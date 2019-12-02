import { InterpolationWithTheme } from '@emotion/core'
import is from '@sindresorhus/is'
import { Blue } from 'bluespark'
import React, { FC, useRef, useState } from 'react'
import useForm from 'react-hook-form'
import { ElementLike } from 'react-hook-form/dist/types'
import {
    CircularProgress,
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
} from 'rmwc'
import { Merge } from 'type-fest'
import { firestore } from '../../services/firebase'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'

type Field<T> = {
    type: 'toggle' | 'required' | 'optional'
    initialValue: T
    label: string
    pattern?: string
}

export const toggle = (
    initialValue: boolean,
    label: string,
): Field<boolean> => ({
    type: 'toggle' as const,
    initialValue,
    label,
})

export const required = (
    initialValue: string,
    label: string,
    pattern?: string,
): Field<string> => ({
    type: 'required' as const,
    initialValue,
    label,
    pattern,
})

export const optional = (
    initialValue: string | null,
    label: string,
    pattern?: string,
): Field<string | null> => ({
    type: 'optional' as const,
    initialValue,
    label,
    pattern,
})

type Schema = {
    [key: string]: Field<any>
}

type GetFormValuesType<S extends Schema> = {
    [K in keyof S & string]: S[K]['initialValue']
}

const replaceEmptyStringWithNull = <T extends { [key: string]: any }>(
    data: T,
) => {
    return Object.entries(data).reduce(
        (pre, [key, value]) => ({
            ...pre,
            [key]: is.emptyString(value) ? null : value,
        }),
        {} as T,
    )
}

export type RefRequired<T extends (...args: any) => any> = Merge<
    ReturnType<T>,
    { docRef: Blue.DocRef }
>

type PropsFn<S extends Schema> = (
    key: keyof S & string,
    noRegister?: boolean,
) => {
    name: string
    label: string
    inputRef: ((ref: ElementLike | null) => void) | undefined
    required: boolean
    pattern: string | undefined
}

type RegisterFn = ReturnType<typeof useForm>['register']

type HandleSubmitFn<E> = (
    callback: (s: E) => void | Promise<void>,
) => (e: React.BaseSyntheticEvent<object, any, any>) => Promise<void>

export const createUseTypedForm = <
    S extends Schema,
    D extends Blue.Meta,
    E extends unknown,
    FormValues extends GetFormValuesType<S> = GetFormValuesType<S>
>({
    name,
    schema,
    decoder,
    encoder,
    dialogTitle,
    dialogStyles,
    renderer: Renderer,
}: {
    name: string
    schema: S

    decoder: (data: D) => FormValues
    encoder: (data: FormValues) => E

    dialogTitle: { create: string; update: string }
    dialogStyles?: InterpolationWithTheme<any>
    renderer: FC<{
        props: PropsFn<S>
        setValue: <K extends keyof FormValues & string>(
            key: K,
            value: FormValues[K],
        ) => void
        register: RegisterFn
        handleSubmit: HandleSubmitFn<E>
        _ref?: Blue.DocRef
    }>
}) => {
    type CallbackFn = (data: E, _ref: Blue.DocRef) => Promise<any>

    const log = (type: string, data: any) =>
        console.log(`[${name} form] ${type}`, data)

    const initialValues = Object.entries(schema).reduce(
        (pre, [key, value]) => ({
            ...pre,
            [key]: value.initialValue,
        }),
        {} as FormValues,
    )

    const trim = (data: FormValues) =>
        Object.entries(data).reduce(
            (pre, [key, value]) => ({
                ...pre,
                [key]: is.string(value) ? value.trim() : value,
            }),
            {} as FormValues,
        )

    const _props = (
        registerFn: RegisterFn,
        key: keyof S & string,
        noRegister = false,
    ) => {
        const { type, pattern } = schema[key]

        const required = type === 'required'

        const inputRef = noRegister
            ? undefined
            : required
            ? registerFn({ required: true })
            : registerFn

        return {
            name: key,
            label: schema[key].label,
            inputRef,
            required,
            pattern,
        }
    }

    return () => {
        const props: PropsFn<S> = (key, noRegister) =>
            _props(register, key, noRegister)

        const callbackRef = useRef<CallbackFn>()
        const dialog = useBool(false)
        const isSaving = useBool(false)
        const [action, setAction] = useState<'create' | 'update'>('create')
        const [_ref, _setRef] = useState<Blue.DocRef>()

        const edit = (dataOrRef: D | Blue.DocRef, callback: CallbackFn) => {
            callbackRef.current = callback
            const _dataOrRef = dataOrRef as D | firestore.DocumentReference

            if (_dataOrRef instanceof firestore.DocumentReference) {
                setAction('create')
                _setRef(_dataOrRef)
                init()
            } else {
                setAction('update')
                _setRef(_dataOrRef._ref)
                init(_dataOrRef)
            }
            dialog.on()
        }

        const render = () => (
            <Dialog open={dialog.state} css={dialogStyles}>
                <DialogTitle>{dialogTitle[action]}</DialogTitle>

                <DialogContent>
                    <Renderer
                        {...{
                            props,
                            setValue,
                            register,
                            handleSubmit,
                            _ref,
                        }}
                    ></Renderer>
                </DialogContent>

                <DialogActions>
                    <DialogButton onClick={dialog.off}>キャンセル</DialogButton>

                    <DialogButton
                        unelevated
                        disabled={isSaving.state}
                        icon={
                            isSaving.state ? (
                                <CircularProgress></CircularProgress>
                            ) : (
                                micon('check')
                            )
                        }
                        onClick={async e => {
                            isSaving.on()

                            await handleSubmit(async data => {
                                if (callbackRef.current && _ref) {
                                    await callbackRef.current(data, _ref)
                                }
                            })(e)

                            dialog.off()
                            isSaving.off()
                        }}
                    >
                        保存
                    </DialogButton>
                </DialogActions>
            </Dialog>
        )

        const {
            register,
            handleSubmit: _handleSubmit,
            setValue,
            getValues,
            reset,
            errors,
        } = useForm<FormValues>()

        const trimData = () => {
            const trimmed = trim(getValues())
            reset(trimmed)
            return trimmed
        }

        const init = (data?: D) => {
            log('init', data)

            if (!data) {
                reset(initialValues)
            } else {
                const cleanData = Object.entries(data).reduce(
                    (pre, [k, v]) => (k in schema ? { ...pre, [k]: v } : pre),
                    {} as D,
                )
                const decoded = decoder(cleanData)
                reset(decoded)
            }
            log('initialized', getValues())
        }

        const encode = (data: FormValues) => {
            const cleanData = replaceEmptyStringWithNull(data)
            log('errors', errors)

            const encoded = encoder(cleanData)
            return encoded
        }

        const handleSubmit = (callback: (s: E) => void | Promise<void>) =>
            _handleSubmit(async data => {
                const trimmed = trimData()

                const encoded = encode(trimmed)
                log('encoded', encoded)
                await callback(encoded)
            })

        return {
            edit,
            render,
            action,
            decoder,
            encoder,
            // props,
            // register,
            // setValue,
            // handleSubmit,
        }
    }
}

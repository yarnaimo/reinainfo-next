import { InterpolationWithTheme } from '@emotion/core'
import is from '@sindresorhus/is'
import { Blue } from 'bluespark'
import React, { FC, MutableRefObject, useRef, useState } from 'react'
import useForm from 'react-hook-form'
import { ElementLike } from 'react-hook-form/dist/types'
import {
    Button,
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
) => (e: React.BaseSyntheticEvent<object, any, any>) => void

export type Renderer<
    S extends Schema,
    E extends unknown,
    FormValues extends GetFormValuesType<S> = GetFormValuesType<S>
> = FC<{
    props: PropsFn<S>
    formRef: MutableRefObject<HTMLFormElement | null>
    setValue: <K extends keyof FormValues & string>(
        key: K,
        value: FormValues[K],
    ) => void
    register: RegisterFn
    handleSubmit: HandleSubmitFn<E>
    _ref?: Blue.DocRef
}>

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
    renderer: Renderer<S, E, FormValues>
}) => {
    type CallbackFn = (_ref: Blue.DocRef, data: E) => Promise<any>

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

        const inputRef = noRegister ? undefined : registerFn

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

        const formRef = useRef<HTMLFormElement>(null)
        const callbackRef = useRef<CallbackFn>()

        const dialogOpen = useBool(false)
        const formRendered = useBool(false)
        const dialog = {
            on: () => {
                formRendered.on()
                dialogOpen.on()
            },
            off: () => {
                dialogOpen.off()
                formRendered.off()
            },
        }
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

        const renderDialog = () => (
            <Dialog open={dialogOpen.state} css={dialogStyles}>
                <DialogTitle>{dialogTitle[action]}</DialogTitle>

                <DialogContent>
                    {formRendered && (
                        <Renderer
                            {...{
                                props,
                                formRef,
                                setValue,
                                register,
                                handleSubmit,
                                _ref,
                            }}
                        ></Renderer>
                    )}
                </DialogContent>

                <DialogActions>
                    <DialogButton
                        label="キャンセル"
                        onClick={dialog.off}
                    ></DialogButton>

                    <DialogButton
                        unelevated
                        label="保存"
                        disabled={isSaving.state}
                        icon={
                            isSaving.state ? (
                                <CircularProgress></CircularProgress>
                            ) : (
                                micon('check')
                            )
                        }
                        onClick={handleSubmit(async data => {
                            isSaving.on()

                            if (callbackRef.current && _ref) {
                                await callbackRef.current(_ref, data)
                            }

                            dialog.off()
                            isSaving.off()
                        })}
                    ></DialogButton>
                </DialogActions>
            </Dialog>
        )

        const renderAddButton = (onClick: () => void) => (
            <Button
                type="button"
                outlined
                icon={micon('plus')}
                label={dialogTitle.create}
                onClick={onClick}
            ></Button>
        )

        const {
            register,
            // handleSubmit: _handleSubmit,
            // formState,
            // clearError,
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
            // formRef.current?.reset()

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

        const handleSubmit = (callback: (s: E) => void | Promise<void>) => {
            return () => {
                if (formRef.current?.reportValidity()) {
                    const trimmed = trimData()

                    const encoded = encode(trimmed)
                    log('encoded', encoded)
                    callback(encoded)
                }
            }
        }

        return {
            formRef,
            edit,
            renderDialog,
            renderAddButton,
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

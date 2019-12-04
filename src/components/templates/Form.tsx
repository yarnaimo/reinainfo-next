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
import { firestore } from '../../services/firebase'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'

type TypeMap = {
    toggle: boolean
    required: string
    optional: string | null
}

type ToggleType = {
    type: 'toggle'
    initial: TypeMap['toggle']
    label: string
    pattern?: never
} & GetConverters<never, never, never>

type GetConverters<D, E, T> = D | E extends T
    ? { decode?: never; encode?: never }
    : { decode: (value: D) => T; encode: (value: T) => E }

type RequiredType<D, E> = {
    type: 'required'
    initial: TypeMap['required']
    label: string
    pattern?: string
} & GetConverters<D, E, TypeMap['required']>

type OptionalType<D, E> = {
    type: 'optional'
    initial: TypeMap['optional']
    label: string
    pattern?: string
} & GetConverters<D, E, TypeMap['optional']>

type FieldType<D, E> = ToggleType | RequiredType<D, E> | OptionalType<D, E>

//

type SchemaBody<D extends object, E extends object> = {
    [K in keyof (D | E)]: FieldType<D[K], E[K]>
}

type SchemaOptions<
    S extends SchemaBody<D, E>,
    D extends object,
    E extends object
> = {
    schema: S
    __D__: D
    __E__: E
    __F__: GetFormValuesType<S, D, E>
}

type SK<S extends SchemaBody<any, any>> = keyof S & string

export const Schema = <D extends object, E extends object>() => <
    S extends SchemaBody<D, E>
>(
    schema: S,
) => ({ schema } as SchemaOptions<S, D, E>)

export type GetFormValuesType<
    S extends SchemaBody<D, E>,
    D extends object,
    E extends object
> = {
    [K in SK<S>]: TypeMap[S[K]['type']]
}

//

type FieldFn<S extends SchemaBody<object, object>> = (
    key: SK<S>,
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

export type Renderer<SO extends SchemaOptions<any, any, any>> = FC<{
    field: FieldFn<SO['schema']>
    formRef: MutableRefObject<HTMLFormElement | null>
    setValue: <K extends keyof SO['__F__'] & string>(
        key: K,
        value: SO['__F__'][K],
    ) => void
    register: RegisterFn
    handleSubmit: HandleSubmitFn<SO['__E__']>
    _ref?: Blue.DocRef
}>

export const createUseTypedForm = <SO extends SchemaOptions<any, any, any>>({
    name,
    schemaOptions,
    dialogTitle,
    dialogStyles,
    renderer: Renderer,
}: {
    name: string
    schemaOptions: SO
    dialogTitle: { create: string; update: string }
    dialogStyles?: InterpolationWithTheme<any>
    renderer: Renderer<SO>
}) => {
    type S = SO['schema']
    type D = SO['__D__']
    type E = SO['__E__']
    type FormValues = SO['__F__']
    const { schema } = schemaOptions

    type CallbackFn = (_ref: Blue.DocRef, data: E) => Promise<any>

    const log = (type: string, data: any) =>
        console.log(`[${name} form] ${type}`, data)

    const initialValues = Object.entries(schema).reduce(
        (pre, [key, value]) => ({
            ...pre,
            [key]: (value as S[SK<S>]).initial,
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

    const decodeValue = (key: SK<S>, value: any) =>
        schema[key as SK<S>].decode?.(value) ?? value

    const decode = (data: D) =>
        Object.entries(data).reduce(
            (pre, [key, value]: [string, any]) =>
                key in schema
                    ? { ...pre, [key]: decodeValue(key, value) }
                    : pre,
            {} as FormValues,
        )

    const encodeValue = (key: SK<S>, value: any) =>
        schema[key as SK<S>].encode?.(value) ?? value

    const encode = (data: FormValues) =>
        Object.entries(data).reduce((pre, [key, value]: [string, any]) => {
            const nullableValue = is.emptyString(value) ? null : value
            return {
                ...pre,
                [key]: encodeValue(key, nullableValue),
            }
        }, {} as E)

    //

    const _field = (registerFn: RegisterFn, key: SK<S>, noRegister = false) => {
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

        const field: FieldFn<S> = (key, noRegister) =>
            _field(register, key, noRegister)

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
                                field,
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
                const decoded = decode(data)
                reset(decoded)
            }
            log('initialized', getValues())
        }

        const handleSubmit = (callback: (s: E) => void | Promise<void>) => {
            return () => {
                log('errors', errors)

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
            decode,
            encode,
            // props,
            // register,
            // setValue,
            // handleSubmit,
        }
    }
}

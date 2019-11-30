import is from '@sindresorhus/is'
import { Blue } from 'bluespark'
import React, { ReactNode, useMemo, useState } from 'react'
import useForm from 'react-hook-form'
import {
    CircularProgress,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
} from 'rmwc'
import { Merge } from 'type-fest'
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
    [K in keyof S]: S[K]['initialValue']
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

export const createUseTypedForm = <
    S extends Schema,
    D extends object,
    E extends unknown,
    FormValues extends GetFormValuesType<S> = GetFormValuesType<S>
>({
    name,
    schema,
    decoder,
    encoder,
}: {
    name: string
    schema: S
    decoder: (data: D) => FormValues
    encoder: (data: FormValues) => E
}) => {
    const log = (type: string, data: any) =>
        console.log(`[${name} form] ${type}`, data)

    return () => {
        const isSaving = useBool(false)
        const [action, setAction] = useState<'create' | 'update'>('create')
        const [editingTicketRef, setDocRef] = useState<Blue.DocRef>()

        const dialogTitle = (toCreate: string, toUpdate: string) => (
            <DialogTitle>
                {action === 'create' ? toCreate : toUpdate}
            </DialogTitle>
        )

        const dialogContent = (children: ReactNode) => (
            <DialogContent>{children}</DialogContent>
        )

        const dialogActions = ({
            onCancel,
            onAccept,
        }: {
            onCancel: () => void
            onAccept: (data: E) => Promise<void>
        }) => (
            <DialogActions>
                <DialogButton action="cancel" onClick={onCancel}>
                    キャンセル
                </DialogButton>

                <DialogButton
                    action="accept"
                    unelevated
                    // disabled={isSaving.state}
                    icon={
                        isSaving.state ? (
                            <CircularProgress></CircularProgress>
                        ) : (
                            micon('check')
                        )
                    }
                    onClick={async e => {
                        isSaving.on()
                        await handleSubmit(onAccept)(e)
                        isSaving.off()
                    }}
                >
                    保存
                </DialogButton>
            </DialogActions>
        )

        const initialValues = useMemo(
            () =>
                Object.entries(schema).reduce(
                    (pre, [key, value]) => ({
                        ...pre,
                        [key]: value.initialValue,
                    }),
                    {} as FormValues,
                ),
            [schema],
        )

        const props = (key: keyof S, noRegister = false) => {
            const { type, pattern } = schema[key]

            const required = type === 'required'

            const inputRef = noRegister
                ? undefined
                : required
                ? register({ required: true })
                : register

            return {
                name: key as string,
                label: schema[key].label,
                inputRef,
                required,
                pattern,
            }
        }

        const {
            register,
            handleSubmit: _handleSubmit,
            setValue,
            getValues,
            reset,
            errors,
        } = useForm<FormValues>()

        const trimData = () => {
            const trimmed = Object.entries(getValues()).reduce(
                (pre, [key, value]) => ({
                    ...pre,
                    [key]: is.string(value) ? value.trim() : value,
                }),
                {} as FormValues,
            )
            reset(trimmed)
        }

        const init = ({ data, ref }: { data?: D; ref: Blue.DocRef }) => {
            log('init', data)
            setAction(data ? 'update' : 'create')
            setDocRef(ref)

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
            _handleSubmit(data => {
                trimData()

                const encoded = encode(data)
                log('encoded', encoded)
                return callback(encoded)
            })

        return {
            dialogTitle,
            dialogContent,
            dialogActions,
            action,
            docRef: editingTicketRef,
            decoder,
            encoder,
            props,
            register,
            setValue,
            init,
            handleSubmit,
        }
    }
}

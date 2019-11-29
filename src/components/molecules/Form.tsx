import is from '@sindresorhus/is'
import { useMemo } from 'react'
import useForm from 'react-hook-form'

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

export const createUseTypedForm = <
    S extends Schema,
    D extends object,
    E extends unknown,
    FormValues extends GetFormValuesType<S> = GetFormValuesType<S>
>({
    schema,
    decoder,
    encoder,
}: {
    schema: S
    decoder: (data: D) => FormValues
    encoder: (data: FormValues) => E
}) => {
    return () => {
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
                name: key,
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

        const init = (data?: D) => {
            console.log('data to init', data)

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
            console.log('inited', getValues())
        }

        const encode = (data: FormValues) => {
            const cleanData = replaceEmptyStringWithNull(data)
            console.log('errors', errors)

            const encoded = encoder(cleanData)
            return encoded
        }

        const handleSubmit = (callback: (s: E) => void) =>
            _handleSubmit(data => {
                trimData()
                callback(encode(data))
            })

        return {
            props,
            register,
            setValue,
            init,
            handleSubmit,
        }
    }
}

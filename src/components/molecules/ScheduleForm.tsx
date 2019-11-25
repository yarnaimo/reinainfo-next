import is from '@sindresorhus/is'
import dayjs from 'dayjs'
import React, { FC } from 'react'
import useForm from 'react-hook-form'
import { RHFInput } from 'react-hook-form-input'
import { Checkbox, Select, TextField } from 'rmwc'
import { categories, ISchedule, MSchedule } from '../../models/Schedule'
import { parseDateString } from '../../utils/date'
import { Section } from '../blocks/Section'

type Field<T> = {
    type: 'toggle' | 'required' | 'optional'
    initialValue: T
    label: string
}

const toggle = (initialValue: boolean, label: string): Field<boolean> => ({
    type: 'toggle' as const,
    initialValue,
    label,
})
const required = (initialValue: string, label: string): Field<string> => ({
    type: 'required' as const,
    initialValue,
    label,
})
const optional = (
    initialValue: string | null,
    label: string,
): Field<string | null> => ({
    type: 'optional' as const,
    initialValue,
    label,
})

type GetFormValuesType<S extends { [key: string]: Field<any> }> = {
    [K in keyof S]: S[K]['initialValue']
}

const schema = {
    active: toggle(true, 'アクティブ?'),
    isSerial: toggle(false, '定期更新?'),

    category: required('event', 'カテゴリ'),
    customIcon: optional('', 'アイコン'),
    ribbonColors: optional('', '色'),

    title: required('', 'タイトル'),
    url: required('', 'URL'),
    date: required('', '日時'),
    hasTime: toggle(true, '時刻あり?'),
    parts: optional('', 'パート'),
    venue: optional('', '場所'),
    hasTickets: toggle(false, 'チケットあり?'),

    thumbUrl: optional('', 'サムネイルURL'),
}

const initialValues = Object.entries(schema).reduce(
    (pre, [key, value]) => ({ ...pre, [key]: value.initialValue }),
    {} as GetFormValuesType<typeof schema>,
)

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

export const useScheduleForm = () => {
    type FormValues = GetFormValuesType<typeof schema>

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

    const init = (s?: ISchedule['_D']) => {
        console.log('schedule to init', s)

        if (!s) {
            reset(initialValues)
        } else {
            const _s = Object.entries(s).reduce(
                (pre, [k, v]) => (k in schema ? { ...pre, [k]: v } : pre),
                {} as ISchedule['_D'],
            )
            reset({
                ..._s,
                date: dayjs(s.date.toDate()).format('YYYYMMDD.HHmm'),
                ribbonColors: s.ribbonColors?.join('/') ?? null,
                parts: s.parts && MSchedule.serializeParts(s.parts),
            })
        }
        console.log('inited', getValues())
    }

    const encode = (data: FormValues) => {
        const _data = replaceEmptyStringWithNull(data)
        console.log('errors', errors)

        const d = {
            ..._data,
            date: parseDateString(data.date)?.toDate() ?? new Date(NaN),
            ribbonColors: data.ribbonColors
                ? data.ribbonColors.split('/')
                : null,
            parts: MSchedule.deserializeParts(data.parts ?? ''),
        }
        return {
            ...d,
            // formattedDate: MSchedule.formatDate(d as any),
        } as ISchedule['_E']
    }

    const handleSubmit = (callback: (s: ISchedule['_E']) => void) =>
        _handleSubmit(data => {
            trimData()
            callback(encode(data))
        })

    return {
        register,
        setValue,
        init,
        handleSubmit,
    }
}

type Props = ReturnType<typeof useScheduleForm>

export const ScheduleForm: FC<Props> = ({ register, setValue }) => {
    const props = (key: keyof typeof schema, noRegister = false) => {
        const required = schema[key].type === 'required'

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
        }
    }

    const form = [
        <Checkbox {...props('active')}></Checkbox>,
        <Checkbox {...props('isSerial')}></Checkbox>,

        <RHFInput
            as={
                <Select
                    {...props('category', true)}
                    options={Object.entries(categories).map(([k, v]) => ({
                        value: k,
                        label: v.name,
                    }))}
                />
            }
            register={register}
            setValue={setValue}
            name="category"
        />,
        <TextField {...props('customIcon')}></TextField>,
        <TextField {...props('ribbonColors')}></TextField>,

        <TextField {...props('title')}></TextField>,
        <TextField {...props('url')}></TextField>,
        <TextField {...props('date')}></TextField>,
        <Checkbox {...props('hasTime')}></Checkbox>,
        <TextField {...props('parts')}></TextField>,
        <TextField {...props('venue')}></TextField>,
        <Checkbox {...props('hasTickets')}></Checkbox>,
        <TextField {...props('thumbUrl')}></TextField>,
    ]

    return (
        <form>
            {form.map((f, i) => (
                <Section key={i}>{f}</Section>
            ))}
        </form>
    )
}

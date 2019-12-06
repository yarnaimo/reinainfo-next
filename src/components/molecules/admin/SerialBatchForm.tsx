import is from '@sindresorhus/is'
import { Dayjs } from 'dayjs'
import React from 'react'
import { Button, TextField } from 'rmwc'
import { ISerial } from '../../../models/Serial'
import {
    createSerialDates,
    formDatePattern,
    parseFormDateNullable,
    toFormDate,
} from '../../../utils/date'
import { FormRow } from '../../blocks/FormRow'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Schema } from '../../templates/Form'
const decodeDayjs = (date: Dayjs | null) => (date ? toFormDate(date) : null)

export type ISerialBatch = {
    count: number | null
    since: Dayjs | null
    until: Dayjs | null
}

const schemaOptions = Schema<
    ISerialBatch,
    ISerialBatch,
    ISerial['_D'] & { dates: Dayjs[] }
>()({
    count: {
        type: 'optional',
        initial: '',
        label: '上限回数',
        pattern: '\\d+',
        decode: number => (is.number(number) ? String(number) : null),
        encode: str => (is.string(str) ? Number(str) : null),
    },
    since: {
        type: 'optional',
        initial: '',
        label: 'Since',
        pattern: formDatePattern,
        decode: decodeDayjs,
        encode: parseFormDateNullable,
    },
    until: {
        type: 'optional',
        initial: '',
        label: 'Until',
        pattern: formDatePattern,
        decode: decodeDayjs,
        encode: parseFormDateNullable,
    },
})

export const useSerialBatchForm = createUseTypedForm({
    name: 'serialBatch',
    schemaOptions,
    dialogTitle: {
        create: 'スケジュールの一括追加',
        update: '',
    },

    renderer: ({
        field,
        formRef,
        handleSubmit,
        optionalData,
        setOptionalData,
    }) => {
        if (!optionalData) {
            return <></>
        }

        const {
            dayOfWeek,
            timeOfDay,
            weekNumbers,
            weekInterval,
            dates,
        } = optionalData

        return (
            <>
                <form ref={formRef}>
                    <Section>
                        <FormRow>
                            <TextField {...field('count')}></TextField>
                        </FormRow>
                        <FormRow>
                            <TextField {...field('since')}></TextField>
                        </FormRow>
                        <FormRow>
                            <TextField {...field('until')}></TextField>
                        </FormRow>
                    </Section>
                </form>

                <Button
                    label="日付を作成"
                    onClick={handleSubmit(({ count, since, until }) => {
                        const dates = createSerialDates({
                            count: count ?? undefined,
                            since: since ?? undefined,
                            until: until ?? undefined,
                            dayOfWeek: dayOfWeek,
                            timeOfDay: timeOfDay,
                            weekNumbers: weekNumbers ?? undefined,
                            weekInterval: weekInterval ?? undefined,
                        })
                        setOptionalData({ ...optionalData, dates })
                    })}
                ></Button>

                <Section>
                    <ul>
                        {dates.map((d, i) => (
                            <li key={i}>{toFormDate(d)}</li>
                        ))}
                    </ul>
                </Section>
            </>
        )
    },
})

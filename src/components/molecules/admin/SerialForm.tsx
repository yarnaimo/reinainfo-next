import is from '@sindresorhus/is'
import React from 'react'
import { Checkbox, TextField } from 'rmwc'
import { ISerial, WNumber } from '../../../models/Serial'
import { stringifyTimeArray, toTimeArray } from '../../../utils/date'
import { textarea } from '../../../utils/html'
import { FormSelect } from '../../atoms/FormSelect'
import { FormRow } from '../../blocks/FormRow'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Schema } from '../../templates/Form'
import { categoryOptions, createScheduleSeedSchema } from './ScheduleForm'

const schemaOptions = Schema<ISerial['_D'], ISerial['_E']>()({
    active: { type: 'toggle', initial: true, label: 'アクティブ?' },
    label: { type: 'required', initial: '', label: 'ラベル' },
    dayOfWeek: {
        type: 'required',
        initial: '',
        label: '曜日',
        decode: number => String(number),
        encode: str => Number(str) as WNumber,
    },
    timeOfDay: {
        type: 'required',
        initial: '',
        label: '時刻',
        pattern: '^\\d{4}$',
        decode: stringifyTimeArray,
        encode: toTimeArray,
    },
    weekNumbers: {
        type: 'optional',
        initial: '',
        label: '週番号 (カンマ区切り)',
        pattern: '^([\\d^,]+,)+[\\d^,]+$',
        decode: numArr => numArr?.join(',') ?? null,
        encode: str => str?.split(',').map(Number) ?? null,
    },
    weekInterval: {
        type: 'optional',
        initial: '',
        label: '週間隔',
        pattern: '^\\d+$',
        decode: number => (is.number(number) ? String(number) : null),
        encode: str => (is.string(str) ? Number(str) : null),
    },

    ...createScheduleSeedSchema(true).schema,
})

const wOptions = [...'日月火水木金土'].map((label, i) => ({
    value: String(i),
    label,
}))

export const useSerialForm = createUseTypedForm({
    name: 'serial',
    schemaOptions,
    dialogTitle: {
        create: 'Serialの追加',
        update: 'Serialの編集',
    },

    renderer: ({ field, formRef, setValue, register, handleSubmit, _ref }) => {
        return (
            <form ref={formRef}>
                <Section>
                    <FormRow>
                        <Checkbox {...field('active')}></Checkbox>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('label')}></TextField>
                    </FormRow>
                    <FormRow>
                        <FormSelect
                            {...field('dayOfWeek', true)}
                            options={wOptions}
                            register={register}
                            setValue={(key, value) =>
                                setValue('dayOfWeek', value as string)
                            }
                        ></FormSelect>
                        <TextField {...field('timeOfDay')}></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('weekNumbers')}></TextField>
                        <TextField {...field('weekInterval')}></TextField>
                    </FormRow>
                </Section>

                <Section>
                    <FormRow>
                        <FormSelect
                            {...field('category', true)}
                            options={categoryOptions}
                            register={register}
                            setValue={(key, value) =>
                                setValue('category', value as string)
                            }
                        ></FormSelect>
                        <TextField {...field('customIcon')}></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('ribbonColors')}></TextField>
                    </FormRow>
                </Section>

                <Section>
                    <FormRow>
                        <Checkbox {...field('hasTime')}></Checkbox>
                    </FormRow>
                    <FormRow>
                        <TextField
                            {...textarea}
                            {...field('title')}
                        ></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...textarea} {...field('url')}></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('venue')}></TextField>
                    </FormRow>
                </Section>
            </form>
        )
    },
})

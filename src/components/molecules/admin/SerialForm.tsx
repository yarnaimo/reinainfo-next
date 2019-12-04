import React from 'react'
import { Checkbox, TextField } from 'rmwc'
import { ISerial } from '../../../models/Serial'
import { textarea } from '../../../utils/html'
import { FormSelect } from '../../atoms/FormSelect'
import { FormRow } from '../../blocks/FormRow'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Schema } from '../../templates/Form'
import { categoryOptions, createScheduleSeedSchema } from './ScheduleForm'

const schemaOptions = Schema<ISerial['_D'], ISerial['_E']>()({
    active: { type: 'toggle', initial: true, label: 'アクティブ?' },
    label: { type: 'required', initial: '', label: 'ラベル' },

    ...createScheduleSeedSchema(true).schema,
})

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

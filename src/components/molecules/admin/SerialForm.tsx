import React from 'react'
import { Checkbox, TextField } from 'rmwc'
import { ISerial } from '../../../models/Serial'
import { FormBlock as Block } from '../../blocks/FormBlock'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Schema } from '../../templates/Form'
import { createScheduleSeedSchema } from './ScheduleForm'

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

    renderer: ({
        field: props,
        formRef,
        setValue,
        register,
        handleSubmit,
        _ref,
    }) => {
        return (
            <form ref={formRef}>
                <Section>
                    <Block>
                        <Checkbox {...props('active')}></Checkbox>
                    </Block>
                    <Block>
                        <TextField {...props('label')}></TextField>
                    </Block>
                </Section>
            </form>
        )
    },
})

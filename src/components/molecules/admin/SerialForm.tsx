import React from 'react'
import { Checkbox, TextField } from 'rmwc'
import { ISerial } from '../../../models/Serial'
import { FormBlock as Block } from '../../blocks/FormBlock'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, required, toggle } from '../../templates/Form'

const schema = {
    active: toggle(true, 'アクティブ?'),
    label: required('', 'ラベル'),
}

export const useSerialForm = createUseTypedForm<
    typeof schema,
    ISerial['_D'],
    ISerial['_E']
>({
    name: 'serial',
    schema,

    decoder: r => r,
    encoder: data => data as ISerial['_E'],

    dialogTitle: {
        create: 'Serialの追加',
        update: 'Serialの編集',
    },

    renderer: ({ props, setValue, register, handleSubmit, _ref }) => {
        return (
            <Section>
                <Block>
                    <Checkbox {...props('active')}></Checkbox>
                </Block>
                <Block>
                    <TextField {...props('label')}></TextField>
                </Block>
            </Section>
        )
    },
})

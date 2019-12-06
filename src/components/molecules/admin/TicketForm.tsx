import is from '@sindresorhus/is'
import { Blue } from 'bluespark'
import React from 'react'
import { TextField } from 'rmwc'
import { ITicket } from '../../../models/Ticket'
import { formDatePattern, parseFormDate, toFormDate } from '../../../utils/date'
import { FormRow } from '../../blocks/FormRow'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Schema } from '../../templates/Form'

const decode = (timestamp: Blue.Timestamp | null) =>
    timestamp ? toFormDate(timestamp.toDate()) : null

const encode = (str: string | null) =>
    is.string(str) ? parseFormDate(str) : null

const schemaOptions = Schema<ITicket['_D'], ITicket['_E']>()({
    label: { type: 'required', initial: '', label: 'ラベル' },
    opensAt: {
        type: 'optional',
        initial: null,
        label: '開始日時',
        pattern: formDatePattern,
        decode,
        encode,
    },
    closesAt: {
        type: 'optional',
        initial: null,
        label: '終了日時',
        pattern: formDatePattern,
        decode,
        encode,
    },
})

export const useTicketForm = createUseTypedForm({
    name: 'ticket',
    schemaOptions,
    dialogTitle: {
        create: 'チケットの追加',
        update: 'チケットの編集',
    },

    renderer: ({ field, formRef }) => {
        return (
            <form ref={formRef}>
                <Section>
                    <FormRow>
                        <TextField {...field('label')}></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('opensAt')}></TextField>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('closesAt')}></TextField>
                    </FormRow>
                </Section>
            </form>
        )
    },
})

import React from 'react'
import { TextField } from 'rmwc'
import { ITicket } from '../../models/Ticket'
import { formDatePattern, parseFormDate, toFormDate } from '../../utils/date'
import { FormBlock as Block } from '../blocks/FormBlock'
import { Section } from '../blocks/Section'
import { createUseTypedForm, optional, required } from './Form'

const schema = {
    label: required('', 'ラベル'),
    opensAt: optional(null, '開始日時', formDatePattern),
    closesAt: optional(null, '終了日時', formDatePattern),
}

export const useTicketForm = createUseTypedForm<
    typeof schema,
    ITicket['_D'],
    ITicket['_E']
>({
    name: 'ticket',
    schema,

    decoder: t => ({
        ...t,
        opensAt: t.opensAt ? toFormDate(t.opensAt.toDate()) : null,
        closesAt: t.closesAt ? toFormDate(t.closesAt.toDate()) : null,
    }),
    encoder: data =>
        ({
            ...data,
            opensAt: data.opensAt && parseFormDate(data.opensAt),
            closesAt: data.closesAt && parseFormDate(data.closesAt),
        } as ITicket['_E']),

    dialogTitle: { create: 'チケットの追加', update: 'チケットの編集' },

    renderer: ({ props }) => {
        return (
            <Section>
                <Block>
                    <TextField {...props('label')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('opensAt')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('closesAt')}></TextField>
                </Block>
            </Section>
        )
    },
})

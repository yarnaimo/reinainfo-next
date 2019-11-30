import styled from '@emotion/styled'
import { useSCollection } from 'bluespark'
import React, { FC, useEffect, useMemo } from 'react'
import { RHFInput } from 'react-hook-form-input'
import {
    Button,
    Checkbox,
    Dialog,
    Select,
    SimpleDataTable,
    TextField,
} from 'rmwc'
import { categories, ISchedule, MSchedule } from '../../models/Schedule'
import { ITicket } from '../../models/Ticket'
import { db } from '../../services/firebase'
import { margin, padding } from '../../utils/css'
import { formDatePattern, parseFormDate, toFormDate } from '../../utils/date'
import { useBool, UseBool } from '../../utils/hooks'
import { Solid } from '../blocks/Flex'
import { Section } from '../blocks/Section'
import { createUseTypedForm, optional, required, toggle } from './Form'
import { TicketForm, useTicketForm } from './TicketForm'

const schema = {
    active: toggle(true, 'アクティブ?'),
    isSerial: toggle(false, '定期更新?'),

    category: required('event', 'カテゴリ'),
    customIcon: optional(null, 'アイコン'),
    ribbonColors: optional(null, '色'),

    title: required('', 'タイトル'),
    url: required('', 'URL'),
    date: required('', '日時', formDatePattern),
    hasTime: toggle(true, '時刻あり?'),
    parts: optional(null, 'パート'),
    venue: optional(null, '場所'),
    hasTickets: toggle(false, 'チケットあり?'),

    thumbUrl: optional(null, 'サムネイルURL'),
}

export const useScheduleForm = createUseTypedForm<
    typeof schema,
    ISchedule['_D'],
    ISchedule['_E']
>({
    name: 'schedule',
    schema,
    decoder: s => ({
        ...s,
        date: toFormDate(s.date.toDate()),
        ribbonColors: s.ribbonColors?.join('/') ?? null,
        parts: s.parts && MSchedule.serializeParts(s.parts),
    }),
    encoder: data =>
        ({
            ...data,
            date: parseFormDate(data.date) ?? new Date(0),
            ribbonColors: data.ribbonColors
                ? data.ribbonColors.split('/')
                : null,
            parts: MSchedule.deserializeParts(data.parts ?? ''),
        } as ISchedule['_E']),
})

const Block = styled(Solid)({
    ...padding({ y: 6 }),
    '& > * + *': {
        ...margin({ left: 8 }),
    },
})

const TicketDialog: FC<{
    ticketForm: ReturnType<typeof useTicketForm>
    open: boolean
    onCancel: () => void
    onAccept: (data: ITicket['_E']) => Promise<void>
}> = ({ ticketForm, open, onCancel, onAccept }) => {
    return (
        <Dialog open={open}>
            {ticketForm.dialogTitle('チケットの追加', 'チケットの編集')}

            {ticketForm.dialogContent(
                <TicketForm {...ticketForm}></TicketForm>,
            )}

            {ticketForm.dialogActions({
                onCancel,
                onAccept,
            })}
        </Dialog>
    )
}

type Props = ReturnType<typeof useScheduleForm>

export const ScheduleForm: FC<Props> = ({
    props: _props,
    register,
    setValue,
    docRef: scheduleRef,
}) => {
    const dialog = useBool(false)
    const ticketForm = useTicketForm()

    const model = useMemo(() => scheduleRef && db._ticketsIn(scheduleRef), [
        scheduleRef,
    ])
    const tickets = useSCollection({
        model,
        q: q => q.orderBy('opensAt'),
        // decoder: ticketForm.decoder,
        // decoder: (t: ITicket['_D']) => t,
    })
    useEffect(() => {
        setValue('hasTickets', !!tickets.array.length)
    }, [tickets.array.length])

    const editTicket = (t?: ITicket['_D']) => {
        if (!model) {
            return
        }
        ticketForm.init({
            data: t,
            ref: t ? t._ref : model.collectionRef.doc(),
        })
        dialog.on()
    }

    const props: typeof _props = (key, noRegister) => ({
        ..._props(key, noRegister),
        css: { width: '100%' },
    })

    const textarea = {
        textarea: true,
        outlined: true,
        rows: 2,
    }

    const CategorySelect_ = (
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
        />
    )

    const TicketsSection_ = (
        <Section>
            <TicketDialog
                ticketForm={ticketForm}
                open={dialog.state}
                onCancel={dialog.off}
                onAccept={async data => {
                    dialog.off()
                    await model![ticketForm.action](ticketForm.docRef!, data)
                }}
            ></TicketDialog>

            <Block>
                <Checkbox disabled {...props('hasTickets')}></Checkbox>
            </Block>
            <Block>
                <SimpleDataTable
                    headers={[['', 'ラベル', '開始日時', '終了日時']]}
                    data={tickets.array.map(t => {
                        const dt = ticketForm.decoder(t)
                        return [
                            <Button
                                label="Edit"
                                onClick={() => editTicket(t)}
                                css={{ margin: '0 -8px' }}
                            ></Button>,
                            dt.label,
                            dt.opensAt,
                            dt.closesAt,
                        ]
                    })}
                ></SimpleDataTable>
            </Block>
        </Section>
    )

    return (
        <>
            <Section>
                <Block>
                    <Checkbox {...props('active')}></Checkbox>
                    <Checkbox {...props('isSerial')}></Checkbox>
                </Block>
                <Block>
                    {CategorySelect_}
                    <TextField {...props('customIcon')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('ribbonColors')}></TextField>
                </Block>
            </Section>

            <Section>
                <Block>
                    <TextField {...props('date')}></TextField>
                    <Checkbox {...props('hasTime')}></Checkbox>
                </Block>
                <Block>
                    <TextField {...props('parts')}></TextField>
                </Block>
                <Block>
                    <TextField {...textarea} {...props('title')}></TextField>
                </Block>
                <Block>
                    <TextField {...textarea} {...props('url')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('venue')}></TextField>
                </Block>
            </Section>

            {TicketsSection_}

            <Section>
                <Block>
                    <TextField {...props('thumbUrl')}></TextField>
                </Block>
            </Section>
        </>
    )
}

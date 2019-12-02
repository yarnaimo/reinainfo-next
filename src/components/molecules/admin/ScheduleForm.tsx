import { useSCollection } from 'bluespark'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { RHFInput } from 'react-hook-form-input'
import { Button, Checkbox, Select, TextField } from 'rmwc'
import {
    categories,
    ISchedule,
    IScheduleSerialized,
    MSchedule,
} from '../../../models/Schedule'
import { ITicket } from '../../../models/Ticket'
import { db } from '../../../services/firebase'
import { formDatePattern, parseFormDate, toFormDate } from '../../../utils/date'
import { FormBlock as Block } from '../../blocks/FormBlock'
import { Section } from '../../blocks/Section'
import {
    createUseTypedForm,
    optional,
    required,
    toggle,
} from '../../templates/Form'
import { ScheduleDetailContent } from '../ScheduleDetailContent'
import { AdminDataTable } from './AdminDataTable'
import { useTicketForm } from './TicketForm'

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

    dialogTitle: { create: 'スケジュールの追加', update: 'スケジュールの編集' },
    dialogStyles: {
        '& > .mdc-dialog__container': {
            width: '100%',
        },
        '& > * > .mdc-dialog__surface': {
            width: '100%',
        },
    },

    renderer: ({ props: _props, setValue, register, handleSubmit, _ref }) => {
        const props: typeof _props = (key, noRegister) => ({
            ..._props(key, noRegister),
            css: { width: '100%' },
        })

        const ticketTableHeader = ['', 'ラベル', '開始日時', '終了日時']
        const ticketForm = useTicketForm()
        const model = useMemo(() => _ref && db._ticketsIn(_ref), [_ref])

        const tickets = useSCollection({
            model,
            q: q => q.orderBy('opensAt'),
            decoder: (t: ITicket['_D']) => {
                const dt = ticketForm.decoder(t)

                return {
                    ...dt,
                    tableRow: [
                        <Button
                            label="Edit"
                            onClick={() =>
                                ticketForm.edit(t, (data, _ref) =>
                                    model!.update(_ref, data),
                                )
                            }
                            css={{ margin: '0 -8px' }}
                        ></Button>,
                        dt.label,
                        dt.opensAt,
                        dt.closesAt,
                    ],
                }
            },
        })
        useEffect(() => {
            setValue('hasTickets', !!tickets.array.length)
        }, [tickets.array.length])

        const textarea = {
            textarea: true,
            outlined: true,
            rows: 2,
        }

        const [previewSchedule, setPreviewSchedule] = useState<
            IScheduleSerialized
        >()

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
                setValue={(key, value) => setValue('category', value as string)}
                name="category"
            />
        )

        const TicketsSection_ = (
            <Section>
                {ticketForm.render()}

                <Block>
                    <Checkbox disabled {...props('hasTickets')}></Checkbox>
                </Block>
                {ticketForm.renderAddButton(() =>
                    ticketForm.edit(model!.collectionRef.doc(), (data, _ref) =>
                        model!.create(_ref, data),
                    ),
                )}
                <AdminDataTable
                    header={ticketTableHeader}
                    data={tickets.array}
                ></AdminDataTable>
            </Section>
        )

        return (
            <>
                {previewSchedule && (
                    <ScheduleDetailContent
                        compact={false}
                        schedule={previewSchedule}
                    ></ScheduleDetailContent>
                )}
                <Button
                    label="プレビュー"
                    onClick={handleSubmit(data => {
                        console.log(data)
                        const dataD = {
                            ...data,
                            _updatedAt: dayjs().toISOString(),
                            date: data.date.toISOString(),
                            formattedDate: MSchedule.formatDate(data),
                        }
                        setPreviewSchedule(dataD as any)
                    })}
                ></Button>

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
                        <TextField
                            {...textarea}
                            {...props('title')}
                        ></TextField>
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
    },
})

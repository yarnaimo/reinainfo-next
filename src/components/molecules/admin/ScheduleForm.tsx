import { useSCollection } from 'bluespark'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, TextField } from 'rmwc'
import {
    categories,
    ISchedule,
    IScheduleSerialized,
    MSchedule,
    ScheduleSeedKeys,
} from '../../../models/Schedule'
import { ITicket } from '../../../models/Ticket'
import { db } from '../../../services/firebase'
import {
    dayjs,
    formDatePattern,
    parseFormDate,
    toFormDate,
} from '../../../utils/date'
import { textarea } from '../../../utils/html'
import { FormSelect } from '../../atoms/FormSelect'
import { FormRow } from '../../blocks/FormRow'
import { Section } from '../../blocks/Section'
import { createUseTypedForm, Renderer, Schema } from '../../templates/Form'
import { ScheduleDetailContent } from '../ScheduleDetailContent'
import { AdminDataTable } from './AdminDataTable'
import { useTicketForm } from './TicketForm'

export const createScheduleSeedSchema = (serial: boolean) =>
    Schema<
        Pick<ISchedule['_D'], ScheduleSeedKeys>,
        Pick<ISchedule['_E'], ScheduleSeedKeys>
    >()({
        category: {
            type: 'required',
            initial: serial ? 'up' : 'event',
            label: 'カテゴリ',
        },
        customIcon: { type: 'optional', initial: null, label: 'アイコン' },
        ribbonColors: {
            type: 'optional',
            initial: null,
            label: '色',
            decode: colors => colors?.join('/') ?? null,
            encode: str => str?.split('/') ?? null,
        },

        hasTime: { type: 'toggle', initial: true, label: '時刻あり?' },
        title: { type: 'required', initial: '', label: 'タイトル' },
        url: { type: 'required', initial: '', label: 'URL' },
        venue: { type: 'optional', initial: null, label: '場所' },
    })

const createSchema = (serial: boolean) =>
    Schema<ISchedule['_D'], ISchedule['_E']>()({
        active: { type: 'toggle', initial: true, label: 'アクティブ?' },
        isSerial: { type: 'toggle', initial: false, label: '定期更新?' },

        ...createScheduleSeedSchema(serial).schema,

        date: {
            type: 'required',
            initial: '',
            label: '日時',
            pattern: formDatePattern,
            decode: timestamp => toFormDate(timestamp.toDate()),
            encode: str => parseFormDate(str) ?? new Date(0),
        },
        parts: {
            type: 'optional',
            initial: null,
            label: 'パート',
            decode: MSchedule.formDecodeParts,
            encode: MSchedule.formEncodeParts,
        },
        hasTickets: { type: 'toggle', initial: false, label: 'チケットあり?' },

        thumbUrl: { type: 'optional', initial: null, label: 'サムネイルURL' },
    })

type _SchemaType = ReturnType<typeof createSchema>

export const categoryOptions = Object.entries(categories).map(([k, v]) => ({
    value: k,
    label: v.name,
}))

const ticketTableKeys: typeof useTicketForm._K[] = [
    'label',
    'opensAt',
    'closesAt',
]

const renderer: Renderer<_SchemaType> = ({
    field,
    formRef,
    setValue,
    register,
    handleSubmit,
    _ref,
}) => {
    // const field: typeof _field = (key, noRegister) => ({
    //     ..._field(key, noRegister),
    //     css: { width: '100%' },
    // })

    const ticketForm = useTicketForm()
    const model = useMemo(() => _ref && db._ticketsIn(_ref), [_ref])

    const tickets = useSCollection({
        model,
        q: q => q.orderBy('opensAt'),
        decoder: (t: ITicket['_D']) => ({
            ...t,
            tableRow: ticketForm.tableRow(t, ticketTableKeys, [
                <Button
                    type="button"
                    label="編集"
                    onClick={() => ticketForm.edit(t, model!.update)}
                    css={{ margin: '0 -8px' }}
                ></Button>,
            ]),
        }),
    })

    useEffect(() => {
        setValue('hasTickets', !!tickets.array.length)
    }, [tickets.array.length])

    const [previewSchedule, setPreviewSchedule] = useState<
        IScheduleSerialized
    >()

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

            {ticketForm.renderDialog()}

            <form ref={formRef}>
                <Section>
                    <FormRow>
                        <Checkbox {...field('active')}></Checkbox>
                        <Checkbox disabled {...field('isSerial')}></Checkbox>
                    </FormRow>
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
                        <TextField {...field('date')}></TextField>
                        <Checkbox {...field('hasTime')}></Checkbox>
                    </FormRow>
                    <FormRow>
                        <TextField {...field('parts')}></TextField>
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

                <Section>
                    <FormRow>
                        <Checkbox disabled {...field('hasTickets')}></Checkbox>
                    </FormRow>
                    {ticketForm.renderAddButton(() =>
                        ticketForm.edit(
                            model!.collectionRef.doc(),
                            model!.create,
                        ),
                    )}
                    <AdminDataTable
                        header={ticketForm.tableHeader(ticketTableKeys, [''])}
                        data={tickets.array}
                    ></AdminDataTable>
                </Section>

                <Section>
                    <FormRow>
                        <TextField {...field('thumbUrl')}></TextField>
                    </FormRow>
                </Section>
            </form>
        </>
    )
}

const createUseScheduleForm = (serial: boolean) =>
    createUseTypedForm({
        name: 'schedule',
        schemaOptions: createSchema(serial),

        dialogTitle: {
            create: serial ? 'スケジュールの一括追加' : 'スケジュールの追加',
            update: 'スケジュールの編集',
        },
        dialogStyles: {
            '& > .mdc-dialog__container': {
                width: '100%',
            },
            '& > * > .mdc-dialog__surface': {
                width: '100%',
            },
        },

        renderer,
    })

export const useScheduleForm = createUseScheduleForm(false)
export const useSerialScheduleForm = createUseScheduleForm(true)

import { useSCollection } from 'bluespark'
import React, { useEffect, useMemo, useState } from 'react'
import { RHFInput } from 'react-hook-form-input'
import { Button, Checkbox, Select, TextField } from 'rmwc'
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
import { FormBlock as Block } from '../../blocks/FormBlock'
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

        title: { type: 'required', initial: '', label: 'タイトル' },
        url: { type: 'required', initial: '', label: 'URL' },
        hasTime: { type: 'toggle', initial: true, label: '時刻あり?' },
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

const categoryOptions = Object.entries(categories).map(([k, v]) => ({
    value: k,
    label: v.name,
}))

const renderer: Renderer<_SchemaType> = ({
    field: _field,
    formRef,
    setValue,
    register,
    handleSubmit,
    _ref,
}) => {
    const field: typeof _field = (key, noRegister) => ({
        ..._field(key, noRegister),
        css: { width: '100%' },
    })

    const ticketTableHeader = ['', 'ラベル', '開始日時', '終了日時']
    const ticketForm = useTicketForm()
    const model = useMemo(() => _ref && db._ticketsIn(_ref), [_ref])

    const tickets = useSCollection({
        model,
        q: q => q.orderBy('opensAt'),
        decoder: (t: ITicket['_D']) => {
            const dt = ticketForm.decode(t)

            return {
                ...dt,
                tableRow: [
                    <Button
                        type="button"
                        label="編集"
                        onClick={() => ticketForm.edit(t, model!.update)}
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
                    {...field('category', true)}
                    options={categoryOptions}
                />
            }
            register={register}
            setValue={(key, value) => setValue('category', value as string)}
            name="category"
        />
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

            {ticketForm.renderDialog()}

            <form ref={formRef}>
                <Section>
                    <Block>
                        <Checkbox {...field('active')}></Checkbox>
                        <Checkbox disabled {...field('isSerial')}></Checkbox>
                    </Block>
                    <Block>
                        {CategorySelect_}
                        <TextField {...field('customIcon')}></TextField>
                    </Block>
                    <Block>
                        <TextField {...field('ribbonColors')}></TextField>
                    </Block>
                </Section>

                <Section>
                    <Block>
                        <TextField {...field('date')}></TextField>
                        <Checkbox {...field('hasTime')}></Checkbox>
                    </Block>
                    <Block>
                        <TextField {...field('parts')}></TextField>
                    </Block>
                    <Block>
                        <TextField
                            {...textarea}
                            {...field('title')}
                        ></TextField>
                    </Block>
                    <Block>
                        <TextField {...textarea} {...field('url')}></TextField>
                    </Block>
                    <Block>
                        <TextField {...field('venue')}></TextField>
                    </Block>
                </Section>

                <Section>
                    <Block>
                        <Checkbox disabled {...field('hasTickets')}></Checkbox>
                    </Block>
                    {ticketForm.renderAddButton(() =>
                        ticketForm.edit(
                            model!.collectionRef.doc(),
                            model!.create,
                        ),
                    )}
                    <AdminDataTable
                        header={ticketTableHeader}
                        data={tickets.array}
                    ></AdminDataTable>
                </Section>

                <Section>
                    <Block>
                        <TextField {...field('thumbUrl')}></TextField>
                    </Block>
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

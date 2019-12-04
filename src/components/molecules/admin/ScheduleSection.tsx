import { useSCollection } from 'bluespark'
import React, { FC, useMemo } from 'react'
import { Button, SimpleDataTable } from 'rmwc'
import { ISchedule, MSchedule } from '../../../models/Schedule'
import { ISerial } from '../../../models/Serial'
import { db } from '../../../services/firebase'
import { toFormDate } from '../../../utils/date'
import { bool } from '../../../utils/html'
import { Heading2 } from '../../atoms/Heading2'
import { PageSection } from '../../blocks/PageSection'
import { Section } from '../../blocks/Section'
import { AdminDataTable } from './AdminDataTable'
import { useScheduleForm, useSerialScheduleForm } from './ScheduleForm'
import { useSerialForm } from './SerialForm'

type Props = { serial?: ISerial['_D']; heading?: string }

export const ScheduleSection: FC<Props> = ({
    serial,
    heading = 'Schedules',
}) => {
    const scheduleForm = parent ? useSerialScheduleForm() : useScheduleForm()
    const serialForm = useSerialForm()

    const tableHeader = [
        '',
        '',
        'カテゴリ',
        '日時',
        '時刻あり?',
        'アイコン',
        '色',
        'タイトル',
        'URL',
        'パート',
        '場所',
        'チケットあり?',
        'サムネイルURL',
    ]
    const model = useMemo(
        () => (serial ? db._schedulesIn(serial._ref) : db.schedules),
        [serial?._ref],
    )
    const q = useMemo(() => MSchedule.whereSinceNow(), [])

    const SerialDetail_ = serial && (
        <Section>
            {serialForm.renderDialog()}
            <Button
                label="編集"
                onClick={() => serialForm.edit(serial, db.serials.update)}
            ></Button>

            <Section>
                <SimpleDataTable
                    // header={[]}
                    data={[
                        ['アクティブ?', bool(serial.active)],
                        ['ラベル', serial.label],

                        ['カテゴリ', serial.category],
                        ['アイコン', serial.customIcon],
                        ['色', serial.ribbonColors],
                        ['タイトル', serial.title],
                        ['URL', serial.url],
                        ['時刻あり?', bool(serial.hasTime)],
                        ['場所', serial.venue],
                    ]}
                ></SimpleDataTable>
            </Section>
        </Section>
    )

    const schedules = useSCollection({
        model,
        q,
        decoder: (s: ISchedule['_D']) => ({
            ...s,
            tableRow: [
                <Button
                    type="button"
                    label="編集"
                    onClick={() => scheduleForm.edit(s, model.update)}
                    css={{ margin: '0 -8px' }}
                ></Button>,

                bool(s.active),

                MSchedule.getCategory(s.category).name,
                toFormDate(s.date.toDate()),
                bool(s.hasTime),

                s.customIcon,
                s.ribbonColors?.length || '',

                s.title,
                s.url,
                s.parts.toString(),
                s.venue,
                bool(s.hasTickets),
                s.thumbUrl,
            ],
        }),
    })

    return (
        <>
            <PageSection>
                <Heading2 text={heading} marginY={16} noColor></Heading2>

                {SerialDetail_}
            </PageSection>

            <PageSection>
                <Section>
                    {scheduleForm.renderDialog()}
                    {scheduleForm.renderAddButton(() =>
                        scheduleForm.edit(
                            model.collectionRef.doc(),
                            model.create,
                        ),
                    )}
                </Section>

                <AdminDataTable
                    header={tableHeader}
                    data={schedules.array}
                ></AdminDataTable>
            </PageSection>
        </>
    )
}

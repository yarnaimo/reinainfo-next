import { Blue, useSCollection } from 'bluespark'
import React, { FC, useMemo } from 'react'
import { Button } from 'rmwc'
import { ISchedule, MSchedule } from '../../../models/Schedule'
import { db } from '../../../services/firebase'
import { toFormDate } from '../../../utils/date'
import { bool } from '../../../utils/html'
import { Heading2 } from '../../atoms/Heading2'
import { PageSection } from '../../blocks/PageSection'
import { Section } from '../../blocks/Section'
import { AdminDataTable } from './AdminDataTable'
import { useScheduleForm, useSerialScheduleForm } from './ScheduleForm'

type Props = { parent?: Blue.DocRef; heading?: string }

export const ScheduleSection: FC<Props> = ({
    parent,
    heading = 'Schedules',
}) => {
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
        () => (parent ? db._schedulesIn(parent) : db.schedules),
        [parent],
    )
    const q = useMemo(() => MSchedule.whereSinceNow(), [])
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

    const scheduleForm = parent ? useSerialScheduleForm() : useScheduleForm()

    return (
        <PageSection>
            <Heading2 text={heading} marginY={16} noColor></Heading2>

            <Section>
                {scheduleForm.renderDialog()}
                {scheduleForm.renderAddButton(() =>
                    scheduleForm.edit(model.collectionRef.doc(), model.create),
                )}
            </Section>

            <AdminDataTable
                header={tableHeader}
                data={schedules.array}
            ></AdminDataTable>
        </PageSection>
    )
}

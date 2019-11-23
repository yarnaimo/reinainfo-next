import { useSCollection } from 'bluespark'
import { NextPage } from 'next'
import React, { useMemo } from 'react'
import { Button, SimpleDataTable } from 'rmwc'
import { AdminContainer } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { Title } from '../../components/templates/Title'
import {
    filterSchedulesAfterNow,
    ISchedule,
    MSchedule,
} from '../../models/Schedule'
import { db } from '../../services/firebase'

const bool = (value: any) => (value ? <b>*</b> : '')

type Props = {}

const AdminSchedulesPage: NextPage<Props> = props => {
    // const serials = db.serials.getQuery({
    //     q: q => q.where('active', '==', true),
    //     decoder: (serial: ISerial['_D']) => {
    //         return {
    //             ...serial,
    //             tableRow: [serial.active && 'active', serial.label],
    //         }
    //     },
    // })

    const schedules = useSCollection({
        model: db.gSchedulesActive,
        q: filterSchedulesAfterNow(),
    })

    const tableHeaders = [
        [
            '',
            '',
            'カテゴリ',
            'アイコン',
            '色',
            'タイトル',
            'URL',
            '時刻?',
            'パート',
            '場所',
            'チケット?',
            'サムネイルURL',
        ],
    ]
    const tableData = useMemo(
        () =>
            schedules.array.map(s => [
                // <SmallIconButton
                //     icon={{
                //         icon: micon('pencil'),
                //         onClick: () =>
                //             s.api === 'search'
                //                 ? editSearchSource(s)
                //                 : editListSource(s),
                //     }}
                //     css={{ margin: '0 -8px' }}
                // ></SmallIconButton>,
                <Button label="Edit" onClick={() => editSchedule(s)}></Button>,
                bool(s.active),

                MSchedule.getCategory(s.category).name,
                s.customIcon,
                s.ribbonColors?.length || '',

                s.title,
                s.url,
                // s.date.toDate().,
                bool(s.hasTime),
                s.parts.toString(),
                s.venue,
                bool(s.hasTickets),
                s.thumbUrl,
            ]),
        [schedules.array],
    )

    // const scheduleDialog = useFormDialog(
    //     'スケジュール',
    //     {
    //         active: Field<boolean>(true),
    //         timelineId: Field<string>(''),

    //         feedUrl: Field<string>(''),
    //         prevPublishedAt: OptField<string>(''),

    //         siteName: Field<string>(''),
    //         faviconUrl: OptField<string>(''),
    //         siteUrl: OptField<string>(''),
    //     },
    //     data => ({
    //         ...data,
    //         type: 'feed' as const,
    //         prevPublishedAt: is.null_(data.prevPublishedAt)
    //             ? null
    //             : dayjs(data.prevPublishedAt).toDate(),
    //     }),
    //     form => (
    //         <>
    //             <Section>
    //                 <Checkbox
    //                     label="アクティブ"
    //                     {...form.field('active', 'bool')}
    //                 ></Checkbox>
    //             </Section>
    //             <Section>
    //                 <TextField
    //                     label="サイト名"
    //                     {...form.readonly('siteName', 'text')}
    //                 ></TextField>
    //             </Section>
    //             <Section>
    //                 <Select
    //                     label="保存先タイムライン"
    //                     // enhanced
    //                     options={timelines.array.map(timeline => ({
    //                         value: timeline._id,
    //                         label: timeline.name,
    //                     }))}
    //                     {...form.field('timelineId', 'text')}
    //                 />
    //             </Section>
    //             <Section>
    //                 <TextField
    //                     label="URL"
    //                     {...form.field('feedUrl', 'text')}
    //                 ></TextField>
    //             </Section>
    //             <Section>
    //                 <TextField
    //                     label="最終更新 (UTC)"
    //                     {...form.field('prevPublishedAt', 'text')}
    //                 ></TextField>
    //             </Section>
    //         </>
    //     ),
    // )

    const editSchedule = (schedule?: ISchedule['_D']) => null
    //     scheduleDialog
    //         .prompt({
    //             titleSuffix: schedule ? 'の編集' : 'の追加',
    //             data: schedule && {
    //                 ...schedule,
    //                 prevPublishedAt:
    //                     schedule.prevPublishedAt &&
    //                     schedule.prevPublishedAt.toDate().toISOString(),
    //             },
    //         })
    //         .then(async data => {
    //             if (!data) {
    //                 return
    //             }
    //             return schedule
    //                 ? db.sources.update(schedule._ref, data)
    //                 : db.sources.create(null, data)
    // })

    return (
        <AdminContainer>
            <Title title="Admin - Schedules" path={null}></Title>

            <h2>Schedules</h2>

            <Section css={{ overflowX: 'scroll' }}>
                <SimpleDataTable
                    headers={tableHeaders}
                    data={tableData}
                ></SimpleDataTable>
            </Section>
        </AdminContainer>
    )
}

// AdminSchedulesPage.getInitialProps = async ctx => {
//     return {}
// }

export default AdminSchedulesPage

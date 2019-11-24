import { useSCollection } from 'bluespark'
import dayjs from 'dayjs'
import { NextPage } from 'next'
import React, { ReactNode, useMemo, useState } from 'react'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
    SimpleDataTable,
} from 'rmwc'
import { AdminContainer } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { ScheduleDetailContent } from '../../components/molecules/ScheduleDetailContent'
import { useScheduleForm } from '../../components/molecules/ScheduleForm'
import { Title } from '../../components/templates/Title'
import {
    filterSchedulesAfterNow,
    ISchedule,
    IScheduleSerialized,
    MSchedule,
} from '../../models/Schedule'
import { db } from '../../services/firebase'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'

const bool = (value: any) => (value ? <b>*</b> : '')

type Props = {}

const S = (children: ReactNode) => <Section>{children}</Section>

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
            '日時',
            '時刻あり?',
            'パート',
            '場所',
            'チケットあり?',
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
                dayjs(s.date.toDate()).format('YYYY-MM-DD HH:mm'),
                bool(s.hasTime),
                s.parts.toString(),
                s.venue,
                bool(s.hasTickets),
                s.thumbUrl,
            ]),
        [schedules.array],
    )

    const [schedulePreview, setSchedulePreview] = useState<
        IScheduleSerialized
    >()

    const scheduleForm = useScheduleForm()

    const [dialogTitle, setDialogTitle] = useState('')

    const DialogContent_ = (
        <DialogContent>
            {schedulePreview && (
                <ScheduleDetailContent
                    compact={false}
                    schedule={schedulePreview}
                ></ScheduleDetailContent>
            )}
            <Button
                label="プレビュー"
                onClick={() => {
                    // encodeData().then(encoded => {
                    //     setSchedulePreview(encoded as any)
                    // })
                }}
            ></Button>

            {scheduleForm.rendered}
        </DialogContent>
    )

    const dialog = useBool(false)
    const isSaving = useBool(false)

    const Dialog_ = (
        <Dialog open={dialog.state}>
            <DialogTitle>{dialogTitle}</DialogTitle>

            {DialogContent_}

            <DialogActions>
                <DialogButton
                    action="cancel"
                    onClick={() => {
                        dialog.off()
                    }}
                >
                    キャンセル
                </DialogButton>

                <DialogButton
                    action="accept"
                    unelevated
                    disabled={isSaving.state}
                    icon={
                        isSaving.state ? (
                            <CircularProgress></CircularProgress>
                        ) : (
                            micon('check')
                        )
                    }
                    onClick={
                        scheduleForm.handleSubmit(data => {
                            console.log(data)
                        })
                        // if (formRef.validate()) {
                        //     dialog.off()

                        //     const encoded = encodeFormData(form)
                        //     console.log(encoded)
                        // }
                    }
                >
                    保存
                </DialogButton>
            </DialogActions>
        </Dialog>
    )

    const editSchedule = (s?: ISchedule['_D']) => {
        setDialogTitle(s ? 'スケジュールの編集' : 'スケジュールの追加')
        scheduleForm.init(s)

        dialog.on()
    }

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

            <Section>
                {Dialog_}

                <Button
                    outlined
                    icon={micon('plus')}
                    label={dialogTitle}
                    onClick={() => editSchedule()}
                ></Button>
            </Section>
        </AdminContainer>
    )
}

// AdminSchedulesPage.getInitialProps = async ctx => {
//     return {}
// }

export default AdminSchedulesPage

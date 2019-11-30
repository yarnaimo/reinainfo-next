import { useSCollection } from 'bluespark'
import dayjs from 'dayjs'
import { NextPage } from 'next'
import React, { FC, useMemo, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
    Button,
    Dialog,
    List,
    SimpleDataTable,
    SimpleListItem,
    TextField,
} from 'rmwc'
import { _retweetManually } from '../../../server/api/retweetManually'
import { AdminContainer } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { ScheduleDetailContent } from '../../components/molecules/ScheduleDetailContent'
import {
    ScheduleForm,
    useScheduleForm,
} from '../../components/molecules/ScheduleForm'
import { Title } from '../../components/templates/Title'
import {
    ISchedule,
    IScheduleSerialized,
    MSchedule,
} from '../../models/Schedule'
import { app, callable, db } from '../../services/firebase'
import { toFormDate } from '../../utils/date'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'

const RetweetSection: FC<{}> = () => {
    const [tweetIdField, setTweetIdField] = useState('')
    const [retweetTargets, setRetweetTargets] = useState<
        { screenName: string; id: string }[]
    >([])

    return (
        <>
            <h2>Retweet</h2>

            <Section>
                <List>
                    {retweetTargets.map(({ screenName, id }, i) => (
                        <SimpleListItem
                            key={i}
                            text={`${screenName}/${id}`}
                            metaIcon={{
                                icon: 'close',
                                onClick: () => {
                                    setRetweetTargets(pre =>
                                        pre.filter((_, _i) => i !== _i),
                                    )
                                },
                            }}
                        />
                    ))}
                </List>

                <TextField
                    label="Paste Tweet URL"
                    onPaste={e => {
                        const text: string = e.clipboardData.getData('text')
                        const twitterMatch = text.match(
                            /twitter.com\/([\w]+)\/status\/(\d+)/,
                        )

                        if (twitterMatch) {
                            const [, screenName, id] = twitterMatch

                            if (!retweetTargets.some(t => t.id === id)) {
                                setRetweetTargets(pre => [
                                    ...pre,
                                    {
                                        screenName,
                                        id,
                                    },
                                ])
                            }
                        }

                        setTweetIdField('')
                    }}
                    value={tweetIdField}
                    onChange={() => {}}
                ></TextField>
            </Section>

            <Section>
                <Button
                    label="リツイート"
                    onClick={() => {
                        callable<typeof _retweetManually>('retweetManually', {
                            ids: retweetTargets.map(t => t.id),
                        }).then(res => {
                            if (res) {
                                setRetweetTargets([])
                                window.alert(
                                    `${res.retweetCount} 件リツイートしました`,
                                )
                            }
                        })
                    }}
                ></Button>
            </Section>
        </>
    )
}

const ScheduleDialog: FC<{
    scheduleForm: ReturnType<typeof useScheduleForm>
    open: boolean
    onCancel: () => void
    onAccept: (data: ISchedule['_E']) => Promise<void>
}> = ({ scheduleForm, open, onCancel, onAccept }) => {
    const [previewSchedule, setPreviewSchedule] = useState<
        IScheduleSerialized
    >()

    return (
        <Dialog
            open={open}
            css={{
                '& > .mdc-dialog__container': {
                    width: '100%',
                },
                '& > * > .mdc-dialog__surface': {
                    width: '100%',
                },
            }}
        >
            {scheduleForm.dialogTitle(
                'スケジュールの登録',
                'スケジュールの編集',
            )}

            {scheduleForm.dialogContent(
                <>
                    {previewSchedule && (
                        <ScheduleDetailContent
                            compact={false}
                            schedule={previewSchedule}
                        ></ScheduleDetailContent>
                    )}
                    <Button
                        label="プレビュー"
                        onClick={scheduleForm.handleSubmit(data => {
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

                    <ScheduleForm {...scheduleForm}></ScheduleForm>
                </>,
            )}

            {scheduleForm.dialogActions({
                onCancel,
                onAccept,
            })}
        </Dialog>
    )
}

const ScheduleSection: FC<{}> = () => {
    const bool = (value: any) => (value ? <b>*</b> : '')

    // const serials = db.serials.getQuery({
    //     q: q => q.where('active', '==', true),
    //     decoder: (serial: ISerial['_D']) => {
    //         return {
    //             ...serial,
    //             tableRow: [serial.active && 'active', serial.label],
    //         }
    //     },
    // })
    const q = useMemo(() => MSchedule.whereSinceNow(), [])
    const schedules = useSCollection({
        model: db.gSchedulesActive,
        q,
    })

    const tableHeaders = [
        [
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
        ],
    ]
    const tableData = useMemo(
        () =>
            schedules.array.map(s => [
                <Button
                    label="Edit"
                    onClick={() => editSchedule(s)}
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
            ]),
        [schedules.array],
    )

    const dialog = useBool(false)
    const scheduleForm = useScheduleForm()

    const editSchedule = (s?: ISchedule['_D']) => {
        scheduleForm.init({
            data: s,
            ref: s ? s._ref : db.schedules.collectionRef.doc(),
        })
        dialog.on()
    }

    return (
        <>
            <h2>Schedules</h2>

            <Section>
                <ScheduleDialog
                    open={dialog.state}
                    scheduleForm={scheduleForm}
                    onCancel={dialog.off}
                    onAccept={async data => {
                        dialog.off()
                        await db.schedules[scheduleForm.action](
                            scheduleForm.docRef!,
                            data,
                        )
                    }}
                ></ScheduleDialog>

                <Button
                    outlined
                    icon={micon('plus')}
                    label={'スケジュールの登録'}
                    onClick={() => editSchedule()}
                ></Button>
            </Section>

            <Section css={{ overflowX: 'scroll' }}>
                <SimpleDataTable
                    headers={tableHeaders}
                    data={tableData}
                ></SimpleDataTable>
            </Section>
        </>
    )
}

type Props = {}

const AdminIndexPage: NextPage<Props> = props => {
    const [user, loading, error] = useAuthState(app.auth())

    if (!user) {
        return <></>
    }

    return (
        <AdminContainer>
            <Title title="Admin - Schedules" path={null}></Title>

            <RetweetSection></RetweetSection>

            <div css={{ height: 16 }}></div>

            <ScheduleSection></ScheduleSection>
        </AdminContainer>
    )
}

// AdminSchedulesPage.getInitialProps = async ctx => {
//     return {}
// }

export default AdminIndexPage

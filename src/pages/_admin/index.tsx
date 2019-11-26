import { useSCollection } from 'bluespark'
import dayjs from 'dayjs'
import { NextPage } from 'next'
import React, { useMemo, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
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
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'

const bool = (value: any) => (value ? <b>*</b> : '')

type Props = {}

const AdminIndexPage: NextPage<Props> = props => {
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
                <Button
                    label="Edit"
                    onClick={() => editSchedule(s)}
                    css={{ margin: '0 -8px' }}
                ></Button>,
                bool(s.active),

                MSchedule.getCategory(s.category).name,
                dayjs(s.date.toDate()).format('YYYY-MM-DD HH:mm'),
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

    const scheduleForm = useScheduleForm()

    const [previewSchedule, setPreviewSchedule] = useState<
        IScheduleSerialized
    >()
    const [editingSchedule, setEditingSchedule] = useState<ISchedule['_D']>()

    const DialogContent_ = (
        <DialogContent>
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
        </DialogContent>
    )

    const dialog = useBool(false)
    const isSaving = useBool(false)

    const Dialog_ = (
        <Dialog open={dialog.state}>
            <DialogTitle>
                スケジュールの{editingSchedule ? '編集' : '登録'}
            </DialogTitle>

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
                    onClick={scheduleForm.handleSubmit(data => {
                        dialog.off()
                        console.log(data)

                        editingSchedule
                            ? db.schedules.update(editingSchedule._ref, data)
                            : db.schedules.create(null, data)
                    })}
                >
                    保存
                </DialogButton>
            </DialogActions>
        </Dialog>
    )

    const editSchedule = (s?: ISchedule['_D']) => {
        setEditingSchedule(s)
        scheduleForm.init(s)

        dialog.on()
    }

    const Schedules_ = (
        <>
            <Section>
                {Dialog_}

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

    //

    const [tweetIdField, setTweetIdField] = useState('')
    const [retweetTargets, setRetweetTargets] = useState<
        { screenName: string; id: string }[]
    >([])

    const Retweet_ = (
        <>
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

    const [user, loading, error] = useAuthState(app.auth())

    if (!user) {
        return <></>
    }

    return (
        <AdminContainer>
            <Title title="Admin - Schedules" path={null}></Title>

            <h2>Retweet</h2>
            {Retweet_}

            <div css={{ height: 16 }}></div>

            <h2>Schedules</h2>
            {Schedules_}
        </AdminContainer>
    )
}

// AdminSchedulesPage.getInitialProps = async ctx => {
//     return {}
// }

export default AdminIndexPage

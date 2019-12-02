import { useSCollection } from 'bluespark'
import { NextPage } from 'next'
import React, { FC, useMemo, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Button, List, SimpleDataTable, SimpleListItem, TextField } from 'rmwc'
import { _retweetManually } from '../../../server/api/retweet-manually'
import { AdminContainer } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { useScheduleForm } from '../../components/molecules/ScheduleForm'
import { Title } from '../../components/templates/Title'
import { MSchedule } from '../../models/Schedule'
import { app, callable, db } from '../../services/firebase'
import { toFormDate } from '../../utils/date'
import { micon } from '../../utils/icon'

const RetweetSection: FC<{}> = () => {
    const [tweetIdField, setTweetIdField] = useState('')
    const [retweetTargets, setRetweetTargets] = useState<
        { screenName: string; id: string }[]
    >([])

    const retweet = (isMyTweet: boolean) =>
        callable<typeof _retweetManually>('retweetManually', {
            ids: retweetTargets.map(t => t.id),
            isMyTweet,
        })

    return (
        <>
            <h2>Retweet</h2>

            <Section>
                {!!retweetTargets.length && (
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
                )}

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
                    label="トピックに追加"
                    css={{ marginRight: 12 }}
                    onClick={() => {
                        retweet(true).then(res => {
                            if (res) {
                                setRetweetTargets([])
                                window.alert(
                                    `${res.retweetCount} 件追加しました`,
                                )
                            }
                        })
                    }}
                ></Button>
                <Button
                    label="リツイート"
                    unelevated
                    onClick={() => {
                        retweet(false).then(res => {
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
                    onClick={() =>
                        scheduleForm.edit(s, (data, _ref) =>
                            db.schedules.update(_ref, data),
                        )
                    }
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

    const scheduleForm = useScheduleForm()

    return (
        <>
            <h2>Schedules</h2>

            <Section>
                {scheduleForm.render()}

                <Button
                    outlined
                    icon={micon('plus')}
                    label={'スケジュールの登録'}
                    onClick={() =>
                        scheduleForm.edit(
                            db.schedules.collectionRef.doc(),
                            (data, _ref) => db.schedules.create(_ref, data),
                        )
                    }
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

export default AdminIndexPage

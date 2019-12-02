import { useSCollection } from 'bluespark'
import { NextPage } from 'next'
import React, { FC, useMemo, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Button, List, SimpleListItem, TextField } from 'rmwc'
import { _retweetManually } from '../../../server/api/retweet-manually'
import { Heading2 } from '../../components/atoms/Heading2'
import { AdminContainer } from '../../components/blocks/Container'
import { PageSection } from '../../components/blocks/PageSection'
import { Section } from '../../components/blocks/Section'
import { AdminDataTable } from '../../components/molecules/AdminDataTable'
import { useScheduleForm } from '../../components/molecules/ScheduleForm'
import { useSerialForm } from '../../components/molecules/SerialForm'
import { Title } from '../../components/templates/Title'
import { ISchedule, MSchedule } from '../../models/Schedule'
import { ISerial } from '../../models/Serial'
import { app, callable, db } from '../../services/firebase'
import { toFormDate } from '../../utils/date'
import { bool } from '../../utils/html'

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
        <PageSection>
            <Heading2 text="Retweet" marginY={16} noColor></Heading2>

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
        </PageSection>
    )
}

const ScheduleSection: FC<{}> = () => {
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
    const q = useMemo(() => MSchedule.whereSinceNow(), [])
    const schedules = useSCollection({
        model: db.schedules,
        q,
        decoder: (s: ISchedule['_D']) => ({
            ...s,
            tableRow: [
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
            ],
        }),
    })

    const scheduleForm = useScheduleForm()

    return (
        <PageSection>
            <Heading2 text="Schedules" marginY={16} noColor></Heading2>

            <Section>
                {scheduleForm.render()}
                {scheduleForm.renderAddButton(() =>
                    scheduleForm.edit(
                        db.schedules.collectionRef.doc(),
                        (data, _ref) => db.schedules.create(_ref, data),
                    ),
                )}
            </Section>

            <AdminDataTable
                header={tableHeader}
                data={schedules.array}
            ></AdminDataTable>
        </PageSection>
    )
}

const SerialSection: FC<{}> = () => {
    const serials = useSCollection({
        model: db.serials,
        q: q => q.where('active', '==', true),
        decoder: (r: ISerial['_D']) => {
            return {
                ...r,
                tableRow: [bool(r.active), r.label],
            }
        },
    })

    const tableHeader = ['', 'ラベル']
    const serialForm = useSerialForm()

    return (
        <PageSection>
            <Heading2 text="Serials" marginY={16} noColor></Heading2>

            <Section>
                {serialForm.render()}
                {serialForm.renderAddButton(() =>
                    serialForm.edit(
                        db.serials.collectionRef.doc(),
                        (data, _ref) => db.serials.create(_ref, data),
                    ),
                )}
            </Section>

            <AdminDataTable
                header={tableHeader}
                data={serials.array}
            ></AdminDataTable>
        </PageSection>
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
            <SerialSection></SerialSection>
            <ScheduleSection></ScheduleSection>
        </AdminContainer>
    )
}

export default AdminIndexPage

import { useSCollection } from 'bluespark'
import { NextPage } from 'next'
import Link from 'next/link'
import React, { FC, useState } from 'react'
import { Button, List, SimpleListItem, TextField } from 'rmwc'
import { _retweetManually } from '../../../server/api/retweet-manually'
import { Heading2 } from '../../components/atoms/Heading2'
import { PageSection } from '../../components/blocks/PageSection'
import { Section } from '../../components/blocks/Section'
import { AdminDataTable } from '../../components/molecules/admin/AdminDataTable'
import { ScheduleSection } from '../../components/molecules/admin/ScheduleSection'
import { useSerialForm } from '../../components/molecules/admin/SerialForm'
import { AdminLayout } from '../../components/templates/AdminLayout'
import { Title } from '../../components/templates/Title'
import { ISerial } from '../../models/Serial'
import { callable, db } from '../../services/firebase'

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

const serialTableKeys: typeof useSerialForm._K[] = ['active', 'label']

const SerialSection: FC<{}> = () => {
    const serialForm = useSerialForm()

    const serials = useSCollection({
        model: db.serials,
        q: q => q.where('active', '==', true),
        decoder: (r: ISerial['_D']) => ({
            ...r,
            tableRow: serialForm.tableRow(r, serialTableKeys, [
                <Link
                    href="/_admin/serials/[id]"
                    as={`/_admin/serials/${r._id}`}
                    passHref
                >
                    <Button
                        tag="a"
                        label="開く"
                        css={{ margin: '0 -8px' }}
                    ></Button>
                </Link>,
            ]),
        }),
    })

    return (
        <PageSection>
            <Heading2 text="Serials" marginY={16} noColor></Heading2>

            <Section>
                {serialForm.renderDialog()}
                {serialForm.renderAddButton(() =>
                    serialForm.editDoc(
                        db.serials.collectionRef.doc(),
                        db.serials.create,
                    ),
                )}
            </Section>

            <AdminDataTable
                header={serialForm.tableHeader(serialTableKeys, [''])}
                data={serials.array}
            ></AdminDataTable>
        </PageSection>
    )
}

type Props = {}

const AdminIndexPage: NextPage<Props> = () => {
    return (
        <AdminLayout>
            <Title title="Admin - Schedules" path={null}></Title>

            <RetweetSection></RetweetSection>
            <SerialSection></SerialSection>
            <ScheduleSection></ScheduleSection>
        </AdminLayout>
    )
}

export default AdminIndexPage

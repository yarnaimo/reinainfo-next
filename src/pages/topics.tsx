import dayjs from 'dayjs'
import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { MainContainer } from '../components/blocks/Container'
import { Solid } from '../components/blocks/Flex'
import { Section } from '../components/blocks/Section'
import { TweetEmbed } from '../components/molecules/TweetEmbed'
import { Title } from '../components/templates/Title'
import { filterByTimestamp } from '../models/Schedule'
import { ITweetLogSerialized, MTweetLog } from '../models/TweetLog'
import { db } from '../services/firebase'
import { color } from '../utils/color'
import { margin } from '../utils/css'

const getRetweetLogsSerialized = () =>
    db.retweetLogs.getQuery({
        q: filterByTimestamp('_createdAt', dayjs().subtract(2, 'week')),
        decoder: MTweetLog.serialize,
    })

type Props = { retweetLogs: ITweetLogSerialized[] }

const TopicsPage: NextPage<Props> = ({ retweetLogs }) => {
    return (
        <MainContainer>
            <Title title="Topics" path="topics"></Title>

            <Solid ai="center" css={{ ...margin({ y: 24 }) }}>
                <h2
                    css={{
                        ...margin({ y: 0 }),
                        color: color.brown(0.75),
                    }}
                >
                    Topics
                </h2>
            </Solid>

            <Section>
                {retweetLogs.map(l => (
                    <TweetEmbed key={l.tweetId} id={l.tweetId}></TweetEmbed>
                ))}
            </Section>
        </MainContainer>
    )
}

TopicsPage.getInitialProps = async ctx => {
    // if (ctx.req) {
    const { array: retweetLogs } = await getRetweetLogsSerialized()
    return { retweetLogs }
    // } else {
    //     return { tweetLogs: undefined }
    // }
}

export default TopicsPage

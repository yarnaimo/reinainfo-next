import dayjs from 'dayjs'
import { NextPage } from 'next'
import React, { useContext } from 'react'
import { useEffectOnce } from 'react-use'
import {} from 'rmwc'
import { MainContainer } from '../components/blocks/Container'
import { Solid } from '../components/blocks/Flex'
import { Section } from '../components/blocks/Section'
import { TweetEmbed } from '../components/molecules/TweetEmbed'
import { Store } from '../components/templates/Store'
import { Title } from '../components/templates/Title'
import { IRetweetLogSerialized, MRetweetLog } from '../models/RetweetLog'
import { filterByTimestamp } from '../models/Schedule'
import { db } from '../services/firebase'
import { color } from '../utils/color'
import { margin } from '../utils/css'

const getRetweetLogsSerialized = () =>
    db.retweetLogs.getQuery({
        q: filterByTimestamp('_createdAt', dayjs().subtract(2, 'week')),
        decoder: MRetweetLog.serialize,
    })

type Props = { retweetLogs?: IRetweetLogSerialized[] }

const TopicsPage: NextPage<Props> = ({ retweetLogs: pRetweetLogs }) => {
    const { globalState, setGlobalState } = useContext(Store)

    useEffectOnce(() => {
        setGlobalState({ topicsPageAccessed: true })
    })

    const retweetLogs = globalState.retweetLogs.array || pRetweetLogs || []

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
                    <TweetEmbed key={l._id} id={l._id}></TweetEmbed>
                ))}
            </Section>
        </MainContainer>
    )
}

TopicsPage.getInitialProps = async ctx => {
    if (ctx.req) {
        const { array: retweetLogs } = await getRetweetLogsSerialized()
        return { retweetLogs }
    } else {
        return { retweetLogs: undefined }
    }
}

export default TopicsPage

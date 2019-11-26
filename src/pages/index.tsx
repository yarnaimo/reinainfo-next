import { NextPage } from 'next'
import React, { useContext, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { Button } from 'rmwc'
import { MainContainer } from '../components/blocks/Container'
import { Solid } from '../components/blocks/Flex'
import { Section } from '../components/blocks/Section'
import { TweetEmbed } from '../components/molecules/TweetEmbed'
import { Store } from '../components/templates/Store'
import { Title } from '../components/templates/Title'
import { ITopicSerialized, MTopic } from '../models/Topic'
import { db } from '../services/firebase'
import { color } from '../utils/color'
import { margin } from '../utils/css'

const getTopicsSerialized = () =>
    db.topics.getQuery({
        q: MTopic.whereCreatedWithinTwoWeeks(),
        decoder: MTopic.serialize,
    })

type Props = { topics?: ITopicSerialized[] }

const TopicsPage: NextPage<Props> = ({ topics: pTopics }) => {
    const { globalState, setGlobalState } = useContext(Store)

    useEffectOnce(() => {
        setGlobalState({ topicsPageAccessed: true })
    })

    const topics = globalState.topics.array || pTopics || []

    const [maxIndex, setMaxIndex] = useState(20)

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
                {topics.slice(0, maxIndex).map(l => (
                    <TweetEmbed key={l._id} id={l.tweetId}></TweetEmbed>
                ))}
            </Section>

            <Section>
                <Button
                    label="さらに表示"
                    onClick={() => setMaxIndex(i => i + 20)}
                ></Button>
            </Section>
        </MainContainer>
    )
}

TopicsPage.getInitialProps = async ctx => {
    if (ctx.req) {
        const { array: topics } = await getTopicsSerialized()
        return { topics }
    } else {
        return { topics: undefined }
    }
}

export default TopicsPage

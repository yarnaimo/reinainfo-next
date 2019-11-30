import { NextPage } from 'next'
import React, { useContext, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { Button } from 'rmwc'
import { Heading2 } from '../components/atoms/Heading2'
import { MainContainer } from '../components/blocks/Container'
import { Section } from '../components/blocks/Section'
import { TweetEmbed } from '../components/molecules/TweetEmbed'
import { Store } from '../components/templates/Store'
import { Title } from '../components/templates/Title'
import { ITopicSerialized, MTopic } from '../models/Topic'
import { db } from '../services/firebase'

const getTopicsSerialized = () =>
    db.topics.getQuery({
        q: MTopic.whereCreatedWithinTwoWeeks(),
        decoder: MTopic.serialize,
    })

type Props = { topics?: ITopicSerialized[] }

const TopicsPage: NextPage<Props> = ({ topics: pTopics }) => {
    const global = useContext(Store)

    useEffectOnce(() => {
        global.listenTopics()
    })

    const topics = global.topics.array || pTopics || []

    const [maxIndex, setMaxIndex] = useState(20)

    return (
        <MainContainer>
            <Title title="Topics" path="topics"></Title>

            <Heading2 text="Topics"></Heading2>

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

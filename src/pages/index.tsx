import { useSDocOnce } from 'bluespark'
import { NextPage } from 'next'
import React from 'react'
import { Heading2 } from '../components/atoms/Heading2'
import { MainContainer } from '../components/blocks/Container'
import { Section } from '../components/blocks/Section'
import { CollectionTimeline } from '../components/molecules/CollectionTimeline'
import { Title } from '../components/templates/Title'
import { db } from '../services/firebase'

type Props = {}

const TopicsPage: NextPage<Props> = () => {
    const twitterCollection = useSDocOnce({
        model: db.twitterCollections,
        doc: 'topics',
    })

    return (
        <MainContainer>
            <Title title="Topics" path="topics"></Title>

            <Heading2 text="Topics"></Heading2>

            <Section>
                <CollectionTimeline
                    collectionId={twitterCollection.data?.collectionId}
                ></CollectionTimeline>
            </Section>
        </MainContainer>
    )
}

// TopicsPage.getInitialProps = async ctx => {
// }

export default TopicsPage

import { NextPage } from 'next'
import React from 'react'
import { Heading2 } from '../components/atoms/Heading2'
import { MainContainer } from '../components/blocks/Container'
import { PageSection } from '../components/blocks/PageSection'
import { Section } from '../components/blocks/Section'
import { CollectionTimeline } from '../components/molecules/CollectionTimeline'
import { Title } from '../components/templates/Title'
import {
  ITwitterCollectionSerialized,
  MTwitterCollection,
} from '../models/TwitterCollection'
import { db } from '../services/firebase'

type Props = { twitterCollection?: ITwitterCollectionSerialized }

const TopicsPage: NextPage<Props> = ({ twitterCollection }) => {
  return (
    <MainContainer>
      <Title title="Topics" path="topics"></Title>

      <PageSection>
        <Heading2 text="Topics"></Heading2>

        <Section>
          <CollectionTimeline
            collectionId={twitterCollection?.collectionId}
          ></CollectionTimeline>
        </Section>
      </PageSection>
    </MainContainer>
  )
}

TopicsPage.getInitialProps = async (ctx) => {
  const twitterCollection = await db.twitterCollections.getDoc({
    doc: 'topics',
    decoder: MTwitterCollection.serialize,
  })
  return { twitterCollection }
}

export default TopicsPage

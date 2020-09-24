import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { ExternalLink } from '../../components/atoms/ExternalLink'
import { Heading2 } from '../../components/atoms/Heading2'
import { MainContainer } from '../../components/blocks/Container'
import { PageSection } from '../../components/blocks/PageSection'
import { Section } from '../../components/blocks/Section'
import { Title } from '../../components/templates/Title'

type Props = {}

const InfoPage: NextPage<Props> = (props) => {
  return (
    <MainContainer>
      <Title title="Info" path="info"></Title>

      <PageSection>
        <Heading2 text="Info"></Heading2>

        <Section>
          <p>{'上田麗奈さん非公式info'}</p>
          <p>
            {'Twitter アカウント - '}
            <ExternalLink href="https://twitter.com/Unoffishama">
              {'@Unoffishama'}
            </ExternalLink>
          </p>
          <p>
            {'管理者 - '}
            <ExternalLink href="https://twitter.com/yarnaimo">
              {'@yarnaimo'}
            </ExternalLink>
          </p>
          <p>
            {'Github リポジトリ - '}
            <ExternalLink href="https://github.com/yarnaimo/reinainfo-next">
              {'yarnaimo/reinainfo-next'}
            </ExternalLink>
          </p>
        </Section>
      </PageSection>
    </MainContainer>
  )
}

export default InfoPage

import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { ExternalLink } from '../../components/atoms/ExternalLink'
import { MainContainer } from '../../components/blocks/Container'
import { Solid } from '../../components/blocks/Flex'
import { Section } from '../../components/blocks/Section'
import { Title } from '../../components/templates/Title'
import { color } from '../../utils/color'
import { margin } from '../../utils/css'

type Props = {}

const InfoPage: NextPage<Props> = props => {
    return (
        <MainContainer>
            <Title title="Info" path="info"></Title>

            <Solid ai="center" css={{ ...margin({ y: 24 }) }}>
                <h2
                    css={{
                        ...margin({ y: 0 }),
                        color: color.brown(0.75),
                    }}
                >
                    Info
                </h2>
            </Solid>

            <Section>
                <p>上田麗奈さん非公式info</p>
                <p>
                    Twitter アカウント -{' '}
                    <ExternalLink href="https://twitter.com/Unoffishama">
                        @Unoffishama
                    </ExternalLink>
                </p>
                <p>
                    管理者 -{' '}
                    <ExternalLink href="https://twitter.com/yarnaimo">
                        @yarnaimo
                    </ExternalLink>
                </p>
                <p>
                    Github リポジトリ -{' '}
                    <ExternalLink href="https://github.com/yarnaimo/reinainfo-next">
                        yarnaimo/reinainfo-next
                    </ExternalLink>
                </p>
            </Section>
        </MainContainer>
    )
}

// InfoPage.getInitialProps = async ctx => {
//     return {  }
// }

export default InfoPage

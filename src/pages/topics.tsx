import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { MainContainer } from '../components/blocks/Container'
import { Title } from '../components/templates/Title'

type Props = {}

const TopicsPage: NextPage<Props> = props => {
    return (
        <MainContainer>
            <Title title="Topics" path="topics"></Title>
        </MainContainer>
    )
}

TopicsPage.getInitialProps = async ctx => {
    return {}
}

export default TopicsPage

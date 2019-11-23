import { NextPage } from 'next'
import React from 'react'
import { SimpleDataTable } from 'rmwc'
import { MainContainer } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { Title } from '../../components/templates/Title'
import { ISerial } from '../../models/Serial'
import { db } from '../../services/firebase'

type Props = {}

const AdminSchedulesPage: NextPage<Props> = props => {
    const serials = db.serials.getQuery({
        q: q => q.where('active', '==', true),
        decoder: (serial: ISerial['_D']) => {
            return {
                ...serial,
                tableRow: [serial.active && 'active', serial.label],
            }
        },
    })

    return (
        <MainContainer>
            <Title title="Admin - Schedules" path={null}></Title>

            <h2>Schedules</h2>

            <Section>
                <SimpleDataTable data={[[]]}></SimpleDataTable>
            </Section>
        </MainContainer>
    )
}

AdminSchedulesPage.getInitialProps = async ctx => {
    return {}
}

export default AdminSchedulesPage

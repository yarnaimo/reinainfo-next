import { Global } from '@emotion/core'
import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { ScheduleDetailContent } from '../../../components/molecules/ScheduleDetailContent'
import { IScheduleSerialized, MSchedule } from '../../../models/Schedule'
import { db } from '../../../services/firebase'

type Props = { schedule: IScheduleSerialized }

const getSchedule = async (id: string) =>
    db.schedules.getDoc({ doc: id, decoder: MSchedule.serialize })

const HeadlessSchedulePage: NextPage<Props> = ({ schedule }) => {
    return (
        <>
            <Global
                styles={`
                    @font-face {
                        font-family: 'BIZ-UDPGothic';
                        src: url('/assets/fonts/BIZ-UDPGothic-02.ttf') format('truetype');
                        font-weight: 400;
                        font-style: normal;
                    }
                    @font-face {
                        font-family: 'BIZ-UDPGothic';
                        src: url('/assets/fonts/BIZ-UDPGothic-Bold-02.ttf') format('truetype');
                        font-weight: 700;
                        font-style: normal;
                    }
                `}
            ></Global>
            <ScheduleDetailContent
                schedule={schedule}
                compact={true}
                css={{ fontFamily: 'Ubuntu, "BIZ-UDPGothic", sans-serif' }}
            ></ScheduleDetailContent>
        </>
    )
}

HeadlessSchedulePage.getInitialProps = async ctx => {
    const params = ctx.query as { id: string }
    const schedule = await getSchedule(params.id)
    if (!schedule) {
        throw new Error('schedule not found')
    }
    return { schedule }
}

export default HeadlessSchedulePage

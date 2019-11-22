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
        <ScheduleDetailContent
            schedule={schedule}
            compact={true}
        ></ScheduleDetailContent>
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

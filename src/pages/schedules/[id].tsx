import { NextPage } from 'next'
import React, { useContext, useEffect, useState } from 'react'
import {} from 'rmwc'
import { MainContainer } from '../../components/blocks/Container'
import {
    ScheduleDetail,
    ScheduleDetailModal,
} from '../../components/molecules/ScheduleDetail'
import { Store } from '../../components/templates/Store'
import { Title } from '../../components/templates/Title'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { db } from '../../services/firebase'
import { useQueryParams } from '../../utils/hooks'

type Props = { schedule?: IScheduleSerialized }

const getSchedule = async (id: string) =>
    db.schedules.getDoc({ doc: id, decoder: MSchedule.serialize })

const SchedulePage: NextPage<Props> = ({ schedule: pSchedule }) => {
    const { globalState } = useContext(Store)
    const { map } = globalState.gSchedules
    // const router = useRouter()
    const { params, router } = useQueryParams({
        id: '',
        type: undefined as 'compact' | undefined,
    })

    const [_schedule, _setSchedule] = useState<IScheduleSerialized>()

    const schedule = map?.get(params.id) ?? pSchedule ?? _schedule

    // useEffectOnce(() => {
    //     router.prefetch('/schedules')
    // })
    // console.log(router)

    useEffect(() => {
        if (!globalState.schedulesPageAccessed && !pSchedule) {
            getSchedule(params.id).then(s => _setSchedule(s))
        }
    }, [globalState.schedulesPageAccessed, pSchedule, _setSchedule])

    if (!schedule) {
        return <></>
    }

    if (params.type === 'compact') {
        return (
            <ScheduleDetailModal
                schedule={schedule}
                compact={true}
            ></ScheduleDetailModal>
        )
    }

    return (
        <MainContainer>
            <Title title={schedule?.title}></Title>

            <ScheduleDetail
                schedule={schedule}
                open={true}
                onClose={() => router.push('/schedules', undefined)}
            ></ScheduleDetail>
        </MainContainer>
    )
}

SchedulePage.getInitialProps = async ctx => {
    if (ctx.req) {
        const params = ctx.query as { id: string }
        return { schedule: await getSchedule(params.id) }
    } else {
        return { schedule: undefined }
    }
}

export default SchedulePage

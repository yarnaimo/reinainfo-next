import { ComponentProps } from '@rmwc/types'
import dayjs from 'dayjs'
import { NextPage } from 'next'
import React, { FC, Fragment, useContext } from 'react'
import { animated, useSpring, useTransition } from 'react-spring'
import { useEffectOnce } from 'react-use'
import { MainContainer } from '../../components/blocks/Container'
import { Liquid, Solid } from '../../components/blocks/Flex'
import { Section } from '../../components/blocks/Section'
import { ScheduleCard } from '../../components/molecules/ScheduleCard'
import { Store } from '../../components/templates/Store'
import { Title } from '../../components/templates/Title'
import {
    IScheduleSerialized,
    IScheduleWithDayjs,
    MSchedule,
} from '../../models/Schedule'
import { db } from '../../services/firebase'
import { color } from '../../utils/color'
import { margin } from '../../utils/css'
import { useBool } from '../../utils/hooks'

type Props = { schedules?: IScheduleSerialized[] }

const getGSchedulesSerialized = () =>
    db.gSchedulesActive.getQuery(undefined, MSchedule.serialize)

// const variants: Variants = {
//     initial: {
//         transition: { staggerChildren: 0.0125, staggerDirection: -1 },
//     },
//     enter: {
//         transition: { staggerChildren: 0.0125, delayChildren: 0 },
//     },
//     exit: {
//         transition: { staggerChildren: 0.0125, staggerDirection: -1 },
//     },
// }

// const filterLabelStyle:CSSObject = {
//     fontSize: 12,
//     lineHeight: '24px',
//     cursor: 'pointer',
//     userSelect: 'none',
// }

const FilterLabel: FC<ComponentProps & { active: boolean; label: string }> = ({
    active,
    label,
    ...props
}) => {
    const spring = useSpring({
        color: active ? color.blue(1) : color.black(0.4),
    })

    return (
        <animated.div
            style={spring}
            css={{
                fontSize: 12,
                lineHeight: '24px',
                cursor: 'pointer',
                userSelect: 'none',
            }}
            {...(props as any)}
        >
            {label}
        </animated.div>
    )
}

type ScheduleChunks = {
    label: string
    schedules: IScheduleWithDayjs[]
}[]

const ScheduleList: FC<{ chunkedSchedules: ScheduleChunks }> = ({
    chunkedSchedules,
}) => {
    const transitions = useTransition(chunkedSchedules, s => s.label, {
        trail: 12,
        from: {
            transform: 'translateY(8px) scale(0.98)',
            opacity: 0,
        },
        enter: {
            transform: 'translateY(0px) scale(1)',
            opacity: 1,
        },
        leave: {
            transform: 'translateY(8px) scale(0.98)',
            opacity: 0,
        },
    })

    return (
        <>
            {transitions.map(({ item: chunk, props, key }) => (
                <Fragment key={key}>
                    <animated.h5
                        style={props}
                        css={{
                            ...margin({ top: 24, bottom: 12 }),
                            color: color.brown(0.75),
                        }}
                    >
                        {chunk.label}
                    </animated.h5>

                    {chunk.schedules.map(s => (
                        <ScheduleCard
                            key={s._id}
                            style={props}
                            schedule={s}
                        ></ScheduleCard>
                    ))}
                </Fragment>
            ))}
        </>
    )
}

const SchedulesPage: NextPage<Props> = ({ schedules: pSchedules }) => {
    const { globalState, setGlobalState } = useContext(Store)

    // const {
    //     params: { id },
    //     router,
    // } = useQueryParams<{ id?: string }>({})

    // const modalSchedule = useMemo(
    //     () => (is.string(id) ? globalState.gSchedules.map?.get(id) : undefined),
    //     [globalState.gSchedules.map, id],
    // )

    useEffectOnce(() => {
        // router.prefetch('/schedules/[id]')
        setGlobalState({ schedulesPageAccessed: true })
    })

    const schedules = globalState.gSchedules.array || pSchedules || []

    const excludeSerials = useBool(false)

    const filteredSchedules = schedules.filter(
        s => !excludeSerials || !s.isSerial,
    )

    const chunkedSchedules = filteredSchedules
        .map((s): IScheduleWithDayjs => ({ ...s, dayjs: dayjs(s.date) }))
        .reduce((chunks, s, i, arr) => {
            const prevSchedule = arr[i - 1]
            if (!prevSchedule || !prevSchedule.dayjs.isSame(s.dayjs, 'month')) {
                chunks.push({
                    label: s.dayjs.format('YYYY年M月'),
                    schedules: [],
                })
            }

            const lastChunk = chunks[chunks.length - 1]
            lastChunk.schedules.push(s)

            return chunks
        }, [] as ScheduleChunks)

    return (
        <MainContainer>
            <Title title="Schedules"></Title>

            {/* <ScheduleDetail
                schedule={modalSchedule}
                // open={modalBool.state}
                onClose={() => router.back()}
            ></ScheduleDetail> */}

            <Solid
                ai="center"
                css={{ ...margin({ y: 24 }) }}
                // variants={cardVariants}
                // initial="initial"
                // animate="enter"
            >
                <Solid>
                    <h2
                        css={{
                            ...margin({ y: 0 }),
                            color: color.brown(0.75),
                        }}
                    >
                        Schedules
                    </h2>
                </Solid>

                <Liquid></Liquid>

                <Solid ai="center" css={{ transform: 'translateY(-1px)' }}>
                    <FilterLabel
                        active={!excludeSerials.state}
                        onClick={excludeSerials.off}
                        label="すべて"
                    ></FilterLabel>

                    <div css={{ width: 16 }}></div>

                    <FilterLabel
                        active={excludeSerials.state}
                        onClick={excludeSerials.on}
                        label="定期更新を除く"
                    ></FilterLabel>
                </Solid>
            </Solid>

            <Section>
                <ScheduleList
                    chunkedSchedules={chunkedSchedules}
                ></ScheduleList>
            </Section>
        </MainContainer>
    )
}

SchedulesPage.getInitialProps = async ctx => {
    if (ctx.req) {
        const { array: schedules } = await getGSchedulesSerialized()
        return { schedules }
    } else {
        return { schedules: undefined }
    }
}

export default SchedulesPage

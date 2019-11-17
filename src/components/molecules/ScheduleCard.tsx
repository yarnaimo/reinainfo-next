import { ComponentProps } from '@rmwc/types'
import React, { forwardRef, memo, useMemo, useState } from 'react'
import { Icon, Ripple } from 'rmwc'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { cardGradient, cardShadow, color } from '../../utils/color'
import { ellipsis, margin, padding, size } from '../../utils/css'
import { micon } from '../../utils/icon'
import { Liquid, Solid, SolidColumn } from '../blocks/Flex'
import { ScheduleDetail } from './ScheduleDetail'

type Props = ComponentProps & {
    schedule: IScheduleSerialized
}

export const ScheduleCard = memo(
    forwardRef<any, Props>(({ schedule: s, ...props }, ref) => {
        const [modalOpen, setModalOpen] = useState(false)

        const category = MSchedule.getCategory(s.category)

        const [textColor, background, boxShadow] = useMemo(
            () => [
                category.textColor ? category.textColor() : color.white(),
                cardGradient(category.color[0], category.color[1]),
                cardShadow(category.color[0](0.4)),
                // cardShadowHovered(category.color[0](0.5)),
            ],
            [s.category],
        )

        const sidePadding = 18
        const iconNegativeMargin = -2
        const iconSize = 18
        const iconBoxSize = 18
        const iconRightMargin = 12
        const leftPadding =
            iconNegativeMargin * 2 + iconBoxSize + iconRightMargin

        const Content_ = (
            <SolidColumn
                css={{
                    borderRadius: 9,
                    position: 'relative',
                    overflow: 'hidden',
                    ...padding({
                        y: 6,
                        left: sidePadding + leftPadding,
                        right: sidePadding,
                    }),
                    boxShadow,
                    background,
                    color: textColor,
                }}
            >
                <Solid // header
                    ai="center"
                    css={{
                        ...margin({ left: -leftPadding }),
                        ...padding({ y: 4 }),
                    }}
                >
                    <Solid ai="center">
                        <Icon
                            icon={micon(category.micon)}
                            css={{
                                ...margin({
                                    x: iconNegativeMargin,
                                    y: iconNegativeMargin / 2,
                                }),
                                ...size(iconBoxSize, iconBoxSize),
                                fontSize: iconSize,
                            }}
                        ></Icon>

                        <div
                            css={{
                                ...margin({ left: iconRightMargin }),
                                fontSize: 11,
                            }}
                        >
                            {category.name}
                        </div>
                    </Solid>

                    <Liquid></Liquid>

                    <div
                        css={{
                            fontSize: 10,
                            ...margin({ left: 10 }),
                            ...ellipsis,
                        }}
                    >
                        {s.venue && `@ ${s.venue}`}
                    </div>
                </Solid>

                <Solid // date
                    ai="baseline"
                    css={{
                        ...padding({ y: 4 }),
                        fontWeight: 500,
                    }}
                >
                    <div css={{ fontSize: 12 }}>
                        {s.formattedDate.wdateString}
                    </div>

                    <div css={{ ...margin({ left: 6 }), fontSize: 11 }}>
                        {s.formattedDate.timeString}
                    </div>
                </Solid>

                <Solid // title
                    css={{
                        ...padding({ y: 4 }),
                        fontSize: 15,
                        fontWeight: 'bold',
                    }}
                >
                    {s.title}
                </Solid>
            </SolidColumn>
        )

        return (
            <>
                <ScheduleDetail
                    schedule={s}
                    open={modalOpen}
                    onClose={() => {
                        setModalOpen(false)
                    }}
                ></ScheduleDetail>

                <a
                    href={`/schedules/${s._id}`}
                    onClick={e => {
                        setModalOpen(true)
                        e.preventDefault()
                    }}
                    ref={ref}
                    {...props}
                    css={{
                        display: 'block',
                        ...margin({ y: 12, x: -1 }),
                    }}
                >
                    {/* <Link
                        key={s._id}
                        href={{ query: { id: s._id } }}
                        as={`/schedules/${s._id}`}
                        passHref
                        shallow
                        scroll={false}
                    > */}
                    <Ripple
                        css={{
                            '&::before, &::after': {
                                opacity: 0,
                                transition: `opacity 25ms linear`,
                                backgroundColor: textColor,
                            },
                            '&:hover::before': {
                                // opacity: 0.05,
                            },
                        }}
                    >
                        {Content_}
                    </Ripple>
                    {/* </Link> */}
                </a>
            </>
        )
    }),
    (a, b) => MSchedule.isSame(a.schedule, b.schedule),
)

// export const ScheduleCard = memo<Props>(({ schedule }) => {
//     return <_ScheduleCard schedule={schedule}></_ScheduleCard>
// }, compareFn)

import React, { forwardRef, memo, useMemo } from 'react'
import { Icon } from 'rmwc'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { cardShadow, color, dialogShadow } from '../../utils/color'
import {
    ellipsis,
    fixedFit,
    margin,
    padding,
    size,
    transition,
} from '../../utils/css'
import { micon } from '../../utils/icon'
import { Container } from '../blocks/Container'
import { Liquid, Solid, SolidColumn } from '../blocks/Flex'

type Props = {
    schedule: IScheduleSerialized
    compact?: boolean
    open: boolean
    onClose?: () => void
}

type ModalProps = {
    schedule: IScheduleSerialized
    compact: boolean
}

export const ScheduleDetailModal = memo<ModalProps>(
    ({ children, schedule: s, compact, ...props }) => {
        const category = s && MSchedule.getCategory(s.category)

        const _color = useMemo(
            () =>
                category && {
                    icon: category.textColor?.() ?? color.white(),
                    iconBackground: category.color[0](),
                    iconBoxShadow: cardShadow(category.color[0](0.3)),
                    categoryText: category.textColor?.() ?? category.color[1](),
                    // cardShadowHovered(category.color[0](0.5)),
                },
            [s?.category],
        )

        const sidePadding = 18
        const iconNegativeMargin = -2
        const iconSize = 14
        const iconBoxSize = 24
        const iconRightMargin = 12
        const leftPadding =
            iconNegativeMargin * 2 + iconBoxSize + iconRightMargin

        return (
            <SolidColumn
                // ref={ref}
                {...props}
                css={{
                    ...margin({
                        y: 12,
                        x: -1,
                    }),

                    borderRadius: 11,
                    position: 'relative',
                    overflow: 'hidden',
                    ...padding({
                        y: 12,
                        left: sidePadding + leftPadding,
                        right: sidePadding,
                    }),
                    boxShadow: dialogShadow(color.black(0.2)),
                    background: color.white(),
                    color: color.black(0.7),
                }}
            >
                <Solid // header
                    ai="center"
                    css={{
                        position: 'relative',
                        // ...margin({ left: -leftPadding }),
                        ...padding({ y: 4 }),
                    }}
                >
                    <Solid
                        jc="center"
                        ai="center"
                        css={{
                            // ...margin({
                            //     x: iconNegativeMargin,
                            //     y: iconNegativeMargin,
                            // }),
                            position: 'absolute',
                            top: 2,
                            left: -leftPadding - 2,

                            ...size(iconBoxSize, iconBoxSize),

                            borderRadius: '50%',
                            background: _color.iconBackground,
                            boxShadow: _color.iconBoxShadow,
                            color: _color.icon,
                        }}
                    >
                        <Icon
                            icon={micon(category.micon)}
                            css={{
                                fontSize: iconSize,
                            }}
                        ></Icon>
                    </Solid>

                    <div
                        css={{
                            // ...margin({
                            //     left: iconRightMargin,
                            // }),
                            fontSize: 14,
                            color: _color.categoryText,
                        }}
                    >
                        {category.name}
                    </div>
                    {/* </Solid> */}

                    <Liquid></Liquid>

                    <div
                        css={{
                            fontSize: 12,
                            ...margin({ left: 10, top: -2 }),
                            ...ellipsis,
                            color: color.black(0.5),
                        }}
                    >
                        {s.venue && `@ ${s.venue}`}
                    </div>
                </Solid>

                <Solid // date
                    ai="baseline"
                    css={{
                        ...padding({ y: 4 }),
                    }}
                >
                    <div
                        css={{
                            fontSize: 14,
                            // fontWeight: 500,
                        }}
                    >
                        {s.formattedDate.wdateString}
                    </div>

                    <div
                        css={{
                            ...margin({ left: 6 }),
                            fontSize: 12.5,
                        }}
                    >
                        {s.formattedDate.timeString}
                    </div>
                </Solid>

                <Solid // title
                    css={{
                        ...padding({ y: 4 }),
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}
                >
                    {s.title}
                </Solid>

                {!compact && s.formattedDate.partsString && (
                    <Solid // parts
                        css={{
                            ...padding({ y: 4 }),
                            fontSize: 12.5,
                        }}
                    >
                        {s.formattedDate.partsString}
                    </Solid>
                )}
            </SolidColumn>
        )
    },
    (a, b) => MSchedule.isSame(a.schedule, b.schedule),
)

const fadeMotion = transition('std', ['opacity', 'visibility'])
const cardMotionIn = transition('dec', ['transform'])
const cardMotionOut = transition('acc', ['transform'])

export const ScheduleDetail = memo(
    forwardRef<any, Props>(
        ({ schedule: s, compact = false, open, onClose, ...props }, ref) => {
            return (
                <SolidColumn
                    jc="center"
                    ai="center"
                    css={{
                        zIndex: 7,
                        ...fixedFit,

                        ...fadeMotion,
                        opacity: open ? 1 : 0,
                        visibility: open ? 'visible' : 'hidden',
                    }}
                >
                    <div
                        onClick={() => onClose?.()}
                        css={{
                            ...fixedFit,
                            zIndex: -1,
                            cursor: 'pointer',
                            // [responsive.isMobile]: {
                            //     display: 'none',
                            // },

                            background: color.black(0.3),
                        }}
                    ></div>

                    <Container
                        css={[
                            cardMotionIn,
                            open ? cardMotionIn : cardMotionOut,
                            {
                                transform: open
                                    ? 'translateY(0px) scale(1)'
                                    : 'translateY(16px) scale(0.95)',
                            },
                        ]}
                    >
                        <ScheduleDetailModal
                            schedule={s}
                            compact={compact}
                        ></ScheduleDetailModal>
                    </Container>
                </SolidColumn>
            )
        },
    ),
    (a, b) => MSchedule.isSame(a.schedule, b.schedule) && a.open === b.open,
)

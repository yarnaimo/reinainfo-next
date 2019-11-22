import React, { forwardRef, memo } from 'react'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { color, dialogShadow } from '../../utils/color'
import { fixedFit, margin, transition } from '../../utils/css'
import { Container } from '../blocks/Container'
import { SolidColumn } from '../blocks/Flex'
import { ScheduleDetailContent } from './ScheduleDetailContent'

const fadeMotion = transition('std', ['opacity', 'visibility'])
const cardMotionIn = transition('dec', ['transform'])
const cardMotionOut = transition('acc', ['transform'])

type Props = {
    schedule: IScheduleSerialized
    compact?: boolean
    open: boolean
    onClose?: () => void
}

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
                        <ScheduleDetailContent
                            schedule={s}
                            compact={compact}
                            css={{
                                ...margin({ x: -1 }),

                                borderRadius: 11,
                                overflow: 'hidden',
                                boxShadow: dialogShadow(color.black(0.2)),
                                background: color.white(),
                            }}
                        ></ScheduleDetailContent>
                    </Container>
                </SolidColumn>
            )
        },
    ),
    (a, b) => MSchedule.isSame(a.schedule, b.schedule) && a.open === b.open,
)

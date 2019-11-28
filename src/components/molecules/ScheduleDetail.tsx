import { MSpark } from 'bluespark'
import React, { forwardRef, memo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { env } from '../../env'
import { IScheduleSerialized } from '../../models/Schedule'
import { ITicket } from '../../models/Ticket'
import { db, dbInstance } from '../../services/firebase'
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
            const [tickets, setTickets] = useState<ITicket['_D'][]>()

            useEffectOnce(() => {
                if (s.hasTickets && env.isBrowser) {
                    db._ticketsIn(dbInstance.doc(s._path))
                        .getQuery({
                            q: q => q.orderBy('opensAt'),
                        })
                        .then(({ array }) => setTickets(array))
                }
            })

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
                            tickets={tickets}
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
    (a, b) => MSpark.isEqual(a.schedule, b.schedule) && a.open === b.open,
)

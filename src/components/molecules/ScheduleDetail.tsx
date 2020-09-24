import { MSpark } from 'bluespark'
import React, { forwardRef, memo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { env } from '../../env'
import { IScheduleSerialized } from '../../models/Schedule'
import { ITicket } from '../../models/Ticket'
import { db, dbInstance } from '../../services/firebase'
import { margin, transition } from '../../utils/css'
import { ScheduleDetailContent } from './ScheduleDetailContent'

const fadeMotion = transition('std', ['opacity', 'visibility'])
const cardMotionIn = transition('dec', ['transform'])
const cardMotionOut = transition('acc', ['transform'])

type Props = {
  schedule: IScheduleSerialized
  compact?: boolean
}

export const ScheduleDetail = memo(
  forwardRef<any, Props>(({ schedule: s, compact = false, ...props }, ref) => {
    const [tickets, setTickets] = useState<ITicket['_D'][]>()

    useEffectOnce(() => {
      if (s.hasTickets && env.isBrowser) {
        db._ticketsIn(dbInstance.doc(s._path))
          .getQuery({
            q: (q) => q.orderBy('opensAt'),
          })
          .then(({ array }) => setTickets(array))
      }
    })

    return (
      <ScheduleDetailContent
        schedule={s}
        tickets={tickets}
        compact={compact}
        css={{
          ...margin({ x: -1 }),
          overflow: 'hidden',
        }}
      ></ScheduleDetailContent>
    )
  }),
  (a, b) => MSpark.isEqual(a.schedule, b.schedule),
)

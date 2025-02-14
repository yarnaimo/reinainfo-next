import { Global } from '@emotion/core'
import { GetServerSideProps, NextPage } from 'next'
import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import {} from 'rmwc'
import { ScheduleDetailContent } from '../../../components/molecules/ScheduleDetailContent'
import { env } from '../../../env'
import { IScheduleSerialized, MSchedule } from '../../../models/Schedule'
import { ITicket } from '../../../models/Ticket'
import { db, dbInstance } from '../../../services/firebase'

const getSchedule = async (id: string) =>
  db.schedules.getDoc({ doc: id, decoder: MSchedule.serialize })

type Props = { schedule: IScheduleSerialized }

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  const { id } = params as { id: string }

  const schedule = await getSchedule(id)
  if (!schedule) {
    throw new Error('schedule not found')
  }

  return {
    props: {
      schedule,
    },
  }
}

const Page: NextPage<Props> = ({ schedule: s }) => {
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

                    * {
                        font-family: Ubuntu, "BIZ-UDPGothic", sans-serif!important;
                    }
                `}
      ></Global>
      <ScheduleDetailContent
        schedule={s}
        tickets={tickets}
        compact={true}
      ></ScheduleDetailContent>
    </>
  )
}

export default Page

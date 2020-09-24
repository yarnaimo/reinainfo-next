import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import {} from 'rmwc'
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner'
import { MainContainer } from '../../components/blocks/Container'
import { ScheduleDetail } from '../../components/molecules/ScheduleDetail'
import { Title } from '../../components/templates/Title'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'

const getSchedule = async (id: string) => {
  const { db } = await import('../../services/firebase')
  return db.schedules.getDoc({ doc: id, decoder: MSchedule.serialize })
}

type Props = { schedule: IScheduleSerialized | null }

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { id } = params as { id: string }
  const schedule = (await getSchedule(id)) ?? null

  return {
    props: {
      schedule,
    },
    revalidate: 60 * 5,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

const Page: NextPage<Props> = ({ schedule }) => {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <MainContainer>
        <LoadingSpinner></LoadingSpinner>
      </MainContainer>
    )
  }

  if (!schedule) {
    return <></>
  }

  return (
    <MainContainer>
      <Title
        title={schedule.title}
        path={`schedules/${schedule._id}`}
        thumbUrl={schedule.thumbUrl || undefined}
      ></Title>

      <ScheduleDetail
        schedule={schedule}
        open={true}
        onClose={() => router.push('/schedules')}
      ></ScheduleDetail>
    </MainContainer>
  )
}

export default Page

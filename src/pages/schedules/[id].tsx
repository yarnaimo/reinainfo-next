import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import {} from 'rmwc'
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner'
import { MainContainer } from '../../components/blocks/Container'
import { PageSection } from '../../components/blocks/PageSection'
import { Section } from '../../components/blocks/Section'
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
    fallback: 'unstable_blocking',
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

      <PageSection>
        <Section>
          <ScheduleDetail schedule={schedule}></ScheduleDetail>
        </Section>
      </PageSection>
    </MainContainer>
  )
}

export default Page

import { ComponentProps } from '@rmwc/types'
import { motion, Variants } from 'framer-motion'
import { GetStaticProps, NextPage } from 'next'
import React, { FC, Fragment } from 'react'
import { Heading2 } from '../../components/atoms/Heading2'
import { MainContainer } from '../../components/blocks/Container'
import { Solid } from '../../components/blocks/Flex'
import { PageSection } from '../../components/blocks/PageSection'
import { Section } from '../../components/blocks/Section'
import { ScheduleCard } from '../../components/molecules/ScheduleCard'
import { Title } from '../../components/templates/Title'
import {
  IScheduleSerialized,
  IScheduleWithDayjs,
  MSchedule,
} from '../../models/Schedule'
import { db } from '../../services/firebase'
import { color } from '../../utils/color'
import { margin, transition } from '../../utils/css'
import { dayjs } from '../../utils/date'
import { useBool } from '../../utils/hooks'
import { cardVariants } from '../../utils/variants'

const getGSchedulesSerialized = () =>
  db.gSchedulesActive.getQuery({
    q: MSchedule.whereSinceNow(),
    decoder: MSchedule.serialize,
  })

const variants: Variants = {
  initial: {
    transition: { staggerChildren: 0.0125, staggerDirection: -1 },
  },
  enter: {
    transition: { staggerChildren: 0.0125, delayChildren: 0 },
  },
  exit: {
    transition: { staggerChildren: 0.0125, staggerDirection: -1 },
  },
}

const filterLabelMotion = transition('std', ['color'])

const FilterLabel: FC<ComponentProps & { active: boolean; label: string }> = ({
  active,
  label,
  ...props
}) => {
  return (
    <div
      {...props}
      css={{
        fontSize: 12,
        lineHeight: '24px',
        cursor: 'pointer',
        userSelect: 'none',

        ...filterLabelMotion,
        color: active ? color.blue(1) : color.black(0.4),
      }}
    >
      {label}
    </div>
  )
}

type ScheduleChunks = {
  label: string
  schedules: IScheduleWithDayjs[]
}[]

const ScheduleList: FC<{ chunkedSchedules: ScheduleChunks }> = ({
  chunkedSchedules,
}) => {
  return (
    <motion.div initial="initial" animate="enter" variants={variants}>
      {chunkedSchedules.map((chunk) => (
        <Fragment key={chunk.label}>
          <motion.h5
            // style={props}
            variants={cardVariants}
            css={{
              ...margin({ top: 24, bottom: 12 }),
              color: color.brown(0.75),
            }}
          >
            {chunk.label}
          </motion.h5>

          {chunk.schedules.map((s) => (
            <ScheduleCard
              key={s._id}
              // style={props}
              variants={cardVariants}
              schedule={s}
            ></ScheduleCard>
          ))}
        </Fragment>
      ))}
    </motion.div>
  )
}

type Props = { schedules: IScheduleSerialized[] }

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { array: schedules } = await getGSchedulesSerialized()

  return {
    props: {
      schedules,
    },
    revalidate: 60 * 5,
  }
}

const Page: NextPage<Props> = ({ schedules }) => {
  const excludeSerials = useBool(false)

  const filteredSchedules = schedules.filter(
    (s) => !excludeSerials.state || !s.isSerial,
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
      <Title title="Schedules" path="schedules"></Title>

      <PageSection>
        <Heading2 text="Schedules">
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
        </Heading2>

        <Section>
          <ScheduleList chunkedSchedules={chunkedSchedules}></ScheduleList>
        </Section>
      </PageSection>
    </MainContainer>
  )
}

export default Page

import { useSCollection } from 'bluespark'
import { prray } from 'prray'
import React, { FC, useMemo } from 'react'
import { Button, SimpleDataTable } from 'rmwc'
import { ISchedule, MSchedule } from '../../../models/Schedule'
import { ISerial } from '../../../models/Serial'
import { db } from '../../../services/firebase'
import { Dayjs } from '../../../utils/date'
import { Heading2 } from '../../atoms/Heading2'
import { PageSection } from '../../blocks/PageSection'
import { Section } from '../../blocks/Section'
import { AdminDataTable } from './AdminDataTable'
import { useScheduleForm } from './ScheduleForm'
import { useSerialBatchForm } from './SerialBatchForm'
import { useSerialForm } from './SerialForm'

type Props = { serial?: ISerial['_D']; heading?: string }

const scheduleTableKeys = [
  'active',
  'category',
  'date',
  'hasTime',
  'title',
  'url',
  'parts',
  'venue',
  'hasTickets',
  'customIcon',
  'ribbonColors',
  'thumbUrl',
] as (keyof typeof useScheduleForm.schema)[]

export const ScheduleSection: FC<Props> = ({
  serial,
  heading = 'Schedules',
}) => {
  const scheduleForm = parent ? useScheduleForm() : useScheduleForm()
  const serialForm = useSerialForm()
  const serialBatchForm = useSerialBatchForm()

  const model = useMemo(
    () => (serial ? db._schedulesIn(serial._ref) : db.schedules),
    [serial?._ref],
  )
  const q = useMemo(() => MSchedule.whereSinceNow(), [])

  const createSerialSchedules = async (dates: Dayjs[]) => {
    if (!serial) {
      return
    }
    const {
      category,
      customIcon,
      ribbonColors,
      hasTime,
      title,
      url,
      venue,
    } = serial

    await prray(dates).mapAsync(async (date) => {
      const data: ISchedule['_E'] = {
        active: true,
        isSerial: true,

        category,
        date: date.toDate(),
        hasTime,
        title,
        url,
        parts: [],
        venue,
        hasTickets: false,

        customIcon,
        ribbonColors,
        thumbUrl: null,
      }

      await model.create(null, data)
    })
  }

  const SerialDetail_ = serial && (
    <Section>
      {serialForm.renderDialog()}
      <Button
        label="編集"
        onClick={() => serialForm.editDoc(serial, db.serials.update)}
      ></Button>

      <Section>
        <SimpleDataTable
          // header={[]}
          data={[
            ...serialForm.tablePairs(serial, [
              'active',
              'label',
              'dayOfWeek',
              'timeOfDay',
              'weekNumbers',
              'weekInterval',
              'category',
              'customIcon',
              'ribbonColors',
              'title',
              'url',
              'hasTime',
              'venue',
            ]),
          ]}
        ></SimpleDataTable>
      </Section>

      {serialBatchForm.renderDialog()}
      {serialBatchForm.renderAddButton(
        () =>
          serialBatchForm.edit(
            null,
            { ...serial, dates: [] },
            async (_, { dates }) => {
              console.log(dates)
              await createSerialSchedules(dates)
            },
          ),
        { outlined: false, unelevated: true },
      )}
    </Section>
  )

  const schedules = useSCollection({
    model,
    q,
    decoder: (s: ISchedule['_D']) => ({
      ...s,
      tableRow: scheduleForm.tableRow(s, scheduleTableKeys, [
        <Button
          type="button"
          label="編集"
          onClick={() => scheduleForm.editDoc(s, model.update)}
          css={{ margin: '0 -8px' }}
        ></Button>,
      ]),
    }),
  })

  return (
    <>
      <PageSection>
        <Heading2 text={heading} marginY={16} noColor></Heading2>

        {SerialDetail_}

        <Section>
          {scheduleForm.renderDialog()}
          {scheduleForm.renderAddButton(() =>
            scheduleForm.editDoc(model.collectionRef.doc(), model.create),
          )}
        </Section>

        <AdminDataTable
          header={scheduleForm.tableHeader(scheduleTableKeys, [''])}
          data={schedules.array}
        ></AdminDataTable>
      </PageSection>
    </>
  )
}

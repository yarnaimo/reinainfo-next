import { MTimestamp } from 'bluespark'
import ical from 'ical-generator'
import { env } from '../../src/env'
import { ISchedule } from '../../src/models/Schedule'
import { dayjs } from '../../src/utils/date'
import { dbAdmin } from '../services/firebase-admin'

const scheduleToEventData = (s: ISchedule['_D']): ical.EventData => ({
  uid: s._path,
  allDay: !s.hasTime,
  start: s.date.toDate(),
  end: dayjs(s.date.toDate()).add(30, 'minute').toDate(),
  summary: s.title,
  location: s.venue ?? undefined,
  url: s.url,
})

export const _updateCalendar = async () => {
  const domain = env.origin.replace(/https?:\/\//, '')
  const timezone = 'Asia/Tokyo'

  const schedules = await dbAdmin.gSchedulesActive.getQuery({
    q: MTimestamp.where({ field: 'date', order: 'asc' }),
  })

  const events = schedules.array.map(scheduleToEventData)

  const mainCal = ical({
    domain,
    name: '🌸 ReinaInfo Calendar',
    timezone,
    events,
  })

  await dbAdmin.calendars.create('main', { content: mainCal.toString() })
}

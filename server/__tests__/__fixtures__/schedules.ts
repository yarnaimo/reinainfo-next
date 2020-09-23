import { prray } from 'prray'
import { ISchedule } from '../../../src/models/Schedule'
import { dbInstanceAdmin } from '../../services/firebase-admin'
import { now } from './date'

export const scheduleUrl = 'https://t.co'
export const pageUrlBase = 'https://localhost:3000/schedules'

const day0End = now.endOf('day')
const day1 = now.add(1, 'day')
const day2Start = now.add(2, 'day').startOf('day')
const day7End = now.add(7, 'day').endOf('day')
const day8Start = now.add(8, 'day').startOf('day')

const o = {
  category: 'live' as const,
  customIcon: null,
  ribbonColors: null,
  hasTime: true,
  url: scheduleUrl,
  parts: [],
  venue: null,
  // way: null,
  hasTickets: false,
  thumbUrl: null,
}
const schedules = prray<ISchedule['_E']>([
  {
    active: true,
    isSerial: false,
    title: 'live0',
    date: day0End.toDate(),
    ...o,
  },
  {
    active: true,
    isSerial: true,
    title: 'up1',
    date: day1.toDate(),
    ...o,
  },
  {
    active: false,
    isSerial: false,
    title: 'live1-inactive',
    date: day1.toDate(),
    ...o,
  },
  {
    active: true,
    isSerial: false,
    title: 'live2',
    date: day2Start.toDate(),
    ...o,
    hasTime: false,
  },
  {
    active: true,
    isSerial: false,
    title: 'live7',
    date: day7End.toDate(),
    ...o,
  },
  {
    active: true,
    isSerial: false,
    title: 'live8',
    date: day8Start.toDate(),
    ...o,
  },
])

export const prepareScheduleDocs = () =>
  schedules.mapAsync((s) =>
    dbInstanceAdmin.collection('schedules').doc(s.title).set(s),
  )

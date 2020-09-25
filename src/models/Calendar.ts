import { Blue, Spark } from 'bluespark'

export type ICalendar = Blue.Interface<{
  content: string
}>

export const Calendar = Spark<ICalendar>()({
  root: true,
  collection: (db) => db.collection('calendars'),
})

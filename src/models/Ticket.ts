import { Rstring } from '@yarnaimo/rain'
import { Blue, Spark, SparkQuery } from 'bluespark'
import dayjs, { Dayjs } from 'dayjs'
import { env } from '../env'
import { toWDateStr, toWDateTimeStr } from '../utils/date'

export type ITicket = Blue.Interface<{
  label: string
  opensAt: Blue.IO<Blue.Timestamp | null, Date | null>
  closesAt: Blue.IO<Blue.Timestamp | null, Date | null>
}>

export const Ticket = Spark<ITicket>()({
  root: false,
  collection: (schedule) => schedule.collection('tickets'),
})
export const GTicket = SparkQuery<ITicket>()({
  root: true,
  query: (db) => db.collectionGroup('tickets'),
})

const dateTimeOrDate = (withTime: boolean, date: Dayjs | null) => {
  return (
    date && (withTime ? toWDateTimeStr(date, true) : toWDateStr(date, true))
  )
}

export class MTicket {
  static stringify(t: ITicket['_D']) {
    const now = dayjs(env.isDev ? '2019-07-25T00:00:00+0900' : undefined)
    const [openDate, closeDate] = [t.opensAt, t.closesAt].map((ts) =>
      ts ? dayjs(ts.toDate()) : null,
    )

    const beforeOpen = openDate && now.isBefore(openDate.endOf('day'))
    const beforeClose = closeDate && now.isBefore(closeDate.endOf('day'))

    const toShow = beforeOpen ? 'open' : beforeClose ? 'close' : null

    const openStr = dateTimeOrDate(toShow === 'open', openDate)
    const closeStr = dateTimeOrDate(toShow === 'close', closeDate)

    const timeStr = Rstring.joinOnlyStrings(' ')([openStr, '～', closeStr])

    return {
      text: `${t.label} - ${timeStr}`,
      closed: closeDate && now.isAfter(closeDate),
    }
  }
}

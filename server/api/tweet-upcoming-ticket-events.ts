import { MTimestamp } from 'bluespark'
import { Dayjs } from 'dayjs'
import { SetOptional } from 'type-fest'
import { ITicketSchedulePair, MSchedule } from '../../src/models/Schedule'
import { ITicket } from '../../src/models/Ticket'
import { dbAdmin } from '../services/firebase-admin'
import { sendCrossNotification } from '../services/integrated'
import { TwimoClient } from '../services/twitter'

const combineSchedule = async (
  ticket: ITicket['_D'],
): Promise<SetOptional<ITicketSchedulePair, 'schedule'>> => {
  const schedule = await dbAdmin.schedules.getDoc({
    doc: ticket._ref.parent.parent!.id,
  })
  return { ticket, schedule }
}

const getTickets = async (
  filterField: 'opensAt' | 'closesAt',
  since: Dayjs,
  until: Dayjs,
) => {
  const { array } = await dbAdmin.gTickets.getQuery({
    q: MTimestamp.where({ field: filterField, order: 'asc', since, until }),
  })
  const combined = await array.mapAsync(combineSchedule)
  return combined
    .toArray()
    .filter((pair): pair is ITicketSchedulePair => !!pair.schedule)
}

export const _tweetUpcomingTicketEvents = async (
  twimo: TwimoClient,
  now: Dayjs,
) => {
  const since = now.startOf('day').add(1, 'day')
  const until = since.add(1, 'day')

  const opTickets = await getTickets('opensAt', since, until)
  const clTickets = await getTickets('closesAt', since, until)

  const opTextsToTweet = opTickets.map((pair, i) => {
    return MSchedule.buildNotificationTextOfTicketEvent(pair, 'open')
  })
  const clTextsToTweet = clTickets.map((pair, i) => {
    return MSchedule.buildNotificationTextOfTicketEvent(pair, 'close')
  })

  const { tweetResults, webhookResults } = await sendCrossNotification(twimo, [
    ...clTextsToTweet,
    ...opTextsToTweet,
  ])

  return { tweetResults, webhookResults }
}

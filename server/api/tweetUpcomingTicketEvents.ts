import { Dayjs } from 'dayjs'
import { SetOptional } from 'type-fest'
import {
    filterByTimestamp,
    ITicketSchedulePair,
    MSchedule,
} from '../../src/models/Schedule'
import { ITicket } from '../../src/models/Ticket'
import { dbAdmin } from '../services/firebase-admin'
import { sendCrossNotification } from '../services/integrated'
import { TwimoClient } from '../services/twitter'

const combineSchedule = async (
    ticket: ITicket['_D'],
): Promise<SetOptional<ITicketSchedulePair, 'schedule'>> => {
    const schedule = await dbAdmin.schedules.getDoc({ doc: ticket.scheduleId })
    return { ticket, schedule }
}

const getTickets = async (
    filterField: 'opensAt' | 'closesAt',
    since: Dayjs,
    until: Dayjs,
) => {
    const { array } = await dbAdmin.gTickets.getQuery({
        q: filterByTimestamp(filterField, since, until),
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
    console.log('[ tweetUpcomingTicketEvents ]')

    const since = now.startOf('day').add(1, 'day')
    const until = since.add(1, 'day')

    const opTickets = await getTickets('opensAt', since, until)
    const clTickets = await getTickets('closesAt', since, until)

    const opTextsToTweet = opTickets.map((pair, i) => {
        // const header = `🚩 チケットの受付が始まります <${i + 1}>`

        return MSchedule.buildNotificationTextOfTicketEvent(pair, 'open')
    })
    const clTextsToTweet = clTickets.map((pair, i) => {
        // const header = `⚠ チケットの申込期限が近づいています <${i + 1}>`

        return MSchedule.buildNotificationTextOfTicketEvent(pair, 'close')
    })

    const { tweetResults, webhookResults } = await sendCrossNotification(
        twimo,
        [...clTextsToTweet, ...opTextsToTweet],
    )

    return { tweetResults, webhookResults }
}

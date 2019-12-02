import { prray } from 'prray'
import { ISchedule } from '../../../src/models/Schedule'
import { ITicket } from '../../../src/models/Ticket'
import { dayjs } from '../../../src/utils/date'
import { _tweetUpcomingTicketEvents } from '../../api/tweet-upcoming-ticket-events'
import { dbInstanceAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining } from '../utils'
import { now } from '../__fixtures__/date'
import { prepareWebhookDoc, send } from '../__mocks__/@slack/webhook'

const day0End = now.endOf('day')
const day1 = now.add(1, 'day')
const day1Noon = day1.set('h', 12)
const day2Start = now.add(2, 'day').startOf('day')
const scheduleDate = dayjs('2019-02-27T18:00')

const url = 'https://t.co'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()

    await prepareWebhookDoc()
})

const o = {
    category: 'live' as const,
    customIcon: null,
    ribbonColors: null,
    hasTime: true,
    url,
    parts: [],
    venue: null,
    // way: null,
    hasTickets: false,
    thumbUrl: null,
}
beforeEach(async () => {
    const schedule: ISchedule['_E'] = {
        active: true,
        isSerial: false,
        title: 'live0',
        date: scheduleDate.toDate(),
        ...o,
    }
    const scheduleDoc = await dbInstanceAdmin
        .collection('schedules')
        .add(schedule)
    const { id: scheduleId } = scheduleDoc

    const tickets = prray<ITicket['_E']>([
        {
            scheduleId,
            label: 'ticket0',
            opensAt: day0End.toDate(),
            closesAt: null,
        },
        {
            scheduleId,
            label: 'ticket1-open',
            opensAt: day1Noon.toDate(),
            closesAt: day2Start.toDate(),
        },
        {
            scheduleId,
            label: 'ticket1-close',
            opensAt: null,
            closesAt: day1.toDate(),
        },
        {
            scheduleId,
            label: 'ticket2',
            opensAt: null,
            closesAt: day2Start.toDate(),
        },
    ])

    await tickets.mapAsync(t => scheduleDoc.collection('tickets').add(t))
})

test('daily', async () => {
    // start

    const result = await _tweetUpcomingTicketEvents(twimo, now)

    // end

    const expectedTweets = [
        `⚠ チケットの申込期限が近づいています [明日 22:00 まで]

2/27 (水) live0
📌 ticket1-close

${url}`,
        `🚩 チケットの受付が始まります [明日 12:00 から]

2/27 (水) live0
📌 ticket1-open

${url}`,
    ].map(t => ({ full_text: t }))

    expectObjectArrayContaining(result.tweetResults, 2, expectedTweets)

    expect(send).toHaveBeenCalledTimes(2)
})

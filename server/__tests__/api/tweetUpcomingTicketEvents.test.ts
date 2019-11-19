import dayjs from 'dayjs'
import { prray } from 'prray'
import { Status } from 'twitter-d'
import { ISchedule } from '../../../src/models/Schedule'
import { ITicket } from '../../../src/models/Ticket'
import { _tweetUpcomingTicketEvents } from '../../api/tweetUpcomingTicketEvents'
import { dbInstanceAdmin } from '../../services/firebase-admin'
import { TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining, mockTwimo } from '../utils'

const now = dayjs('2019-01-18T22:00')
const day0End = now.endOf('day')
const day1 = now.add(1, 'day')
const day2Start = now.add(2, 'day').startOf('day')
const scheduleDate = dayjs('2019-02-27T18:00')

const url = 'https://t.co'

let twimo: TwimoClient

beforeEach(() => {
    twimo = mockTwimo({
        postThread: async (texts: string[]) => {
            return texts.map(
                (full_text, i) => ({ full_text, id_str: String(i) } as Status),
            )
        },
    })
})

const o = {
    category: 'live' as const,
    customIcon: null,
    customColor: null,
    hasTime: true,
    url,
    parts: [],
    venue: null,
    way: null,
}
beforeEach(async () => {
    const schedule: ISchedule['_E'] = {
        active: true,
        isSerial: false,
        title: 'live0',
        date: scheduleDate.toDate(),
        ...o,
    }
    const { id: scheduleId } = await dbInstanceAdmin
        .collection('schedules')
        .add(schedule)

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
            opensAt: day1.toDate(),
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

    await tickets.mapAsync(t => dbInstanceAdmin.collection('tickets').add(t))
})

test('daily', async () => {
    // start

    const result = await _tweetUpcomingTicketEvents(twimo, now)

    // end

    const expectedTweets = [
        `⚠ チケットの申込期限が近づいています <1>

[明日 22:00 まで / ticket1-close]
2/27 (水) | live0

${url}`,
        `🚩 チケットの受付が始まります <1>

[明日 22:00 から / ticket1-open]
2/27 (水) | live0

${url}`,
    ].map(t => ({ full_text: t }))

    expectObjectArrayContaining(result, 2, expectedTweets)
})

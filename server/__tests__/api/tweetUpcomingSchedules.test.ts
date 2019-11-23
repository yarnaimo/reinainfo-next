import { prray } from 'prray'
import { ISchedule } from '../../../src/models/Schedule'
import { _tweetUpcomingSchedules } from '../../api/tweetUpcomingSchedules'
import { dbAdmin, dbInstanceAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining } from '../utils'
import { now } from '../__fixtures__/date'
import { send } from '../__mocks__/@slack/webhook'

const day0End = now.endOf('day')
const day1 = now.add(1, 'day')
const day2Start = now.add(2, 'day').startOf('day')
const day7End = now.add(7, 'day').endOf('day')
const day8Start = now.add(8, 'day').startOf('day')

const url = 'https://t.co'
const pageUrlBase = 'https://localhost:3000/schedules'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()

    await dbAdmin.webhooks.create(null, {
        service: 'slack',
        url: 'url',
    })
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
        title: 'live1',
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

beforeEach(async () => {
    await schedules.mapAsync(s =>
        dbInstanceAdmin
            .collection('schedules')
            .doc(s.title)
            .set(s),
    )
})

test('daily', async () => {
    // start

    const result = await _tweetUpcomingSchedules(twimo, now, 'daily')

    // end

    const expectedText = `明日 1/19 (土) の予定 <1/1>

22:00
🎫 live1

${url}`

    expectObjectArrayContaining(result.tweetResults, 1, [
        { full_text: expectedText },
    ])

    const { array: logs } = await dbAdmin.tweetLogs.getQuery({})
    expectObjectArrayContaining(logs, 1, [
        {
            type: 'upcomingSchedule',
            tweetId: '0',
        },
    ])

    expect(send).toHaveBeenCalledTimes(1)
})

test('weekly', async () => {
    // start

    const result = await _tweetUpcomingSchedules(twimo, now, 'weekly')

    // end

    const expectedTweets = [
        `1/19 (土) - 1/25 (金) の予定 <1/3>

1/19 (土) 22:00
🎫 live1

${url}`,
        `1/19 (土) - 1/25 (金) の予定 <2/3>

1/20 (日)
🎫 live2

${url}
${pageUrlBase}/live2`,
        `1/19 (土) - 1/25 (金) の予定 <3/3>

1/25 (金) 23:59
🎫 live7

${url}
${pageUrlBase}/live7`,
    ].map(t => ({
        full_text: t,
    }))

    expectObjectArrayContaining(result.tweetResults, 3, expectedTweets)

    const { array: logs } = await dbAdmin.tweetLogs.getQuery({})
    expectObjectArrayContaining(logs, 0, [])

    expect(send).toHaveBeenCalledTimes(3)
})

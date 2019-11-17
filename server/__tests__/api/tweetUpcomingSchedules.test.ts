import dayjs from 'dayjs'
import { prray } from 'prray'
import { Status } from 'twitter-d'
import { ISchedule } from '../../../src/models/Schedule'
import { _tweetUpcomingSchedules } from '../../api/tweetUpcomingSchedules'
import { dbAdmin, dbInstanceAdmin } from '../../services/firebase-admin'
import { expectObjectArrayContaining, spyOnTwimo } from '../utils'

const now = dayjs('2019-01-18T22:00')
const day0End = now.endOf('day')
const day1 = now.add(1, 'day')
const day2Start = now.add(2, 'day').startOf('day')
const day7End = now.add(7, 'day').endOf('day')
const day8Start = now.add(8, 'day').startOf('day')

const url = 'https://t.co'

beforeEach(() => {
    spyOnTwimo({
        postThread: async (texts: string[]) => {
            return texts.map(
                (full_text, i) => ({ full_text, id_str: String(i) } as Status),
            )
        },
    })
})

const o = {
    hasTime: true,
    url,
    parts: [],
    venue: null,
    way: null,
}
const schedules = prray<ISchedule['_E']>([
    {
        active: true,
        category: 'event' as const,
        title: 'event0',
        date: day0End.toDate(),
        ...o,
    },
    {
        active: true,
        category: 'event' as const,
        title: 'event1',
        date: day1.toDate(),
        ...o,
    },
    {
        active: false,
        category: 'event' as const,
        title: 'event1-inactive',
        date: day1.toDate(),
        ...o,
    },
    {
        active: true,
        category: 'event' as const,
        title: 'event2',
        date: day2Start.toDate(),
        ...o,
    },
    {
        active: true,
        category: 'event' as const,
        title: 'event7',
        date: day7End.toDate(),
        ...o,
    },
    {
        active: true,
        category: 'event' as const,
        title: 'event8',
        date: day8Start.toDate(),
        ...o,
    },
])

beforeEach(async () => {
    await schedules.mapAsync(s =>
        dbInstanceAdmin.collection('schedules').add(s),
    )
})

test('daily', async () => {
    // start

    const result = await _tweetUpcomingSchedules(now, 'daily')

    // end

    const expectedText = `
1/19(土) の予定 (1/1)

22:00
🎤 event1

${url}
`.trim()

    expectObjectArrayContaining(result, 1, [{ full_text: expectedText }])

    const { array: logs } = await dbAdmin.tweetLogs.getQuery()
    expectObjectArrayContaining(logs, 1, [
        {
            type: 'upcomingSchedule',
            tweetId: '0',
        },
    ])
})

test('weekly', async () => {
    // start

    const result = await _tweetUpcomingSchedules(now, 'weekly')

    // end

    const expectedTweets = [
        `1/19(土) ～ 1/25(金) の予定 (1/3)

1/19(土) 22:00
🎤 event1

${url}
`,
        `1/19(土) ～ 1/25(金) の予定 (2/3)

1/20(日) 0:00
🎤 event2

${url}
`,
        `1/19(土) ～ 1/25(金) の予定 (3/3)

1/25(金) 23:59
🎤 event7

${url}
`,
    ].map(t => ({
        full_text: t.trim(),
    }))

    expectObjectArrayContaining(result, 3, expectedTweets)

    const { array: logs } = await dbAdmin.tweetLogs.getQuery()
    expectObjectArrayContaining(logs, 0, [])
})

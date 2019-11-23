import { _tweetUpcomingSchedules } from '../../api/tweetUpcomingSchedules'
import { dbAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining } from '../utils'
import { now } from '../__fixtures__/date'
import {
    addSchedules,
    pageUrlBase,
    scheduleUrl,
} from '../__fixtures__/schedules'
import { send } from '../__mocks__/@slack/webhook'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()

    await dbAdmin.webhooks.create(null, {
        service: 'slack',
        url: 'url',
    })

    await addSchedules()
})

test('daily', async () => {
    // start

    const result = await _tweetUpcomingSchedules(twimo, now, 'daily')

    // end

    const expectedText = `明日 1/19 (土) の予定 <1/1>

22:00
🎫 up1

${scheduleUrl}`

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
🎫 up1

${scheduleUrl}`,
        `1/19 (土) - 1/25 (金) の予定 <2/3>

1/20 (日)
🎫 live2

${scheduleUrl}
${pageUrlBase}/live2`,
        `1/19 (土) - 1/25 (金) の予定 <3/3>

1/25 (金) 23:59
🎫 live7

${scheduleUrl}
${pageUrlBase}/live7`,
    ].map(t => ({
        full_text: t,
    }))

    expectObjectArrayContaining(result.tweetResults, 3, expectedTweets)

    const { array: logs } = await dbAdmin.tweetLogs.getQuery({})
    expectObjectArrayContaining(logs, 0, [])

    expect(send).toHaveBeenCalledTimes(3)
})

import { Dayjs } from 'dayjs'
import { prray } from 'prray'
import { MSchedule, whereDateBetween } from '../../src/models/Schedule'
import { stringifyWDate } from '../../src/utils/date'
import { dbAdmin } from '../services/firebase-admin'
import { getTwimoClient } from '../services/twitter'

export const _tweetUpcomingSchedules = async (
    now: Dayjs,
    freq: 'daily' | 'weekly',
) => {
    const twimo = await getTwimoClient()

    const since = now.startOf('day').add(1, 'day')

    const until = freq === 'daily' ? since.add(1, 'day') : since.add(1, 'week')
    const untilDate = until.subtract(1, 'day')

    const schedules = await dbAdmin.gSchedulesActive.getQuery(
        whereDateBetween(since, until),
    )

    const dateRange =
        freq === 'daily'
            ? stringifyWDate(since)
            : `${stringifyWDate(since)} ～ ${stringifyWDate(untilDate)}`

    const textsToTweet = schedules.array.map((s, i) => {
        const header = `${dateRange} の予定 (${i + 1}/${
            schedules.array.length
        })`
        return MSchedule.buildTweetText(s, header, freq === 'weekly')
    })

    const thread = await twimo.postThread(textsToTweet)

    if (freq === 'daily') {
        await prray(thread).mapAsync(({ id_str }) =>
            dbAdmin.tweetLogs.create(null, {
                type: 'upcomingSchedule',
                tweetId: id_str,
            }),
        )
    }

    return thread
}

import { Dayjs } from 'dayjs'
import { prray } from 'prray'
import { MSchedule } from '../../src/models/Schedule'
import { stringifyWDate } from '../../src/utils/date'
import { filterByTimestamp } from '../../src/utils/firebase'
import { dbAdmin } from '../services/firebase-admin'
import { sendCrossNotification } from '../services/integrated'
import { TwimoClient } from '../services/twitter'

export const _tweetUpcomingSchedules = async (
    twimo: TwimoClient,
    now: Dayjs,
    freq: 'daily' | 'weekly',
) => {
    console.log('[ tweetUpcomingSchedules ]')

    const since = now.startOf('day').add(1, 'day')

    const until = freq === 'daily' ? since.add(1, 'day') : since.add(1, 'week')
    const untilDate = until.subtract(1, 'day')

    const schedules = await dbAdmin.gSchedulesActive.getQuery({
        q: filterByTimestamp('date', 'asc', since, until),
    })

    const dateRange =
        freq === 'daily'
            ? `明日 ${stringifyWDate(since)}`
            : `${stringifyWDate(since)} - ${stringifyWDate(untilDate)}`

    const texts = schedules.array.map((s, i) => {
        const header = `${dateRange} の予定 <${i + 1}/${
            schedules.array.length
        }>`
        return MSchedule.buildNotificationText(s, header, freq === 'weekly')
    })

    const { tweetResults, webhookResults } = await sendCrossNotification(
        twimo,
        texts,
    )

    if (freq === 'daily') {
        await prray(tweetResults).mapAsync(({ id_str }) =>
            dbAdmin.scheduleTweetLogs.create(id_str, {}),
        )
    }

    return { tweetResults, webhookResults }
}

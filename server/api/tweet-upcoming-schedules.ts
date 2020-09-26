import { MTimestamp } from 'bluespark'
import { prray } from 'prray'
import { MSchedule } from '../../src/models/Schedule'
import { Dayjs, toWDateStr } from '../../src/utils/date'
import { dbAdmin } from '../services/firebase-admin'
import { sendCrossNotification } from '../services/integrated'
import { TwimoClient } from '../services/twitter'

export const _tweetUpcomingSchedules = async (
  twimo: TwimoClient,
  now: Dayjs,
  freq: 'daily' | 'weekly',
) => {
  const since = now.startOf('day').add(1, 'day')

  const until = freq === 'daily' ? since.add(1, 'day') : since.add(1, 'week')
  const untilDate = until.subtract(1, 'day')

  const schedules = await dbAdmin.gSchedulesActive.getQuery({
    q: MTimestamp.where({ field: 'date', order: 'asc', since, until }),
  })

  const dateRange =
    freq === 'daily'
      ? `明日 ${toWDateStr(since)}`
      : `${toWDateStr(since)} - ${toWDateStr(untilDate)}`

  const texts = schedules.array.map((s, i) => {
    const header =
      schedules.array.length >= 2
        ? `${dateRange} の予定 [${i + 1}/${schedules.array.length}]`
        : `${dateRange} の予定`
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

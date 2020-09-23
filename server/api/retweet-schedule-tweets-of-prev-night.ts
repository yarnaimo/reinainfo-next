import { Dayjs } from 'dayjs'
import { dbAdmin } from '../services/firebase-admin'
import { TwimoClient } from '../services/twitter'

export const _retweetScheduleTweetsOfPrevNight = async (
  twimo: TwimoClient,
  now: Dayjs,
) => {
  const logs = await dbAdmin.scheduleTweetLogs.getQuery({
    q: (q) =>
      q
        .where('_createdAt', '>=', now.subtract(1, 'day').toDate())
        .orderBy('_createdAt'),
  })

  const retweets = await twimo.retweet(logs.array.map((l) => l._id))
  return retweets
}

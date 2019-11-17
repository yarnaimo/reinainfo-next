import { Dayjs } from 'dayjs'
import { dbAdmin } from '../services/firebase-admin'
import { getTwimoClient } from '../services/twitter'

export const _morningRetweet = async (now: Dayjs) => {
    const twimo = await getTwimoClient()

    const logs = await dbAdmin.tweetLogs.getQuery(q =>
        q
            .where('type', '==', 'upcomingSchedule')
            .where('_createdAt', '>=', now.subtract(1, 'day').toDate())
            .orderBy('_createdAt'),
    )

    const retweets = await twimo.retweet(logs.array.map(l => l.tweetId))
    return retweets
}

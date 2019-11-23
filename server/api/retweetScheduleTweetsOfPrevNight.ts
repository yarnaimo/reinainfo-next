import { Dayjs } from 'dayjs'
import { dbAdmin } from '../services/firebase-admin'
import { TwimoClient } from '../services/twitter'

export const _retweetScheduleTweetsOfPrevNight = async (
    twimo: TwimoClient,
    now: Dayjs,
) => {
    console.log('[ retweetScheduleTweetsOfPrevNight ]')

    const logs = await dbAdmin.tweetLogs.getQuery({
        q: q =>
            q
                .where('type', '==', 'upcomingSchedule')
                .where('_createdAt', '>=', now.subtract(1, 'day').toDate())
                .orderBy('_createdAt'),
    })

    const retweets = await twimo.retweet(logs.array.map(l => l.tweetId))
    return retweets
}

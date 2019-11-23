import { Blue, Spark, SparkQuery } from 'bluespark'
import { Merge } from 'type-fest'
import { serializeTimestamp } from '../utils/firebase'

export type ITweetLog = Blue.Interface<{
    tweetId: string
    type: 'retweet' | 'upcomingSchedule'
}>

export const TweetLog = Spark<ITweetLog>()({
    root: true,
    collection: db => db.collection('tweetLogs'),
})
export const RetweetLog = SparkQuery<ITweetLog>()({
    root: true,
    query: db => db.collection('tweetLogs').where('type', '==', 'retweet'),
})

export type ITweetLogSerialized = Merge<
    ITweetLog['_D'],
    Record<'_createdAt' | '_updatedAt', string> & {
        _ref: undefined
    }
>

export class MTweetLog {
    static serialize(schedule: ITweetLog['_D']): ITweetLogSerialized {
        return {
            ...schedule,
            _createdAt:
                schedule._createdAt && serializeTimestamp(schedule._createdAt),
            _updatedAt:
                schedule._updatedAt && serializeTimestamp(schedule._updatedAt),
            _ref: undefined,
        }
    }
}

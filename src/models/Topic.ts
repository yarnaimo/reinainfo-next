import { Blue, Spark } from 'bluespark'
import dayjs from 'dayjs'
import { Merge } from 'type-fest'
import { filterByTimestamp, serializeTimestamp } from '../utils/firebase'

export type ITopic = Blue.Interface<{
    type: 'retweet' | 'tweet'
    tweetId: string
    origCreatedAt: Blue.IO<Blue.Timestamp, Date>
}>

export const Topic = Spark<ITopic>()({
    root: true,
    collection: db => db.collection('topics'),
})

export type ITopicSerialized = Merge<
    ITopic['_D'],
    Record<'_createdAt' | '_updatedAt', string> & {
        _ref: undefined
    }
>

export class MTopic {
    static whereCreatedWithinTwoWeeks() {
        return filterByTimestamp(
            'origCreatedAt',
            'desc',
            dayjs().subtract(2, 'week'),
        )
    }

    static serialize(t: ITopic['_D']): ITopicSerialized {
        return {
            ...t,
            _createdAt: t._createdAt && serializeTimestamp(t._createdAt),
            _updatedAt: t._updatedAt && serializeTimestamp(t._updatedAt),
            _ref: undefined,
        }
    }
}

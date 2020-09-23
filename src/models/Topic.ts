import { Blue, MSpark, MTimestamp, Spark } from 'bluespark'
import { Merge } from 'type-fest'
import { dayjs } from '../utils/date'

export type ITopic = Blue.Interface<{
  type: 'retweet' | 'tweet'
  tweetId: string
  origCreatedAt: Blue.IO<Blue.Timestamp, Date>
}>

export const Topic = Spark<ITopic>()({
  root: true,
  collection: (db) => db.collection('topics'),
})

export type ITopicSerialized = Merge<
  ITopic['_D'],
  Record<'_createdAt' | '_updatedAt', string> & {
    _ref: undefined
  }
>

export class MTopic {
  static whereCreatedWithinTwoWeeks() {
    return MTimestamp.where({
      field: 'origCreatedAt',
      order: 'desc',
      since: dayjs().subtract(2, 'week'),
    })
  }

  static serialize(t: ITopic['_D']): ITopicSerialized {
    return MSpark.serialize(t)
  }
}

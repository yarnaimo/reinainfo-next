import { Blue, Spark } from 'bluespark'

export type ITweetLog = Blue.Interface<{
    tweetId: string
    type: 'retweet' | 'upcomingSchedule'
}>

export const TweetLog = Spark<ITweetLog>()({
    root: true,
    collection: db => db.collection('tweetLogs'),
})

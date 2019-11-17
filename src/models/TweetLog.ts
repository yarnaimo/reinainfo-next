import { Blue, Spark } from 'bluespark'

export type ITweetLog = Blue.Interface<{
    tweetId: string
    type: 'retweet' | 'upcomingSchedule'
}>

export const TweetLog = Spark<ITweetLog>()(true, db =>
    db.collection('tweetLogs'),
)

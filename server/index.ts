import dayjs from 'dayjs'
import * as functions from 'firebase-functions'
import { TweetClassifier } from '../learn'
import { _next } from './api/next'
import { _onScheduleWrite } from './api/onScheduleWrite'
import { _retweetManually } from './api/retweetManually'
import { _retweetPositiveTweets } from './api/retweetPositiveTweets'
import { _retweetScheduleTweetsOfPrevNight } from './api/retweetScheduleTweetsOfPrevNight'
import { _tweetUpcomingSchedules } from './api/tweetUpcomingSchedules'
import { _tweetUpcomingTicketEvents } from './api/tweetUpcomingTicketEvents'
import { getTwimoClient } from './services/twitter'

const timezone = 'Asia/Tokyo'
process.env.TZ = timezone

const defaultRegion = functions.region('asia-northeast1')
const usRegion = functions.region('us-central1')

const nextBuilder = usRegion.runWith({
    timeoutSeconds: 15,
    memory: '256MB',
})
const defaultBuilder = defaultRegion.runWith({
    timeoutSeconds: 30,
    memory: '256MB',
})
const puppeteerBuilder = defaultRegion.runWith({
    timeoutSeconds: 30,
    memory: '1GB',
})

export const next = nextBuilder.https.onRequest(_next)

export const retweetManually = defaultBuilder.https.onCall(_retweetManually)

// const tasks = [_crawlTweets()]

// if (dayjs().minute() < 15) {
//     tasks.push(_tweetSchedulesBetween())
// }
// await Promise.all(tasks)

export const retweetPositiveTweets = defaultBuilder.pubsub
    .schedule('every 15 minutes')
    .timeZone(timezone)
    .onRun(async () => {
        const twimo = await getTwimoClient()
        const tc = new TweetClassifier()
        await _retweetPositiveTweets(twimo, dayjs(), t => tc.isOfficialTweet(t))
    })

export const retweetScheduleTweetsOfPrevNight = defaultBuilder.pubsub
    .schedule('every day 09:00')
    .timeZone(timezone)
    .onRun(async () => {
        const twimo = await getTwimoClient()
        await _retweetScheduleTweetsOfPrevNight(twimo, dayjs())
    })

export const tweetUpcomingSchedules = defaultBuilder.pubsub
    .schedule('every day 21:00')
    .timeZone(timezone)
    .onRun(async () => {
        const twimo = await getTwimoClient()
        await _tweetUpcomingSchedules(twimo, dayjs(), 'daily')
    })

export const tweetUpcomingTicketEvents = defaultBuilder.pubsub
    .schedule('every day 21:05')
    .timeZone(timezone)
    .onRun(async () => {
        const twimo = await getTwimoClient()
        await _tweetUpcomingTicketEvents(twimo, dayjs())
    })

export const mightUpdateScheduleThumb = puppeteerBuilder.firestore
    .document('schedules/{schedule}')
    .onWrite(async (change, context) => {
        const { before, after } = change
        await _onScheduleWrite(before, after)
    })

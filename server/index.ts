import dayjs from 'dayjs'
import * as functions from 'firebase-functions'
import { _next } from './api/next'
import { _crawlTweets } from './api/retweetPickedTweets'
import { _tweetSchedulesBetween } from './api/tweetUpcomingSchedules'
import { _updateTwitterLists } from './api/updateTwitterLists'

process.env.TZ = 'Asia/Tokyo'

const { https, pubsub } = functions
    .runWith({ timeoutSeconds: 180 })
    .region('asia-northeast1')

export const next = functions.region('us-central1').https.onRequest(_next)

export const crawl = pubsub.schedule('every 15 minutes').onRun(async () => {
    const tasks = [_crawlTweets()]

    if (dayjs().minute() < 15) {
        tasks.push(_tweetSchedulesBetween())
    }
    await Promise.all(tasks)
})

export const updateTwitterLists = https.onCall(_updateTwitterLists)

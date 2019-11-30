const timezone = 'Asia/Tokyo'
process.env.TZ = timezone

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

const getTime = () => dayjs().format('HHmm')

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

const run = <T extends any>(name: string, fn: () => Promise<T>) => {
    console.log(`⚡ ${name}`)
    return fn()
}

export const defaultBuilderFunctions = defaultBuilder.pubsub
    .schedule('*/15 * * * *')
    .timeZone(timezone)
    .onRun(async () => {
        const time = getTime()
        console.log(time)
        const twimo = await getTwimoClient()

        const tc = new TweetClassifier()
        await run('retweetPositiveTweets', () =>
            _retweetPositiveTweets(twimo, dayjs(), t => tc.isOfficialTweet(t)),
        )

        if (time === '0900') {
            await run('retweetScheduleTweetsOfPrevNight', () =>
                _retweetScheduleTweetsOfPrevNight(twimo, dayjs()),
            )
        }

        if (time === '2100') {
            await run('tweetUpcomingSchedules', () =>
                _tweetUpcomingSchedules(twimo, dayjs(), 'daily'),
            )
            await run('tweetUpcomingTicketEvents', () =>
                _tweetUpcomingTicketEvents(twimo, dayjs()),
            )
        }
    })

export const onScheduleWrite = puppeteerBuilder.firestore
    .document('schedules/{schedule}')
    .onWrite(async (change, context) => {
        const twimo = await getTwimoClient()
        const { before, after } = change
        await _onScheduleWrite(twimo, before, after)
    })

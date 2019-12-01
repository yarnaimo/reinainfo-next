import { Blue } from 'bluespark'
import { ulid } from 'ulid'
import { env } from '../../src/env'
import { ISchedule, MSchedule } from '../../src/models/Schedule'
import { dbAdmin } from '../services/firebase-admin'
import { sendCrossNotification } from '../services/integrated'
import { newBrowserPage } from '../services/puppeteer'
import { savePNGImage } from '../services/storage'
import { TwimoClient } from '../services/twitter'

export const updateScheduleThumb = async (schedule: ISchedule['_D']) => {
    const page = await newBrowserPage()

    await page.setViewport({
        width: env.twitterCardSize[0],
        height: env.twitterCardSize[1],
        deviceScaleFactor: 2,
    })

    await page.goto(`${env.origin}/_headless/schedules/${schedule._id}`)
    await page.waitFor(4000)

    const buffer = await page.screenshot({ encoding: 'binary' })

    const fileId = ulid()
    const thumbUrl = await savePNGImage(`scheduleThumbs/${fileId}.png`, buffer)
    console.log(thumbUrl)

    // ** keep _updatedAt unchanged **
    await schedule._ref.update({
        thumbUrl,
    })

    await page.browser().close()
}

export const onScheduleCreate = async (
    twimo: TwimoClient,
    schedule: ISchedule['_D'],
    skipScreenshot: boolean,
) => {
    if (!skipScreenshot) {
        await updateScheduleThumb(schedule)
    }

    const text = MSchedule.buildNotificationText(
        schedule,
        '🎉 スケジュールが登録されました',
        true,
    )

    const { tweetResults, webhookResults } = await sendCrossNotification(
        twimo,
        [text],
    )

    return { type: 'created', tweetResults, webhookResults }
}

export const onScheduleUpdate = async (
    twimo: TwimoClient,
    schedule: ISchedule['_D'],
    skipScreenshot: boolean,
) => {
    if (!skipScreenshot) {
        await updateScheduleThumb(schedule)
    }
    return { type: 'updated' }
}

export const _onScheduleWrite = async (
    twimo: TwimoClient,
    _before: Blue.DocSnapshot,
    _after: Blue.DocSnapshot,
    skipScreenshot = false,
) => {
    const before = dbAdmin.schedules._decode(_before)
    const after = dbAdmin.schedules._decode(_after)

    const beforeTimestamp = before?._updatedAt
    const afterTimestamp = after?._updatedAt

    if (!beforeTimestamp && afterTimestamp) {
        return onScheduleCreate(twimo, after!, skipScreenshot)
    }

    if (
        beforeTimestamp &&
        afterTimestamp &&
        !afterTimestamp.isEqual(beforeTimestamp)
    ) {
        return onScheduleUpdate(twimo, after!, skipScreenshot)
    }

    return { type: null }
}

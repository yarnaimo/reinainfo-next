import { Blue } from 'bluespark'
import { ulid } from 'ulid'
import { env } from '../../src/env'
import { MSchedule } from '../../src/models/Schedule'
import { sendCrossNotification } from '../services/integrated'
import { newBrowserPage } from '../services/puppeteer'
import { savePNGImage } from '../services/storage'
import { TwimoClient } from '../services/twitter'

export const updateScheduleThumb = async (snap: Blue.DocSnapshot) => {
    const { id } = snap.ref

    const page = await newBrowserPage()

    await page.setViewport({
        width: env.twitterCardSize[0],
        height: env.twitterCardSize[1],
        deviceScaleFactor: 2,
    })

    await page.goto(`${env.origin}/headless/schedules/${id}`)
    await page.waitFor(4000)

    const buffer = await page.screenshot({ encoding: 'binary' })

    const fileId = ulid()
    const thumbUrl = await savePNGImage(`scheduleThumbs/${fileId}.png`, buffer)
    console.log(thumbUrl)

    // ** keep _updatedAt unchanged **
    await snap.ref.update({
        thumbUrl,
    })

    await page.browser().close()
}

export const onScheduleCreate = async (
    twimo: TwimoClient,
    snap: Blue.DocSnapshot,
) => {
    await updateScheduleThumb(snap)

    const text = MSchedule.buildNotificationText(
        snap.data() as any,
        '🎉 スケジュールが追加されました',
        true,
    )

    const { tweetResults, webhookResults } = await sendCrossNotification(
        twimo,
        [text],
    )

    return { tweetResults, webhookResults }
}

export const onScheduleUpdate = async (
    twimo: TwimoClient,
    snap: Blue.DocSnapshot,
) => {
    await updateScheduleThumb(snap)
}

export const _onScheduleWrite = async (
    twimo: TwimoClient,
    before: Blue.DocSnapshot | undefined,
    after: Blue.DocSnapshot,
) => {
    const [beforeTimestamp, afterTimestamp] = [before, after].map(
        snap => snap?.data()?._updatedAt as Blue.Timestamp | undefined,
    )

    if (!beforeTimestamp && afterTimestamp) {
        return onScheduleCreate(twimo, after)
    }

    if (
        beforeTimestamp &&
        afterTimestamp &&
        !afterTimestamp.isEqual(beforeTimestamp)
    ) {
        return onScheduleUpdate(twimo, after)
    }
}

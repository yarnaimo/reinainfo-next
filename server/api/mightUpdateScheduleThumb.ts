import { Blue } from 'bluespark'
import { ulid } from 'ulid'
import { env } from '../../src/env'
import { newBrowserPage } from '../services/puppeteer'
import { savePNGImage } from '../services/storage'

export const updateScheduleThumb = async (after: Blue.DocSnapshot) => {
    const { id } = after

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
    await after.ref.update({
        thumbUrl,
    })

    await page.browser().close()
}

export const _mightUpdateScheduleThumb = async (
    before: Blue.DocSnapshot,
    after: Blue.DocSnapshot,
) => {
    const [beforeTimestamp, afterTimestamp] = [before, after].map(
        snap => snap.data()?._updatedAt as Blue.Timestamp | undefined,
    )

    const isCreated = !beforeTimestamp && afterTimestamp

    const isUpdated =
        beforeTimestamp &&
        afterTimestamp &&
        !afterTimestamp.isEqual(beforeTimestamp)

    if (isCreated || isUpdated) {
        await updateScheduleThumb(after)
    }
}

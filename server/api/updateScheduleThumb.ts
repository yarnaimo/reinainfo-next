import { ulid } from 'ulid'
import { env } from '../../src/env'
import { dbAdmin } from '../services/firebase-admin'
import { newBrowserPage } from '../services/puppeteer'
import { savePNGImage } from '../services/storage'

export const updateScheduleThumb = async (id: string) => {
    const page = await newBrowserPage()

    await page.setViewport({
        width: env.twitterCardSize[0],
        height: env.twitterCardSize[1],
        deviceScaleFactor: 2,
    })

    await page.goto(`${env.origin}/headless/schedules/${id}`)
    await page.waitFor(3000)

    const buffer = await page.screenshot({ encoding: 'binary' })

    const fileId = ulid()
    const thumbUrl = await savePNGImage(`scheduleThumbs/${fileId}.png`, buffer)
    console.log(thumbUrl)

    await dbAdmin.schedules.update(id, {
        thumbUrl,
    })
}

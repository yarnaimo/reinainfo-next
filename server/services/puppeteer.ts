import puppeteer from 'puppeteer'
import { env } from '../../src/env'

const winChromePath =
    '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe'

export const newBrowserPage = async () => {
    const browser = await puppeteer.launch({
        headless: !env.isDev,
        executablePath: env.isDev ? winChromePath : undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage()
    return page
}

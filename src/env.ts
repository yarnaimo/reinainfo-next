const isDev = process.env.NODE_ENV !== 'production'
const isBrowser = (process as any).browser as boolean
const port = () => parseInt(process.env.PORT || '3000', 10)

export const env = {
    isDev,
    isBrowser,
    port,
    origin: isDev
        ? `https://localhost:${port()}`
        : 'https://reinainfo-next.web.app',
    appName: 'ReinaInfo Next',
    longAppName: 'ReinaInfo Next - 上田麗奈さん非公式info',
    description: '',
    screenName: 'Unoffishama',
    twitterCardSize: [310, 162] as const,
}

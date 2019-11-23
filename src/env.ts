const isDev = () => process.env.NODE_ENV !== 'production'

const port = () => parseInt(process.env.PORT || '3000', 10)

export const env = {
    isDev,
    port,
    origin: isDev()
        ? `https://localhost:${port()}`
        : 'https://reinainfo-next.web.app',
    appName: 'ReinaInfo Next',
    description: '',
    screenName: 'Unoffishama',
    twitterCardSize: [310, 162] as const,
}

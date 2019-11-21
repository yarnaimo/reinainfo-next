export const env = {
    appName: 'ReinaInfo',
    description: '',
    twitterCardSize: [310, 162] as const,
    isDev: () => process.env.NODE_ENV !== 'production',
    port: () => parseInt(process.env.PORT || '3000', 10),
}

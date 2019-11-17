export const env = {
    appName: 'ReinaInfo',
    description: '',
    isDev: () => process.env.NODE_ENV !== 'production',
    port: () => parseInt(process.env.PORT || '3000', 10),
}

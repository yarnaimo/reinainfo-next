import { Blue, Spark } from 'bluespark'

export type IWebhook = Blue.Interface<{
    service: 'slack' | 'discord'
    url: string
}>

export const Webhook = Spark<IWebhook>()({
    root: true,
    collection: db => db.collection('webhooks'),
})

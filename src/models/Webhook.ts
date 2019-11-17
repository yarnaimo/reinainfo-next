import { Blue, Spark } from 'bluespark'

export type IWebhook = Blue.Interface<{
    service: 'slack' | 'discord'
    url: string
}>

export const Webhook = Spark<IWebhook>()(true, db => db.collection('webhooks'))

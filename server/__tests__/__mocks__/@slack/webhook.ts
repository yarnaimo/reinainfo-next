import { dbAdmin } from '../../../services/firebase-admin'

export let send: any

beforeEach(() => {
    send = jest.fn().mockResolvedValue({ text: 'ok' })
})

export const IncomingWebhook = function(this: any) {
    this.send = send
}

export const prepareWebhookDoc = () =>
    dbAdmin.webhooks.create(null, {
        service: 'slack',
        url: 'url',
    })

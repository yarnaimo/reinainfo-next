import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook'
import { prray } from 'prray'
import { IWebhook } from '../../src/models/Webhook'
import { dbAdmin } from './firebase-admin'

export const sendWebhookMessage = async (
    { service, url }: IWebhook['_A'],
    message: IncomingWebhookSendArguments,
) => {
    const client = new IncomingWebhook(
        service === 'slack' ? url : `${url}/slack`,
    )
    return client.send(message)
}

export const sendMessageToAllWebhooks = async (
    message: IncomingWebhookSendArguments,
) => {
    const { array: webhooks } = await dbAdmin.webhooks.getQuery({})

    const results = await prray(webhooks).mapAsync(
        async webhook => {
            try {
                const result = await sendWebhookMessage(webhook, message)
                return { webhook, result }
            } catch (error) {
                return { webhook, error }
            }
        },
        { concurrency: 16 },
    )
    return results
}

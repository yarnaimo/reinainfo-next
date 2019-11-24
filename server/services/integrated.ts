import { getUrlOfTweet } from '@yarnaimo/twimo'
import { prray } from 'prray'
import { dbAdmin } from './firebase-admin'
import { TwimoClient } from './twitter'
import { sendMessageToAllWebhooks } from './webhook'

export const retweetWithLoggingAndNotification = async (
    twimo: TwimoClient,
    ids: string[],
) => {
    const retweetResults = await twimo.retweet(ids)

    await prray(retweetResults).mapAsync(({ retweeted_status }) =>
        dbAdmin.retweetLogs.create(retweeted_status!.id_str, {}),
    )

    if (!retweetResults.length) {
        return { retweetResults }
    }

    const webhookResults = await sendMessageToAllWebhooks({
        text: [
            `⚡ ${retweetResults.length} 件のツイートをリツイートしました`,
            ...retweetResults.map(r => getUrlOfTweet(r)),
        ].join('\n'),
    })

    return { retweetResults, webhookResults }
}

export const sendCrossNotification = async (
    twimo: TwimoClient,
    texts: string[],
) => {
    const tweetResults = await twimo.postThread(texts)

    const webhookResults = await prray(texts).mapAsync(
        text => sendMessageToAllWebhooks({ text }),
        {
            concurrency: 1,
        },
    )

    return { tweetResults, webhookResults }
}

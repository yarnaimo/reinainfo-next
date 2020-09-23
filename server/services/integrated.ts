import { getUrlOfTweet } from '@yarnaimo/twimo'
import { prray } from 'prray'
import { env } from '../../src/env'
import { dayjs } from '../../src/utils/date'
import { dbAdmin } from './firebase-admin'
import { TwimoClient } from './twitter'
import { sendMessageToAllWebhooks } from './webhook'

export const retweetWithLoggingAndNotification = async (
  twimo: TwimoClient,
  ids: string[],
  isMyTweet: boolean,
) => {
  const twitterCollection = await dbAdmin.twitterCollections.getDoc({
    doc: 'topics',
  })
  if (!twitterCollection) {
    throw new Error('twitterCollections/topics not found')
  }

  //

  const tweetResults = isMyTweet
    ? await twimo.lookupTweets(ids)
    : (await twimo.retweet(ids)).map((r) => r.retweeted_status!)

  await prray(tweetResults).mapAsync(
    async ({ id_str: tweetId, created_at }) => {
      await twimo.addTweetToCollection({
        tweetId,
        collectionId: twitterCollection.collectionId,
      })

      return dbAdmin.topics.create(null, {
        type: isMyTweet ? 'tweet' : 'retweet',
        tweetId,
        origCreatedAt: dayjs(created_at).toDate(),
      })
    },
  )

  if (!tweetResults.length) {
    return { tweetResults }
  }

  const webhookResults = await sendMessageToAllWebhooks({
    text: [
      isMyTweet
        ? `⚡ @${env.screenName} がツイートしました`
        : `⚡ ${tweetResults.length} 件リツイートしました`,
      ...tweetResults.map((r) => getUrlOfTweet(r)),
    ].join('\n'),
  })

  return { tweetResults, webhookResults }
}

export const sendCrossNotification = async (
  twimo: TwimoClient,
  texts: string[],
) => {
  const tweetResults = await twimo.postThread(texts)

  const webhookResults = await prray(texts).mapAsync(
    (text) => sendMessageToAllWebhooks({ text }),
    {
      concurrency: 1,
    },
  )

  return { tweetResults, webhookResults }
}

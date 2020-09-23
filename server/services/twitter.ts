import { TwimoClient } from '@yarnaimo/twimo'
import { IStatus } from '../../src/services/tweet-service'
import { PromiseReturnType } from '../../src/utils/types'
import { getEnv } from './firebase-admin'

export type ListInfo = { id_str: string; name: string }

export const getTwimoClient = async () => {
  const env = await getEnv()

  const twimo = TwimoClient(env.twitter)
  return {
    ...twimo,

    lookupTweets: (ids: string[]) =>
      twimo.get<IStatus[]>('statuses/lookup', {
        ...twimo.defaultParams,
        id: ids.join(),
      }),

    getLists: () => twimo.get<ListInfo[]>('lists/list'),

    getListTweets: (listId: string) =>
      twimo.get<IStatus[]>('lists/statuses', {
        list_id: listId,
        count: 100,
      }),

    getMutedIds: async () => {
      const { ids } = await twimo.get<{ ids: string[] }>('mutes/users/ids', {
        stringify_ids: true,
      })
      return new Set(ids)
    },

    addTweetToCollection: ({
      collectionId,
      tweetId,
    }: {
      collectionId: string
      tweetId: string
    }) =>
      twimo.post('collections/entries/add', {
        id: collectionId,
        tweet_id: tweetId,
      }),
  }
}

export type TwimoClient = PromiseReturnType<typeof getTwimoClient>

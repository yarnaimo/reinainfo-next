import { Status } from 'twitter-d'
import { mutedIds, searchResults } from '../../__tests__/__fixtures__/twitter'

export const getTwimoClient = async () => {
  return {
    getMutedIds: async () => new Set(mutedIds),
    searchTweets: jest
      .fn()
      .mockResolvedValueOnce(searchResults.slice(0, 2).reverse())
      .mockImplementationOnce(
        async ({ sinceId }: any) =>
          sinceId === '2' && searchResults.slice(2).reverse(),
      ),
    retweet: async (ids: string[]) => {
      return ids.map(
        (id) =>
          ({
            retweeted_status: searchResults.find((t) => t.id_str === id),
          } as Status),
      )
    },
    postThread: async (texts: string[]) => {
      return texts.map(
        (full_text, i) => ({ full_text, id_str: String(i) } as Status),
      )
    },
    addTweetToCollection: ({
      collectionId,
      tweetId,
    }: {
      collectionId: string
      tweetId: string
    }) => ({}),
  }
}

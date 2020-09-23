import { Blue, Spark } from 'bluespark'

export type ITwitterSearch = Blue.Interface<{
  query: string
  prevTweetId: string | null
}>

export const TwitterSearch = Spark<ITwitterSearch>()({
  root: true,
  collection: (db) => db.collection('twitterSearches'),
})

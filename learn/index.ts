import * as tf from '@tensorflow/tfjs'
import { readFileSync } from 'fs'
import lazy from 'lazy.js'
import { join } from 'path'
import { FullUser, Status } from 'twitter-d'

type R0 = tf.Tensor<tf.Rank.R0>
type R1 = tf.Tensor<tf.Rank.R1>
type R2 = tf.Tensor<tf.Rank.R2>

export { tf }
export const utf8 = 'utf8'
export const tmpPath = (...paths: string[]) => join('learn', 'tmp', ...paths)
export const store = join('learn', 'store.json')

export interface IData {
  xs: R2
  ys: R1
  indexes: number[]
}

export const loadCsv = () => {
  const data = readFileSync(tmpPath('tweets.csv'), utf8)
    .split('\n')
    .map((row) => row.split(',').map(Number))

  const data_tensor = tf.tensor2d(data)

  const xs = data_tensor.slice([0, 1], [-1, -1])
  const ys = data_tensor.slice([0, 0], [-1, 1]).as1D()

  return {
    xs,
    ys,
    indexes: lazy.range(xs.shape[0]).toArray(),
  } as IData
}

export const getSigmoid = (xs: R2, v: R1, w: R2, b: R1) => {
  return xs
    .clipByValue(1e-10, Infinity)
    .pow(v)
    .matMul(w)
    .add(b)
    .sigmoid()
    .as1D()
}

export class TweetClassifier {
  private v: R1
  private w: R2
  private b: R1

  constructor() {
    const { v, w, b } = JSON.parse(readFileSync(store, utf8))
    this.v = tf.tensor1d(v)
    this.w = tf.tensor1d(w).as2D(-1, 1)
    this.b = tf.tensor1d([b])
  }

  isOfficialTweet(tweet: Status) {
    const x = tf.tensor1d(tweetToVector(tweet)).as2D(1, -1)
    const y = getSigmoid(x, this.v, this.w, this.b)

    return !!y.greater(tf.scalar(0.5)).dataSync()[0]
  }
}

export const extractTweetId = (str: string) => (str.match(/(\d+)$/) || [])[1]

const length = (array?: any[] | null) => (array ? array.length : 0)

export const tweetToVector = ({ user: _user, ...t }: Status) => {
  const user = _user as FullUser

  return [
    user.friends_count,
    user.followers_count,
    user.friends_count / (user.followers_count || 1),
    user.favourites_count,
    user.verified,
    user.description && user.description.length,
    length(user.entities.description.urls),
    user.url != null,
    t.retweet_count,
    t.favorite_count,
    t.full_text.length,
    length(t.entities.hashtags),
    length(t.entities.urls),
    t.extended_entities ? length(t.extended_entities.media) : 0,
  ].map(Number)
}

export const tweetToVectorWithLabel = (officialTweetIds?: string[]) => (
  t: Status,
) => {
  return [
    officialTweetIds ? officialTweetIds.includes(t.id_str) : true,
    ...tweetToVector(t),
  ].map(Number)
}

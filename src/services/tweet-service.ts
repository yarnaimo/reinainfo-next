import { Status } from 'twitter-d'

export type DeepExcludeUndefined<T> = {
  [K in keyof T]-?: Exclude<DeepExcludeUndefined<T[K]>, undefined>
}

export type IStatus = DeepExcludeUndefined<Status>

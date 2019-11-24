import { Blue, Spark } from 'bluespark'
import { Merge } from 'type-fest'
import { serializeTimestamp } from '../utils/firebase'

export type IRetweetLog = Blue.Interface<{}>

export const RetweetLog = Spark<IRetweetLog>()({
    root: true,
    collection: db => db.collection('retweetLogs'),
})

export type IRetweetLogSerialized = Merge<
    IRetweetLog['_D'],
    Record<'_createdAt' | '_updatedAt', string> & {
        _ref: undefined
    }
>

export class MRetweetLog {
    static serialize(log: IRetweetLog['_D']): IRetweetLogSerialized {
        return {
            ...log,
            _createdAt: log._createdAt && serializeTimestamp(log._createdAt),
            _updatedAt: log._updatedAt && serializeTimestamp(log._updatedAt),
            _ref: undefined,
        }
    }
}

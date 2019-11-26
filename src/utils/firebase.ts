import { Blue } from 'bluespark'
import dayjs, { Dayjs } from 'dayjs'
import { firestore } from 'firebase/app'

export const serializeTimestamp = (timestamp: firestore.Timestamp) =>
    timestamp.toDate().toISOString()

export const deserializeTimestamp = (isoString: string) =>
    firestore.Timestamp.fromDate(new Date(isoString))

export const timestampToDayjs = (timestamp: Blue.Timestamp) =>
    dayjs(timestamp.toDate())

export const filterByTimestamp = (
    field: string,
    order: 'asc' | 'desc',
    since?: Dayjs,
    until?: Dayjs,
) => {
    return <Q extends Blue.Query>(q: Q) => {
        let _q = q as Blue.Query
        since && (_q = _q.where(field, '>=', since.toDate()))
        until && (_q = _q.where(field, '<', until.toDate()))

        return _q.orderBy(field, order) as Q
    }
}

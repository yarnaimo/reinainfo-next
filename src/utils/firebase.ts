import { Blue } from 'bluespark'
import dayjs from 'dayjs'
import { firestore } from 'firebase/app'

export const serializeTimestamp = (timestamp: firestore.Timestamp) =>
    timestamp.toDate().toISOString()

export const deserializeTimestamp = (isoString: string) =>
    firestore.Timestamp.fromDate(new Date(isoString))

export const timestampToDayjs = (timestamp: Blue.Timestamp) =>
    dayjs(timestamp.toDate())

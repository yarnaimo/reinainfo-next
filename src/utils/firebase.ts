import { firestore } from 'firebase/app'

export const serializeTimestamp = (timestamp: firestore.Timestamp) =>
    timestamp.toDate().toISOString()
export const deserializeTimestamp = (isoString: string) =>
    firestore.Timestamp.fromDate(new Date(isoString))

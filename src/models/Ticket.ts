import { Blue, Spark, SparkQuery } from 'bluespark'

export type ITicket = Blue.Interface<{
    scheduleId: string
    label: string
    opensAt: Blue.IO<Blue.Timestamp | null, Date | null>
    closesAt: Blue.IO<Blue.Timestamp | null, Date | null>
}>

export const Ticket = Spark<ITicket>()({
    root: false,
    collection: schedule => schedule.collection('tickets'),
})
export const GTicket = SparkQuery<ITicket>()({
    root: true,
    query: db => db.collectionGroup('tickets'),
})

import { Blue, Spark, SparkQuery } from 'bluespark'

export type ITicket = Blue.Interface<{
    label: string
}>

export const Ticket = Spark<ITicket>()(false, schedule =>
    schedule.collection('tickets'),
)
export const GTicket = SparkQuery<ITicket>()(true, db =>
    db.collectionGroup('tickets'),
)

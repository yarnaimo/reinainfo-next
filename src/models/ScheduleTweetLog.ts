import { Blue, Spark } from 'bluespark'

export type IScheduleTweetLog = Blue.Interface<{}>

export const ScheduleTweetLog = Spark<IScheduleTweetLog>()({
    root: true,
    collection: db => db.collection('scheduleTweetLogs'),
})

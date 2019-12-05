import { Blue, Spark } from 'bluespark'
import { Merge } from 'type-fest'
import { IScheduleSeed } from './Schedule'

export type WNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ISerial = Blue.Interface<
    Merge<
        IScheduleSeed,
        {
            active: boolean
            label: string
            dayOfWeek: WNumber
            timeOfDay: [number, number]
            weekNumbers: number[] | null
            weekInterval: number | null
        }
    >
>

export const Serial = Spark<ISerial>()({
    root: true,
    collection: db => db.collection('serials'),
})

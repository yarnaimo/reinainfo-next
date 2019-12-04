import { Blue, Spark } from 'bluespark'
import { Merge } from 'type-fest'
import { IScheduleSeed } from './Schedule'

export type ISerial = Blue.Interface<
    Merge<
        IScheduleSeed,
        {
            active: boolean
            label: string
        }
    >
>

export const Serial = Spark<ISerial>()({
    root: true,
    collection: db => db.collection('serials'),
})

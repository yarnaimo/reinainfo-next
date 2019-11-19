import { Blue, Spark } from 'bluespark'

export type ISerial = Blue.Interface<{
    active: boolean
    label: string
}>

export const Serial = Spark<ISerial>()({
    root: true,
    collection: db => db.collection('serials'),
})

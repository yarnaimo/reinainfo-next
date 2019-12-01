import { Blue, Spark } from 'bluespark'

export type ITwitterCollection = Blue.Interface<{
    collectionId: string
}>

export const TwitterCollection = Spark<ITwitterCollection>()({
    root: true,
    collection: db => db.collection('twitterCollections'),
})

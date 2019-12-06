import { Blue, MSpark, Spark, SparkSerialized } from 'bluespark'

export type ITwitterCollection = Blue.Interface<{
    collectionId: string
}>

export type ITwitterCollectionSerialized = SparkSerialized<
    ITwitterCollection['_D']
>

export const TwitterCollection = Spark<ITwitterCollection>()({
    root: true,
    collection: db => db.collection('twitterCollections'),
})

export class MTwitterCollection {
    static serialize(
        t: ITwitterCollection['_D'],
    ): ITwitterCollectionSerialized {
        return MSpark.serialize(t)
    }
}

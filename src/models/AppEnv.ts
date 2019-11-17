import { Blue, Spark } from 'bluespark'

export type IAppEnv = Blue.Interface<{
    twitter: {
        consumerKey: string
        consumerSecret: string
        token: string
        tokenSecret: string
    }
}>

export const AppEnv = Spark<IAppEnv>()(true, db => db.collection('appEnvs'))

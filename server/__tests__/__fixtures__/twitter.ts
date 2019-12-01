import dayjs from 'dayjs'
import { Status } from 'twitter-d'
import { dbAdmin } from '../../services/firebase-admin'
import { now } from './date'

export const prepareTwitterCollectionDoc = () =>
    dbAdmin.twitterCollections.create('topics', {
        collectionId: '117',
    })

export const screen_name = 'screenName'

export const mutedIds = ['91']

export const searchResults = [
    {
        id_str: '0',
        created_at: dayjs('2018-11-17').toISOString(),
        user: { id_str: '50', screen_name },
    },
    {
        id_str: '1',
        created_at: dayjs('2018-12-27').toISOString(),
        user: { id_str: mutedIds[0], screen_name },
    },
    {
        id_str: '2',
        created_at: dayjs('2018-12-27').toISOString(),
        user: { id_str: '52', screen_name },
    },
    {
        id_str: '3',
        created_at: dayjs('2018-12-27').toISOString(),
        user: { id_str: '53', screen_name },
    },
    {
        id_str: '4',
        created_at: now.subtract(10, 'minute').toISOString(),
        user: { id_str: '54', screen_name },
    },
] as Status[]

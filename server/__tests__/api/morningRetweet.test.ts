import dayjs from 'dayjs'
import { prray } from 'prray'
import { Status } from 'twitter-d'
import { _morningRetweet } from '../../api/morningRetweet'
import { dbInstanceAdmin } from '../../services/firebase-admin'
import { mockTwimo } from '../utils'

const now = dayjs('2018-08-03T09:00')

test('morningRetweet', async () => {
    const twimo = mockTwimo({
        retweet: async (ids: string[]) => {
            return ids.map(
                id => ({ retweeted_status: { id_str: id } } as Status),
            )
        },
    })

    await prray([
        {
            _createdAt: new Date('2018-08-01T22:00'),
            type: 'upcomingSchedule' as const,
            tweetId: '81',
        },
        {
            _createdAt: new Date('2018-08-02T22:00'),
            type: 'retweet' as const,
            tweetId: '117',
        },
        {
            _createdAt: new Date('2018-08-02T22:00'),
            type: 'upcomingSchedule' as const,
            tweetId: '1080',
        },
    ]).mapAsync(log => dbInstanceAdmin.collection('tweetLogs').add(log))

    // start

    const result = await _morningRetweet(twimo, now)

    // end

    expect(result).toHaveLength(1)
    expect(result).toMatchObject([{ retweeted_status: { id_str: '1080' } }])
})

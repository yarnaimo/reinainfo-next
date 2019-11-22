import dayjs from 'dayjs'
import { Status } from 'twitter-d'
import { _retweetPositiveTweets } from '../../api/retweetPositiveTweets'
import { dbAdmin } from '../../services/firebase-admin'
import * as webhookModule from '../../services/webhook'
import { mockTwimo } from '../utils'

const webhookMock = jest
    .spyOn(webhookModule, 'sendWebhookMessage')
    .mockResolvedValue({ text: 'ok' })

const now = dayjs('2019-08-10T09:00')
const screen_name = 'screenName'

const tweets = [
    {
        id_str: '0',
        created_at: dayjs('2019-1-17').toISOString(),
        user: { id_str: '50', screen_name },
    },
    {
        id_str: '1',
        created_at: dayjs('2019-2-27').toISOString(),
        user: { id_str: '91', screen_name },
    },
    {
        id_str: '2',
        created_at: dayjs('2019-2-27').toISOString(),
        user: { id_str: '52', screen_name },
    },
    {
        id_str: '3',
        created_at: dayjs('2019-2-27').toISOString(),
        user: { id_str: '53', screen_name },
    },
    {
        id_str: '4',
        created_at: now.subtract(10, 'minute').toISOString(),
        user: { id_str: '54', screen_name },
    },
] as Status[]

test('retweetPositiveTweets', async () => {
    const twimo = mockTwimo({
        getMutedIds: async () => new Set(['91']),
        searchTweets: jest
            .fn()
            .mockResolvedValueOnce(tweets.slice(0, 2).reverse())
            .mockImplementationOnce(
                async ({ sinceId }: any) =>
                    sinceId === '2' && tweets.slice(2).reverse(),
            ),
        retweet: async (ids: string[]) => {
            return ids.map(
                id =>
                    ({
                        retweeted_status: tweets.find(t => t.id_str === id),
                    } as Status),
            )
        },
    })

    const query = 'query'
    await dbAdmin.twitterSearches.create('default', {
        query,
        prevTweetId: null,
    })

    await dbAdmin.webhooks.create(null, {
        service: 'slack',
        url: 'url',
    })

    const expectedMessages = [
        '⚡ 1 件のツイートをリツイートしました\nhttps://twitter.com/screenName/status/0',
        '⚡ 1 件のツイートをリツイートしました\nhttps://twitter.com/screenName/status/2',
    ]

    // start

    const result1 = await _retweetPositiveTweets(
        twimo,
        now,
        t => t.id_str !== '3',
    )

    // end

    expect(result1.retweetResults).toHaveLength(1)
    expect(result1.retweetResults).toMatchObject([
        { retweeted_status: { id_str: '0' } },
    ])
    expect(webhookMock).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'slack', url: 'url' }),
        { text: expectedMessages[0] },
    )

    const search1 = await dbAdmin.twitterSearches.getDoc({ doc: 'default' })
    expect(search1).toMatchObject({ query, prevTweetId: '1' })

    // start

    const result2 = await _retweetPositiveTweets(
        twimo,
        now,
        t => t.id_str !== '3',
    )

    // end

    expect(result2.retweetResults).toHaveLength(1)
    expect(result2.retweetResults).toMatchObject([
        { retweeted_status: { id_str: '2' } },
    ])
    expect(webhookMock).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'slack', url: 'url' }),
        { text: expectedMessages[1] },
    )

    const search2 = await dbAdmin.twitterSearches.getDoc({ doc: 'default' })
    expect(search2).toMatchObject({ query, prevTweetId: '3' })
})

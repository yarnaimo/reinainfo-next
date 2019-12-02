import { _retweetPositiveTweets } from '../../api/retweet-positive-tweets'
import { dbAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining } from '../utils'
import { now } from '../__fixtures__/date'
import { prepareTwitterCollectionDoc } from '../__fixtures__/twitter'
import { prepareWebhookDoc, send } from '../__mocks__/@slack/webhook'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()

    await prepareWebhookDoc()
    await prepareTwitterCollectionDoc()
})

test('retweetPositiveTweets', async () => {
    const query = 'query'
    await dbAdmin.twitterSearches.create('default', {
        query,
        prevTweetId: null,
    })

    // await dbAdmin.webhooks.create(null, {
    //     service: 'slack',
    //     url: 'url',
    // })

    const expectedMessages = [
        '⚡ 1 件リツイートしました\nhttps://twitter.com/screenName/status/0',
        '⚡ 1 件リツイートしました\nhttps://twitter.com/screenName/status/2',
    ]

    // start

    const result1 = await _retweetPositiveTweets(
        twimo,
        now,
        t => t.id_str !== '3',
    )

    // end

    expect(result1.tweetResults).toHaveLength(1)
    expect(result1.tweetResults).toMatchObject([{ id_str: '0' }])
    expect(send).toHaveBeenNthCalledWith(
        1,
        // expect.objectContaining({ service: 'slack', url: 'url' }),
        { text: expectedMessages[0] },
    )

    const search1 = await dbAdmin.twitterSearches.getDoc({ doc: 'default' })
    expect(search1).toMatchObject({ query, prevTweetId: '1' })

    const { array: topics } = await dbAdmin.topics.getQuery({})
    expectObjectArrayContaining(topics, 1, [{ type: 'retweet', tweetId: '0' }])

    // start

    const result2 = await _retweetPositiveTweets(
        twimo,
        now,
        t => t.id_str !== '3',
    )

    // end

    expect(result2.tweetResults).toHaveLength(1)
    expect(result2.tweetResults).toMatchObject([{ id_str: '2' }])
    expect(send).toHaveBeenNthCalledWith(
        2,
        // expect.objectContaining({ service: 'slack', url: 'url' }),
        { text: expectedMessages[1] },
    )

    const search2 = await dbAdmin.twitterSearches.getDoc({ doc: 'default' })
    expect(search2).toMatchObject({ query, prevTweetId: '3' })

    expect(send).toHaveBeenCalledTimes(2)
})

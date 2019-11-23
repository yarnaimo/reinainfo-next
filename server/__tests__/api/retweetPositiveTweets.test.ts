import { _retweetPositiveTweets } from '../../api/retweetPositiveTweets'
import { dbAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { now } from '../__fixtures__/date'
import { send } from '../__mocks__/@slack/webhook'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()
})

test('retweetPositiveTweets', async () => {
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
    expect(send).toHaveBeenNthCalledWith(
        1,
        // expect.objectContaining({ service: 'slack', url: 'url' }),
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
    expect(send).toHaveBeenNthCalledWith(
        2,
        // expect.objectContaining({ service: 'slack', url: 'url' }),
        { text: expectedMessages[1] },
    )

    const search2 = await dbAdmin.twitterSearches.getDoc({ doc: 'default' })
    expect(search2).toMatchObject({ query, prevTweetId: '3' })

    expect(send).toHaveBeenCalledTimes(2)
})

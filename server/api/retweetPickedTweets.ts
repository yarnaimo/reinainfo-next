import { plusOne } from '@yarnaimo/twimo'
import dayjs, { Dayjs } from 'dayjs'
import { Status } from 'twitter-d'
import { dbAdmin } from '../services/firebase-admin'
import { retweetWithLoggingAndNotification } from '../services/integrated'
import { getTwimoClient } from '../services/twitter'

export const _retweetPickedTweets = async (
    now: Dayjs,
    tweetClassifier: (t: Status) => boolean,
) => {
    const twimo = await getTwimoClient()
    const mutedIds = await twimo.getMutedIds()
    const isMuted = (t: Status) => mutedIds.has(t.user.id_str)

    const search = await dbAdmin.twitterSearches.getDoc('default')
    if (!search) {
        throw new Error('twitter search settings not found')
    }

    //

    const fetchedTweets = await twimo.searchTweets({
        q: search.query + ' exclude:retweets',
        sinceId: search.prevTweetId ? plusOne(search.prevTweetId) : undefined,
    })

    const _10minAgo = now.subtract(10, 'minute')

    const timeFilteredTweets = fetchedTweets.filter(t =>
        dayjs(t.created_at).isBefore(_10minAgo),
    )

    const pickedTweets = timeFilteredTweets
        .filter(t => !isMuted(t))
        .filter(tweetClassifier)

    const results = await retweetWithLoggingAndNotification(
        twimo,
        pickedTweets.map(t => t.id_str),
    )

    if (timeFilteredTweets.length) {
        await dbAdmin.twitterSearches.update(search._ref, {
            prevTweetId: timeFilteredTweets[0].id_str,
        })
    }

    return results
}

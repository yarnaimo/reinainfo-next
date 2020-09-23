import { prray } from 'prray'
import { _retweetScheduleTweetsOfPrevNight } from '../../api/retweet-schedule-tweets-of-prev-night'
import { dbInstanceAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { nowMorning } from '../__fixtures__/date'

let twimo: TwimoClient

beforeEach(async () => {
  twimo = await getTwimoClient()
})

test('retweetScheduleTweetsOfPrevNight', async () => {
  await prray([
    {
      _createdAt: new Date('2018-08-01T22:00'),
      // type: 'upcomingSchedule' as const,
      // tweetId: '0',
    },
    // {
    //     _createdAt: new Date('2018-08-02T22:00'),
    //     type: 'retweet' as const,
    //     tweetId: '2',
    // },
    {
      _createdAt: new Date('2018-08-02T22:00'),
      // type: 'upcomingSchedule' as const,
      // tweetId: '4',
    },
  ]).mapAsync((log, i) =>
    dbInstanceAdmin.collection('scheduleTweetLogs').doc(String(i)).set(log),
  )

  // start

  const result = await _retweetScheduleTweetsOfPrevNight(twimo, nowMorning)

  // end

  expect(result).toHaveLength(1)
  expect(result).toMatchObject([{ retweeted_status: { id_str: '1' } }])
})

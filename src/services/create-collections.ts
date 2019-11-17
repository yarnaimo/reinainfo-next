import { Blue } from 'bluespark'
import { AppEnv } from '../models/AppEnv'
import { GScheduleActive, Schedule } from '../models/Schedule'
import { TweetLog } from '../models/TweetLog'
import { TwitterSearch } from '../models/TwitterSearch'
import { Webhook } from '../models/Webhook'

export const createCollections = <F extends Blue.Firestore>(instance: F) => {
    return {
        appEnvs: AppEnv(instance),
        webhooks: Webhook(instance),
        twitterSearches: TwitterSearch(instance),

        tweetLogs: TweetLog(instance),

        schedules: Schedule(instance),
        _schedulesIn: Schedule,
        gSchedulesActive: GScheduleActive(instance),
    }
}

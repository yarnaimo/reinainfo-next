import { Blue } from 'bluespark'
import { AppEnv } from '../models/AppEnv'
import { Calendar } from '../models/Calendar'
import { GScheduleActive, Schedule } from '../models/Schedule'
import { ScheduleTweetLog } from '../models/ScheduleTweetLog'
import { Serial } from '../models/Serial'
import { GTicket, Ticket } from '../models/Ticket'
import { Topic } from '../models/Topic'
import { TwitterCollection } from '../models/TwitterCollection'
import { TwitterSearch } from '../models/TwitterSearch'
import { Webhook } from '../models/Webhook'

export const createCollections = <F extends Blue.Firestore>(instance: F) => {
  return {
    appEnvs: AppEnv(instance),
    webhooks: Webhook(instance),
    calendars: Calendar(instance),
    twitterSearches: TwitterSearch(instance),
    twitterCollections: TwitterCollection(instance),

    scheduleTweetLogs: ScheduleTweetLog(instance),
    topics: Topic(instance),

    schedules: Schedule(instance),
    _schedulesIn: Schedule,
    gSchedulesActive: GScheduleActive(instance),
    serials: Serial(instance),

    _ticketsIn: Ticket,
    gTickets: GTicket(instance),
  }
}

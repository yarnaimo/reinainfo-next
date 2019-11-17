import is from '@sindresorhus/is/dist'
import { Rstring } from '@yarnaimo/rain'
import { Blue, BlueObject, Spark, SparkQuery } from 'bluespark'
import dayjs, { Dayjs } from 'dayjs'
import { Merge } from 'type-fest'
import { hsl } from '../utils/color'
import { stringifyTime, stringifyWDate } from '../utils/date'
import { serializeTimestamp } from '../utils/firebase'

const colorSet = {
    pink: {
        color: [hsl(8, 71, 75), hsl(8, 75, 73)],
        // color: [hsl(11, 72, 79), hsl(9, 77, 77)],
        textColor: null,
    },
    orange: {
        color: [hsl(40, 85, 65), hsl(38, 89, 62)],
        textColor: null,
    },
    red: {
        color: [hsl(0, 57, 64), hsl(0, 51, 60)],
        // color: [hsl(9, 79, 71), hsl(4, 88, 67)],
        textColor: null,
    },
    aqua: {
        color: [hsl(169, 46, 70), hsl(167, 42, 66)],
        // color: [hsl(204, 43, 60), hsl(206, 35, 56)],
        // color: [hsl(170, 53, 71), hsl(161, 57, 62)],
        textColor: null,
    },
    purple: {
        color: [hsl(354, 33, 75), hsl(352, 34, 72)],
        textColor: null,
    },
    brown: {
        color: [hsl(39, 31, 64), hsl(37, 28, 62)],
        // color: [hsl(40, 36, 69), hsl(35, 44, 62)],
        textColor: null,
    },
    darkBrown: {
        color: [hsl(29, 32, 65), hsl(29, 34, 62)],
        // color: [hsl(40, 36, 69), hsl(35, 44, 62)],
        textColor: null,
    },

    releaseBrown: {
        color: [hsl(39, 33, 93), hsl(36, 31, 89)],
        textColor: hsl(31, 21, 58),
    },
    releaseBlue: {
        color: [hsl(191, 20, 93), hsl(185, 18, 90)],
        textColor: hsl(205, 23, 57),
    },
}

export const categories = {
    live: {
        emoji: '🎫',
        name: 'ライブ',
        micon: 'ticket',
        ...colorSet.orange,
    },
    event: {
        emoji: '🎤',
        name: 'イベント',
        micon: 'microphone-variant',
        ...colorSet.darkBrown,
    },
    streaming: {
        emoji: '🔴',
        name: 'リアルタイム配信',
        micon: 'record',
        ...colorSet.red,
    },
    tv: {
        emoji: '📺',
        name: 'テレビ',
        micon: 'television-classic',
        ...colorSet.aqua,
    },
    radio: {
        emoji: '📻',
        name: 'ラジオ',
        micon: 'radio',
        ...colorSet.purple,
    },
    up: {
        emoji: '🆙',
        name: 'Web配信',
        micon: 'update',
        ...colorSet.brown,
    },

    music: {
        emoji: '🎶',
        name: 'リリース | 音楽',
        micon: 'library-music',
        ...colorSet.releaseBrown,
    },
    video: {
        emoji: '📼',
        name: 'リリース | BD/DVD',
        micon: 'video',
        ...colorSet.releaseBrown,
    },
    game: {
        emoji: '🎮',
        name: 'リリース | ゲーム',
        micon: 'gamepad-variant',
        ...colorSet.releaseBlue,
    },
    book: {
        emoji: '📗',
        name: 'リリース | 書籍/雑誌',
        micon: 'book-open-variant',
        ...colorSet.releaseBlue,
    },
    otherReleases: {
        emoji: '⚪',
        name: 'リリース | その他',
        micon: 'cat',
        ...colorSet.releaseBlue,
    },
}

export type CategoryKey = keyof typeof categories

export interface IPart extends BlueObject {
    name: string | null
    gatherBy: string | null
    opensAt: string | null
    startsAt: string
}

export type ISchedule = Blue.Interface<{
    active: boolean
    isSerial: boolean
    category: CategoryKey
    title: string
    url: string
    date: Blue.IO<Blue.Timestamp, Date>
    hasTime: boolean
    parts: IPart[]
    venue: string | null
    way: string | null
}>

export type IScheduleSerialized = Merge<
    ISchedule['_D'],
    Record<'_createdAt' | '_updatedAt' | 'date', string> & {
        formattedDate: ReturnType<typeof MSchedule['formatDate']>
    }
>

export type IScheduleWithDayjs = Merge<IScheduleSerialized, { dayjs: Dayjs }>

export const Schedule = Spark<ISchedule>()(false, parent =>
    parent.collection('schedules'),
)
export const GScheduleActive = SparkQuery<ISchedule>()(true, db =>
    db
        .collectionGroup('schedules')
        .where('active', '==', true)
        .orderBy('date'),
)

export const whereDateBetween = (since: Dayjs, until: Dayjs) => {
    return (q: Blue.Query) =>
        q
            .where('date', '>=', since.toDate())
            .where('date', '<', until.toDate())
            .orderBy('date', 'asc')
}

export const MSchedule = (() => {
    const isSame = (a?: IScheduleSerialized, b?: IScheduleSerialized) =>
        a?._id === b?._id && a?._updatedAt === b?._updatedAt

    const serialize = (schedule: ISchedule['_D']): IScheduleSerialized => {
        delete schedule._ref

        const date = serializeTimestamp(schedule.date)
        return {
            ...schedule,
            _createdAt: serializeTimestamp(schedule._createdAt),
            _updatedAt: serializeTimestamp(schedule._updatedAt),
            date,
            formattedDate: formatDate(schedule),
        }
    }

    const getCategory = (key: CategoryKey) => categories[key]

    const stringifyParts = (parts: IPart[]) => {
        const withSuffix = (time: string | null, suffix: string) => {
            return time ? time + suffix : null
        }

        const array = parts.map((p, i) => {
            const timesStr = Rstring.joinOnlyStrings(' ')([
                withSuffix(p.gatherBy, '集合'),
                withSuffix(p.opensAt, '開場'),
                withSuffix(p.startsAt, '開始'),
            ])!
            return { name: p.name || String(i + 1), timesOfPart: timesStr }
        })

        return {
            array,
            string: array
                .map(({ name, timesOfPart }) =>
                    1 < array.length ? `[${name}] ${timesOfPart}` : timesOfPart,
                )
                .join('\n'),
        }
    }

    const stringifyTimeFromParts = (parts: IPart[]) => {
        return parts
            .map(p => (p.name ? `${p.name} ${p.startsAt}` : p.startsAt))
            .join(' / ')
    }

    const formatDate = (s: ISchedule['_D'] | IScheduleSerialized) => {
        const date = dayjs(is.string(s.date) ? s.date : s.date.toDate())
        const wdateString = stringifyWDate(date)

        if (s.hasTime) {
            return s.parts.length
                ? {
                      //   type: 'withParts' as const,
                      wdateString,
                      timeString: stringifyTimeFromParts(s.parts),
                      partsString: stringifyParts(s.parts).string,
                  }
                : {
                      //   type: 'withTime' as const,
                      wdateString,
                      timeString: stringifyTime(date),
                  }
        } else {
            return {
                // type: null,
                wdateString,
            }
        }
    }

    const buildTweetText = (
        s: ISchedule['_D'],
        header: string,
        withDate: boolean,
    ) => {
        const formattedDate = formatDate(s)

        return Rstring.joinOnlyStrings()([
            header,
            '',

            Rstring.joinOnlyStrings(' ')([
                withDate && formattedDate.wdateString,
                !formattedDate.partsString && formattedDate.timeString,
            ]),
            Rstring.joinOnlyStrings(' ')([
                getCategory(s.category).emoji,
                s.title,
                s.venue && `@ ${s.venue}`,
            ]),
            formattedDate.partsString,
            '',

            // s.way && `参加方法 » ${s.way}`,
            s.url,
        ])!
    }

    return { isSame, getCategory, serialize, formatDate, buildTweetText }
})()

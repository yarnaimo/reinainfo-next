import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ja'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
dayjs.locale('ja')

export { dayjs }

// export const formatDate = (date: Dayjs) =>
//     date.format(date.isSame(dayjs(), 'day') ? 'H:mm' : 'D日 H:mm')

export const formDatePattern =
    '^(?:\\d{2}|\\d{4}|\\d{8})(?:\\.(?:\\d{2}|\\d{4}))?$'

export const toFormDate = (date: Dayjs | Date) =>
    dayjs(date).format('YYYYMMDD.HHmm')

export const toTableDate = (date: Dayjs | Date) =>
    dayjs(date).format('YYYY-MM-DD HH:mm')

export const stringifyWDate = (date: Dayjs, omitSpace = false) => {
    const now = dayjs()

    const template = date.isSame(now, 'month')
        ? 'D'
        : date.isSame(now, 'year')
        ? 'M/D'
        : 'YYYY/M/D'

    const dateString = date.format(template)
    const w = date.format('ddd').slice(0, 1)

    return `${dateString}${omitSpace ? '' : ' '}(${w})`
}

export const stringifyTime = (date: Dayjs) => date.format('H:mm')

export const stringifyWDateTime = (date: Dayjs, omitSpace = false) =>
    `${stringifyWDate(date, omitSpace)} ${stringifyTime(date)}`

export const parseFormDate = (str: string) => {
    const [date, time] = [...str.split('.'), '']

    if (![2, 4, 8].includes(date.length) || ![0, 2, 4].includes(time.length)) {
        return null
    }

    const paddedTime = time.padEnd(4, '0')
    const strToParse = `${date}.${paddedTime}`

    const formats = ['YYYYMMDD.HHmm', 'MMDD.HHmm', 'DD.HHmm']

    for (const f of formats) {
        const parsed = dayjs(strToParse, f)

        if (parsed.isValid()) {
            return parsed.toDate()
        }
    }
    return null
}

type WNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const createSerialDates = ({
    dayOfWeek,
    timeOfDay: [hour, minute] = [0, 0],
    weekNumbers,
    weekInterval = 1,
    count = 25,
    since = dayjs(),
    until = dayjs().add(6, 'month'),
}: {
    dayOfWeek: WNumber
    timeOfDay?: [number, number]
    weekNumbers?: number[]
    weekInterval?: number
    count?: number
    since?: Dayjs
    until?: Dayjs
}) => {
    if (!dayOfWeek) throw new Error('Invalid parameters')

    const mightAddOneWeek = (date: Dayjs) =>
        date.isBefore(since) ? date.add(1, 'week') : date

    const currentDate = mightAddOneWeek(
        since
            .set('day', dayOfWeek)
            .set('hour', hour)
            .set('minute', minute),
    )

    const { dates } = [...Array(count).keys()].reduce(
        ({ dates, currentDate }) => {
            if (currentDate.isAfter(until)) {
                return { dates, currentDate }
            }

            const nthWeek = Math.ceil(dayjs(currentDate).date() / 7)
            return {
                dates:
                    weekNumbers && !weekNumbers.includes(nthWeek)
                        ? dates
                        : [...dates, currentDate],
                currentDate: currentDate.add(weekInterval, 'week'),
            }
        },
        { dates: [] as Dayjs[], currentDate },
    )
    return dates.map(d => d.toDate())
}

import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ja'
dayjs.locale('ja')

// export const formatDate = (date: Dayjs) =>
//     date.format(date.isSame(dayjs(), 'day') ? 'H:mm' : 'D日 H:mm')

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

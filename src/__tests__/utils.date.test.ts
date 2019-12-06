import { createSerialDates, dayjs, parseFormDate } from '../utils/date'

test('parse date', () => {
    expect(parseFormDate('20180801')).toEqual(new Date('2018-08-01T00:00'))
})

test('parse date with time', () => {
    expect(parseFormDate('0801.0117')).toEqual(
        new Date(`${dayjs().year()}-08-01T01:17`),
    )
})

test('create cyclic dates with weekNumber', () => {
    expect(
        createSerialDates({
            dayOfWeek: 5,
            timeOfDay: [6, 5],
            weekNumbers: [2, 4],
            since: dayjs('2018-08-04T00:00'), // saturday
            until: dayjs('2018-08-24T06:05'),
        }),
    ).toEqual([dayjs('2018-08-10T06:05'), dayjs('2018-08-24T06:05')])
})

test('create cyclic dates with weekInterval', () => {
    expect(
        createSerialDates({
            dayOfWeek: 1,
            timeOfDay: [0, 0],
            weekInterval: 2,
            since: dayjs('2018-08-11T00:00'),
            count: 2,
        }),
    ).toEqual([dayjs('2018-08-13T00:00'), dayjs('2018-08-27T00:00')])
})

// test('duration string to minutes', () => {
//     expect(durationStringToMinutes('2d.1w.3h.4m')).toBe(
//         2 * 24 * 60 + 1 * 7 * 24 * 60 + 3 * 60 + 4,
//     )
// })

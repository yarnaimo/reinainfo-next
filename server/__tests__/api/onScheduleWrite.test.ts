import { firestore } from '@firebase/testing'
import { _onScheduleWrite } from '../../api/onScheduleWrite'
import { dbAdmin } from '../../services/firebase-admin'
import { getTwimoClient, TwimoClient } from '../../services/twitter'
import { expectObjectArrayContaining } from '../utils'
import { now } from '../__fixtures__/date'
import {
    addSchedules,
    pageUrlBase,
    scheduleUrl,
} from '../__fixtures__/schedules'

let twimo: TwimoClient

beforeEach(async () => {
    twimo = await getTwimoClient()

    await addSchedules()
})

const timestamp1 = firestore.Timestamp.fromDate(now.toDate())
const timestamp2 = firestore.Timestamp.fromDate(now.add(1, 'week').toDate())

const createSnap = (data: any) =>
    ({
        id: 'live2',
        exists: !!data,
        data: () => data,
        ref: { path: '' },
    } as any)

test('thumbUrl updated but _updatedAt not updated', async () => {
    const result = await _onScheduleWrite(
        twimo,
        createSnap({ _updatedAt: timestamp1, thumbUrl: 'a' }),
        createSnap({ _updatedAt: timestamp1, thumbUrl: 'b' }),
        true,
    )

    expect(result.type).toBeNull()
})

test('deleted', async () => {
    const result = await _onScheduleWrite(
        twimo,
        createSnap({ _updatedAt: timestamp1, thumbUrl: 'a' }),
        createSnap(undefined),
        true,
    )

    expect(result.type).toBeNull()
})

test('updated', async () => {
    const snap = await dbAdmin.schedules.collectionRef.doc('live2').get()

    const result = await _onScheduleWrite(
        twimo,
        createSnap({ _updatedAt: timestamp1, thumbUrl: 'a', ...snap.data() }),
        createSnap({ _updatedAt: timestamp2, thumbUrl: 'a', ...snap.data() }),
        true,
    )

    expect(result.type).toBe('updated')
})

test('created', async () => {
    const snap = await dbAdmin.schedules.collectionRef.doc('live2').get()

    const result = await _onScheduleWrite(
        twimo,
        createSnap(undefined),
        createSnap({ _updatedAt: timestamp1, thumbUrl: 'a', ...snap.data() }),
        true,
    )

    const expectedText = `🎉 スケジュールが追加されました

1/20 (日)
🎫 live2

${scheduleUrl}
${pageUrlBase}/live2`

    expectObjectArrayContaining((result as any).tweetResults, 1, [
        { full_text: expectedText },
    ])
})

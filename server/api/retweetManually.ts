import { https } from 'firebase-functions'
import { createCallable, dbInstanceAdmin } from '../services/firebase-admin'
import { retweetWithLoggingAndNotification } from '../services/integrated'
import { getTwimoClient } from '../services/twitter'

export const _retweetManually = createCallable<
    'retweetManually',
    { ids: string[] },
    {}
>(async (data, ctx) => {
    if (!ctx.auth) {
        throw new https.HttpsError('unauthenticated', '')
    }

    const isAdmin = await dbInstanceAdmin
        .collection('admins')
        .doc(ctx.auth.uid)
        .get()
        .then(snap => snap.exists)

    if (!isAdmin) {
        throw new https.HttpsError('permission-denied', '')
    }

    const twimo = await getTwimoClient()
    const results = await retweetWithLoggingAndNotification(twimo, data.ids)

    return results
})

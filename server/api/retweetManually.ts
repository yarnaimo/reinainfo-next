import { createCallable } from '../services/firebase-admin'
import { retweetWithLoggingAndNotification } from '../services/integrated'
import { getTwimoClient } from '../services/twitter'

export const _retweetManually = createCallable<
    'retweetManually',
    { ids: string[] },
    {}
>(async data => {
    const twimo = await getTwimoClient()
    const results = await retweetWithLoggingAndNotification(twimo, data.ids)

    return results
})

import { Firestore } from '@google-cloud/firestore'
import { FirestoreTest } from '@yarnaimo/firebase-testing'

const provider = new FirestoreTest('salmon-test')

export const getProvider = () => {
    beforeEach(async () => {
        provider.next()
    })

    afterEach(async () => {
        await provider.cleanup()
    })

    return {
        provider,
        getDB: () => provider.getFirestoreWithAuth(),
        getAdminDB: () => (provider.getFirestoreWithAuth() as any) as Firestore,
    }
}

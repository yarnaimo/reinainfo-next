import { FirestoreTest } from '@yarnaimo/firebase-testing'
import { createCollections } from '../../../src/services/create-collections'

const provider = new FirestoreTest('sodafloat-test')

export let dbInstanceAdmin: FirebaseFirestore.Firestore

export let dbAdmin: ReturnType<typeof createCollections>

beforeEach(() => {
    provider.next()
    dbInstanceAdmin = provider.getFirestoreWithAuth() as any
    dbAdmin = createCollections(dbInstanceAdmin) as any
})

afterEach(async () => {
    await provider.cleanup()
})

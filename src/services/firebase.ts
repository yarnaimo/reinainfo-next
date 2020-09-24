import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import { JsonObject } from 'type-fest'
import { firebaseConfig } from '../.config/firebase-web'
import { env } from '../env'
import { createCollections } from './create-collections'

export { firestore }

export const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(firebaseConfig)

export const dbInstance = app.firestore()

export const db = createCollections(dbInstance)

export const functions = app.functions('asia-northeast1')

if (env.isDev) {
  functions.useFunctionsEmulator(`http://localhost:5000`)
}

export const callable = async <
  T extends {
    name: string
    req: JsonObject
    res: JsonObject
  }
>(
  name: T['name'],
  request: T['req'],
) => {
  const result = await functions
    .httpsCallable(name)(request)
    .catch((error) => console.error(error))

  return result && (result.data as T['res'])
}

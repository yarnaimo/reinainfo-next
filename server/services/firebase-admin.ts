import * as admin from 'firebase-admin'
import { JsonObject } from 'type-fest'
import { createCollections } from '../../src/services/create-collections'

const serviceAccountPath = `../.config/firebase-admin.json`

let serviceAccount: any

try {
    serviceAccount = require(serviceAccountPath)
} catch (error) {}

export const appAdmin = admin.apps.length
    ? admin.app()
    : serviceAccount
    ? admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `gs://${serviceAccount.project_id}.appspot.com`,
      })
    : admin.initializeApp()

export const dbInstanceAdmin = appAdmin.firestore()

export const dbAdmin = createCollections(dbInstanceAdmin)

export const getEnv = async () => {
    const env = await dbAdmin.appEnvs.getDoc({ doc: 'default' })
    if (!env) {
        throw new Error('env not found')
    }
    return env
}

export const storageAdmin = appAdmin.storage()
export const bucketAdmin = storageAdmin.bucket()

export const createCallable = <
    N extends string,
    Request extends JsonObject,
    Response extends JsonObject
>(
    handler: (request: Request) => Promise<Response>,
) => {
    return handler as typeof handler & {
        name: N
        req: Request
        res: Response
    }
}

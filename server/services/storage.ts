import { bucketAdmin } from './firebase-admin'

export const savePNGImage = async (path: string, buffer: Buffer) => {
  const file = bucketAdmin.file(path)
  await file.save(buffer, { contentType: 'image/png' })
  await file.makePublic()
  const url = `https://storage.googleapis.com/${bucketAdmin.name}/${file.name}`
  return url
}

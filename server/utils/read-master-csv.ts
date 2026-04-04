/**
 * Reads the master solution CSV.
 *
 * - Development (no R2_ACCOUNT_ID): reads from `server/assets/solutions/` via Nitro's
 *   storage API. The `key` is the bare filename, e.g. `task1_example_master.csv`.
 *
 * - Production (R2_ACCOUNT_ID set): fetches from the private R2 bucket. The `key` is
 *   the full R2 object key, e.g. `ss2026/1-neuronale-netzwerke/master.csv`.
 */
export async function readMasterCsv(key: string): Promise<string> {
  if (process.env.R2_ACCOUNT_ID) {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      },
      forcePathStyle: true
    })
    const response = await s3.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key
    }))
    return await response.Body!.transformToString('utf-8')
  }

  const storage = useStorage('assets:server')
  const content = await storage.getItem(`solutions/${key}`)
  if (content === null || content === undefined) {
    throw new Error(`Master CSV not found: solutions/${key}`)
  }
  return typeof content === 'string' ? content : JSON.stringify(content)
}

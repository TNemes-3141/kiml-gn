/**
 * Debug endpoint – REMOVE BEFORE GOING LIVE WITH REAL STUDENT DATA.
 * GET /api/debug/r2
 * Returns R2 config diagnostics and attempts a HeadBucket call.
 */
export default defineEventHandler(async () => {
  const accountId = process.env.R2_ACCOUNT_ID
  const bucketName = process.env.R2_BUCKET_NAME
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretKey = process.env.R2_SECRET_ACCESS_KEY

  const config = {
    R2_ACCOUNT_ID: accountId ?? '(not set)',
    R2_BUCKET_NAME: bucketName ?? '(not set)',
    R2_ACCESS_KEY_ID: accessKeyId ? `${accessKeyId.slice(0, 6)}…` : '(not set)',
    R2_SECRET_ACCESS_KEY: secretKey ? `${secretKey.slice(0, 4)}… (${secretKey.length} chars)` : '(not set)',
    endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '(no account ID)',
    forcePathStyle: true
  }

  if (!accountId || !bucketName || !accessKeyId || !secretKey) {
    return { ok: false, config, error: 'One or more env vars are missing.' }
  }

  try {
    const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey: secretKey },
      forcePathStyle: true
    })

    await s3.send(new HeadBucketCommand({ Bucket: bucketName }))
    return { ok: true, config, bucket: 'reachable' }
  }
  catch (err: unknown) {
    const e = err as { name?: string, message?: string, $metadata?: { httpStatusCode?: number } }
    return {
      ok: false,
      config,
      error: e.message ?? String(err),
      errorName: e.name,
      httpStatus: e.$metadata?.httpStatusCode
    }
  }
})

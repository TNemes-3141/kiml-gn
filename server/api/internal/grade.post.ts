import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ submissionId: string, taskId: string }>(event)
  if (!body?.submissionId || !body?.taskId) {
    throw createError({ statusCode: 400, message: 'Missing submissionId or taskId' })
  }

  const db = useDB()

  // Fetch submission and task in parallel
  const [submissionResult, taskResult] = await Promise.all([
    db.execute({
      sql: 'SELECT student_csv_file_key FROM submissions WHERE id = ?',
      args: [body.submissionId]
    }),
    db.execute({
      sql: 'SELECT master_solution_csv_key, grading_endpoint FROM tasks WHERE id = ?',
      args: [body.taskId]
    })
  ])

  const submission = submissionResult.rows[0]
  const task = taskResult.rows[0]

  if (!submission || !task) {
    throw createError({ statusCode: 404, message: 'Submission or task not found' })
  }

  const gradingEndpoint = task.grading_endpoint as string | null
  if (!gradingEndpoint) {
    // No grading configured for this task — leave score as NULL
    return { ok: true, skipped: true }
  }

  const masterCsvKey = task.master_solution_csv_key as string
  const studentCsvKey = submission.student_csv_file_key as string

  let masterCsv: string
  let studentCsv: string

  try {
    // Read master CSV from Nitro server assets (bundled at build time, never public)
    masterCsv = await readMasterCsv(masterCsvKey)
  }
  catch (err) {
    await db.execute({
      sql: 'UPDATE submissions SET grading_error = ? WHERE id = ?',
      args: [`Failed to read master CSV: ${String(err)}`, body.submissionId]
    })
    return { ok: false }
  }

  try {
    // Read student CSV from R2 (production) or local disk (development)
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
        Key: studentCsvKey
      }))
      studentCsv = await response.Body!.transformToString('utf-8')
    }
    else {
      studentCsv = readFileSync(join(process.cwd(), '.data', 'uploads', studentCsvKey), 'utf-8')
    }
  }
  catch (err) {
    await db.execute({
      sql: 'UPDATE submissions SET grading_error = ? WHERE id = ?',
      args: [`Failed to read student CSV: ${String(err)}`, body.submissionId]
    })
    return { ok: false }
  }

  try {
    const result = await $fetch<{ score: number }>(gradingEndpoint, {
      method: 'POST',
      body: { submissionId: body.submissionId, masterCsv, studentCsv },
      headers: { 'x-internal-token': process.env.GRADING_INTERNAL_TOKEN! }
    })

    await db.execute({
      sql: 'UPDATE submissions SET score = ?, grading_error = NULL WHERE id = ?',
      args: [result.score, body.submissionId]
    })

    return { ok: true, score: result.score }
  }
  catch (err) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? String(err)
    await db.execute({
      sql: 'UPDATE submissions SET grading_error = ? WHERE id = ?',
      args: [message, body.submissionId]
    })
    return { ok: false }
  }
})

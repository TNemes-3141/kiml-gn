import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing task slug' })
  }

  const db = useDB()

  // Resolve authenticated student
  const rawCookie = getCookie(event, 'auth:user')
  if (!rawCookie) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  let email: string | null = null
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie))
    email = parsed?.email ?? null
  }
  catch {
    throw createError({ statusCode: 401, message: 'Invalid auth cookie' })
  }

  if (!email) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const studentResult = await db.execute({
    sql: 'SELECT id, public_alias FROM students WHERE email = ?',
    args: [email]
  })
  const student = studentResult.rows[0]
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found' })
  }
  const studentId = student.id as string

  // Resolve task
  const taskResult = await db.execute({
    sql: 'SELECT id, serial_num, semester_id, max_daily_submissions, max_overall_submissions, submission_deadline FROM tasks WHERE slug = ?',
    args: [slug]
  })
  const task = taskResult.rows[0]
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }
  const taskId = task.id as string
  const semesterId = task.semester_id as string
  const taskSerialNum = Number(task.serial_num)

  // Check deadline
  const deadline = new Date(task.submission_deadline as string)
  if (new Date() > deadline) {
    throw createError({ statusCode: 400, message: 'Submission deadline has passed' })
  }

  // Check daily limit
  const dailyResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ? AND date(submitted_at) = date(\'now\')',
    args: [studentId, taskId]
  })
  if (Number(dailyResult.rows[0]?.count) >= Number(task.max_daily_submissions)) {
    throw createError({ statusCode: 429, message: 'Daily submission limit reached' })
  }

  // Check overall limit
  const totalResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ?',
    args: [studentId, taskId]
  })
  const totalCount = Number(totalResult.rows[0]?.count)
  if (totalCount >= Number(task.max_overall_submissions)) {
    throw createError({ statusCode: 429, message: 'Overall submission limit reached' })
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Missing form data' })
  }

  let solutionFile: { filename: string, data: Buffer } | null = null
  let sourceCodeFile: { filename: string, data: Buffer } | null = null
  let publicAlias: string | null = null

  for (const field of formData) {
    if (field.name === 'solutionFile' && field.filename) {
      solutionFile = { filename: field.filename, data: field.data }
    }
    else if (field.name === 'sourceCodeFile' && field.filename) {
      sourceCodeFile = { filename: field.filename, data: field.data }
    }
    else if (field.name === 'publicAlias') {
      publicAlias = field.data.toString('utf-8').trim() || null
    }
  }

  if (!solutionFile || !sourceCodeFile) {
    throw createError({ statusCode: 400, message: 'Both solution file and source code file are required' })
  }

  // Handle public alias
  if (publicAlias && !student.public_alias) {
    // Check uniqueness
    const aliasCheck = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM students WHERE public_alias = ?',
      args: [publicAlias]
    })
    if (Number(aliasCheck.rows[0]?.count) > 0) {
      throw createError({ statusCode: 409, message: 'This alias is already taken. Please choose a different one.' })
    }

    await db.execute({
      sql: 'UPDATE students SET public_alias = ? WHERE id = ?',
      args: [publicAlias, studentId]
    })
  }

  const submissionId = randomUUID()
  const serialNum = totalCount + 1

  // Build file keys: [semester_id]/[serial_num]-[slug]/[student_id]/v[n].ext
  const taskDir = `${semesterId}/${taskSerialNum}-${slug}/${studentId}`
  const sourceExt = sourceCodeFile.filename.toLowerCase().endsWith('.ipynb') ? '.ipynb' : '.py'
  const csvKey = `${taskDir}/v${serialNum}.csv`
  const sourceKey = `${taskDir}/v${serialNum}${sourceExt}`

  if (process.env.R2_ACCOUNT_ID) {
    // Production: upload to Cloudflare R2 via S3-compatible API.
    // Dynamically imported so the S3 SDK is never bundled in the dev server.
    const s3sdk = await import('@aws-sdk/client-s3')
    const s3 = new s3sdk.S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      }
    })
    const bucket = process.env.R2_BUCKET_NAME!

    await Promise.all([
      s3.send(new s3sdk.PutObjectCommand({ Bucket: bucket, Key: csvKey, Body: solutionFile.data, ContentType: 'text/csv' })),
      s3.send(new s3sdk.PutObjectCommand({ Bucket: bucket, Key: sourceKey, Body: sourceCodeFile.data, ContentType: 'application/octet-stream' }))
    ])
  }
  else {
    // Development: save locally, mirroring the same directory structure
    const uploadsDir = join(process.cwd(), '.data', 'uploads', taskDir)
    mkdirSync(uploadsDir, { recursive: true })
    writeFileSync(join(process.cwd(), '.data', 'uploads', csvKey), solutionFile.data)
    writeFileSync(join(process.cwd(), '.data', 'uploads', sourceKey), sourceCodeFile.data)
  }

  // Demo: random score between 0.0 and 1.0
  const score = Math.round(Math.random() * 1000) / 1000

  await db.execute({
    sql: `INSERT INTO submissions (id, student_id, task_id, submission_serial_num, score, source_code_file_key, student_csv_file_key)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [submissionId, studentId, taskId, serialNum, score, sourceKey, csvKey]
  })

  return {
    id: submissionId,
    serialNum,
    score
  }
})

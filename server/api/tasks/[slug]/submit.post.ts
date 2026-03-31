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
    sql: 'SELECT id, max_daily_submissions, max_overall_submissions, submission_deadline FROM tasks WHERE slug = ?',
    args: [slug]
  })
  const task = taskResult.rows[0]
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }
  const taskId = task.id as string

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

  // Store files
  const r2BucketUrl = process.env.R2_BUCKET_URL
  let csvKey: string
  let sourceKey: string

  if (r2BucketUrl) {
    // Production: upload to Cloudflare R2
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    // R2 upload implementation would go here
    csvKey = `${slug}/${studentId}_v${serialNum}_solution.csv`
    sourceKey = `${slug}/${studentId}_v${serialNum}_${sourceCodeFile.filename}`
  }
  else {
    // Development: save locally
    const uploadsDir = join(process.cwd(), '.data', 'uploads', slug, studentId)
    mkdirSync(uploadsDir, { recursive: true })

    csvKey = `${slug}/${studentId}_v${serialNum}_solution.csv`
    sourceKey = `${slug}/${studentId}_v${serialNum}_${sourceCodeFile.filename}`

    writeFileSync(join(uploadsDir, `v${serialNum}_solution.csv`), solutionFile.data)
    writeFileSync(join(uploadsDir, `v${serialNum}_${sourceCodeFile.filename}`), sourceCodeFile.data)
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

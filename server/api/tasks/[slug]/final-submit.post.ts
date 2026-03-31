export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing task slug' })
  }

  const db = useDB()

  // Resolve task
  const taskResult = await db.execute({
    sql: 'SELECT id, baseline_score FROM tasks WHERE slug = ?',
    args: [slug]
  })
  const task = taskResult.rows[0]
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }
  const taskId = task.id as string
  const baselineScore = Number(task.baseline_score)

  // Resolve student
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
    sql: 'SELECT id FROM students WHERE email = ?',
    args: [email]
  })
  const student = studentResult.rows[0]
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found' })
  }
  const studentId = student.id as string

  // Parse body
  const body = await readBody<{ submissionId: string }>(event)
  if (!body?.submissionId) {
    throw createError({ statusCode: 400, message: 'Missing submission ID' })
  }

  // Verify submission belongs to this student and task, and passes baseline
  const subResult = await db.execute({
    sql: 'SELECT id, score FROM submissions WHERE id = ? AND student_id = ? AND task_id = ?',
    args: [body.submissionId, studentId, taskId]
  })
  const submission = subResult.rows[0]
  if (!submission) {
    throw createError({ statusCode: 404, message: 'Submission not found' })
  }

  const score = Number(submission.score)
  if (score < baselineScore) {
    throw createError({ statusCode: 400, message: 'Selected submission does not pass the baseline score.' })
  }

  // Check not already submitted
  const stateResult = await db.execute({
    sql: 'SELECT selected_final_submission_id FROM student_task_states WHERE student_id = ? AND task_id = ?',
    args: [studentId, taskId]
  })
  if (stateResult.rows[0]?.selected_final_submission_id) {
    throw createError({ statusCode: 409, message: 'You have already submitted your final solution.' })
  }

  // Update the task state
  await db.execute({
    sql: 'UPDATE student_task_states SET selected_final_submission_id = ?, status = ? WHERE student_id = ? AND task_id = ?',
    args: [body.submissionId, 'COMPLETED', studentId, taskId]
  })

  return { success: true }
})

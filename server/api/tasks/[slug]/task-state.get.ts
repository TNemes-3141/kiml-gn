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

  // Resolve student
  let studentId: string | null = null
  const rawCookie = getCookie(event, 'auth:user')
  if (rawCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawCookie))
      if (parsed?.email) {
        const studentResult = await db.execute({
          sql: 'SELECT id FROM students WHERE email = ?',
          args: [parsed.email]
        })
        studentId = (studentResult.rows[0]?.id as string) ?? null
      }
    }
    catch {}
  }

  if (!studentId) {
    return { selectedSubmissionId: null, status: 'NOT_COMPLETED' }
  }

  const stateResult = await db.execute({
    sql: 'SELECT status, selected_final_submission_id FROM student_task_states WHERE student_id = ? AND task_id = ?',
    args: [studentId, taskId]
  })

  const state = stateResult.rows[0]
  return {
    selectedSubmissionId: (state?.selected_final_submission_id as string) ?? null,
    status: (state?.status as string) ?? 'NOT_COMPLETED'
  }
})

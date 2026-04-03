export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing task slug' })
  }

  const db = useDB()

  // Resolve task ID from slug
  const taskResult = await db.execute({
    sql: 'SELECT id FROM tasks WHERE slug = ?',
    args: [slug]
  })
  const task = taskResult.rows[0]
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }
  const taskId = task.id as string

  // Resolve student from auth cookie
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
    return { dailyCount: 0, totalCount: 0 }
  }

  // Count today's submissions
  const dailyResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ? AND date(submitted_at) = date(\'now\')',
    args: [studentId, taskId]
  })

  // Count total submissions
  const totalResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ?',
    args: [studentId, taskId]
  })

  return {
    dailyCount: Number(dailyResult.rows[0]?.count ?? 0),
    totalCount: Number(totalResult.rows[0]?.count ?? 0)
  }
})

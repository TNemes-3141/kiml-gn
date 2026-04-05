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

  // Resolve student
  const student = await resolveStudent(event)

  if (!student) {
    return { dailyCount: 0, totalCount: 0 }
  }

  // Count today's submissions
  const dailyResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ? AND date(submitted_at) = date(\'now\')',
    args: [student.id, taskId]
  })

  // Count total submissions
  const totalResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND task_id = ?',
    args: [student.id, taskId]
  })

  return {
    dailyCount: Number(dailyResult.rows[0]?.count ?? 0),
    totalCount: Number(totalResult.rows[0]?.count ?? 0)
  }
})

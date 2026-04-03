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

  // Resolve current student from auth cookie (for row highlighting)
  let currentStudentId: string | null = null
  const rawCookie = getCookie(event, 'auth:user')
  if (rawCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawCookie))
      if (parsed?.email) {
        const studentResult = await db.execute({
          sql: 'SELECT id FROM students WHERE email = ?',
          args: [parsed.email]
        })
        currentStudentId = (studentResult.rows[0]?.id as string) ?? null
      }
    }
    catch {}
  }

  // Query the leaderboard view with competitive ranking
  const result = await db.execute({
    sql: `SELECT public_alias, best_score, student_id,
            RANK() OVER (ORDER BY best_score DESC) AS rank
          FROM leaderboard
          WHERE task_id = ?
          ORDER BY best_score DESC`,
    args: [taskId]
  })

  const entries = result.rows.map(row => ({
    rank: Number(row.rank),
    name: (row.public_alias as string) ?? 'Anonymous',
    score: Number(row.best_score),
    isCurrentStudent: (row.student_id as string) === currentStudentId
  }))

  return { entries }
})

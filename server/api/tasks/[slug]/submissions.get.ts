export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing task slug' })
  }

  const db = useDB()

  // Resolve task ID
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
    return { submissions: [] }
  }

  const result = await db.execute({
    sql: 'SELECT id, submission_serial_num, submitted_at, score, student_csv_file_key, source_code_file_key FROM submissions WHERE student_id = ? AND task_id = ? ORDER BY submitted_at DESC',
    args: [student.id, taskId]
  })

  const submissions = result.rows.map(row => ({
    id: row.id as string,
    serialNum: Number(row.submission_serial_num),
    submittedAt: row.submitted_at as string,
    score: row.score !== null ? Number(row.score) : null,
    solutionFileName: (row.student_csv_file_key as string).split('/').pop() ?? '',
    sourceCodeFileName: (row.source_code_file_key as string).split('/').pop() ?? ''
  }))

  return { submissions }
})

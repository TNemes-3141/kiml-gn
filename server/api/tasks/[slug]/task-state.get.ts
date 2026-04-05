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
  const student = await resolveStudent(event)

  if (!student) {
    return { selectedSubmissionId: null, status: 'NOT_COMPLETED' }
  }

  const stateResult = await db.execute({
    sql: 'SELECT status, selected_final_submission_id FROM student_task_states WHERE student_id = ? AND task_id = ?',
    args: [student.id, taskId]
  })

  const state = stateResult.rows[0]
  return {
    selectedSubmissionId: (state?.selected_final_submission_id as string) ?? null,
    status: (state?.status as string) ?? 'NOT_COMPLETED'
  }
})

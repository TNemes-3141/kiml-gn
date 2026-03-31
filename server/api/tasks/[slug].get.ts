export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing task slug' })
  }

  const db = useDB()

  const result = await db.execute({
    sql: 'SELECT id, serial_num, title, slug, baseline_score, unlock_time, submission_deadline, online_editor_link FROM tasks WHERE slug = ?',
    args: [slug]
  })

  const task = result.rows[0]
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }

  return {
    id: task.id as string,
    serialNum: Number(task.serial_num),
    title: task.title as string,
    slug: task.slug as string,
    baselineScore: Number(task.baseline_score),
    unlockTime: task.unlock_time as string,
    submissionDeadline: task.submission_deadline as string,
    onlineEditorLink: task.online_editor_link as string
  }
})

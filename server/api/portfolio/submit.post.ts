export default defineEventHandler(async (event) => {
  const db = useDB()

  const student = await requireStudent(event)

  // Check not already submitted
  if (student.portfolioVideoLink) {
    throw createError({ statusCode: 409, message: 'You have already submitted your portfolio.' })
  }

  // Check eligibility: must have enough PASSED tasks
  const semesterResult = await db.execute({
    sql: 'SELECT passing_threshold FROM semesters WHERE id = ?',
    args: [student.semesterId]
  })
  const passingThreshold = Number(semesterResult.rows[0]?.passing_threshold ?? 0)

  const passedResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM student_task_states WHERE student_id = ? AND status = ?',
    args: [student.id, 'PASSED']
  })
  const passedCount = Number(passedResult.rows[0]?.count ?? 0)

  if (passedCount < passingThreshold) {
    throw createError({ statusCode: 403, message: 'You have not passed the required number of programming tasks.' })
  }

  const body = await readBody<{ videoLink: string }>(event)
  if (!body?.videoLink) {
    throw createError({ statusCode: 400, message: 'Missing video URL' })
  }

  await db.execute({
    sql: 'UPDATE students SET portfolio_video_link = ? WHERE id = ?',
    args: [body.videoLink, student.id]
  })

  return { success: true }
})

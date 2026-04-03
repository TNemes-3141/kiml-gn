export default defineEventHandler(async (event) => {
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
    sql: 'SELECT id, semester_id, portfolio_video_link FROM students WHERE email = ?',
    args: [email]
  })
  const student = studentResult.rows[0]
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found' })
  }

  const studentId = student.id as string

  // Check not already submitted
  if (student.portfolio_video_link) {
    throw createError({ statusCode: 409, message: 'You have already submitted your portfolio.' })
  }

  // Check eligibility: must have enough PASSED tasks
  const semesterResult = await db.execute({
    sql: 'SELECT passing_threshold FROM semesters WHERE id = ?',
    args: [student.semester_id as string]
  })
  const passingThreshold = Number(semesterResult.rows[0]?.passing_threshold ?? 0)

  const passedResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM student_task_states WHERE student_id = ? AND status = ?',
    args: [studentId, 'PASSED']
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
    args: [body.videoLink, studentId]
  })

  return { success: true }
})

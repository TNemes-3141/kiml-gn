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
    sql: 'SELECT id, portfolio_video_link, semester_id FROM students WHERE email = ?',
    args: [email]
  })
  const student = studentResult.rows[0]
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found' })
  }

  const studentId = student.id as string
  const semesterId = student.semester_id as string

  // Get current semester info
  const semesterResult = await db.execute({
    sql: 'SELECT passing_threshold, portfolio_submission_deadline FROM semesters WHERE id = ?',
    args: [semesterId]
  })
  const semester = semesterResult.rows[0]

  // Count PASSED tasks for this student
  const passedResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM student_task_states WHERE student_id = ? AND status = ?',
    args: [studentId, 'PASSED']
  })

  return {
    passedCount: Number(passedResult.rows[0]?.count ?? 0),
    passingThreshold: Number(semester?.passing_threshold ?? 0),
    portfolioDeadline: (semester?.portfolio_submission_deadline as string) ?? null,
    videoLink: (student.portfolio_video_link as string) ?? null
  }
})

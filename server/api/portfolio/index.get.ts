export default defineEventHandler(async (event) => {
  const db = useDB()

  const student = await requireStudent(event)

  // Get current semester info
  const semesterResult = await db.execute({
    sql: 'SELECT passing_threshold, portfolio_submission_deadline FROM semesters WHERE id = ?',
    args: [student.semesterId]
  })
  const semester = semesterResult.rows[0]

  // Count PASSED tasks for this student
  const passedResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM student_task_states WHERE student_id = ? AND status = ?',
    args: [student.id, 'PASSED']
  })

  return {
    passedCount: Number(passedResult.rows[0]?.count ?? 0),
    passingThreshold: Number(semester?.passing_threshold ?? 0),
    portfolioDeadline: (semester?.portfolio_submission_deadline as string) ?? null,
    videoLink: student.portfolioVideoLink
  }
})

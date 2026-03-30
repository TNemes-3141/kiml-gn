export default defineEventHandler(async (event) => {
  const db = useDB()

  // Get current semester (latest by start_date)
  const semesterResult = await db.execute(
    'SELECT id, display_name as displayName, passing_threshold as passingThreshold FROM semesters ORDER BY start_date DESC LIMIT 1'
  )
  const semester = semesterResult.rows[0]
  if (!semester) {
    return { semester: null, totalTasks: 0, passedCount: 0, tasks: [] }
  }

  // Get all tasks for current semester
  const tasksResult = await db.execute({
    sql: 'SELECT id, serial_num, title, slug, unlock_time, submission_deadline FROM tasks WHERE semester_id = ? ORDER BY serial_num ASC',
    args: [semester.id as string]
  })

  // Try to resolve the authenticated student from the auth cookie
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

  // Get task states for this student
  const taskStates: Record<string, string> = {}
  let passedCount = 0
  if (studentId) {
    const statesResult = await db.execute({
      sql: 'SELECT task_id, status FROM student_task_states WHERE student_id = ?',
      args: [studentId]
    })
    for (const row of statesResult.rows) {
      taskStates[row.task_id as string] = row.status as string
      if (row.status === 'PASSED') passedCount++
    }
  }

  const tasks = tasksResult.rows.map(task => ({
    id: task.id as string,
    serialNum: Number(task.serial_num),
    title: task.title as string,
    slug: task.slug as string,
    unlockTime: task.unlock_time as string,
    submissionDeadline: task.submission_deadline as string,
    status: taskStates[task.id as string] ?? 'NOT_COMPLETED'
  }))

  return {
    semester: {
      id: semester.id as string,
      displayName: semester.displayName as string,
      passingThreshold: Number(semester.passingThreshold)
    },
    totalTasks: tasks.length,
    passedCount,
    tasks
  }
})

export default defineNitroPlugin(async () => {
  const db = useDB()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS semesters (
      id VARCHAR(50) PRIMARY KEY,
      display_name VARCHAR(50) UNIQUE NOT NULL,
      passing_threshold INTEGER NOT NULL,
      start_date TEXT NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(50) PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      public_alias VARCHAR(50) UNIQUE,
      token_hash VARCHAR(255),
      semester_id VARCHAR(50) NOT NULL,
      first_login_at TIMESTAMP,
      accepted_portfolio_tos BOOLEAN DEFAULT FALSE,
      portfolio_tos_accepted_at TIMESTAMP,
      portfolio_video_link TEXT,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_students_token_hash ON students(token_hash)
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(50) PRIMARY KEY,
      serial_num INTEGER NOT NULL,
      semester_id VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      baseline_score FLOAT NOT NULL,
      unlock_time TIMESTAMP NOT NULL,
      submission_deadline TIMESTAMP NOT NULL,
      max_daily_submissions INTEGER NOT NULL,
      max_overall_submissions INTEGER NOT NULL,
      master_solution_csv_key VARCHAR(255) NOT NULL,
      online_editor_link TEXT NOT NULL UNIQUE,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS student_task_states (
      student_id VARCHAR(50) NOT NULL,
      task_id VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'NOT_COMPLETED',
      selected_final_submission_id VARCHAR(50),
      PRIMARY KEY (student_id, task_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `)

  const semestersResult = await db.execute('SELECT COUNT(*) as count FROM semesters')
  const semestersCount = Number(semestersResult.rows[0]!.count)
  if (semestersCount === 0) {
    await db.execute({
      sql: 'INSERT INTO semesters (id, display_name, passing_threshold, start_date) VALUES (?, ?, ?, ?)',
      args: ['ss2026', 'Sommersemester 2026', 1, '2026-03-15']
    })
  }

  const studentsResult = await db.execute('SELECT COUNT(*) as count FROM students')
  const studentsCount = Number(studentsResult.rows[0]!.count)
  if (studentsCount === 0) {
    await db.execute({
      sql: 'INSERT INTO students (id, first_name, last_name, email, semester_id) VALUES (?, ?, ?, ?, ?)',
      args: ['student-demo-1', 'Tamas', 'Nemes', 'tamas@example.com', 'ss2026']
    })
  }

  const tasksResult = await db.execute('SELECT COUNT(*) as count FROM tasks')
  const tasksCount = Number(tasksResult.rows[0]!.count)
  if (tasksCount === 0) {
    await db.execute({
      sql: `INSERT INTO tasks (id, serial_num, semester_id, title, slug, baseline_score, unlock_time, submission_deadline, max_daily_submissions, max_overall_submissions, master_solution_csv_key, online_editor_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['task-1', 1, 'ss2026', 'Neuronale Netzwerke', 'neuronale-netzwerke', 0.1, '2026-03-29T08:00:00+02:00', '2026-07-29T08:00:00+02:00', 20, 100, 'task1_example_master.csv', 'https://colab.research.google.com/drive/example-task-1']
    })
    await db.execute({
      sql: `INSERT INTO tasks (id, serial_num, semester_id, title, slug, baseline_score, unlock_time, submission_deadline, max_daily_submissions, max_overall_submissions, master_solution_csv_key, online_editor_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['task-2', 2, 'ss2026', 'Entscheidungsbäume', 'entscheidungsbaeume', 0.2, '2026-04-15T16:00:00+02:00', '2026-04-17T16:00:00+02:00', 20, 100, 'task2_example_master.csv', 'https://colab.research.google.com/drive/example-task-2']
    })
  }

  const statesResult = await db.execute('SELECT COUNT(*) as count FROM student_task_states')
  const statesCount = Number(statesResult.rows[0]!.count)
  if (statesCount === 0) {
    await db.execute({
      sql: 'INSERT INTO student_task_states (student_id, task_id) VALUES (?, ?)',
      args: ['student-demo-1', 'task-1']
    })
    await db.execute({
      sql: 'INSERT INTO student_task_states (student_id, task_id) VALUES (?, ?)',
      args: ['student-demo-1', 'task-2']
    })
  }
})

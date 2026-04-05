import { createHash } from 'node:crypto'

const DEV_TOKEN_HASH = createHash('sha256').update('dev-test-token-kiml-2026').digest('hex')

export default defineNitroPlugin(async () => {
  const db = useDB()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS semesters (
      id VARCHAR(50) PRIMARY KEY,
      display_name VARCHAR(50) UNIQUE NOT NULL,
      passing_threshold INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      portfolio_submission_deadline TIMESTAMP NOT NULL
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
      grading_endpoint VARCHAR(255) NOT NULL,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id VARCHAR(50) PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      task_id VARCHAR(50) NOT NULL,
      submission_serial_num INTEGER NOT NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      score FLOAT,
      source_code_file_key VARCHAR(255) NOT NULL,
      student_csv_file_key VARCHAR(255) NOT NULL,
      grading_error TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
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

  await db.execute(`
    CREATE VIEW IF NOT EXISTS leaderboard AS
    SELECT
      sub.task_id,
      sub.student_id,
      s.public_alias,
      MAX(sub.score) AS best_score
    FROM submissions sub
    JOIN students s ON s.id = sub.student_id
    WHERE sub.score IS NOT NULL
    GROUP BY sub.task_id, sub.student_id
  `)

  // Seed mock data only in local development (no Turso URL = local SQLite)
  if (!process.env.TURSO_DATABASE_URL) {
    const semestersResult = await db.execute('SELECT COUNT(*) as count FROM semesters')
    const semestersCount = Number(semestersResult.rows[0]!.count)
    if (semestersCount === 0) {
      await db.execute({
        sql: 'INSERT INTO semesters (id, display_name, passing_threshold, start_date, portfolio_submission_deadline) VALUES (?, ?, ?, ?, ?)',
        args: ['ss2026', 'Sommersemester 2026', 1, '2026-03-15', '2026-08-31T23:59:59+02:00']
      })
    }

    const studentsResult = await db.execute('SELECT COUNT(*) as count FROM students')
    const studentsCount = Number(studentsResult.rows[0]!.count)
    if (studentsCount === 0) {
      await db.execute({
        sql: 'INSERT INTO students (id, first_name, last_name, email, semester_id, token_hash) VALUES (?, ?, ?, ?, ?, ?)',
        args: ['student-demo-1', 'Tamas', 'Nemes', 'tamas@example.com', 'ss2026', DEV_TOKEN_HASH]
      })
    }

    const tasksResult = await db.execute('SELECT COUNT(*) as count FROM tasks')
    const tasksCount = Number(tasksResult.rows[0]!.count)
    if (tasksCount === 0) {
      await db.execute({
        sql: `INSERT INTO tasks (id, serial_num, semester_id, title, slug, baseline_score, unlock_time, submission_deadline, max_daily_submissions, max_overall_submissions, master_solution_csv_key, online_editor_link, grading_endpoint)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['task-0', 0, 'ss2026', 'Testaufgabe', 'testaufgabe', 0.1, '2026-03-15T08:00:00+02:00', '2026-07-29T08:00:00+02:00', 20, 100, 'master_solutions/ss2026-0-testaufgabe.csv', 'https://colab.research.google.com/drive/example-task-0', '/api/grading/testaufgabe']
      })
      await db.execute({
        sql: `INSERT INTO tasks (id, serial_num, semester_id, title, slug, baseline_score, unlock_time, submission_deadline, max_daily_submissions, max_overall_submissions, master_solution_csv_key, online_editor_link, grading_endpoint)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['task-1', 1, 'ss2026', 'Neuronale Netzwerke', 'neuronale-netzwerke', 0.1, '2026-03-29T08:00:00+02:00', '2026-07-29T08:00:00+02:00', 20, 100, 'master_solutions/ss2026-1-neuronale-netzwerke.csv', 'https://colab.research.google.com/drive/example-task-1', '/api/grading/neuronale-netzwerke']
      })
    }

    const statesResult = await db.execute('SELECT COUNT(*) as count FROM student_task_states')
    const statesCount = Number(statesResult.rows[0]!.count)
    if (statesCount === 0) {
      await db.execute({
        sql: 'INSERT INTO student_task_states (student_id, task_id, status) VALUES (?, ?, ?)',
        args: ['student-demo-1', 'task-1', 'PASSED']
      })
    }
  }
})

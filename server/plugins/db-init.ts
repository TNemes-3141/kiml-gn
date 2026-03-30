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

  const semestersResult = await db.execute('SELECT COUNT(*) as count FROM semesters')
  const semestersCount = Number(semestersResult.rows[0]!.count)
  if (semestersCount === 0) {
    await db.execute({
      sql: 'INSERT INTO semesters (id, display_name, passing_threshold, start_date) VALUES (?, ?, ?, ?)',
      args: ['ss2026', 'Sommersemester 2026', 4, '2026-03-15']
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
})

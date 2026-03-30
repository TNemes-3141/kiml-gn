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

  const result = await db.execute('SELECT COUNT(*) as count FROM semesters')
  const count = Number(result.rows[0]!.count)
  if (count === 0) {
    await db.execute({
      sql: 'INSERT INTO semesters (id, display_name, passing_threshold, start_date) VALUES (?, ?, ?, ?)',
      args: ['ss2026', 'Sommersemester 2026', 4, '2026-03-15']
    })
  }
})

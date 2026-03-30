export default defineEventHandler(async () => {
  const db = useDB()
  const result = await db.execute(
    'SELECT id, display_name as displayName, passing_threshold as passingThreshold, start_date as startDate FROM semesters ORDER BY start_date DESC'
  )
  return result.rows
})

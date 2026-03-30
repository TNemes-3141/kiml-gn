export default defineEventHandler(async () => {
  const db = useDB()
  const result = await db.execute(
    "SELECT first_name as firstName, last_name as lastName, email FROM students WHERE id = 'student-demo-1'"
  )

  const row = result.rows[0]
  if (!row) {
    throw createError({ statusCode: 404, message: 'Demo user not found' })
  }

  return {
    firstName: row.firstName as string,
    lastName: row.lastName as string,
    email: row.email as string
  }
})

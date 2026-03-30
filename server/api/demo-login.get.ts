export default defineEventHandler(async () => {
  const db = useDB()
  const result = await db.execute(
    "SELECT first_name as firstName, last_name as lastName, email FROM students WHERE id = 'student-demo-1'"
  )

  if (!result.rows[0]) {
    throw createError({ statusCode: 404, message: 'Demo user not found' })
  }

  return result.rows[0] as { firstName: string; lastName: string; email: string }
})

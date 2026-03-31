export default defineEventHandler(async (event) => {
  const db = useDB()

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

  const result = await db.execute({
    sql: 'SELECT id, public_alias FROM students WHERE email = ?',
    args: [email]
  })

  const student = result.rows[0]
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found' })
  }

  return {
    studentId: student.id as string,
    publicAlias: (student.public_alias as string) ?? null
  }
})

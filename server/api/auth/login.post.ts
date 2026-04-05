import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string }>(event)
  if (!body?.token || typeof body.token !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing token' })
  }

  const tokenHash = createHash('sha256').update(body.token).digest('hex')

  const db = useDB()
  const result = await db.execute({
    sql: 'SELECT id, first_name, last_name, email, first_login_at FROM students WHERE token_hash = ?',
    args: [tokenHash]
  })

  const student = result.rows[0]
  if (!student) {
    throw createError({
      statusCode: 401,
      message: 'Login failed: Account not found. Refer to the instructions in How to log in at the top of the page.'
    })
  }

  // Check 6-month expiry from first login
  if (student.first_login_at) {
    const firstLogin = new Date(student.first_login_at as string)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    if (firstLogin < sixMonthsAgo) {
      throw createError({
        statusCode: 401,
        message: 'Login failed: Your access link has expired.'
      })
    }
  }

  // Set first_login_at only on the very first login (preserves original for expiry calc)
  if (!student.first_login_at) {
    await db.execute({
      sql: 'UPDATE students SET first_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [student.id as string]
    })
  }

  // Set secure HttpOnly cookie
  setCookie(event, 'auth:session', tokenHash, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180 // 6 months
  })

  return {
    firstName: student.first_name as string,
    lastName: student.last_name as string,
    email: student.email as string
  }
})

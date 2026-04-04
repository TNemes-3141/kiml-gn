export default defineEventHandler((event) => {
  if (!getRequestURL(event).pathname.startsWith('/api/grading/')) return
  const token = getHeader(event, 'x-internal-token')
  if (!token || token !== process.env.GRADING_INTERNAL_TOKEN) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
})

export default defineEventHandler(async (event) => {
  const student = await resolveStudent(event)
  if (!student) {
    return { user: null }
  }

  return {
    user: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    }
  }
})

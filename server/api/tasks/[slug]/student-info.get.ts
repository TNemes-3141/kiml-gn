export default defineEventHandler(async (event) => {
  const student = await requireStudent(event)

  return {
    studentId: student.id,
    publicAlias: student.publicAlias
  }
})

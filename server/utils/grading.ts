/**
 * Shared contract for all grading endpoints under /api/grading/*.
 *
 * Every grading endpoint receives this body and must return GradingResponse.
 * The orchestrator (server/api/internal/grade.post.ts) is the only caller.
 */
export interface GradingRequest {
  /** The full text content of the master solution CSV. */
  masterCsv: string
  /** The full text content of the student's submitted CSV. */
  studentCsv: string
}

export interface GradingResponse {
  /** Score in the range [0, 1]. Higher is always better. */
  score: number
}

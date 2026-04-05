/**
 * Grading endpoint for Task 0: Testaufgabe
 *
 * Metric: 1 - RMSE (Root Mean Squared Error) on the `prediction` column.
 *
 * Master CSV: single column `prediction` with N ground-truth values.
 * Student CSV: single column `prediction` with the same N predicted values, in the same row order.
 *
 * Score = 1 - sqrt( (1/n) * Σ (y_i - ŷ_i)² )
 *
 * Score is clamped to [0, 1] and rounded to 3 decimal places.
 * A score of 1.0 is a perfect prediction; 0.0 or lower means the predictions
 * deviate by 1.0 or more on average.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  const groundTruth = parseSingleColumnCsv(body.masterCsv, 'prediction')
  const predictions = parseSingleColumnCsv(body.studentCsv, 'prediction')

  if (groundTruth.length === 0) {
    throw createError({ statusCode: 400, message: 'Master CSV is empty.' })
  }
  if (predictions.length !== groundTruth.length) {
    throw createError({
      statusCode: 400,
      message: `Row count mismatch: master has ${groundTruth.length} rows, student CSV has ${predictions.length}.`
    })
  }

  let sumSquaredErrors = 0
  for (let i = 0; i < groundTruth.length; i++) {
    sumSquaredErrors += (groundTruth[i]! - predictions[i]!) ** 2
  }

  const rmse = Math.sqrt(sumSquaredErrors / groundTruth.length)
  const score = Math.max(0, Math.min(1, 1 - rmse))
  return { score: Math.round(score * 1000) / 1000 }
})

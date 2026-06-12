/**
 * Grading endpoint for Task 5: Convolutional Neural Networks
 *
 * Metric: Accuracy (fraction of test images whose predicted label matches the
 * ground truth). The task is a balanced 10-class problem, so accuracy is an
 * unbiased measure and a constant-class submission scores ~0.1.
 *
 * Master CSV: single column `label` with N ground-truth values (0..9).
 * Student CSV: single column `label` with the same N predicted values.
 *
 * Accuracy = (1 / N) * sum_i 1[ prediction_i == groundTruth_i ]
 *
 * Score is rounded to 3 decimal places.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  const groundTruth = parseSingleColumnCsv(body.masterCsv, 'label')
  const predictions = parseSingleColumnCsv(body.studentCsv, 'label')

  if (groundTruth.length === 0) {
    throw createError({ statusCode: 400, message: 'Master CSV is empty.' })
  }
  if (predictions.length !== groundTruth.length) {
    throw createError({
      statusCode: 400,
      message: `Row count mismatch: master has ${groundTruth.length} rows, student CSV has ${predictions.length}.`
    })
  }

  let correct = 0
  for (let i = 0; i < groundTruth.length; i++) {
    if (predictions[i] === groundTruth[i]) {
      correct++
    }
  }

  const accuracy = correct / groundTruth.length

  return { score: Math.round(accuracy * 1000) / 1000 }
})
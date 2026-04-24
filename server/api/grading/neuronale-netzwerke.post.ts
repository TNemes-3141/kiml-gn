/**
 * Grading endpoint for Task 1: Neuronale Netzwerke
 *
 * Metric: R² (coefficient of determination) on the `price_CHF` column.
 *
 * Master CSV: single column `price_CHF` with N ground-truth values (no row IDs, no split column).
 * Student CSV: single column `price_CHF` with the same N predicted values, in the same row order.
 *
 * R² = 1 - SS_res / SS_tot
 *   SS_res = Σ (y*_i - y_i)²   (sum of squared residuals)
 *   SS_tot = Σ (y*_i - ȳ*)²    (total sum of squares around ground-truth mean)
 *
 * Score is clamped to [0, 1] and rounded to 3 decimal places.
 * A score of 1.0 is a perfect prediction; 0.0 means the model is no better than predicting the mean.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  const groundTruth = parseSingleColumnCsv(body.masterCsv, 'price')
  const predictions = parseSingleColumnCsv(body.studentCsv, 'price')

  if (groundTruth.length === 0) {
    throw createError({ statusCode: 400, message: 'Master CSV is empty.' })
  }
  if (predictions.length !== groundTruth.length) {
    throw createError({
      statusCode: 400,
      message: `Row count mismatch: master has ${groundTruth.length} rows, student CSV has ${predictions.length}.`
    })
  }

  const mean = groundTruth.reduce((s: number, v: number) => s + v, 0) / groundTruth.length

  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < groundTruth.length; i++) {
    ssRes += (groundTruth[i]! - predictions[i]!) ** 2
    ssTot += (groundTruth[i]! - mean) ** 2
  }

  const r2 = ssTot === 0 ? 1 : (1 - ssRes / ssTot)
  return { score: Math.round(r2 * 1000) / 1000 }
})

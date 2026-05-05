/**
 * Grading endpoint for Task 2: Support Vector Machines
 *
 * Metric: MCC (Matthews Correlation Coefficient)
 *
 * Master CSV: single column `label` with N ground-truth values (-1 or 1).
 * Student CSV: single column `label` with the same N predicted values.
 *
 * MCC = (TP*TN - FP*FN) / sqrt((TP+FP)*(TP+FN)*(TN+FP)*(TN+FN))
 *
 * Score is rounded to 4 decimal places. Negative scores are permitted.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  // Spaltennamen entsprechen exakt den generierten CSV-Dateien aus den Python-Skripten
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

  let tp = 0
  let tn = 0
  let fp = 0
  let fn = 0

  for (let i = 0; i < groundTruth.length; i++) {
    const truth = groundTruth[i]!
    const pred = predictions[i]!

    if (truth === 1 && pred === 1) {
      tp++
    } else if (truth === -1 && pred === -1) {
      tn++
    } else if (truth === -1 && pred === 1) {
      fp++
    } else if (truth === 1 && pred === -1) {
      fn++
    }
  }

  const numerator = (tp * tn) - (fp * fn)
  const denominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))

  const mcc = denominator === 0 ? 0 : numerator / denominator

  return { score: Math.round(mcc * 1000) / 1000 }
})
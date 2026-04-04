/**
 * Grading endpoint for Task 2: Entscheidungsbäume
 *
 * Metric: Macro-averaged F1 score on the test split.
 *
 * Master CSV columns: Id, phi1..phi21, y (true class label), split (0=train, 1=test).
 * Student CSV columns: id, predicted_label — one row per test sample, in any order.
 *
 * Only rows where split === '1' are evaluated.
 * F1 is averaged uniformly across all classes present in the ground truth (macro average).
 * Score is rounded to 3 decimal places.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  const masterRows = parseCsvRows(body.masterCsv)
  const studentRows = parseCsvRows(body.studentCsv)

  // Build lookup: id → predicted_label
  const predictions = new Map(
    studentRows.map(r => [r['id']?.trim() ?? '', r['predicted_label']?.trim() ?? ''])
  )

  const testRows = masterRows.filter(r => r['split']?.trim() === '1')
  if (testRows.length === 0) {
    throw createError({ statusCode: 400, message: 'No test rows found in master CSV (split === 1).' })
  }

  // Collect unique classes from ground truth
  const classes = [...new Set(testRows.map(r => r['y']?.trim() ?? ''))]

  // Per-class TP, FP, FN
  const stats = new Map(classes.map(c => [c, { tp: 0, fp: 0, fn: 0 }]))

  for (const row of testRows) {
    const actual = row['y']?.trim() ?? ''
    const id = row['Id']?.trim() ?? ''
    const predicted = predictions.get(id) ?? ''

    if (predicted === actual) {
      stats.get(actual)!.tp++
    }
    else {
      stats.get(actual)!.fn++
      const predStats = stats.get(predicted)
      if (predStats) predStats.fp++
    }
  }

  // Macro F1: average per-class F1 scores
  let f1Sum = 0
  for (const { tp, fp, fn } of stats.values()) {
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn)
    f1Sum += precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
  }

  const score = Math.round((f1Sum / classes.length) * 1000) / 1000
  return { score }
})

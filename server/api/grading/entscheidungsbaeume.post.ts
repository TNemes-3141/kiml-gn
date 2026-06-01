/**
 * Grading endpoint for Task 4: Decision Trees
 *
 * Metric: Macro-F1 (unweighted mean of per-class F1 over all 7 cover types)
 *
 * Master CSV: single column `Cover_Type` with N ground-truth values (1..7).
 * Student CSV: single column `Cover_Type` with the same N predicted values.
 *
 * For each class k:
 *   precision_k = TP_k / (TP_k + FP_k)
 *   recall_k    = TP_k / (TP_k + FN_k)
 *   F1_k        = 2 * precision_k * recall_k / (precision_k + recall_k)
 * Macro-F1 = (1 / K) * sum_k F1_k
 *
 * The label set is the union of the classes present in the ground truth and
 * the predictions (matching scikit-learn's `f1_score(average='macro')`).
 * Any class with an undefined precision/recall contributes an F1 of 0
 * (zero-division handling), so degenerate single-class submissions score low.
 *
 * Score is rounded to 3 decimal places.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  // Spaltennamen entsprechen exakt den generierten CSV-Dateien aus den Python-Skripten
  const groundTruth = parseSingleColumnCsv(body.masterCsv, 'Cover_Type')
  const predictions = parseSingleColumnCsv(body.studentCsv, 'Cover_Type')

  if (groundTruth.length === 0) {
    throw createError({ statusCode: 400, message: 'Master CSV is empty.' })
  }
  if (predictions.length !== groundTruth.length) {
    throw createError({
      statusCode: 400,
      message: `Row count mismatch: master has ${groundTruth.length} rows, student CSV has ${predictions.length}.`
    })
  }

  // Klassenmenge = Vereinigung der in Wahrheit und Vorhersage vorkommenden Labels
  const labels = new Set<number>()
  for (const value of groundTruth) labels.add(value)
  for (const value of predictions) labels.add(value)

  // Pro Klasse TP, FP und FN zaehlen
  const tp = new Map<number, number>()
  const fp = new Map<number, number>()
  const fn = new Map<number, number>()
  for (const label of labels) {
    tp.set(label, 0)
    fp.set(label, 0)
    fn.set(label, 0)
  }

  for (let i = 0; i < groundTruth.length; i++) {
    const truth = groundTruth[i]!
    const pred = predictions[i]!

    if (pred === truth) {
      tp.set(truth, tp.get(truth)! + 1)
    } else {
      // Vorhersage zaehlt als FP fuer die vorhergesagte Klasse ...
      fp.set(pred, fp.get(pred)! + 1)
      // ... und als FN fuer die tatsaechliche Klasse.
      fn.set(truth, fn.get(truth)! + 1)
    }
  }

  // Macro-F1: ungewichteter Mittelwert der F1-Werte ueber alle Klassen
  let f1Sum = 0
  for (const label of labels) {
    const tpK = tp.get(label)!
    const fpK = fp.get(label)!
    const fnK = fn.get(label)!

    const precisionDenom = tpK + fpK
    const recallDenom = tpK + fnK

    const precision = precisionDenom === 0 ? 0 : tpK / precisionDenom
    const recall = recallDenom === 0 ? 0 : tpK / recallDenom

    const f1Denom = precision + recall
    const f1 = f1Denom === 0 ? 0 : (2 * precision * recall) / f1Denom

    f1Sum += f1
  }

  const macroF1 = f1Sum / labels.size

  return { score: Math.round(macroF1 * 1000) / 1000 }
})
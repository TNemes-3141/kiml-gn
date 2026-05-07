/**
 * Grading endpoint for Task 3: Clustering mit K-Means
 *
 * Metric: Adjusted Rand Index (ARI) on the `class` column.
 *
 * ARI compares the similarity of two assignments (ground truth vs. predicted clusters),
 * ignoring permutations and correcting for chance. 
 *
 * ARI = (Index - ExpectedIndex) / (MaxIndex - ExpectedIndex)
 * * Score is clamped to [0, 1] (since ARI can technically be slightly negative for 
 * worse-than-random predictions) and rounded to 3 decimal places.
 */
import type { GradingRequest, GradingResponse } from '../../utils/grading'

export default defineEventHandler(async (event): Promise<GradingResponse> => {
  const body = await readBody<GradingRequest>(event)

  // In the Jupyter Notebook skeleton, the student submission saves the column as 'class'
  const groundTruth = parseSingleColumnCsv(body.masterCsv, 'class')
  const predictions = parseSingleColumnCsv(body.studentCsv, 'class')

  if (groundTruth.length === 0) {
    throw createError({ statusCode: 400, message: 'Master CSV is empty.' })
  }
  if (predictions.length !== groundTruth.length) {
    throw createError({
      statusCode: 400,
      message: `Row count mismatch: master has ${groundTruth.length} rows, student CSV has ${predictions.length}.`
    })
  }

  const n = groundTruth.length

  // 1. Build contingency table and marginal sums in a single O(N) pass
  // This is highly efficient and guarantees execution well under the 10-second timeout.
  const truthCounts = new Map<number, number>()
  const predCounts = new Map<number, number>()
  const overlapCounts = new Map<string, number>()

  for (let i = 0; i < n; i++) {
    const t = groundTruth[i]!
    const p = predictions[i]!

    truthCounts.set(t, (truthCounts.get(t) || 0) + 1)
    predCounts.set(p, (predCounts.get(p) || 0) + 1)

    // Composite key for the contingency table (intersection of truth and prediction)
    const key = `${t}_${p}`
    overlapCounts.set(key, (overlapCounts.get(key) || 0) + 1)
  }

  // Helper function to calculate combinations (k choose 2)
  const choose2 = (k: number) => (k * (k - 1)) / 2

  // 2. Calculate combinations for the ARI formula
  let sumCombNij = 0
  for (const count of overlapCounts.values()) {
    sumCombNij += choose2(count)
  }

  let sumCombAi = 0
  for (const count of truthCounts.values()) {
    sumCombAi += choose2(count)
  }

  let sumCombBj = 0
  for (const count of predCounts.values()) {
    sumCombBj += choose2(count)
  }

  const combN = choose2(n)

  // 3. Compute ARI
  const expectedIndex = (sumCombAi * sumCombBj) / combN
  const maxIndex = (sumCombAi + sumCombBj) / 2
  const denominator = maxIndex - expectedIndex

  let ari = 0
  if (denominator === 0) {
    // If denominator is 0, it means all items are in a single cluster, or every item is in its own cluster.
    ari = sumCombNij === maxIndex ? 1 : 0
  } else {
    ari = (sumCombNij - expectedIndex) / denominator
  }

  // 4. Clamp to [0, 1] and round to 3 decimal places
  const clampedAri = Math.max(0, Math.min(1, ari))
  
  return { score: Math.round(clampedAri * 1000) / 1000 }
})
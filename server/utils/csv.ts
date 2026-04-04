/**
 * Returns the number of data rows (excluding header) and columns in a CSV string.
 */
export function getCsvDimensions(csvText: string): { rows: number, cols: number } {
  const lines = csvText.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return { rows: 0, cols: 0 }
  const cols = lines[0]!.split(',').length
  const rows = lines.length - 1
  return { rows, cols }
}

/**
 * Parses a CSV string into an array of header-keyed row objects.
 * Values are always strings (never undefined) — empty string for missing cells.
 */
export function parseCsvRows(csvText: string): Record<string, string | undefined>[] {
  const lines = csvText.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return []
  const headers = lines[0]!.split(',').map(h => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']))
  })
}

/**
 * Parses a single-column CSV into an array of floats.
 * Skips the header row. Throws if the column name doesn't match.
 */
export function parseSingleColumnCsv(csvText: string, expectedColumn: string): number[] {
  const lines = csvText.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return []
  const header = lines[0]!.trim()
  if (header !== expectedColumn) {
    throw createError({
      statusCode: 400,
      message: `Expected column "${expectedColumn}" in CSV, got "${header}".`
    })
  }
  return lines.slice(1).map(l => parseFloat(l.trim()))
}

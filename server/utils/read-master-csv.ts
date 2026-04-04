/**
 * Reads a master solution CSV from Nitro server assets.
 * Files must be placed in server/assets/solutions/.
 * They are bundled into the Nitro output and never served to clients.
 */
export async function readMasterCsv(filename: string): Promise<string> {
  const storage = useStorage('assets:server')
  const content = await storage.getItem(`solutions/${filename}`)
  if (content === null || content === undefined) {
    throw new Error(`Master CSV not found: solutions/${filename}`)
  }
  return typeof content === 'string' ? content : JSON.stringify(content)
}

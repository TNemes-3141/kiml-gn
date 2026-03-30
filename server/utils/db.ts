import { createClient, type Client } from '@libsql/client'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

let _client: Client | undefined

export function useDB(): Client {
  if (_client) return _client

  const remoteUrl = process.env.TURSO_DATABASE_URL
  if (remoteUrl) {
    _client = createClient({
      url: remoteUrl,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  }
  else {
    const dataDir = join(process.cwd(), '.data')
    mkdirSync(dataDir, { recursive: true })
    _client = createClient({
      url: `file:${join(dataDir, 'app.db')}`
    })
  }

  return _client
}

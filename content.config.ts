import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    tasks: defineCollection({
      type: 'page',
      source: 'tasks/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string()
      })
    })
  }
})

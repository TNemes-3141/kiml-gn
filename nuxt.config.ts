// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui'],
  colorMode: { preference: 'dark', fallback: 'dark' },
  css: ['~/assets/css/main.css', 'katex/dist/katex.min.css'],
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-math': {}
        },
        rehypePlugins: {
          'rehype-katex': {}
        }
      }
    }
  },
  nitro: {
    externals: { inline: ['@libsql/client'] }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod',
        '@tanstack/vue-table'
      ]
    }
  }
})
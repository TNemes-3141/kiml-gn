<script setup lang="ts">
const { isAuthenticated, user, logout } = useAuth()
const showLoginHelp = ref(false)

async function handleLogout() {
  await logout()
  navigateTo('/')
}

const authenticatedLinks = [
  [
    { label: 'Vorlesungsmaterialien', to: '/materials' },
    { label: 'Programmieraufgaben', to: '/tasks' },
    { label: 'Portfolio', to: '/portfolio' }
  ]
]

const unauthenticatedLinks = [
  [
    { label: 'Vorlesungsmaterialien', to: '/materials' }
  ]
]

const footerLinks = [
  [
    { label: 'Impressum', to: '/imprint' },
    { label: 'Datenschutz', to: '/privacy' }
  ]
]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <UHeader>
      <template #title>
        <NuxtLink to="/" class="text-primary font-bold text-lg">
          Einführung in KI &amp; ML
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="isAuthenticated ? authenticatedLinks : unauthenticatedLinks"
      />

      <template #body>
        <UNavigationMenu
          :items="isAuthenticated ? authenticatedLinks : unauthenticatedLinks"
          orientation="vertical"
        />
      </template>

      <template #right>
        <template v-if="isAuthenticated">
          <span class="text-sm mr-3">
            Hallo, <strong>{{ user?.firstName }}</strong>!
          </span>
          <UButton
            color="neutral"
            variant="solid"
            @click="handleLogout"
          >
            Abmelden
          </UButton>
        </template>
        <template v-else>
          <span class="text-sm text-muted mr-3">Nicht angemeldet</span>
          <UButton
            color="primary"
            @click="showLoginHelp = true"
          >
            Wie melde ich mich an?
          </UButton>
        </template>
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <span class="text-sm text-muted">
          Tamás Nemes &copy; {{ new Date().getFullYear() }}
        </span>
      </template>

      <UNavigationMenu :items="footerLinks" />
    </UFooter>

    <LoginHelpModal v-model:open="showLoginHelp" />
  </div>
</template>

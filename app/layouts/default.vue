<script setup lang="ts">
const { isAuthenticated, user, logout } = useAuth()
const showLoginHelp = ref(false)

async function handleLogout() {
  await logout()
  navigateTo('/')
}

const authenticatedLinks = [
  [
    { label: 'Lecture materials', to: '/materials' },
    { label: 'Programming tasks', to: '/tasks' },
    { label: 'Portfolio', to: '/portfolio' }
  ]
]

const unauthenticatedLinks = [
  [
    { label: 'Lecture materials', to: '/materials' }
  ]
]

const footerLinks = [
  [
    { label: 'Imprint', to: '/imprint' },
    { label: 'Privacy notice', to: '/privacy' }
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
            Hello, <strong>{{ user?.firstName }}</strong>!
          </span>
          <UButton
            color="neutral"
            variant="solid"
            @click="handleLogout"
          >
            Log out
          </UButton>
        </template>
        <template v-else>
          <span class="text-sm text-muted mr-3">Not signed in</span>
          <UButton
            color="primary"
            @click="showLoginHelp = true"
          >
            How to sign in
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

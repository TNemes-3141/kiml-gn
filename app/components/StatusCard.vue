<script setup lang="ts">
defineProps<{
  state: 'success' | 'error'
  title: string
  message: string
}>()

const config = {
  success: { bg: 'bg-success-500/20', iconColor: 'text-success-400', titleColor: 'text-success-400', textColor: 'text-success-300', icon: 'i-lucide-check' },
  error: { bg: 'bg-error-500/20', iconColor: 'text-error-400', titleColor: 'text-error-400', textColor: 'text-error-300', icon: 'i-lucide-octagon-alert' }
}
</script>

<template>
  <div :class="['rounded-[10px] p-6', config[state].bg]">
    <UIcon :name="config[state].icon" :class="['mb-2 size-5', config[state].iconColor]" />
    <p :class="['font-semibold', config[state].titleColor]">
      {{ title }}
    </p>
    <p :class="['text-[15px] leading-6', config[state].textColor]">
      <slot>{{ message }}</slot>
    </p>
  </div>
</template>

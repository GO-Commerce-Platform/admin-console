<!--
  Naive UI Theme Provider Component
  
  Provides global theme configuration and dark theme context
  for all child components using Naive UI
  
  Related GitHub Issue: #25 - UI Migration from Chakra UI to Naive UI
-->
<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
    :locale="locale"
    :date-locale="dateLocale"
  >
    <NGlobalStyle />
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NLoadingBarProvider>
            <slot />
          </NLoadingBarProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  enUS,
  dateEnUS,
} from 'naive-ui'
import { naiveTheme, themeOverrides } from '@/theme/naive'

/**
 * Component Props
 */
interface NaiveUIProviderProps {
  /** Locale for UI text (defaults to English) */
  locale?: typeof enUS
  /** Date locale for date pickers (defaults to English US) */
  dateLocale?: typeof dateEnUS
}

const props = withDefaults(defineProps<NaiveUIProviderProps>(), {
  locale: () => enUS,
  dateLocale: () => dateEnUS,
})
</script>

<style scoped>
/* Additional glassmorphism styles that work with Naive UI theme */
:deep(.n-card) {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.n-card:hover) {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(156, 78, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-button--primary) {
  background: linear-gradient(135deg, #9c4eff 0%, #7c3aed 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(156, 78, 255, 0.25);
}

:deep(.n-button--primary:hover) {
  background: linear-gradient(135deg, #b884ff 0%, #9c4eff 100%);
  box-shadow: 0 8px 25px rgba(156, 78, 255, 0.35);
  transform: translateY(-1px);
}

:deep(.n-data-table) {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

:deep(.n-data-table .n-data-table-th) {
  background: rgba(51, 65, 85, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

:deep(.n-data-table .n-data-table-td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.n-data-table .n-data-table-tr:hover .n-data-table-td) {
  background: rgba(51, 65, 85, 0.4);
}

:deep(.n-input) {
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-input:focus-within) {
  border-color: rgba(156, 78, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(156, 78, 255, 0.15);
}

:deep(.n-select) {
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-dropdown) {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

:deep(.n-modal) {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->
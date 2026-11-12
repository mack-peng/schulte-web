import { ref } from 'vue'
import { loadSettings, saveSettings } from '@/core/storage'
import type { ThemeMode } from '@/core/types'

const current = ref<ThemeMode>('light')
let initialized = false

function systemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: ThemeMode): void {
  current.value = theme
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#151412' : '#F6F4EF')
}

export function useTheme() {
  if (!initialized) {
    initialized = true
    apply(loadSettings().theme ?? systemTheme())

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', (event) => {
      if (!loadSettings().theme) apply(event.matches ? 'dark' : 'light')
    })
  }

  function setTheme(theme: ThemeMode): void {
    apply(theme)
    saveSettings({ ...loadSettings(), theme })
  }

  function toggleTheme(): void {
    setTheme(current.value === 'dark' ? 'light' : 'dark')
  }

  return { theme: current, setTheme, toggleTheme }
}

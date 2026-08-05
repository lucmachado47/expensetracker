/** Manages the persisted color theme and its toggle control. */

const THEME_KEY = 'theme'

const applyIcon = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const toggle = document.getElementById('themeToggle')
  if (toggle) toggle.textContent = isDark ? '☀️' : '🌙'
}

const toggleTheme = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem(THEME_KEY, 'light')
  } else {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem(THEME_KEY, 'dark')
  }

  applyIcon()
  // Notify theme-dependent components so they can refresh their derived styles.
  document.dispatchEvent(new CustomEvent('themechange'))
}

document.addEventListener('DOMContentLoaded', () => {
  applyIcon()
  const toggle = document.getElementById('themeToggle')
  if (toggle) toggle.addEventListener('click', toggleTheme)
})

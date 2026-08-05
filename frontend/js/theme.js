// Switch and save the theme (light/dark). Included in all pages.
// Each page <head> already applies the saved theme before the first paint.
// (short inline script) - this file is only for toggling the theme and updating the icon.)

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
  // Let any page-specific script (e.g. a Chart.js instance) know the theme changed,
  // so it can re-read CSS variables and redraw with the correct colors.
  document.dispatchEvent(new CustomEvent('themechange'))
}

document.addEventListener('DOMContentLoaded', () => {
  applyIcon()
  const toggle = document.getElementById('themeToggle')
  if (toggle) toggle.addEventListener('click', toggleTheme)
})
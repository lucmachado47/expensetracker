/** Lightweight toast notifications. Replaces alert() across the app.
 *  Requires a <div id="toastContainer" class="toast-container"></div> in the page. */

const CONTAINER_ID = 'toastContainer'
const AUTO_DISMISS_MS = 4500

const ICONS = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
}

/**
 * Shows a dismissible toast notification.
 *
 * @param {string} message Text to display (inserted as text, never HTML).
 * @param {'success'|'error'|'info'} [type='info'] Visual style of the toast.
 */
export const showToast = (message, type = 'info') => {
    const container = document.getElementById(CONTAINER_ID)

    if (!container) {
        // Fail safe: never leave the user without feedback if the container is missing.
        console.warn('Toast container not found on this page.')
        alert(message)
        return
    }

    const toast = document.createElement('div')
    toast.className = `toast is-${type}`
    toast.setAttribute('role', 'status')

    const icon = document.createElement('span')
    icon.className = 'toast-icon'
    icon.textContent = ICONS[type] || ICONS.info

    const text = document.createElement('span')
    text.className = 'toast-message'
    text.textContent = message

    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.className = 'toast-close'
    closeButton.setAttribute('aria-label', 'Dismiss notification')
    closeButton.textContent = '✕'

    toast.append(icon, text, closeButton)

    const dismiss = () => {
        toast.classList.add('is-leaving')
        setTimeout(() => toast.remove(), 200)
    }

    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    closeButton.addEventListener('click', () => {
        clearTimeout(timer)
        dismiss()
    })

    container.appendChild(toast)
}
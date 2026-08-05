/** Promise-based confirmation dialog. Replaces confirm() with an on-brand modal.
 *  Builds and removes its own DOM — no static markup needed in any page. */

/**
 * Shows a confirmation modal and resolves once the user responds.
 *
 * @param {string} message Question shown to the user.
 * @param {{confirmLabel?: string, cancelLabel?: string}} [options] Button labels.
 * @returns {Promise<boolean>} Resolves true if confirmed, false otherwise.
 */
export const confirmDialog = (message, options = {}) => {
    return new Promise((resolve) => {
        const previouslyFocused = document.activeElement

        const overlay = document.createElement('div')
        overlay.className = 'modal-overlay'

        const dialog = document.createElement('div')
        dialog.className = 'modal-dialog'
        dialog.setAttribute('role', 'alertdialog')
        dialog.setAttribute('aria-modal', 'true')

        const text = document.createElement('p')
        text.className = 'modal-message'
        text.textContent = message

        const actions = document.createElement('div')
        actions.className = 'modal-actions'

        const cancelButton = document.createElement('button')
        cancelButton.type = 'button'
        cancelButton.className = 'btn btn-secondary'
        cancelButton.textContent = options.cancelLabel || 'Cancel'

        const confirmButton = document.createElement('button')
        confirmButton.type = 'button'
        confirmButton.className = 'btn btn-danger'
        confirmButton.textContent = options.confirmLabel || 'Delete'

        actions.append(cancelButton, confirmButton)
        dialog.append(text, actions)
        overlay.append(dialog)
        document.body.append(overlay)

        confirmButton.focus()

        const close = (result) => {
            document.removeEventListener('keydown', onKeydown)
            overlay.remove()
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
            resolve(result)
        }

        // Trap Tab between the two buttons so focus can't escape the modal.
        const onKeydown = (event) => {
            if (event.key === 'Escape') {
                close(false)
                return
            }
            if (event.key !== 'Tab') return

            const focusables = [cancelButton, confirmButton]
            const goingBackward = event.shiftKey

            if (goingBackward && document.activeElement === focusables[0]) {
                event.preventDefault()
                focusables[1].focus()
            } else if (!goingBackward && document.activeElement === focusables[1]) {
                event.preventDefault()
                focusables[0].focus()
            }
        }

        cancelButton.addEventListener('click', () => close(false))
        confirmButton.addEventListener('click', () => close(true))
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) close(false)
        })
        document.addEventListener('keydown', onKeydown)
    })
}
/** Registers new users and directs successful registrations to the login page. */

import {
    API_URL,
    apiRequest,
} from './api.js'

import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm')

  if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
      // Registration is separate from login; users authenticate after the account is created.
      event.preventDefault()

      const formData = new FormData(registerForm)
      const data = Object.fromEntries(formData)

      try {
        const response = await apiRequest(`${API_URL}/register/`, 'POST', data)
  
        if (response.ok) {
          showToast('Account created successfully!', 'success')
          window.location.href = 'login.html'
          // Brief delay so the toast is visible before the redirect fires.
          setTimeout(() => {
            window.location.href = 'login.html'
          }, 900)
        } else {
          const errorData = await response.json()
          showToast(JSON.stringify(errorData), 'error')
        }
      } catch (error) {
        console.error('Error:', error)
        showToast('An error occurred. Please try again.', 'error')
      }
    })
  }
})
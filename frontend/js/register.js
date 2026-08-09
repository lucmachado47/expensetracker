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
      event.preventDefault()

      const formData = new FormData(registerForm)
      const data = Object.fromEntries(formData)

      try {
        const response = await apiRequest(`${API_URL}/register/`, 'POST', data)
  
        if (response.ok) {
          showToast('Account created successfully!', 'success')
          
          setTimeout(() => {
            window.location.href = 'index.html'
          }, 1500)
            
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

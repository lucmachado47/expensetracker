import {
    API_URL,
    apiRequest,
} from './api.js'

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
          alert('Account created successfully!')
          window.location.href = 'login.html'
        } else {
          const errorData = await response.json()
          alert(JSON.stringify(errorData))
        }
      } catch (error) {
        console.error('Error:', error)
        alert('An error occurred. Please try again.')
      }
    })
  }
})

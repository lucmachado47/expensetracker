document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm')

  if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
      event.preventDefault()

      const formData = new FormData(registerForm)
      const data = Object.fromEntries(formData)

      try {
        const response = await fetch('http://127.0.0.1:8000/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (response.ok) {
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

import {
    API_URL,
    apiRequest,
} from './api.js'

document.addEventListener('DOMContentLoaded', function() 
{
    const loginForm = document.getElementById('loginForm')

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(loginForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await apiRequest(
                    `${API_URL}/token/`,
                    'POST', 
                    data
                )

                if (response.ok) {
                    const responseData = await response.json()
                    localStorage.setItem('access_token', responseData.access)
                    localStorage.setItem('refresh_token', responseData.refresh)
                    window.location.href = 'dashboard.html'
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
document.addEventListener('DOMContentLoaded', function() 
{
    const loginForm = document.getElementById('loginForm')

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(loginForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await fetch('http://127.0.0.1:8000/api/token/', {
                    method: 'POST',
                    headers:{ 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                })
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
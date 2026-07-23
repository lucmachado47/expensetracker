document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    
    document
        .getElementById('logoutButton')
        .addEventListener('click', logoutApplication)
})

checkAuthentication = () => {
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
        window.location.href = 'login.html'
    }
}

logoutApplication = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = 'login.html'
}

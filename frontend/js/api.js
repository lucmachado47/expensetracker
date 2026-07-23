export const getAccessToken = () => localStorage.getItem('access_token')

export const checkAuthentication = () => {
    const token = getAccessToken()

    if (!token) {
        window.location.href = 'login.html'
    }
}

export const API_URL = 'http://127.0.0.1:8000/api'

export const apiRequest = async (endpoint, method, data = null) => {
    const token = getAccessToken()

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if (token) {
        options.headers.Authorization = `Bearer ${token}`
    }

    if (data !== null) {
        options.body = JSON.stringify(data)
    }

    return fetch(endpoint, options)
}

export const logoutApplication = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = 'login.html'
}
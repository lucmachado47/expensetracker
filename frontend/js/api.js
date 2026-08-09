/** Provides shared authentication and JSON request helpers for the API. */

/**
 * Retrieves the JWT used to authorize protected API requests.
 *
 * @returns {string|null} The stored access token, if available.
 */
export const getAccessToken = () => localStorage.getItem('access_token')

/**
 * Retrieves the JWT used to obtain a replacement access token.
 *
 * @returns {string|null} The stored refresh token, if available.
 */
export const getRefreshToken = () => localStorage.getItem('refresh_token')

/** Redirects unauthenticated visitors before protected page content is used. */
export const checkAuthentication = () => {
    const token = getAccessToken()

    if (!token) {
        window.location.href = 'index.html'
    }
}

export const API_URL = 'https://expensetracker-j7t0.onrender.com/api'

/**
 * Sends JSON requests with JWT authorization and retries once after token renewal.
 *
 * @param {string} endpoint API URL to request.
 * @param {string} method HTTP method to use.
 * @param {Object|null} data Optional JSON request body.
 * @returns {Promise<Response>} The initial or retried API response.
 */
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

    let response = await fetch(endpoint, options)

    if (response.status === 401) {
        // Retry once with a refreshed access token when the original credential has expired.
        const newAccessToken = await refreshAccessToken()

        if (!newAccessToken) {
            logoutApplication()
            return response
        }

        options.headers.Authorization = `Bearer ${newAccessToken}`

        response = await fetch(endpoint, options)
    }

    return response
}

/**
 * Exchanges the stored refresh token for a new access token.
 *
 * @returns {Promise<string|null>} The replacement token or null when renewal fails.
 */
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken()

    const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    localStorage.setItem('access_token', data.access)

    return data.access
}

/** Clears locally stored JWTs and returns the browser to the sign-in page. */
export const logoutApplication = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = 'index.html'
}

export const formatLabel = (value) => {
    return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
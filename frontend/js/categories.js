import {
    checkAuthentication,
    API_URL,
    apiRequest,
} from './api.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    createCategory()
    loadCategories()
})
 
const createCategory = async () => {
    const categoryForm = document.getElementById('categoryForm')
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(categoryForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await apiRequest(`${API_URL}/categories/`, 'POST', data)

                if (response.ok) {
                    await response.json()
                    alert('Category added successfully!')
                    categoryForm.reset()
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
}

const loadCategories = async () => {
    const categoryTableBody = document.getElementById('categoryTableBody')

    try {
        const response = await apiRequest(`${API_URL}/categories/`, 'GET')

        if (!response.ok) {
            throw new Error('Failed to load categories')
        }
        const categories = await response.json()
        
        categoryTableBody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.category_name}</td>
                <td>${category.frequency}</td>
            </tr>
        `).join('')
        
    } catch (error) {
        console.error('Error:', error)
        alert('An error occurred while loading categories. Please try again.')
    }
}
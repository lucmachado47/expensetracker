document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    createCategory()
    loadCategories()
})

checkAuthentication = () => {
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
        window.location.href = 'login.html'
    }
}

createCategory = async () => {
    const accessToken = localStorage.getItem('access_token')
    const categoryForm = document.getElementById('categoryForm')
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(categoryForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await fetch('http://127.0.0.1:8000/api/categories/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'},
                    body: JSON.stringify(data),
                })
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

loadCategories = async () => {
    const accessToken = localStorage.getItem('access_token')
    const categoryTableBody = document.getElementById('categoryTableBody')

    try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
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
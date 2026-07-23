import {
    checkAuthentication,
    API_URL,
    apiRequest,
} from './api.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    createTransaction()
    loadTransactions()
    loadCategories()
})

const createTransaction = async () => {
    const transactionForm = document.getElementById('transactionForm')

    if (transactionForm) {
        transactionForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(transactionForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await apiRequest(`${API_URL}/transactions/`, 'POST', data)

                if (response.ok) {
                    await response.json()
                    alert('Transaction added successfully!')
                    transactionForm.reset()
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

const loadTransactions = async () => {
    const transactionTableBody = document.getElementById('transactionTableBody')

    try {
        const response = await apiRequest(`${API_URL}/transactions/`, 'GET')

        if (!response.ok) {
            throw new Error('Failed to load transactions')
        }
        const transactions = await response.json()
        transactionTableBody.innerHTML = ''
        transactionTableBody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.category}</td>
                <td>${transaction.transaction_type}</td>
                <td>${transaction.transaction_amount}</td>
                <td>${transaction.transaction_date}</td>
                <td>${transaction.description}</td>
            </tr>
        `).join('')
    } catch (error) {
        console.error('Error:', error)
        alert('An error occurred while loading transactions. Please try again.')
    }
}

const loadCategories = async () => {
    const transactionCategory = document.getElementById('transactionCategory')

    try {
        const response = await apiRequest(`${API_URL}/categories/`, 'GET')
        
        if (!response.ok) {
            throw new Error('Failed to load categories')
        }
        const categories = await response.json()
        transactionCategory.innerHTML = '<option value="">Select a category</option>'
        for (const category of categories) {
            const option = new Option(category.category_name, category.id)
            transactionCategory.appendChild(option)
        }
        
    } catch (error) {
        console.error('Error:', error)
        alert('An error occurred while loading categories. Please try again.')
    }
}
document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    createTransaction()
    loadTransactions()
    loadCategories()
})

checkAuthentication = () => {
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
        window.location.href = 'login.html'
    }
} 

createTransaction = async () => {
    const accessToken = localStorage.getItem('access_token')
    const transactionForm = document.getElementById('transactionForm')

    if (transactionForm) {
        transactionForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(transactionForm)
            const data = Object.fromEntries(formData)

            try {
                const response = await fetch('http://127.0.0.1:8000/api/transactions/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })

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

loadTransactions = async () => {
    const accessToken = localStorage.getItem('access_token')
    const transactionTableBody = document.getElementById('transactionTableBody')

    try {
        const response = await fetch('http://127.0.0.1:8000/api/transactions/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
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

loadCategories = async () => {
    const accessToken = localStorage.getItem('access_token')
    const transactionCategory = document.getElementById('transactionCategory')

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
/** Handles authenticated transaction creation, listing, and category selection. */

import {
    checkAuthentication,
    API_URL,
    apiRequest,
} from './api.js'

import {
    populateYearDropdown,
    getSelectedMonth,
    getSelectedYear,
} from './chart.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    populateYearDropdown()
    
    loadCategories()
    createTransaction()
    
    document.getElementById('selectedMonth').value =
    String(new Date().getMonth() + 1)

    document
        .getElementById('selectedMonth')
        .addEventListener('change', () => {
            currentPage = 1
            loadTransactions()
        })

    document
        .getElementById('selectedYear')
        .addEventListener('change', () => {
            currentPage = 1
            loadTransactions()
        })

    document
        .getElementById('transactionSearch')
        .addEventListener('input', () => {
            currentPage = 1
            loadTransactions()
        })

    document
        .getElementById('previousPage')
        .addEventListener('click', () => {
            currentPage--
            loadTransactions()
        })

    document
        .getElementById('nextPage')
        .addEventListener('click', () => {
            currentPage++
            loadTransactions()
        })

    loadTransactions()

    window.editTransaction = editTransaction
    window.deleteTransaction = deleteTransaction
})

let transactions = []
let editingTransactionId = null
let currentPage = 1

/** Submits a transaction through the shared helper so its JWT is attached. */
const createTransaction = async () => {
    const transactionForm = document.getElementById('transactionForm')

    if (transactionForm) {
        transactionForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(transactionForm)
            const data = Object.fromEntries(formData)
            const submitButton = document.getElementById('submitTransaction')
            const isEditing = editingTransactionId !== null
            let response

            try {
                if (!isEditing) {
                    response = await apiRequest(`${API_URL}/transactions/`, 'POST', data)
                } else {
                    response = await apiRequest(`${API_URL}/transactions/${editingTransactionId}/`, 'PATCH', data)
                }

                if (response.ok) {
                    transactionForm.reset()
                    alert(isEditing ? 'Transaction updated successfully!' : 'Transaction added successfully!')

                    if (isEditing) {
                        editingTransactionId = null
                        submitButton.textContent = 'Create Transaction'
                    }

                    currentPage = 1
                    await loadTransactions()

                } else {
                    const errorData = await response.json()
                    alert(JSON.stringify(errorData))
                }
            } catch (error) {
                console.error('Error:', error)
                alert('An error occurred while submitting the transaction. Please try again.')
            }
        })
    }
}

/** Loads and renders the current user's transactions in the activity table. */
const loadTransactions = async () => {
    const transactionTableBody = document.getElementById('transactionTableBody')
    const searchInput = document.getElementById('transactionSearch')

    try {
        const searchTerm = searchInput.value.toLowerCase()
        const month = getSelectedMonth()
        const year = getSelectedYear()

        const response = await apiRequest(`${API_URL}/transactions/?page=${currentPage}&month=${month}&year=${year}&search=${searchTerm}`, 'GET')

        if (!response.ok) {
            throw new Error('Failed to load transactions')
        }
        const data = await response.json()
    
        updatePagination(data)

        transactions = data.results
    
        transactionTableBody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.category_name}</td>
                <td>${transaction.transaction_type}</td>
                <td>${transaction.transaction_amount}</td>
                <td>${transaction.transaction_date}</td>
                <td>${transaction.description}</td>
                 <td>
                    <button onclick="editTransaction(${transaction.id})">Edit</button>
                    <button onclick="deleteTransaction(${transaction.id})">Delete</button>
                </td>
            </tr>
        `).join('')
    } catch (error) {
        console.error('Error:', error)
        alert('An error occurred while loading transactions. Please try again.')
    }
}

/** Loads user-owned categories so transactions can reference a valid category. */
const loadCategories = async () => {
    const transactionCategory = document.getElementById('transactionCategory')

    try {
        const response = await apiRequest(`${API_URL}/categories/`, 'GET')
        
        if (!response.ok) {
            throw new Error('Failed to load categories')
        }
        const data = await response.json()
        const categories = data.results
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

const editTransaction = (id) => {
    const transaction = transactions.find(transaction => transaction.id === id)

    if (!transaction) {
        alert('Transaction not found.')
        return
    }

    editingTransactionId = id

    document.getElementById('submitTransaction').textContent = 'Update Transaction'
    document.getElementById('transactionCategory').value = transaction.category
    document.getElementById('transactionType').value = transaction.transaction_type
    document.getElementById('transactionAmount').value = transaction.transaction_amount
    document.getElementById('transactionDate').value = transaction.transaction_date
    document.getElementById('transactionDescription').value = transaction.description
}
	
const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return
    }
    
    if (editingTransactionId === id) {
        editingTransactionId = null
        document.getElementById('transactionForm').reset()
        document.getElementById('submitTransaction').textContent = 'Create Transaction'
    }

    try {
        const response = await apiRequest(`${API_URL}/transactions/${id}/`, 'DELETE')

        if (!response.ok) {
            throw new Error('Failed to delete transaction')
        }  

        if (transactions.length === 1 && currentPage > 1) {
            currentPage--
        }

        await loadTransactions()
        alert('Transaction deleted successfully!')
        
    } catch (error) {
        console.error('Error:', error)
        alert('An error occurred while deleting the transaction. Please try again.')
    }
}

const PAGE_SIZE = 10
const updatePagination = (data) => {
    const previousButton = document.getElementById('previousPage')
    const nextButton = document.getElementById('nextPage')
    const pageInfo = document.getElementById('pageInfo')
    
    previousButton.disabled = data.previous === null
    nextButton.disabled = data.next === null

    const totalPages = Math.max(1, Math.ceil(data.count / PAGE_SIZE))

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
}
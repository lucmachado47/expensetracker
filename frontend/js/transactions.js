/** Handles authenticated transaction creation, listing, and category selection. */

import {
    checkAuthentication,
    logoutApplication,
    API_URL,
    apiRequest,
    formatLabel,
} from './api.js'

import {
    populateYearDropdown,
    getSelectedMonth,
    getSelectedYear,
} from './chart.js'

import { showToast } from './toast.js'
import { renderSkeletonRows } from './skeleton.js'
import { confirmDialog } from './modal.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()

    document
        .getElementById('logoutButton')
        .addEventListener('click', logoutApplication)
        
    populateYearDropdown()
    
    loadCategories()
    createTransaction()

    document.getElementById('selectedMonth').value =
    String(new Date().getMonth() + 1)

    updateWithdrawalVisibility()

    document
        .getElementById('transactionType')
        .addEventListener('change', updateWithdrawalVisibility)

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

/** Shows the withdrawal checkbox only for investment transactions, clearing it otherwise. */
const updateWithdrawalVisibility = () => {
    const isInvestment = document.getElementById('transactionType').value === 'INVESTMENT'
    const withdrawalGroup = document.getElementById('withdrawalGroup')

    withdrawalGroup.style.display = isInvestment ? '' : 'none'

    if (!isInvestment) {
        document.getElementById('transactionWithdrawal').checked = false
    }
}

/** Connects the transaction form to authenticated create and update requests. */
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

            if (data.transaction_type === 'INVESTMENT' && document.getElementById('transactionWithdrawal').checked) {
                data.transaction_amount = String(-Number(data.transaction_amount))
            }

            try {
                if (!isEditing) {
                    response = await apiRequest(`${API_URL}/transactions/`, 'POST', data)
                } else {
                    response = await apiRequest(`${API_URL}/transactions/${editingTransactionId}/`, 'PATCH', data)
                }

                if (response.ok) {
                    transactionForm.reset()
                    updateWithdrawalVisibility()
                    showToast(isEditing ? 'Transaction updated successfully!' : 'Transaction added successfully!', 'success')

                    if (isEditing) {
                        editingTransactionId = null
                        submitButton.textContent = 'Create Transaction'
                    }

                    currentPage = 1
                    await loadTransactions()

                } else {
                    const errorData = await response.json()
                    showToast(JSON.stringify(errorData), 'error')
                }
            } catch (error) {
                console.error('Error:', error)
                showToast('An error occurred while submitting the transaction. Please try again.', 'error')
            }
        })
    }
}

/** Loads and renders the selected page of filtered user transactions. */
const loadTransactions = async () => {
    const transactionTableBody = document.getElementById('transactionTableBody')
    const searchInput = document.getElementById('transactionSearch')

    try {
        const searchTerm = searchInput.value.toLowerCase()
        const month = getSelectedMonth()
        const year = getSelectedYear()

        renderSkeletonRows(transactionTableBody, 6)

        const params = new URLSearchParams({ page: currentPage, year, search: searchTerm })
        if (month) {
            params.set('month', month)
        }

        const response = await apiRequest(`${API_URL}/transactions/?${params}`, 'GET')

        if (!response.ok) {
            throw new Error('Failed to load transactions')
        }
        const data = await response.json()
    
        updatePagination(data)

        transactions = data.results
    
        transactionTableBody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.category_name}</td>
                <td>${formatLabel(transaction.transaction_type)}</td>
                <td>${transaction.transaction_amount}${Number(transaction.transaction_amount) < 0 ? ' <span class="withdrawal-tag">Withdrawal</span>' : ''}</td>
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
        showToast('An error occurred while loading transactions. Please try again.', 'error')
        transactionTableBody.innerHTML = ''
    }
}

/** Loads available user-owned categories into the transaction form selector. */
const loadCategories = async () => {
    const transactionCategory = document.getElementById('transactionCategory')

    try {
        const response = await apiRequest(`${API_URL}/categories/?page_size=1000`, 'GET')
        
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
        showToast('An error occurred while loading categories. Please try again.', 'error')
    }
}

/**
 * Loads a rendered transaction into the form for editing.
 *
 * @param {number} id Transaction identifier.
 */
const editTransaction = (id) => {
    const transaction = transactions.find(transaction => transaction.id === id)

    if (!transaction) {
        showToast('Transaction not found.', 'error')
        return
    }

    editingTransactionId = id

    document.getElementById('submitTransaction').textContent = 'Update Transaction'
    document.getElementById('transactionCategory').value = transaction.category
    document.getElementById('transactionType').value = transaction.transaction_type
    document.getElementById('transactionAmount').value = Math.abs(Number(transaction.transaction_amount))
    document.getElementById('transactionDate').value = transaction.transaction_date
    document.getElementById('transactionDescription').value = transaction.description

    updateWithdrawalVisibility()
    document.getElementById('transactionWithdrawal').checked = Number(transaction.transaction_amount) < 0

    document.getElementsByClassName('transactions-layout')[0].scrollIntoView({ behavior: 'smooth', block: 'start'})
}
	
/**
 * Confirms and deletes a transaction, updating the current page when needed.
 *
 * @param {number} id Transaction identifier.
 * @returns {Promise<void>}
 */
const deleteTransaction = async (id) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this transaction?', { confirmLabel: 'Delete transaction' })
    if (!confirmed) {
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
        showToast('Transaction deleted successfully!', 'success')
        
    } catch (error) {
        console.error('Error:', error)
        showToast('An error occurred while deleting the transaction. Please try again.', 'error')
    }
}

const PAGE_SIZE = 10
/**
 * Updates pagination controls from the paginated API response.
 *
 * @param {{count: number, previous: string|null, next: string|null}} data Paginated response metadata.
 */
const updatePagination = (data) => {
    const previousButton = document.getElementById('previousPage')
    const nextButton = document.getElementById('nextPage')
    const pageInfo = document.getElementById('pageInfo')
    
    previousButton.disabled = data.previous === null
    nextButton.disabled = data.next === null

    const totalPages = Math.max(1, Math.ceil(data.count / PAGE_SIZE))

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
}

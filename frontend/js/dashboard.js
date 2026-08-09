/** Loads the authenticated user's filtered dashboard data, chart, and transaction tables. */

import {
    checkAuthentication,
    logoutApplication,
    API_URL,
    apiRequest,
} from './api.js' 

import {
    createChart,
    populateYearDropdown,
    getSelectedMonth,
    getSelectedYear,

} from './chart.js'

import { renderSkeletonRows } from './skeleton.js'
import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()
    
    document
        .getElementById('logoutButton')
        .addEventListener('click', logoutApplication)

    populateYearDropdown()

    document.getElementById('selectedMonth').value =
    String(new Date().getMonth() + 1)

    document
        .getElementById('selectedMonth')
        .addEventListener('change', refreshDashboard)

    document
    .getElementById('selectedYear')
    .addEventListener('change', refreshDashboard)

    // Rebuild the chart so it reads the color variables for the newly selected theme.
    document.addEventListener('themechange', refreshDashboard)

    refreshDashboard()
    
})

/**
 * Loads transactions for the selected reporting month and year.
 *
 * @returns {Promise<Array>} Transactions belonging to the selected period.
 */
const loadDashboardTransactions = async () => {
    const month = getSelectedMonth()
    const year = getSelectedYear()

    const response = await apiRequest(
        `${API_URL}/transactions/?page_size=1000&month=${month}&year=${year}`,
        'GET'
    )

    if (!response.ok) {
        throw new Error('Failed to load transactions')
    }

    const data = await response.json()

    return data
} 

/**
 * Identifies expenses dated after the current day for separate pending treatment.
 *
 * @param {Object} transaction Transaction returned by the API.
 * @returns {boolean} Whether the expense is scheduled in the future.
 */
const isPendingTransactions = (transaction) => {
    const today = new Date()

    return transaction.transaction_type === 'EXPENSE' && new Date(transaction.transaction_date) > today
}

/**
 * Builds table rows and highlights future expenses as pending.
 *
 * @param {Array} transactions Transactions for one dashboard section.
 * @returns {string} HTML rows for the target table body.
 */
const renderRows = (transactions) => {
    return transactions.map(transaction => {
        
        const pending = isPendingTransactions(transaction)
        
        return `
        <tr>
            <td>${transaction.category_name}</td>
            <td>${transaction.transaction_amount}</td>
            <td>${transaction.description}</td>
            <td>
                ${transaction.transaction_date}
                ${pending ? '<span class="pending-tag">Pending</span>' : ''}
            </td>
        </tr>`
    }).join('')   
}

/**
 * Groups transactions by type for the dashboard's separate financial-flow tables.
 *
 * @param {Array} transactions Transactions returned for the selected period.
 */
const renderTransactionTables = (transactions) => {
    const incomeTransactionTableBody = document.getElementById('incomeTransactionTableBody')
    const expenseTransactionTableBody = document.getElementById('expenseTransactionTableBody')
    const investmentTransactionTableBody = document.getElementById('investmentTransactionTableBody')

    const incomes = transactions.filter(transaction => transaction.transaction_type === 'INCOME')
    const expenses = transactions.filter(transaction => transaction.transaction_type === 'EXPENSE')
    const investments = transactions.filter(transaction => transaction.transaction_type === 'INVESTMENT')

    incomeTransactionTableBody.innerHTML = renderRows(incomes)
   
    expenseTransactionTableBody.innerHTML = renderRows(expenses)

    investmentTransactionTableBody.innerHTML = renderRows(investments)
}

/**
 * Calculates the monthly totals for each transaction type.
 *
 * @param {Array} transactions List of transactions returned by the API.
 * @returns {Object} Aggregated totals used by the dashboard chart.
 */
const calculateTotals = (transactions) => {
    const totals = {
        totalIncome: 0, 
        totalExpense: 0, 
        totalInvestment: 0,
    }
   
    for (const transaction of transactions) {
        if (transaction.transaction_type === 'INCOME') {
            totals.totalIncome += Number(transaction.transaction_amount)
        }  
        
        if (transaction.transaction_type === 'EXPENSE') {
            totals.totalExpense += Number(transaction.transaction_amount)
        }

        if (transaction.transaction_type === 'INVESTMENT') {
            totals.totalInvestment += Number(transaction.transaction_amount)
        }  
    }

    return totals
}

/**
 * Formats a number as a currency string (e.g. 1234.5 -> "$1,234.50").
 *
 * @param {number} value Raw numeric amount.
 * @returns {string} Formatted currency string.
 */
const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Renders selected-period income, expense, and net-balance summary values.
 *
 * @param {Object} totals Aggregated income, expense, and investment values.
 */
const renderStats = (totals) => {
    const netBalance = totals.totalIncome - totals.totalExpense
    const balanceCard = document.getElementById('statBalanceCard')

    document.getElementById('statIncome').textContent = formatCurrency(totals.totalIncome)
    document.getElementById('statExpense').textContent = formatCurrency(totals.totalExpense)
    document.getElementById('statBalance').textContent = formatCurrency(netBalance)

    balanceCard.classList.toggle('is-positive', netBalance >= 0)
    balanceCard.classList.toggle('is-negative', netBalance < 0)
}

/**
 * Toggles the loading state across the chart, stat cards, and transaction tables.
 *
 * @param {boolean} isLoading Whether the dashboard is currently fetching data.
 */
const setDashboardLoading = (isLoading) => {
    document.getElementById('chart-card').classList.toggle('is-loading', isLoading)

    for (const id of ['statIncome', 'statExpense', 'statBalance']) {
        document.getElementById(id).classList.toggle('is-loading', isLoading)
    }

    if (isLoading) {
        renderSkeletonRows(document.getElementById('incomeTransactionTableBody'), 4)
        renderSkeletonRows(document.getElementById('expenseTransactionTableBody'), 4)
        renderSkeletonRows(document.getElementById('investmentTransactionTableBody'), 4)
    }
}

/** Reloads the selected period so every dashboard section uses the same data. */
const refreshDashboard = async () => {
    setDashboardLoading(true)

    try {
        const transactions = await loadDashboardTransactions()
        const totals = calculateTotals(transactions.results)
        renderStats(totals)
        createChart(totals)
        renderTransactionTables(transactions.results)
    } catch (error) {
        console.error('Error:', error)
        showToast('Failed to load dashboard data. Please try again.', 'error')
    } finally {
        setDashboardLoading(false)
    }
}

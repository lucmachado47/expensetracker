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
    
    refreshDashboard()
    
})

const loadDashboardTransactions = async () => {
    const month = getSelectedMonth()
    const year = getSelectedYear()

    const response = await apiRequest(
        `${API_URL}/transactions/?month=${month}&year=${year}`,
        'GET'
    )

    if (!response.ok) {
        throw new Error('Failed to load transactions')
    }

    const transactions = await response.json()

    return transactions 
}

const isPendingTransactions = (transaction) => {
    const today = new Date()

    return transaction.transaction_type === 'EXPENSE' && new Date(transaction.transaction_date) > today
}

const renderRows = (transactions) => {
    return transactions.map(transaction => {
        
        const pending = isPendingTransactions(transaction)
        
        return `
        <tr>
            <td>${transaction.transaction_type}</td>
            <td>${transaction.transaction_amount}</td>
            <td>${transaction.description}</td>
            <td ${pending ? 'style="color: red"' : ''}>
                ${transaction.transaction_date}
                ${pending ? '<span class="pending-tag">Pending</span>' : ''}
            </td>
        </tr>`
    }).join('')   
}

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

const calculateTotals = (transactions) => {
    const today = new Date()

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

const refreshDashboard = async () => {
    const transactions = await loadDashboardTransactions()
    const totals = calculateTotals(transactions)
    createChart(totals)
    renderTransactionTables(transactions)
}





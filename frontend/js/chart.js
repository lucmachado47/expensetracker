/** Supplies date selection and Chart.js rendering for the dashboard. */

/**
 * Reads the reporting month selected in the dashboard.
 *
 * @returns {number} Selected month number.
 */
export const getSelectedMonth = () => {
    return Number(document.getElementById('selectedMonth').value)
} 

/**
 * Reads the reporting year selected in the dashboard.
 *
 * @returns {number} Selected year number.
 */
export const getSelectedYear = () => {
    return Number(document.getElementById('selectedYear').value)
}

/** Populates a useful reporting range centered on the current year. */
export const populateYearDropdown = () => {
    const yearDropdown = document.getElementById('selectedYear')

    const currentYear = new Date().getFullYear()

    for (let year = (currentYear - 5); year <= (currentYear + 5); year ++) {
        const option = new Option(year, year)
        
        if (year === currentYear) {
            option.selected = true
        }

        yearDropdown.appendChild(option)
    }
}

let chart

/**
 * Rebuilds the monthly totals chart using the latest dashboard data.
 *
 * Expense is green when income covers it and red when it exceeds income.
 *
 * @param {Object} totals Aggregated income, expense, and investment values.
 */
export const createChart = (totals) => {
    const ctx = document.getElementById('myChart');

    if (chart) {
        // Destroy the old instance to avoid drawing duplicate charts after filtering.
        chart.destroy()
    }
    chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Income', 'Expense', 'Investment'],
        datasets: [{
        label: 'Amount',
        data: [totals.totalIncome, totals.totalExpense, totals.totalInvestment],
        backgroundColor: [
            "#3498db",
            totals.totalIncome >= totals.totalExpense
                ? "#2ecc71"
                : "#e74c3c",
            "#f1c40f"
        ],
        borderWidth: 1
    }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
    })
}

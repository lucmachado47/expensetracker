/** Retrieves a root CSS custom property for chart theme styling. */
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/**
 * Returns the reporting month selected in the dashboard controls.
 *
 * @returns {number|null} Selected calendar month, or null when "All months" is selected.
 */
export const getSelectedMonth = () => {
    const value = document.getElementById('selectedMonth').value
    return value ? Number(value) : null
}

/**
 * Returns the reporting year selected in the dashboard controls.
 *
 * @returns {number} Selected calendar year.
 */
export const getSelectedYear = () => {
    return Number(document.getElementById('selectedYear').value)
}

/** Populates the year selector with a five-year range around the current year. */
export const populateYearDropdown = () => {
    const yearDropdown = document.getElementById('selectedYear')
    const currentYear = new Date().getFullYear()
    for (let year = (currentYear - 5); year <= (currentYear + 5); year++) {
        const option = new Option(year, year)
        if (year === currentYear) {
            option.selected = true
        }
        yearDropdown.appendChild(option)
    }
}

let chart

/** Builds a vertical gradient fill from a chart bar's base color. */
const buildGradient = (ctx, chartArea, colorHex) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    gradient.addColorStop(0, colorHex)
    gradient.addColorStop(1, `${colorHex}55`)
    return gradient
}

/**
 * Renders the selected-period income and expense totals alongside the cumulative investment total as a bar chart.
 *
 * @param {{totalIncome: number, totalExpense: number, totalInvestment: number}} totals Selected-period income/expense totals and the cumulative investment total.
 */
export const createChart = (totals) => {
    const canvas = document.getElementById('myChart')
    const ctx = canvas.getContext('2d')

    if (chart) {
        chart.destroy()
    }

    const incomeColor = cssVar('--success')
    const investmentColor = cssVar('--primary')
    const expenseColor = totals.totalIncome >= totals.totalExpense
        ? cssVar('--success')
        : cssVar('--danger')

    const textColor = cssVar('--ink-soft')
    const gridColor = cssVar('--border')
    const surfaceColor = cssVar('--surface')

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense', 'Investment (Total)'],
            datasets: [{
                label: 'Amount',
                data: [totals.totalIncome, totals.totalExpense, totals.totalInvestment],
                backgroundColor: (context) => {
                    const { chartArea } = context.chart
                    if (!chartArea) return null
                    const colors = [incomeColor, expenseColor, investmentColor]
                    return buildGradient(context.chart.ctx, chartArea, colors[context.dataIndex])
                },
                borderRadius: 10,
                borderSkipped: false,
                maxBarThickness: 72,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: surfaceColor,
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (item) => ` $${item.formattedValue}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: 'Inter', weight: '600' } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor, drawTicks: false },
                    border: { display: false },
                    ticks: { color: textColor, font: { family: 'Inter' } }
                }
            }
        }
    })
}

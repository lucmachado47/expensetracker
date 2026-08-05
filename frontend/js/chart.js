/** Reads a CSS custom property from :root so the chart always matches the active theme. */
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export const getSelectedMonth = () => {
    return Number(document.getElementById('selectedMonth').value)
}

export const getSelectedYear = () => {
    return Number(document.getElementById('selectedYear').value)
}

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

/** Builds a soft vertical gradient fill for a bar, using the given base color. */
const buildGradient = (ctx, chartArea, colorHex) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    gradient.addColorStop(0, colorHex)
    gradient.addColorStop(1, `${colorHex}55`) // fades toward the bottom
    return gradient
}

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
            labels: ['Income', 'Expense', 'Investment'],
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
export const getSelectedMonth = () => {
    return Number(document.getElementById('selectedMonth').value)
}

export const getSelectedYear = () => {
    return Number(document.getElementById('selectedYear').value)
}

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

export const createChart = (totals) => {
    const ctx = document.getElementById('myChart');

    if (chart) {
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
document.addEventListener('DOMContentLoaded', function() {
    const monthlyInvestmentInput = document.getElementById('monthlyInvestment');
    const returnRateInput = document.getElementById('returnRate');
    const timePeriodInput = document.getElementById('timePeriod');
    const calculateButton = document.getElementById('calculateButton');
    const resultSection = document.getElementById('resultSection');
    const investmentValue = document.getElementById('investmentValue');
    const returnsValue = document.getElementById('returnsValue');
    let sipPieChart; // Declare chart variable outside the functions

    function updateValues() {
        const monthlyInvestment = parseFloat(monthlyInvestmentInput.value);
        const returnRate = parseFloat(returnRateInput.value) / 100;
        const timePeriod = parseFloat(timePeriodInput.value);

        const totalInvestmentValue = monthlyInvestment * timePeriod * 12;
        const totalReturnsValue = monthlyInvestment * (((Math.pow(1 + returnRate, timePeriod * 12)) - 1) / returnRate);

        investmentValue.textContent = totalInvestmentValue.toFixed(2);
        returnsValue.textContent = totalReturnsValue.toFixed(2);

        updatePieChart(totalInvestmentValue, totalReturnsValue);
    }

    function updatePieChart(totalInvestment, totalReturns) {
        if (sipPieChart) {
            sipPieChart.destroy(); // Destroy existing chart instance
        }

        const ctx = document.getElementById('sipPieChart').getContext('2d');
        sipPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Invested Amount', 'Returned Amount'],
                datasets: [{
                    data: [totalInvestment, totalReturns],
                    backgroundColor: ['#36a2eb', '#ff6384'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        // Display the pie chart
        document.getElementById('sipPieChart').style.display = 'block';
    }

    calculateButton.addEventListener('click', function() {
        updateValues();
        resultSection.style.display = 'block';
    });

    monthlyInvestmentInput.addEventListener('input', function() {
        document.getElementById('monthlyInvestmentValue').textContent = '₹' + this.value;
    });

    returnRateInput.addEventListener('input', function() {
        document.getElementById('returnRateValue').textContent = this.value + '%';
    });

    timePeriodInput.addEventListener('input', function() {
        document.getElementById('timePeriodValue').textContent = this.value + ' years';
    });
});
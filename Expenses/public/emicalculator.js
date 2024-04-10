document.addEventListener('DOMContentLoaded', function() {
    const loanAmountInput = document.getElementById('loanAmount');
    const timeTenureInput = document.getElementById('timeTenure');
    const interestRateInput = document.getElementById('interestRate');
    const calculateButton = document.getElementById('calculateButton');
    const resultSection = document.getElementById('resultSection');
    const emiValue = document.getElementById('emiValue');
    const totalPaymentValue = document.getElementById('totalPaymentValue');
    const totalInterestValue = document.getElementById('totalInterestValue');
    let emiPieChart; // Declare chart variable outside the functions

    function updateValues() {
        const loanAmount = parseFloat(loanAmountInput.value);
        const timeTenure = parseFloat(timeTenureInput.value);
        const interestRate = parseFloat(interestRateInput.value) / 100;

        const monthlyInterest = interestRate / 12;
        const months = timeTenure;

        const emi = loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, months) / (Math.pow(1 + monthlyInterest, months) - 1);

        const totalPayment = emi * months;
        const totalInterest = totalPayment - loanAmount;

        emiValue.textContent = emi.toFixed(2);
        totalPaymentValue.textContent = totalPayment.toFixed(2);
        totalInterestValue.textContent = totalInterest.toFixed(2);

        updatePieChart(emi, totalPayment, totalInterest);
    }

    function updatePieChart(emi, totalPayment, totalInterest) {
        if (emiPieChart) {
            emiPieChart.destroy(); // Destroy existing chart instance
        }

        const ctx = document.getElementById('emiPieChart').getContext('2d');
        emiPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['EMI Amount', 'Total Payment', 'Total Interest'],
                datasets: [{
                    data: [emi, totalPayment, totalInterest],
                    backgroundColor: ['#E6F69D', '#AADEA7', '#64C2A6'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        // Display the pie chart
        document.getElementById('emiPieChart').style.display = 'block';
    }

    calculateButton.addEventListener('click', function() {
        updateValues();
        resultSection.style.display = 'block';
    });

    loanAmountInput.addEventListener('input', function() {
        document.getElementById('loanAmountValue').textContent = '₹' + this.value;
    });

    timeTenureInput.addEventListener('input', function() {
        document.getElementById('timeTenureValue').textContent = this.value + ' months';
    });

    interestRateInput.addEventListener('input', function() {
        document.getElementById('interestRateValue').textContent = this.value + '%';
    });
});

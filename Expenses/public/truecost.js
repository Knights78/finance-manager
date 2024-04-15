document.getElementById("costForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var income = parseFloat(document.getElementById('income').value);
    var itax = parseFloat(document.getElementById('itax').value);
    var stax = parseFloat(document.getElementById('stax').value);
    var weeksoff = parseFloat(document.getElementById('weeksoff').value);
    var price = parseFloat(document.getElementById('price').value);

    if (isNaN(income) || isNaN(itax) || isNaN(stax) || isNaN(weeksoff) || isNaN(price)) {
        document.getElementById("horrible_error").style.display = "block";
        return;
    }

    document.getElementById("horrible_error").style.display = "none";

    var payPerDay = (income - (income * (itax / 100))) / ((52 - weeksoff) * 5); // Pay per work day

    var priceInDays = price / payPerDay;
    var priceInMonths = priceInDays / 20;
    var sip5Years = sipInvestment(price, 5);
    var sip10Years = sipInvestment(price, 10);
    var sip20Years = sipInvestment(price, 20);
    var sip30Years = sipInvestment(price, 30);

    document.getElementById("result-cost-working").innerHTML = "Cost in terms of working: " + priceInDays.toFixed(2) + " days";
    document.getElementById("result-cost-months").innerHTML = "Cost in terms of months: " + priceInMonths.toFixed(2) + " months";
    document.getElementById("result-sip").innerHTML = "If invested in SIP: <br>" +
        "5 years: " + sip5Years.toFixed(2) + "<br>" +
        "10 years: " + sip10Years.toFixed(2) + "<br>" +
        "20 years: " + sip20Years.toFixed(2) + "<br>" +
        "30 years: " + sip30Years.toFixed(2);
});

function sipInvestment(price, years) {
    var annualInterestRate = 0.12; // Assuming 12% annual return
    return price * (Math.pow((1 + annualInterestRate), years));
}

// =============================
// Expense Tracker Pro v3
// Developed by Devesh Gouniyal
// =============================

// ---------- Local Storage ----------
let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];
    let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;

// ---------- Variables ----------
let editIndex = -1;
let expenseChart = null;
let incomeExpenseChart = null;

// ---------- Elements ----------
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const addBtn = document.getElementById("addBtn");
const search = document.getElementById("search");
const themeBtn = document.getElementById("themeBtn");
const pdfBtn = document.getElementById("pdfBtn");
const excelBtn = document.getElementById("excelBtn");
const clearAllBtn = document.getElementById("clearAll");
// Budget Elements
const budgetInput = document.getElementById("budgetInput");
const saveBudget = document.getElementById("saveBudget");
const remainingBudget = document.getElementById("remainingBudget");
const budgetProgress = document.getElementById("budgetProgress");
const monthFilter = document.getElementById("monthFilter");
const budgetWarning = document.getElementById("budgetWarning");

// Auto Date
date.value = new Date().toISOString().split("T")[0];

// ---------- Add Transaction ----------
function animateValue(elementId, endValue) {

    const element = document.getElementById(elementId);

    const duration = 800;
    const stepTime = 15;

    const steps = duration / stepTime;

    const increment = endValue / steps;

    let current = 0;

    const timer = setInterval(() => {

        current += increment;

        if (current >= endValue) {

            current = endValue;

            clearInterval(timer);

        }

        element.textContent =
            "₹" +
            current.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

    }, stepTime);

}
function showToast(message, color = "#22c55e") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.style.background = color;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}
addBtn.addEventListener("click", saveTransaction);

function saveTransaction() {

    // Validation
    if (
        description.value.trim() === "" ||
        amount.value.trim() === "" ||
        date.value === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    if (Number(amount.value) <= 0) {
        alert("Amount must be greater than 0.");
        return;
    }

    const transaction = {

        description: description.value.trim(),

        amount: Number(amount.value),

        type: type.value,

        category: category.value,

        date: date.value

    };

    if (editIndex === -1) {

        transactions.push(transaction);

    } else {

        transactions[editIndex] = transaction;

        editIndex = -1;

        addBtn.textContent = "➕ Add Transaction";

    }

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    clearForm();
    showToast("✅ Transaction Added Successfully");

    renderTransactions();

}

function clearForm() {

    description.value = "";
    amount.value = "";
    type.value = "income";
    category.value = "Food";
    date.value = new Date().toISOString().split("T")[0];

}
// ---------- Render Transactions ----------
function renderTransactions() {

    const transactionList = document.getElementById("transactionList");

    transactionList.innerHTML = "";

    let income = 0;
    let expense = 0;
    // Monthly Summary
let monthIncome = 0;
let monthExpense = 0;
const categoryTotals = {};

let currentMonth;
let currentYear;

if (monthFilter.value === "") {

    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();

} else {

    const parts = monthFilter.value.split("-");

    currentYear = Number(parts[0]);
    currentMonth = Number(parts[1]) - 1;

}

    const categoryData = {};

    const filteredTransactions = transactions.filter(transaction => {

    const searchMatch =
        transaction.description.toLowerCase().includes(
            search.value.toLowerCase()
        );

    if (monthFilter.value === "") {
        return searchMatch;
    }

    const selectedMonth = monthFilter.value; // YYYY-MM
    const transactionMonth = transaction.date.substring(0, 7);

    return searchMatch && transactionMonth === selectedMonth;

});

    filteredTransactions.forEach((transaction, index) => {
        const transactionDate = new Date(transaction.date);
        const selectedMonth = transactionDate.getMonth();
const selectedYear = transactionDate.getFullYear();

if (
    transactionDate.getMonth() === currentMonth &&
    transactionDate.getFullYear() === currentYear
) {
    if (transaction.type === "income") {
        monthIncome += transaction.amount;
    } else {
        monthExpense += transaction.amount;

        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0) + transaction.amount;
    }
}

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;

            categoryData[transaction.category] =
                (categoryData[transaction.category] || 0) +
                transaction.amount;
        }

        transactionList.innerHTML += `
<tr>
<td>${transaction.date}</td>

<td>${transaction.description}</td>

<td>${transaction.category}</td>

<td style="color:${
    transaction.type === "income"
        ? "#22c55e"
        : "#ef4444"
};font-weight:bold;">

${transaction.type === "income"
    ? "🟢 Income"
    : "🔴 Expense"}

</td>

<td style="color:${
    transaction.type === "income"
        ? "#22c55e"
        : "#ef4444"
};font-weight:bold;">

${transaction.type === "income" ? "+" : "-"}
₹${transaction.amount.toLocaleString("en-IN")}

</td>

<td>

<button onclick="editTransaction(${index})">
✏️ Edit
</button>

<button onclick="deleteTransaction(${index})">
🗑️ Delete
</button>

</td>

</tr>
`;

    });

    const balance = income - expense;

    animateValue("balance", balance);

    
    
    animateValue("income", income);

    animateValue("expense", expense);

    document.getElementById("transactionCount").textContent =
        transactions.length;
        // ===== Monthly Summary =====

document.getElementById("monthIncome").textContent =
    "₹" + monthIncome.toLocaleString("en-IN", {
        minimumFractionDigits: 2
    });

document.getElementById("monthExpense").textContent =
    "₹" + monthExpense.toLocaleString("en-IN", {
        minimumFractionDigits: 2
    });

document.getElementById("monthSavings").textContent =
    "₹" + (monthIncome - monthExpense).toLocaleString("en-IN", {
        minimumFractionDigits: 2
    });

let topCategory = "-";
let maxExpense = 0;

for (const cat in categoryTotals) {
    if (categoryTotals[cat] > maxExpense) {
        maxExpense = categoryTotals[cat];
        topCategory = cat;
    }
}

document.getElementById("topCategory").textContent = topCategory;
// ===== Saving Rate =====
let savingRate = 0;

if (monthIncome > 0) {
    savingRate = ((monthIncome - monthExpense) / monthIncome) * 100;
}

document.getElementById("savingRate").textContent =
    savingRate.toFixed(1) + "%";
    // ===== Smart Financial Insights =====

const insights = [];

if (topCategory !== "-") {
    insights.push(`🔥 You spent the most on ${topCategory} this month.`);
}

if (monthIncome > monthExpense && monthIncome > 0) {
    insights.push(
        `💰 Great! You saved ₹${(monthIncome - monthExpense).toLocaleString("en-IN")} this month.`
    );
}

if (monthExpense > monthIncome && monthIncome > 0) {
    insights.push(
        "⚠️ Your expenses are higher than your income this month."
    );
}


// ===== Budget Update =====
budgetInput.value = monthlyBudget || "";
// Budget only for selected month
const currentMonthExpense = monthExpense;

const remaining = monthlyBudget - currentMonthExpense;

remainingBudget.textContent =
    "₹" + remaining.toLocaleString("en-IN", {
        minimumFractionDigits: 2
    });

let percent = 0;

if (monthlyBudget > 0) {
    percent = (currentMonthExpense / monthlyBudget) * 100;
    if (percent > 100) percent = 100;
}

budgetProgress.style.width = percent + "%";
// ===== Budget Warning =====
if (monthlyBudget > 0) {

    if (currentMonthExpense >= monthlyBudget) {

        budgetWarning.textContent =
            `🚨 Budget Exceeded by ₹${(currentMonthExpense - monthlyBudget).toLocaleString("en-IN")}`;

    } else if (percent >= 80) {

        budgetWarning.textContent =
            `⚠️ Warning: ${Math.round(percent)}% of your budget is used.`;

    } else {

        budgetWarning.textContent = "";

    }

}
// ===== Budget Insights =====

if (monthlyBudget > 0) {

    const usedPercent = (currentMonthExpense / monthlyBudget) * 100;

    if (usedPercent >= 100) {

        insights.push(
            `🚨 You have exceeded your monthly budget by ₹${(currentMonthExpense - monthlyBudget).toLocaleString("en-IN")}.`
        );

    } else if (usedPercent >= 80) {

        insights.push(
            `⚠️ You have used ${Math.round(usedPercent)}% of your monthly budget.`
        );

    } else {

        insights.push(
            `✅ You are within your monthly budget (${Math.round(usedPercent)}% used).`
        );

    }

}
// ===== AI Financial Advisor =====

const advice = [];

if (monthExpense > monthIncome && monthIncome > 0) {
    advice.push("🚨 Reduce unnecessary expenses. Your spending is higher than your income.");
}

if (savingRate >= 30) {
    advice.push("🎉 Excellent! Your saving rate is very healthy.");
} else if (savingRate >= 15) {
    advice.push("👍 Good savings! Try reaching 30% next month.");
} else {
    advice.push("💰 Try to save at least 20% of your income every month.");
}

if (topCategory === "Entertainment") {
    advice.push("🎬 Entertainment is your highest expense. Consider reducing it slightly.");
}

if (topCategory === "Food") {
    advice.push("🍔 Food is your biggest expense. Meal planning could help you save more.");
}

if (monthlyBudget > 0 && percent >= 80 && percent < 100) {
    advice.push("⚠️ You are close to your budget limit. Spend carefully.");
}

if (monthlyBudget > 0 && percent >= 100) {
    advice.push("🚫 You have crossed your monthly budget. Avoid non-essential expenses.");
}

document.getElementById("aiAdvice").innerHTML =
    advice.map(item => `<p>${item}</p>`).join("");

// ===== Show Insights =====

document.getElementById("financialInsights").innerHTML =
    insights.length > 0
        ? insights.map(text => `<p>${text}</p>`).join("")
        : "<p>No insights available.</p>";

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx =
        document
            .getElementById("expenseChart")
            .getContext("2d");

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: Object.keys(categoryData),

            datasets: [{

                data: Object.values(categoryData),

                backgroundColor: [

                    "#ef4444",
                    "#22c55e",
                    "#3b82f6",
                    "#f59e0b",
                    "#8b5cf6",
                    "#06b6d4",
                    "#ec4899"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });
    // ===== Income vs Expense Bar Chart =====

if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
}

const incomeExpenseCtx = document
    .getElementById("incomeExpenseChart")
    .getContext("2d");

incomeExpenseChart = new Chart(incomeExpenseCtx, {

    type: "bar",

    data: {

        labels: ["Income", "Expense"],

        datasets: [{

            label: "Amount (₹)",

            data: [income, expense],

            backgroundColor: [
                "#22c55e",
                "#ef4444"
            ]

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {
                display: false
            }

        },

        scales: {

            y: {
                beginAtZero: true
            }

        }

    }

});

}
// ---------- Delete ----------
function deleteTransaction(index) {

    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    transactions.splice(index, 1);

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    renderTransactions();

}

// ---------- Edit ----------
function editTransaction(index) {

    editIndex = index;

    const transaction = transactions[index];

    description.value = transaction.description;
    amount.value = transaction.amount;
    type.value = transaction.type;
    category.value = transaction.category;
    date.value = transaction.date;

    addBtn.textContent = "💾 Update Transaction";

}

// ---------- Search ----------
search.addEventListener("input", renderTransactions);
monthFilter.addEventListener("change", renderTransactions);

// ---------- Dark Mode ----------
themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

});

// ---------- Clear All ----------
clearAllBtn.addEventListener("click", () => {

    if (!confirm("Delete all transactions?")) {
        return;
    }

    transactions = [];

    localStorage.removeItem("transactions");
    showToast("🗑️ All Transactions Deleted", "#ef4444");

    renderTransactions();

});
// ---------- Budget ----------
saveBudget.addEventListener("click", () => {

    if (budgetInput.value.trim() === "") {
        alert("Please enter a monthly budget.");
        return;
    }

    monthlyBudget = Number(budgetInput.value);

    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );
    showToast("💰 Budget Saved", "#3b82f6");

    

    renderTransactions();

});
// ---------- PDF Export ----------
pdfBtn.addEventListener("click", () => {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Expense Tracker Report", 20, 20);

    doc.setFontSize(12);

    doc.text(
        "Current Balance: " +
        document.getElementById("balance").textContent.replace("₹", "Rs. "),
        20,
        40
    );

    doc.text(
        "Total Income: " +
        document.getElementById("income").textContent.replace("₹", "Rs. "),
        20,
        50
    );

    doc.text(
        "Total Expense: " +
        document.getElementById("expense").textContent.replace("₹", "Rs. "),
        20,
        60
    );

    doc.save("Expense_Report.pdf");

});
// ---------- Excel Export ----------
excelBtn.addEventListener("click", () => {

    if (transactions.length === 0) {
        alert("No transactions available to export.");
        return;
    }

    let csv = "Date,Description,Category,Type,Amount\n";

    transactions.forEach((transaction) => {

        csv += `${transaction.date},${transaction.description},${transaction.category},${transaction.type},${transaction.amount}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Expense_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

});

// ---------- Enter Key ----------
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        addBtn.click();
    }

});

// ---------- Initial Load ----------
renderTransactions();
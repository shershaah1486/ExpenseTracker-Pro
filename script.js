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
let monthlyTrendChart = null;

// ---------- Elements ----------
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");
const repeatType = document.getElementById("repeatType");
const isRecurring = document.getElementById("isRecurring");

const addBtn = document.getElementById("addBtn");
const search = document.getElementById("search");
const themeBtn = document.getElementById("themeBtn");
const pdfBtn = document.getElementById("pdfBtn");
// ===== Currency System =====

let selectedCurrency =
    localStorage.getItem("currency") || "INR";

let currencyRates = {

INR:1,

USD:0.0116,
EUR:0.0100,
GBP:0.0086,
JPY:1.70,
AED:0.0427,

CAD:0.0158,
AUD:0.0178,
CHF:0.0094,
SGD:0.0150,
CNY:0.083,

SAR:0.0435,
MYR:0.054,
THB:0.38,
KRW:16.2,
RUB:0.91,

SEK:0.11,
NZD:0.019,
ZAR:0.21

};

const currencySymbols = {

INR:"₹",

USD:"$",
EUR:"€",
GBP:"£",
JPY:"¥",
AED:"د.إ",

CAD:"C$",
AUD:"A$",
CHF:"Fr",
SGD:"S$",
CNY:"¥",

SAR:"﷼",
MYR:"RM",
THB:"฿",
KRW:"₩",
RUB:"₽",

SEK:"kr",
NZD:"NZ$",
ZAR:"R"

};
function formatCurrency(amount) {

    const converted =
        amount * currencyRates[selectedCurrency];

    return (
        currencySymbols[selectedCurrency] +
        converted.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );

}
async function fetchLiveRates() {

    try {

        const response = await fetch(
            "https://open.er-api.com/v6/latest/INR"
        );

        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("API Error");
        }

        currencyRates = {
            INR: 1,
            ...data.rates
        };
        console.log(data);
console.log(currencyRates);

        console.log("✅ Live exchange rates loaded");

        renderTransactions();

    } catch (error) {

        console.log("⚠️ Live rates unavailable. Using offline rates.");

    }

}
const excelBtn = document.getElementById("excelBtn");
const clearAllBtn = document.getElementById("clearAll");
const exportDataBtn = document.getElementById("exportDataBtn");
const importDataBtn = document.getElementById("importDataBtn");
const importFile = document.getElementById("importFile");
// Budget Elements
const budgetInput = document.getElementById("budgetInput");



const saveBudget = document.getElementById("saveBudget");
const remainingBudget = document.getElementById("remainingBudget");
const budgetProgress = document.getElementById("budgetProgress");
const monthFilter = document.getElementById("monthFilter");
const budgetWarning = document.getElementById("budgetWarning");
const healthScore = document.getElementById("healthScore");
const healthStatus = document.getElementById("healthStatus");

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
        showToast("⚠️ Please fill all fields.");
        return;
    }

    if (Number(amount.value) <= 0) {
        showToast("⚠️ Amount must be greater than 0.");
        return;
    }

    const transaction = {

        description: description.value.trim(),

        amount: Number(amount.value),

        type: type.value,

        category: category.value,

        date: date.value,
        repeat: repeatType.value,
recurring: isRecurring.checked,
lastRun: date.value

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
    repeatType.value = "none";
isRecurring.checked = false;

}
// ---------- Recurring Transactions ----------

function processRecurringTransactions() {

    const today = new Date();
    const newTransactions = [];

    transactions.forEach((transaction) => {

        if (!transaction.recurring || transaction.repeat === "none") {
            return;
        }

        if (!transaction.lastRun) {
            transaction.lastRun = transaction.date;
        }

        let lastRun = new Date(transaction.lastRun);

        while (true) {

            let nextRun = new Date(lastRun);

            switch (transaction.repeat) {

                case "daily":
                    nextRun.setDate(nextRun.getDate() + 1);
                    break;

                case "weekly":
                    nextRun.setDate(nextRun.getDate() + 7);
                    break;

                case "monthly":
                    nextRun.setMonth(nextRun.getMonth() + 1);
                    break;

                case "yearly":
                    nextRun.setFullYear(nextRun.getFullYear() + 1);
                    break;

                default:
                    return;
            }

            if (nextRun > today) break;
            const alreadyExists = transactions.some(t =>
    t.description === transaction.description &&
    t.amount === transaction.amount &&
    t.type === transaction.type &&
    t.category === transaction.category &&
    t.date === nextRun.toISOString().split("T")[0]
);

if (alreadyExists) {
    lastRun = nextRun;
    transaction.lastRun =
        nextRun.toISOString().split("T")[0];
    continue;
}

            newTransactions.push({

                ...transaction,

                date: nextRun.toISOString().split("T")[0],

                lastRun: nextRun.toISOString().split("T")[0]

            });

            lastRun = nextRun;

            transaction.lastRun =
                nextRun.toISOString().split("T")[0];
        }

    });

    if (newTransactions.length > 0) {

        transactions.push(...newTransactions);

        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );

    }

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
${formatCurrency(transaction.amount)}

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
    const recentContainer = document.getElementById("recentTransactions");

const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

if (recent.length === 0) {

    recentContainer.innerHTML =
        "<p>No recent transactions.</p>";

} else {

    recentContainer.innerHTML = recent.map(t => `

        <div class="recent-item">

            <span>${t.description}</span>

            <span class="${
                t.type === "income"
                    ? "recent-income"
                    : "recent-expense"
            }">

                ${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}

            </span>

        </div>

    `).join("");

}
// ===== Upcoming Recurring Payments =====

const upcomingContainer =
    document.getElementById("upcomingPayments");

const recurringList = transactions
    .filter(t => t.recurring)
    .slice(0, 5);

if (recurringList.length === 0) {

    upcomingContainer.innerHTML =
        "<p>No upcoming recurring payments.</p>";

} else {

    upcomingContainer.innerHTML = recurringList.map(t => {

        const last = new Date(t.lastRun || t.date);
        const next = new Date(last);

        switch (t.repeat) {

            case "daily":
                next.setDate(next.getDate() + 1);
                break;

            case "weekly":
                next.setDate(next.getDate() + 7);
                break;

            case "monthly":
                next.setMonth(next.getMonth() + 1);
                break;

            case "yearly":
                next.setFullYear(next.getFullYear() + 1);
                break;
        }

        const diff =
            Math.ceil(
                (next - new Date()) /
                (1000 * 60 * 60 * 24)
            );

        let text = "";

        if (diff <= 0)
            text = "Today";
        else if (diff === 1)
            text = "Tomorrow";
        else
            text = diff + " days";

        return `

            <div class="upcoming-item">

                <span>${t.description}</span>

                <span class="upcoming-days">

                    ${text}

                </span>

            </div>

        `;

    }).join("");

}

    const balance = income - expense;
    document.getElementById("balance").textContent =
    formatCurrency(balance);

document.getElementById("income").textContent =
    formatCurrency(income);

document.getElementById("expense").textContent =
    formatCurrency(expense);
    
    // ===== Analytics Dashboard =====




updateHealthScore(
    income,
    expense,
    balance
);





    document.getElementById("transactionCount").textContent =
        transactions.length;
        // ===== Monthly Summary =====

document.getElementById("monthIncome").textContent =
    formatCurrency(monthIncome);

document.getElementById("monthExpense").textContent =
    formatCurrency(monthExpense);

document.getElementById("monthSavings").textContent =
    formatCurrency(monthIncome - monthExpense);

let topCategory = "-";
let maxExpense = 0;

for (const cat in categoryTotals) {
    if (categoryTotals[cat] > maxExpense) {
        maxExpense = categoryTotals[cat];
        topCategory = cat;
    }
}

document.getElementById("topCategory").textContent = topCategory;
// ===== Analytics Dashboard =====

const incomeTransactions =
    transactions.filter(t => t.type === "income").length;

const expenseTransactions =
    transactions.filter(t => t.type === "expense").length;

const avgIncome =
    incomeTransactions > 0
        ? income / incomeTransactions
        : 0;

const avgExpense =
    expenseTransactions > 0
        ? expense / expenseTransactions
        : 0;


        maximumFractionDigits: 0
    document.getElementById("avgIncome").textContent =
    formatCurrency(avgIncome);

document.getElementById("avgExpense").textContent =
    formatCurrency(avgExpense);

document.getElementById("topAnalyticsCategory").textContent =
    topCategory;

document.getElementById("analyticsSavings").textContent =
    formatCurrency(balance);
// ===== Saving Rate =====
let savingRate = 0;

// Saving rate should never be negative
if (monthIncome > 0) {

    if (monthExpense < monthIncome) {
        savingRate = ((monthIncome - monthExpense) / monthIncome) * 100;
    } else {
        savingRate = 0;
    }

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

// Never show negative remaining budget
const displayRemaining = Math.max(0, remaining);

remainingBudget.textContent =
"Remaining: " +
formatCurrency(remaining);
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
    renderMonthlyTrendChart();

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
const currencySelect =
    document.getElementById("currencySelect");

currencySelect.value = selectedCurrency;

currencySelect.addEventListener("change", () => {

    selectedCurrency = currencySelect.value;

    localStorage.setItem(
        "currency",
        selectedCurrency
    );

    renderTransactions();

});

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
        showToast("⚠️ Please enter a monthly budget.");
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

    doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.text("TRACKWISE - FINANCIAL REPORT", 20, 20);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 30);

doc.setDrawColor(34, 197, 94);
doc.setLineWidth(0.8);
doc.line(20, 35, 190, 35);

doc.setFontSize(13);

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
    // ---------------- Financial Health ----------------

doc.setFont("helvetica", "bold");
doc.setFontSize(15);
doc.text("Financial Health", 20, 80);

doc.setFont("helvetica", "normal");
doc.setFontSize(12);

doc.text(
    "Health Score: " + document.getElementById("healthScore").textContent,
    20,
    90
);

const healthStatusText = document
    .getElementById("healthStatus")
    .textContent
    .replace(/[^\x00-\x7F]/g, "");

doc.text(
    "Status: " + healthStatusText.trim(),
    20,
    100
);
// ---------------- AI Insights ----------------

doc.setFont("helvetica", "bold");
doc.setFontSize(15);
doc.text("AI Financial Insights", 20, 120);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);

const aiText = document
    .getElementById("financialInsights")
    .innerText
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\n/g, " ");

doc.text(aiText, 20, 130, {
    maxWidth: 170
});
// ---------------- Charts ----------------

// Expense Pie Chart
const expenseChartCanvas = document.getElementById("expenseChart");

if (expenseChartCanvas) {
    const expenseChartImg = expenseChartCanvas.toDataURL("image/png", 1.0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Expense Breakdown", 20, 155);

    doc.addImage(
    expenseChartImg,
    "PNG",
    15,
    160,
    85,
    85
);
}

// Income vs Expense Chart
const incomeChartCanvas = document.getElementById("incomeExpenseChart");

if (incomeChartCanvas) {
    const incomeChartImg = incomeChartCanvas.toDataURL("image/png", 1.0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Income vs Expense", 110, 155);

    doc.addImage(
    incomeChartImg,
    "PNG",
    105,
    160,
    85,
    85
);
}
doc.setDrawColor(180);
doc.line(20, 285, 190, 285);

doc.setFontSize(10);
doc.setTextColor(120);

doc.text(
    "Generated by TrackWise | Developed by Devesh Gouniyal",
    20,
    292
);

// Reset color (optional, good practice)
doc.setTextColor(0);

    doc.save("Expense_Report.pdf");

});
// ---------- Excel Export ----------
excelBtn.addEventListener("click", () => {

    if (transactions.length === 0) {
        showToast("📄 No transactions available to export.");
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
processRecurringTransactions();
localStorage.removeItem("savingsGoal");
renderTransactions();
// ========== Export Data ==========
exportDataBtn.addEventListener("click", () => {

    const backup = {
        transactions: transactions,
        monthlyBudget: monthlyBudget
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "trackwise-backup.json";
    a.click();

    URL.revokeObjectURL(url);

    showToast("✅ Backup exported successfully!");
});
// ========== Import Data ==========
importDataBtn.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

        try {

            const backup = JSON.parse(event.target.result);

            transactions = backup.transactions || [];
            monthlyBudget = backup.monthlyBudget || 0;

            localStorage.setItem(
                "transactions",
                JSON.stringify(transactions)
            );

            localStorage.setItem(
                "monthlyBudget",
                monthlyBudget
            );

            renderTransactions();

            showToast("✅ Backup restored successfully!");

        } catch (err) {

            showToast("❌ Invalid backup file.");

        }

    };

    reader.readAsText(file);

});
function renderMonthlyTrendChart() {

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    for (let i = 5; i >= 0; i--) {

        const d = new Date();
        d.setMonth(d.getMonth() - i);

        const month = d.getMonth();
        const year = d.getFullYear();

        labels.push(monthNames[month]);

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {

            const td = new Date(t.date);

            if (
                td.getMonth() === month &&
                td.getFullYear() === year
            ) {

                if (t.type === "income")
                    income += t.amount;
                else
                    expense += t.amount;

            }

        });

        incomeData.push(income);
        expenseData.push(expense);

    }

    if (monthlyTrendChart)
        monthlyTrendChart.destroy();

    monthlyTrendChart = new Chart(

        document.getElementById("monthlyTrendChart"),

        {
            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: "Income",
                        data: incomeData,
                        borderColor: "#22c55e",
                        backgroundColor: "rgba(34,197,94,.15)",
                        fill: true,
                        tension: .4
                    },

                    {
                        label: "Expense",
                        data: expenseData,
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239,68,68,.15)",
                        fill: true,
                        tension: .4
                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        labels: {
                            color: "#fff"
                        }
                    }
                },

                scales: {

                    x: {
                        ticks: {
                            color: "#fff"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#fff"
                        }
                    }

                }

            }

        }

    );

}
// ================= AI Health Score =================

function updateHealthScore(totalIncome, totalExpense, currentBalance) {

    let score = 100;

    if (totalIncome > 0) {

        const expenseRatio = (totalExpense / totalIncome) * 100;

        if (expenseRatio > 90) score -= 40;
        else if (expenseRatio > 75) score -= 25;
        else if (expenseRatio > 60) score -= 15;
    }

    if (currentBalance > 0) score += 5;

    if (monthlyBudget > 0 && totalExpense <= monthlyBudget) {
        score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    healthScore.textContent = score + "/100";

    if (score >= 90) {
        healthStatus.textContent = "🟢 Excellent";
    } else if (score >= 75) {
        healthStatus.textContent = "🟢 Good";
    } else if (score >= 50) {
        healthStatus.textContent = "🟡 Average";
    } else {
        healthStatus.textContent = "🔴 Poor";
    }
}

// ================= Typing Animation =================

const typingText = document.getElementById("typingText");

if (typingText) {

    const words = [
        "Track Smart.",
        "Save More.",
        "Spend Wisely.",
        "Take Control."
    ];

    let index = 0;

    setInterval(() => {

        index = (index + 1) % words.length;

        typingText.style.opacity = 0;

        setTimeout(() => {

            typingText.textContent = words[index];

            typingText.style.opacity = 1;

        }, 250);

    }, 2500);

}
// Hero Buttons

const startBtn = document.getElementById("startBtn");
const learnBtn = document.getElementById("learnBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        document.getElementById("dashboard").scrollIntoView({
            behavior: "smooth"
        });
    });
}

if (learnBtn) {

    learnBtn.addEventListener("click", () => {

        document.getElementById("insights").scrollIntoView({
            behavior: "smooth"
        });

    });

}
// ===== Load Live Exchange Rates =====
fetchLiveRates();
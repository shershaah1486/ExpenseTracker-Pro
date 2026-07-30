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
const budgetWarning = document.getElementById("budgetWarning");

// Auto Date
date.value = new Date().toISOString().split("T")[0];

// ---------- Add Transaction ----------
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

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

    const categoryData = {};

    const filteredTransactions = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(
            search.value.toLowerCase()
        )
    );

    filteredTransactions.forEach((transaction, index) => {
        const transactionDate = new Date(transaction.date);

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

    document.getElementById("balance").textContent =
        "₹" +
        balance.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

    document.getElementById("income").textContent =
        "₹" +
        income.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

    document.getElementById("expense").textContent =
        "₹" +
        expense.toLocaleString("en-IN", {
            minimumFractionDigits: 2
        });

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
// ===== Budget Update =====
budgetInput.value = monthlyBudget || "";

const remaining = monthlyBudget - monthExpense;

remainingBudget.textContent =
    "₹" + remaining.toLocaleString("en-IN", {
        minimumFractionDigits: 2
    });

let percent = 0;

if (monthlyBudget > 0) {
    percent = (monthExpense / monthlyBudget) * 100;
    if (percent > 100) percent = 100;
}

budgetProgress.style.width = percent + "%";
// ===== Budget Warning =====
if (monthlyBudget > 0) {

    if (monthExpense >= monthlyBudget) {

        budgetWarning.textContent =
            `🚨 Budget Exceeded by ₹${(monthExpense - monthlyBudget).toLocaleString("en-IN")}`;

    } else if (percent >= 80) {

        budgetWarning.textContent =
            `⚠️ Warning: ${Math.round(percent)}% of your budget is used.`;

    } else {

        budgetWarning.textContent = "";

    }

}

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

    alert("✅ Monthly Budget Saved!");

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
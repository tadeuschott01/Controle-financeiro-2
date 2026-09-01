/* =========================================================
   CONTROLES — APP.JS
   Versão completa compatível com o HTML atual
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const STORAGE_KEYS = {
    user: "controles_user",
    transactions: "controles_transactions",
    goals: "controles_goals",
    budgets: "controles_budgets",
    darkMode: "controles_dark_mode"
};

const CATEGORIES = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Saúde",
    "Educação",
    "Compras",
    "Contas",
    "Salário",
    "Investimentos",
    "Outros"
];

let transactions = [];
let goals = [];
let budgets = [];
let currentUser = null;
let currentTransactionType = "income";

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value) || 0);
}

function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString + "T12:00:00");

    return date.toLocaleDateString("pt-BR");
}

function todayISO() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function generateId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function saveData() {
    localStorage.setItem(
        STORAGE_KEYS.transactions,
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        STORAGE_KEYS.goals,
        JSON.stringify(goals)
    );

    localStorage.setItem(
        STORAGE_KEYS.budgets,
        JSON.stringify(budgets)
    );
}

function loadData() {
    try {
        transactions =
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.transactions)
            ) || [];

        goals =
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.goals)
            ) || [];

        budgets =
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.budgets)
            ) || [];

    } catch (error) {
        console.error("Erro ao carregar dados:", error);

        transactions = [];
        goals = [];
        budgets = [];
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

function loadUser() {
    try {
        currentUser =
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.user)
            ) || null;
    } catch {
        currentUser = null;
    }
}

function saveUser(user) {
    currentUser = user;

    localStorage.setItem(
        STORAGE_KEYS.user,
        JSON.stringify(user)
    );
}

function showLogin() {
    $("loginScreen")?.classList.remove("hidden");
    $("app")?.classList.add("hidden");
}

function showApp() {
    $("loginScreen")?.classList.add("hidden");
    $("app")?.classList.remove("hidden");

    updateUserInterface();
    showSection("dashboard");
    updateDashboard();
}

function updateUserInterface() {
    if (!currentUser) return;

    const name = currentUser.name || "Usuário";

    if ($("userName")) {
        $("userName").textContent = name;
    }

    if ($("welcomeName")) {
        $("welcomeName").textContent = name.split(" ")[0];
    }

    if ($("userAvatar")) {
        $("userAvatar").textContent =
            name.charAt(0).toUpperCase();
    }

    if ($("userPlan")) {
        $("userPlan").textContent =
            currentUser.premium
                ? "ControleS Premium"
                : "ControleS Grátis";
    }
}

function handleLogin(event) {
    event.preventDefault();

    const name = $("loginName")?.value.trim();
    const email = $("loginEmail")?.value.trim();
    const password = $("loginPassword")?.value;

    if (!name || !email || !password) {
        alert("Preencha todos os campos.");
        return;
    }

    const user = {
        name,
        email,
        premium: currentUser?.premium || false,
        createdAt: currentUser?.createdAt || new Date().toISOString()
    };

    saveUser(user);

    showApp();
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {
    localStorage.removeItem(STORAGE_KEYS.user);

    currentUser = null;

    showLogin();
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

const SECTION_TITLES = {
    dashboard: "Tela principal",
    transactions: "Lançamentos",
    categories: "Categorias",
    reports: "Relatórios",
    premium: "Premium"
};

function showSection(sectionName) {
    const sections = [
        "dashboard",
        "transactions",
        "categories",
        "reports",
        "premium"
    ];

    sections.forEach(section => {
        const element = $(section);

        if (!element) return;

        element.classList.toggle(
            "hidden",
            section !== sectionName
        );
    });

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );
        });

    if ($("pageTitle")) {
        $("pageTitle").textContent =
            SECTION_TITLES[sectionName] || "ControleS";
    }

    $("sidebar")?.classList.remove("mobile-open");

    if (sectionName === "dashboard") {
        updateDashboard();
    }

    if (sectionName === "transactions") {
        renderTransactions();
        updateCategoryFilter();
    }

    if (sectionName === "categories") {
        updateCategoryChart();
        renderCategoryList();
    }

    if (sectionName === "reports") {
        updateReportChart();
        renderReportAnalysis();
    }

    if (sectionName === "premium") {
        updatePremium();
    }
}


/* =========================================================
   DATA ATUAL
   ========================================================= */

function getTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            income += amount;
        } else {
            expense += amount;
        }
    });

    return {
        income,
        expense,
        balance: income - expense,
        economy:
            income > 0
                ? ((income - expense) / income) * 100
                : 0
    };
}


/* =========================================================
   DATA ATUAL
   ========================================================= */

function updateDate() {
    if (!$("currentDate")) return;

    const now = new Date();

    $("currentDate").textContent =
        now.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {
    updateDate();

    const totals = getTotals();

    if ($("balanceValue")) {
        $("balanceValue").textContent =
            formatCurrency(totals.balance);
    }

    if ($("incomeValue")) {
        $("incomeValue").textContent =
            formatCurrency(totals.income);
    }

    if ($("expenseValue")) {
        $("expenseValue").textContent =
            formatCurrency(totals.expense);
    }

    if ($("economyValue")) {
        $("economyValue").textContent =
            `${Math.max(0, totals.economy).toFixed(1)}%`;
    }

    renderRecentTransactions();
    updateFinanceChart();
}


/* =========================================================
   TRANSAÇÕES
   ========================================================= */

function openTransactionModal(type = "income") {
    currentTransactionType = type;

    $("transactionModal")?.classList.remove("hidden");

    if ($("dateInput")) {
        $("dateInput").value = todayISO();
    }

    updateTransactionTypeButtons();
}

function closeTransactionModal() {
    $("transactionModal")?.classList.add("hidden");

    $("transactionForm")?.reset();

    currentTransactionType = "income";

    updateTransactionTypeButtons();

    if ($("dateInput")) {
        $("dateInput").value = todayISO();
    }
}

function updateTransactionTypeButtons() {
    document
        .querySelectorAll(".type-option")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.type === currentTransactionType
            );
        });
}

function addTransaction(event) {
    event.preventDefault();

    const description =
        $("descriptionInput")?.value.trim();

    const amount =
        Number($("amountInput")?.value);

    const date =
        $("dateInput")?.value || todayISO();

    const frequency =
        $("frequencyInput")?.value || "once";

    const category =
        $("transactionCategory")?.value || "Outros";

    if (!description) {
        alert("Digite uma descrição.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Digite um valor válido.");
        return;
    }

    const transaction = {
        id: generateId(),
        description,
        amount,
        date,
        frequency,
        category,
        type: currentTransactionType,
        createdAt: new Date().toISOString()
    };

    transactions.unshift(transaction);

    saveData();

    closeTransactionModal();

    updateDashboard();
    renderTransactions();
    updateCategoryFilter();

    alert("Lançamento salvo com sucesso.");
}


/* =========================================================
   RENDERIZAÇÃO DE TRANSAÇÕES
   ========================================================= */

function transactionHTML(transaction) {
    const isIncome = transaction.type === "income";

    return `
        <div class="transaction">

            <div class="transaction-icon">
                ${isIncome ? "↗" : "↘"}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(transaction.description)}
                </strong>

                <small>
                    ${escapeHTML(transaction.category)}
                    •
                    ${formatDate(transaction.date)}
                </small>

            </div>

            <div class="transaction-value ${isIncome ? "income" : "expense"}">
                ${isIncome ? "+" : "-"}
                ${formatCurrency(transaction.amount)}
            </div>

            <button
                class="transaction-delete"
                type="button"
                data-delete-transaction="${transaction.id}"
                title="Excluir"
            >
                ×
            </button>

        </div>
    `;
}

function renderRecentTransactions() {
    const container = $("recentTransactions");

    if (!container) return;

    const recent =
        transactions
            .slice()
            .sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            )
            .slice(0, 5);

    if (!recent.length) {
        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento cadastrado.
            </div>
        `;

        return;
    }

    container.innerHTML =
        recent.map(transactionHTML).join("");
}

function renderTransactions() {
    const container = $("allTransactions");

    if (!container) return;

    const search =
        ($("searchInput")?.value || "")
            .trim()
            .toLowerCase();

    const type =
        $("typeFilter")?.value || "all";

    const category =
        $("categoryFilter")?.value || "all";

    let filtered =
        transactions.filter(transaction => {

            const matchesSearch =
                !search ||
                transaction.description
                    .toLowerCase()
                    .includes(search) ||
                transaction.category
                    .toLowerCase()
                    .includes(search);

            const matchesType =
                type === "all" ||
                transaction.type === type;

            const matchesCategory =
                category === "all" ||
                transaction.category === category;

            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );
        });

    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;
    }

    container.innerHTML =
        filtered.map(transactionHTML).join("");
}

function deleteTransaction(id) {
    const transaction =
        transactions.find(item => item.id === id);

    if (!transaction) return;

    const confirmed =
        confirm(
            `Excluir "${transaction.description}"?`
        );

    if (!confirmed) return;

    transactions =
        transactions.filter(
            item => item.id !== id
        );

    saveData();

    updateDashboard();
    renderTransactions();
    updateCategoryFilter();
    updatePremium();
    updateCategoryChart();
}


/* =========================================================
   FILTRO DE CATEGORIAS
   ========================================================= */

function updateCategoryFilter() {
    const select = $("categoryFilter");

    if (!select) return;

    const currentValue = select.value;

    const usedCategories =
        [...new Set(
            transactions.map(
                transaction => transaction.category
            )
        )];

    select.innerHTML = `
        <option value="all">
            Todas categorias
        </option>
    `;

    usedCategories
        .sort()
        .forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });

    if (
        [...select.options]
            .some(option => option.value === currentValue)
    ) {
        select.value = currentValue;
    }
}


/* =========================================================
   GRÁFICO RECEITAS X DESPESAS
   ========================================================= */

function updateFinanceChart() {
    const canvas = $("financeChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const totals = getTotals();

    if (financeChart) {
        financeChart.destroy();
    }

    financeChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: [
                "Receitas",
                "Despesas"
            ],

            datasets: [
                {
                    label: "Valor",
                    data: [
                        totals.income,
                        totals.expense
                    ],

                    borderRadius: 10
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(
                                context.raw
                            );
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function getExpenseByCategory() {
    const result = {};

    transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(transaction => {

            const category =
                transaction.category || "Outros";

            result[category] =
                (result[category] || 0) +
                Number(transaction.amount || 0);
        });

    return result;
}

function updateCategoryChart() {
    const canvas = $("categoryChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const data =
        getExpenseByCategory();

    const labels = Object.keys(data);
    const values = Object.values(data);

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels,

            datasets: [
                {
                    data: values,
                    borderWidth: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {

                            const value =
                                context.raw || 0;

                            return `${context.label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });

    renderCategoryList();
}

function renderCategoryList() {
    const container =
        $("categoryList");

    if (!container) return;

    const data =
        getExpenseByCategory();

    const entries =
        Object.entries(data)
            .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                Ainda não existem despesas
                para analisar.
            </div>
        `;

        return;
    }

    const total =
        entries.reduce(
            (sum, [, value]) => sum + value,
            0
        );

    container.innerHTML =
        entries.map(
            ([category, value]) => {

                const percentage =
                    total > 0
                        ? (value / total) * 100
                        : 0;

                return `
                    <div class="category-summary-item">

                        <div class="category-summary-left">

                            <span class="category-dot"></span>

                            <strong>
                                ${escapeHTML(category)}
                            </strong>

                        </div>

                        <div>
                            <strong>
                                ${formatCurrency(value)}
                            </strong>

                            <span>
                                ${percentage.toFixed(1)}%
                            </span>
                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   RELATÓRIOS
   ========================================================= */

function updateReportChart() {
    const canvas =
        $("reportCategoryChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const data =
        getExpenseByCategory();

    const labels =
        Object.keys(data);

    const values =
        Object.values(data);

    if (reportCategoryChart) {
        reportCategoryChart.destroy();
    }

    reportCategoryChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels,

            datasets: [
                {
                    data: values,
                    borderWidth: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function renderReportAnalysis() {
    const container =
        $("reportAnalysis");

    if (!container) return;

    const totals = getTotals();

    let message = "";

    if (transactions.length === 0) {

        message = `
            <p>
                Adicione seus primeiros lançamentos
                para receber uma análise financeira.
            </p>
        `;

    } else if (totals.income === 0) {

        message = `
            <p>
                Você possui despesas cadastradas,
                mas ainda não registrou receitas.
            </p>
        `;

    } else if (totals.expense > totals.income) {

        message = `
            <p>
                ⚠️ Seus gastos estão acima das suas receitas.
                Vale revisar as principais categorias de despesas.
            </p>
        `;

    } else if (totals.economy < 10) {

        message = `
            <p>
                💡 Sua margem de economia está baixa.
                Tente reduzir algumas despesas recorrentes.
            </p>
        `;

    } else {

        message = `
            <p>
                ✅ Suas receitas estão acima das despesas.
                Continue acompanhando seus gastos para manter
                uma boa margem de economia.
            </p>
        `;
    }

    container.innerHTML = `
        <div class="premium-analysis">

            <p>
                <strong>Receitas:</strong>
                ${formatCurrency(totals.income)}
            </p>

            <p>
                <strong>Despesas:</strong>
                ${formatCurrency(totals.expense)}
            </p>

            <p>
                <strong>Saldo:</strong>
                ${formatCurrency(totals.balance)}
            </p>

            <br>

            ${message}

        </div>
    `;
}


/* =========================================================
   PREMIUM
   ========================================================= */

function isPremium() {
    return Boolean(
        currentUser &&
        currentUser.premium
    );
}

function updatePremium() {

    updatePremiumPerformance();
    updateHealthStatus();
    renderGoals();
    renderBudgets();
    renderSmartAlerts();
    renderMonthlyComparison();
    renderPremiumAnalysis();
}

function updatePremiumPerformance() {

    const totals = getTotals();

    if ($("premiumEconomyValue")) {
        $("premiumEconomyValue").textContent =
            `${Math.max(0, totals.economy).toFixed(1)}%`;
    }

    if (!$("premiumPerformanceText")) return;

    if (!transactions.length) {

        $("premiumPerformanceText").textContent =
            "Cadastre seus lançamentos para acompanhar seu desempenho.";

        return;
    }

    if (totals.expense > totals.income) {

        $("premiumPerformanceText").textContent =
            "Seus gastos estão acima das receitas. É hora de revisar seu orçamento.";

    } else if (totals.economy < 10) {

        $("premiumPerformanceText").textContent =
            "Você está economizando pouco. Pequenos ajustes podem aumentar sua margem.";

    } else {

        $("premiumPerformanceText").textContent =
            "Muito bem! Suas receitas estão superando suas despesas.";
    }
}

function updateHealthStatus() {

    const container =
        $("healthResult");

    if (!container) return;

    const totals = getTotals();

    let status;
    let description;

    if (!transactions.length) {

        status = "Sem dados";
        description =
            "Adicione lançamentos para calcular sua saúde financeira.";

    } else if (totals.expense > totals.income) {

        status = "Crítica";
        description =
            "Suas despesas estão acima das receitas.";

    } else if (totals.economy < 10) {

        status = "Atenção";
        description =
            "Sua margem de economia está baixa.";

    } else {

        status = "Saudável";
        description =
            "Você possui uma boa margem entre receitas e despesas.";
    }

    container.innerHTML = `
        <div class="health-item">
            <strong>
                ${status}
            </strong>

            <small>
                ${description}
            </small>
        </div>
    `;
}


/* =========================================================
   METAS
   ========================================================= */

function openGoalModal() {
    $("goalModal")?.classList.remove("hidden");
}

function closeGoalModal() {
    $("goalModal")?.classList.add("hidden");
    $("goalForm")?.reset();
}

function createGoal(event) {
    event.preventDefault();

    const name =
        $("goalName")?.value.trim();

    const target =
        Number($("goalTarget")?.value);

    const saved =
        Number($("goalSaved")?.value) || 0;

    if (!name) {
        alert("Digite o nome da meta.");
        return;
    }

    if (!target || target <= 0) {
        alert("Digite um valor válido para a meta.");
        return;
    }

    if (saved > target) {
        alert(
            "O valor já guardado não pode ser maior que a meta."
        );
        return;
    }

    goals.push({
        id: generateId(),
        name,
        target,
        saved,
        createdAt: new Date().toISOString()
    });

    saveData();

    closeGoalModal();
    renderGoals();
}

function renderGoals() {

    const container =
        $("goalsList");

    if (!container) return;

    if (!goals.length) {

        container.innerHTML = `
            <div class="empty-state">
                Você ainda não criou nenhuma meta.
            </div>
        `;

        return;
    }

    container.innerHTML =
        goals.map(goal => {

            const percentage =
                Math.min(
                    100,
                    (goal.saved / goal.target) * 100
                );

            return `
                <div class="health-item">

                    <strong>
                        ${escapeHTML(goal.name)}
                    </strong>

                    <small>
                        ${formatCurrency(goal.saved)}
                        de
                        ${formatCurrency(goal.target)}
                    </small>

                    <div style="
                        margin-top:10px;
                        height:8px;
                        background:var(--border);
                        border-radius:10px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${percentage}%;
                            height:100%;
                            background:var(--orange);
                        "></div>
                    </div>

                    <small>
                        ${percentage.toFixed(0)}% concluído
                    </small>

                    <button
                        type="button"
                        class="text-button"
                        data-delete-goal="${goal.id}"
                        style="margin-top:8px;"
                    >
                        Excluir
                    </button>

                </div>
            `;
        }).join("");
}

function deleteGoal(id) {

    goals =
        goals.filter(
            goal => goal.id !== id
        );

    saveData();
    renderGoals();
}


/* =========================================================
   ORÇAMENTO
   ========================================================= */

function openBudgetModal() {
    $("budgetModal")?.classList.remove("hidden");
}

function closeBudgetModal() {
    $("budgetModal")?.classList.add("hidden");
    $("budgetForm")?.reset();
}

function createBudget(event) {
    event.preventDefault();

    const category =
        $("budgetCategory")?.value;

    const limit =
        Number($("budgetLimit")?.value);

    if (!category || !limit || limit <= 0) {
        alert("Informe uma categoria e um limite válido.");
        return;
    }

    const existing =
        budgets.find(
            budget => budget.category === category
        );

    if (existing) {
        existing.limit = limit;
    } else {
        budgets.push({
            id: generateId(),
            category,
            limit
        });
    }

    saveData();

    closeBudgetModal();
    renderBudgets();
}

function renderBudgets() {

    const container =
        $("budgetsList");

    if (!container) return;

    if (!budgets.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum orçamento definido.
            </div>
        `;

        return;
    }

    const expenses =
        getExpenseByCategory();

    container.innerHTML =
        budgets.map(budget => {

            const spent =
                expenses[budget.category] || 0;

            const percentage =
                (spent / budget.limit) * 100;

            const safePercentage =
                Math.min(100, percentage);

            return `
                <div class="health-item">

                    <strong>
                        ${escapeHTML(budget.category)}
                    </strong>

                    <small>
                        Gasto:
                        ${formatCurrency(spent)}
                        /
                        Limite:
                        ${formatCurrency(budget.limit)}
                    </small>

                    <div style="
                        margin-top:10px;
                        height:8px;
                        background:var(--border);
                        border-radius:10px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${safePercentage}%;
                            height:100%;
                            background:${percentage > 100 ? "var(--danger)" : "var(--orange)"};
                        "></div>
                    </div>

                    <small>
                        ${percentage.toFixed(0)}% utilizado
                    </small>

                    <button
                        type="button"
                        class="text-button"
                        data-delete-budget="${budget.id}"
                        style="margin-top:8px;"
                    >
                        Excluir
                    </button>

                </div>
            `;
        }).join("");
}


/* =========================================================
   ALERTAS INTELIGENTES
   ========================================================= */

function renderSmartAlerts() {

    const container =
        $("smartAlerts");

    if (!container) return;

    const totals = getTotals();
    const alerts = [];

    if (!transactions.length) {

        alerts.push(
            "💡 Adicione lançamentos para começar sua análise financeira."
        );

    } else {

        if (totals.expense > totals.income) {

            alerts.push(
                "🚨 Seus gastos estão acima das receitas."
            );
        }

        if (
            totals.income > 0 &&
            totals.economy < 10 &&
            totals.expense <= totals.income
        ) {

            alerts.push(
                "⚠️ Sua margem de economia está abaixo de 10%."
            );
        }

        const expenses =
            getExpenseByCategory();

        budgets.forEach(budget => {

            const spent =
                expenses[budget.category] || 0;

            if (spent >= budget.limit) {

                alerts.push(
                    `🚨 Você atingiu o limite de ${budget.category}.`
                );

            } else if (
                spent >= budget.limit * 0.8
            ) {

                alerts.push(
                    `⚠️ Você já utilizou mais de 80% do orçamento de ${budget.category}.`
                );
            }
        });

        if (!alerts.length) {

            alerts.push(
                "✅ Nenhum alerta financeiro importante no momento."
            );
        }
    }

    container.innerHTML =
        alerts.map(
            alert => `
                <div class="health-item">
                    ${escapeHTML(alert)}
                </div>
            `
        ).join("");
}


/* =========================================================
   COMPARAÇÃO MENSAL
   ========================================================= */

function renderMonthlyComparison() {

    const container =
        $("monthlyComparison");

    if (!container) return;

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        const date =
            new Date(transaction.date + "T12:00:00");

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {

            if (transaction.type === "income") {
                income += Number(transaction.amount);
            } else {
                expense += Number(transaction.amount);
            }
        }
    });

    container.innerHTML = `
        <p>
            <strong>Receitas neste mês:</strong>
            ${formatCurrency(income)}
        </p>

        <p>
            <strong>Despesas neste mês:</strong>
            ${formatCurrency(expense)}
        </p>

        <p>
            <strong>Resultado:</strong>
            ${formatCurrency(income - expense)}
        </p>
    `;
}


/* =========================================================
   PREVISÃO DO FIM DO MÊS
   ========================================================= */

function calculateMonthForecast() {

    const now = new Date();

    const day =
        now.getDate();

    const daysInMonth =
        new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        ).getDate();

    const totals = getTotals();

    if (day <= 0) {
        return totals.balance;
    }

    const dailyExpense =
        totals.expense / day;

    const remainingDays =
        daysInMonth - day;

    return (
        totals.balance -
        dailyExpense * remainingDays
    );
}


/* =========================================================
   ANÁLISE PREMIUM
   ========================================================= */

function renderPremiumAnalysis() {

    const container =
        $("premiumAnalysis");

    if (!container) return;

    const totals = getTotals();

    const forecast =
        calculateMonthForecast();

    let text = "";

    if (!transactions.length) {

        text =
            "Cadastre seus lançamentos para receber uma análise personalizada.";

    } else if (forecast < 0) {

        text =
            `⏳ Mantendo o ritmo atual de gastos, sua projeção para o fim do mês é ${formatCurrency(forecast)}. Vale reduzir as despesas nos próximos dias.`;

    } else {

        text =
            `⏳ Mantendo o ritmo atual, sua projeção para o fim do mês é de ${formatCurrency(forecast)}.`;

    }

    container.innerHTML = `
        <p>
            ${text}
        </p>

        <br>

        <p>
            Seu saldo atual é
            <strong>
                ${formatCurrency(totals.balance)}
            </strong>.
        </p>
    `;
}


/* =========================================================
   SIMULADOR
   ========================================================= */

function simulateExpense() {

    const amount =
        Number($("simulationAmount")?.value);

    const result =
        $("simulationResult");

    if (!result) return;

    if (!amount || amount <= 0) {

        result.textContent =
            "Digite um valor válido.";

        return;
    }

    const totals =
        getTotals();

    const simulated =
        totals.balance - amount;

    if (simulated < 0) {

        result.innerHTML = `
            ⚠️ Essa despesa deixaria seu saldo em
            <strong>
                ${formatCurrency(simulated)}
            </strong>.
        `;

    } else {

        result.innerHTML = `
            Após essa despesa, seu saldo seria
            <strong>
                ${formatCurrency(simulated)}
            </strong>.
        `;
    }
}


/* =========================================================
   TEMA ESCURO
   ========================================================= */

function applyTheme() {

    const dark =
        localStorage.getItem(
            STORAGE_KEYS.darkMode
        ) === "true";

    document.body.classList.toggle(
        "dark",
        dark
    );

    if ($("themeBtn")) {

        $("themeBtn").innerHTML =
            dark
                ? "<span>☀️</span><span>Tema claro</span>"
                : "<span>🌙</span><span>Tema escuro</span>";
    }
}

function toggleTheme() {

    const isDark =
        document.body.classList.toggle("dark");

    localStorage.setItem(
        STORAGE_KEYS.darkMode,
        String(isDark)
    );

    if ($("themeBtn")) {

        $("themeBtn").innerHTML =
            isDark
                ? "<span>☀️</span><span>Tema claro</span>"
                : "<span>🌙</span><span>Tema escuro</span>";
    }
}


/* =========================================================
   EXPORTAR DADOS
   ========================================================= */

function exportData() {

    const data = {
        app: "ControleS",
        exportedAt: new Date().toISOString(),
        user: currentUser,
        transactions,
        goals,
        budgets
    };

    const blob =
        new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download =
        `controles-backup-${todayISO()}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* =========================================================
   PREMIUM
   ========================================================= */

function subscribePremium() {

    if (!currentUser) {
        alert("Entre na sua conta primeiro.");
        return;
    }

    if (currentUser.premium) {

        alert(
            "Sua conta já possui o ControleS Premium."
        );

        return;
    }

    const confirmed =
        confirm(
            "Ativar o Premium de teste nesta versão?"
        );

    if (!confirmed) return;

    currentUser.premium = true;

    saveUser(currentUser);

    updateUserInterface();
    updatePremium();

    alert(
        "Premium ativado nesta versão de teste."
    );
}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    /* LOGIN */

    $("loginForm")?.addEventListener(
        "submit",
        handleLogin
    );

    $("logoutBtn")?.addEventListener(
        "click",
        logout
    );


    /* NAVEGAÇÃO */

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.section
                    );
                }
            );
        });


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (
                button.classList.contains("nav-item")
            ) {
                return;
            }

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.section;

                    if (section) {
                        showSection(section);
                    }
                }
            );
        });


    /* MENU MOBILE */

    $("mobileMenuBtn")?.addEventListener(
        "click",
        () => {

            $("sidebar")
                ?.classList.toggle("mobile-open");
        }
    );


    /* NOVO LANÇAMENTO */

    $("openTransactionBtn")
        ?.addEventListener(
            "click",
            () => openTransactionModal()
        );

    $("newTransactionButton")
        ?.addEventListener(
            "click",
            () => openTransactionModal()
        );


    /* MODAL TRANSAÇÃO */

    $("closeModal")
        ?.addEventListener(
            "click",
            closeTransactionModal
        );

    $("transactionForm")
        ?.addEventListener(
            "submit",
            addTransaction
        );

    document
        .querySelectorAll(".type-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentTransactionType =
                        button.dataset.type;

                    updateTransactionTypeButtons();
                }
            );
        });


    /* FILTROS */

    $("searchInput")
        ?.addEventListener(
            "input",
            renderTransactions
        );

    $("typeFilter")
        ?.addEventListener(
            "change",
            renderTransactions
        );

    $("categoryFilter")
        ?.addEventListener(
            "change",
            renderTransactions
        );


    /* MODAL META */

    $("newGoalBtn")
        ?.addEventListener(
            "click",
            openGoalModal
        );

    $("closeGoalModal")
        ?.addEventListener(
            "click",
            closeGoalModal
        );

    $("goalForm")
        ?.addEventListener(
            "submit",
            createGoal
        );


    /* MODAL ORÇAMENTO */

    $("newBudgetBtn")
        ?.addEventListener(
            "click",
            openBudgetModal
        );

    $("closeBudgetModal")
        ?.addEventListener(
            "click",
            closeBudgetModal
        );

    $("budgetForm")
        ?.addEventListener(
            "submit",
            createBudget
        );


    /* SIMULADOR */

    $("simulateBtn")
        ?.addEventListener(
            "click",
            simulateExpense
        );


    /* TEMA */

    $("themeBtn")
        ?.addEventListener(
            "click",
            toggleTheme
        );


    /* EXPORTAÇÃO */

    $("exportDataBtn")
        ?.addEventListener(
            "click",
            exportData
        );


    /* PREMIUM */

    $("subscribePremiumBtn")
        ?.addEventListener(
            "click",
            subscribePremium
        );


    /* CLIQUES DINÂMICOS */

    document.addEventListener(
        "click",
        event => {

            const deleteTransactionButton =
                event.target.closest(
                    "[data-delete-transaction]"
                );

            if (deleteTransactionButton) {

                deleteTransaction(
                    deleteTransactionButton
                        .dataset
                        .deleteTransaction
                );

                return;
            }


            const deleteGoalButton =
                event.target.closest(
                    "[data-delete-goal]"
                );

            if (deleteGoalButton) {

                deleteGoal(
                    deleteGoalButton
                        .dataset
                        .deleteGoal
                );

                return;
            }


            const deleteBudgetButton =
                event.target.closest(
                    "[data-delete-budget]"
                );

            if (deleteBudgetButton) {

                budgets =
                    budgets.filter(
                        budget =>
                            budget.id !==
                            deleteBudgetButton
                                .dataset
                                .deleteBudget
                    );

                saveData();
                renderBudgets();

                return;
            }
        }
    );


    /* FECHAR MODAIS CLICANDO NO FUNDO */

    document
        .querySelectorAll(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                () => {

                    const modal =
                        overlay.closest(".modal");

                    modal?.classList.add("hidden");
                }
            );
        });


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            document
                .querySelectorAll(".modal")
                .forEach(modal => {
                    modal.classList.add("hidden");
                });
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function init() {

    loadUser();
    loadData();

    applyTheme();
    setupEvents();
    updateCategoryFilter();

    if ($("dateInput")) {
        $("dateInput").value = todayISO();
    }

    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }
}

document.addEventListener(
    "DOMContentLoaded",
    init
);

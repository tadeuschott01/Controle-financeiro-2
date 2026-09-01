/* =====================================================
   CONTROLES — APP.JS
   VERSÃO PREMIUM
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTOS
    ========================= */

    const loginScreen = document.getElementById("loginScreen");
    const loginForm = document.getElementById("loginForm");
    const app = document.getElementById("app");

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const userPlan = document.getElementById("userPlan");
    const pageTitle = document.getElementById("pageTitle");
    const currentDate = document.getElementById("currentDate");

    const transactionModal = document.getElementById("transactionModal");
    const transactionForm = document.getElementById("transactionForm");

    const descriptionInput = document.getElementById("descriptionInput");
    const amountInput = document.getElementById("amountInput");
    const dateInput = document.getElementById("dateInput");
    const frequencyInput = document.getElementById("frequencyInput");
    const transactionCategory = document.getElementById("transactionCategory");

    const recentTransactions = document.getElementById("recentTransactions");
    const allTransactions = document.getElementById("allTransactions");

    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const balanceValue = document.getElementById("balanceValue");
    const incomeValue = document.getElementById("incomeValue");
    const expenseValue = document.getElementById("expenseValue");
    const economyValue = document.getElementById("economyValue");

    const categoryList = document.getElementById("categoryList");
    const reportAnalysis = document.getElementById("reportAnalysis");
    const monthForecast = document.getElementById("monthForecast");

    const goalModal = document.getElementById("goalModal");
    const goalForm = document.getElementById("goalForm");

    const budgetModal = document.getElementById("budgetModal");
    const budgetForm = document.getElementById("budgetForm");

    /* =========================
       DADOS
    ========================= */

    let transactions = loadJSON(
        "controles_transactions",
        []
    );

    let currentUser = loadJSON(
        "controles_user",
        null
    );

    let goals = loadJSON(
        "controles_goals",
        []
    );

    let budgets = loadJSON(
        "controles_budgets",
        {}
    );

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;

    const categories = [
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

    /* =========================
       UTILITÁRIOS
    ========================= */

    function loadJSON(key, fallback) {

        try {

            const data = localStorage.getItem(key);

            return data
                ? JSON.parse(data)
                : fallback;

        } catch {

            return fallback;

        }

    }

    function saveTransactions() {

        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
        );

    }

    function saveGoals() {

        localStorage.setItem(
            "controles_goals",
            JSON.stringify(goals)
        );

    }

    function saveBudgets() {

        localStorage.setItem(
            "controles_budgets",
            JSON.stringify(budgets)
        );

    }

    function formatMoney(value) {

        return Number(value || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }

    function formatDate(dateString) {

        if (!dateString) return "";

        const date = new Date(
            dateString + "T00:00:00"
        );

        return date.toLocaleDateString("pt-BR");

    }

    function todayISO() {

        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

    }

    function frequencyLabel(frequency) {

        const labels = {
            once: "Única",
            daily: "Diária",
            weekly: "Semanal",
            monthly: "Mensal"
        };

        return labels[frequency] || "Única";

    }

    function escapeHTML(text) {

        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    function isPremium() {

        return currentUser &&
            currentUser.plan === "premium";

    }

    /* =========================
       LOGIN
    ========================= */

    function loadUser() {

        if (!currentUser) {

            loginScreen.classList.remove("hidden");
            app.classList.add("hidden");

            return;

        }

        loginScreen.classList.add("hidden");
        app.classList.remove("hidden");

        userName.textContent = currentUser.name;
        welcomeName.textContent = currentUser.name;

        userAvatar.textContent =
            currentUser.name
                .charAt(0)
                .toUpperCase();

        userPlan.textContent =
            isPremium()
                ? "ControleS Premium ⭐"
                : "ControleS Grátis";

        updateAll();

    }

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                document.getElementById("loginName")
                    .value.trim();

            const email =
                document.getElementById("loginEmail")
                    .value.trim();

            const password =
                document.getElementById("loginPassword")
                    .value;

            if (!name || !email || !password) {
                return;
            }

            currentUser = {
                name,
                email,
                plan: "free"
            };

            localStorage.setItem(
                "controles_user",
                JSON.stringify(currentUser)
            );

            loadUser();

        }
    );

    /* =========================
       LOGOUT
    ========================= */

    document
        .getElementById("logoutBtn")
        .addEventListener("click", () => {

            localStorage.removeItem(
                "controles_user"
            );

            currentUser = null;

            app.classList.add("hidden");
            loginScreen.classList.remove("hidden");

        });

    /* =========================
       NAVEGAÇÃO
    ========================= */

    const navItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".section");

    function openSection(sectionName) {

        sections.forEach(section => {
            section.classList.add("hidden");
        });

        const selected =
            document.getElementById(sectionName);

        if (selected) {
            selected.classList.remove("hidden");
        }

        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );

        });

        const titles = {
            dashboard: "Dashboard",
            transactions: "Lançamentos",
            categories: "Categorias",
            reports: "Relatórios",
            premium: "Premium"
        };

        pageTitle.textContent =
            titles[sectionName] || "Dashboard";

        if (sectionName === "premium") {
            updatePremium();
        }

    }

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            openSection(
                item.dataset.section
            );

            document
                .getElementById("sidebar")
                .classList.remove("mobile-open");

        });

    });

    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (!button.classList.contains("nav-item")) {

                button.addEventListener(
                    "click",
                    () => {
                        openSection(
                            button.dataset.section
                        );
                    }
                );

            }

        });

    /* =========================
       MOBILE
    ========================= */

    document
        .getElementById("mobileMenuBtn")
        .addEventListener("click", () => {

            document
                .getElementById("sidebar")
                .classList.toggle("mobile-open");

        });

    /* =========================
       MODAL LANÇAMENTO
    ========================= */

    function openModal() {

        transactionModal.classList.remove("hidden");

        dateInput.value =
            dateInput.value || todayISO();

        frequencyInput.value = "once";

        descriptionInput.focus();

    }

    function closeModal() {

        transactionModal.classList.add("hidden");

        transactionForm.reset();

        selectedType = "income";

        updateTypeButtons();

        dateInput.value = todayISO();
        frequencyInput.value = "once";

    }

    document
        .getElementById("openTransactionBtn")
        .addEventListener("click", openModal);

    document
        .getElementById("newTransactionButton")
        .addEventListener("click", openModal);

    document
        .getElementById("closeModal")
        .addEventListener("click", closeModal);

    document
        .querySelector("#transactionModal .modal-overlay")
        .addEventListener("click", closeModal);

    /* =========================
       TIPO
    ========================= */

    const typeButtons =
        document.querySelectorAll(".type-option");

    function updateTypeButtons() {

        typeButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.type === selectedType
            );

        });

    }

    typeButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedType =
                button.dataset.type;

            updateTypeButtons();

        });

    });

    /* =========================
       SALVAR
    ========================= */

    transactionForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const description =
                descriptionInput.value.trim();

            const amount =
                Number(amountInput.value);

            const date =
                dateInput.value;

            const frequency =
                frequencyInput.value || "once";

            const category =
                transactionCategory.value;

            if (
                !description ||
                amount <= 0 ||
                !date
            ) {
                return;
            }

            const transaction = {

                id:
                    `${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}`,

                type:
                    selectedType,

                description,

                amount,

                date,

                frequency,

                category

            };

            transactions.push(transaction);

            saveTransactions();

            closeModal();

            updateAll();

        }
    );

    /* =========================
       RECORRÊNCIA
    ========================= */

    function transactionOccurrences(
        transaction,
        startDate,
        endDate
    ) {

        const occurrences = [];

        const original =
            new Date(
                transaction.date + "T00:00:00"
            );

        let current =
            new Date(original);

        const frequency =
            transaction.frequency || "once";

        if (frequency === "once") {

            if (
                current >= startDate &&
                current <= endDate
            ) {
                occurrences.push(
                    new Date(current)
                );
            }

            return occurrences;

        }

        while (current <= endDate) {

            if (current >= startDate) {

                occurrences.push(
                    new Date(current)
                );

            }

            if (frequency === "daily") {

                current.setDate(
                    current.getDate() + 1
                );

            } else if (frequency === "weekly") {

                current.setDate(
                    current.getDate() + 7
                );

            } else if (frequency === "monthly") {

                /*
                 IMPORTANTE:
                 mensal acontece uma vez por mês.
                 */

                const originalDay =
                    original.getDate();

                const nextMonth =
                    current.getMonth() + 1;

                const nextYear =
                    current.getFullYear();

                current =
                    new Date(
                        nextYear,
                        nextMonth,
                        1
                    );

                const lastDay =
                    new Date(
                        nextYear,
                        nextMonth + 1,
                        0
                    ).getDate();

                current.setDate(
                    Math.min(
                        originalDay,
                        lastDay
                    )
                );

            } else {

                break;

            }

        }

        return occurrences;

    }

    function getPeriodTransactions(
        startDate,
        endDate
    ) {

        const result = [];

        transactions.forEach(transaction => {

            const occurrences =
                transactionOccurrences(
                    transaction,
                    startDate,
                    endDate
                );

            occurrences.forEach(date => {

                result.push({
                    ...transaction,
                    occurrenceDate: date
                });

            });

        });

        return result;

    }

    /* =========================
       MÊS ATUAL
    ========================= */

    function getCurrentMonthRange() {

        const now = new Date();

        return {

            start:
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                    0,
                    0,
                    0
                ),

            end:
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                    23,
                    59,
                    59
                )

        };

    }

    function calculateMonthTotals() {

        const { start, end } =
            getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        let income = 0;
        let expense = 0;

        items.forEach(item => {

            if (item.type === "income") {
                income += Number(item.amount);
            } else {
                expense += Number(item.amount);
            }

        });

        return {
            income,
            expense,
            balance: income - expense
        };

    }

    /* =========================
       DASHBOARD
    ========================= */

    function updateDashboard() {

        const totals =
            calculateMonthTotals();

        balanceValue.textContent =
            formatMoney(totals.balance);

        incomeValue.textContent =
            formatMoney(totals.income);

        expenseValue.textContent =
            formatMoney(totals.expense);

        let economy = 0;

        if (totals.income > 0) {

            economy =
                (totals.balance /
                    totals.income) * 100;

        }

        economyValue.textContent =
            `${economy.toFixed(1)}%`;

        currentDate.textContent =
            new Date().toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        updateFinanceChart();

    }

    /* =========================
       HTML TRANSAÇÃO
    ========================= */

    function createTransactionHTML(transaction) {

        const sign =
            transaction.type === "income"
                ? "+"
                : "-";

        const valueClass =
            transaction.type === "income"
                ? "income"
                : "expense";

        const icon =
            transaction.type === "income"
                ? "↗"
                : "↘";

        const occurrenceDate =
            transaction.occurrenceDate
                ? transaction.occurrenceDate
                    .toISOString()
                    .split("T")[0]
                : transaction.date;

        return `

            <div class="transaction">

                <div class="transaction-icon">
                    ${icon}
                </div>

                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            transaction.category
                        )}
                        •
                        ${formatDate(occurrenceDate)}
                        •
                        ${frequencyLabel(
                            transaction.frequency
                        )}
                    </small>

                </div>

                <div class="transaction-value ${valueClass}">
                    ${sign}${formatMoney(
                        transaction.amount
                    )}
                </div>

                <button
                    class="transaction-delete"
                    data-delete-id="${String(
                        transaction.id
                    )}"
                    title="Excluir lançamento"
                    type="button"
                >
                    ×
                </button>

            </div>

        `;

    }

    /* =========================
       RECENTES
    ========================= */

    function updateRecentTransactions() {

        const { start, end } =
            getCurrentMonthRange();

        let items =
            getPeriodTransactions(
                start,
                end
            );

        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );

        items =
            items.slice(0, 5);

        if (!items.length) {

            recentTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento neste mês.
                </div>
            `;

            return;

        }

        recentTransactions.innerHTML =
            items
                .map(createTransactionHTML)
                .join("");

    }

    /* =========================
       TODOS OS LANÇAMENTOS
    ========================= */

    function updateAllTransactions() {

        /*
         Mostra os lançamentos reais
         e ocorrências dentro de uma janela
         ampla apenas para consulta.
        */

        const now = new Date();

        const start =
            new Date(
                now.getFullYear() - 2,
                now.getMonth(),
                1
            );

        const end =
            new Date(
                now.getFullYear() + 2,
                now.getMonth() + 1,
                0
            );

        let items =
            getPeriodTransactions(
                start,
                end
            );

        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const type =
            typeFilter.value;

        const category =
            categoryFilter.value;

        items =
            items.filter(item => {

                const matchesSearch =
                    !search ||
                    item.description
                        .toLowerCase()
                        .includes(search) ||
                    item.category
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    type === "all" ||
                    item.type === type;

                const matchesCategory =
                    category === "all" ||
                    item.category === category;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            });

        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );

        if (!items.length) {

            allTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento encontrado.
                </div>
            `;

            return;

        }

        allTransactions.innerHTML =
            items
                .map(createTransactionHTML)
                .join("");

    }

    /* =========================
       EXCLUSÃO
    ========================= */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (!button) return;

            const id =
                String(
                    button.dataset.deleteId
                );

            const index =
                transactions.findIndex(
                    transaction =>
                        String(transaction.id) === id
                );

            if (index === -1) return;

            transactions.splice(index, 1);

            saveTransactions();

            updateAll();

        }
    );

    /* =========================
       FILTROS
    ========================= */

    searchInput.addEventListener(
        "input",
        updateAllTransactions
    );

    typeFilter.addEventListener(
        "change",
        updateAllTransactions
    );

    categoryFilter.addEventListener(
        "change",
        updateAllTransactions
    );

    function updateCategoryFilter() {

        const current =
            categoryFilter.value;

        categoryFilter.innerHTML = `
            <option value="all">
                Todas categorias
            </option>
        `;

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);

        });

        categoryFilter.value =
            categories.includes(current)
                ? current
                : "all";

    }

    /* =========================
       GRÁFICO FINANCEIRO
    ========================= */

    function updateFinanceChart() {

        const canvas =
            document.getElementById(
                "financeChart"
            );

        if (!canvas) return;

        const totals =
            calculateMonthTotals();

        if (financeChart) {
            financeChart.destroy();
        }

        financeChart =
            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: [
                        "Receitas",
                        "Despesas"
                    ],

                    datasets: [{
                        data: [
                            totals.income,
                            totals.expense
                        ],
                        borderWidth: 0
                    }]

                },

                options: {

                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                callback:
                                    value =>
                                        formatMoney(value)
                            }

                        }

                    }

                }

            });

    }

    /* =========================
       CATEGORIAS
    ========================= */

    function calculateCategories() {

        const { start, end } =
            getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        const totals = {};

        items.forEach(item => {

            if (item.type !== "expense") {
                return;
            }

            if (!totals[item.category]) {
                totals[item.category] = 0;
            }

            totals[item.category] +=
                Number(item.amount);

        });

        return totals;

    }

    function updateCategories() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) => b[1] - a[1]
                );

        if (!entries.length) {

            categoryList.innerHTML = `
                <div class="empty-state">
                    Nenhuma despesa cadastrada neste mês.
                </div>
            `;

            updateCategoryChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum, [, value]) =>
                    sum + value,
                0
            );

        categoryList.innerHTML =
            entries.map(
                ([category, value]) => {

                    const percentage =
                        total > 0
                            ? value / total * 100
                            : 0;

                    return `

                        <div class="category-summary-item">

                            <div class="category-summary-left">

                                <div class="category-dot"></div>

                                <strong>
                                    ${escapeHTML(category)}
                                </strong>

                            </div>

                            <span>
                                ${formatMoney(value)}
                                (${percentage.toFixed(1)}%)
                            </span>

                        </div>

                    `;

                }
            ).join("");

        updateCategoryChart(totals);

    }

    function updateCategoryChart(totals) {

        const canvas =
            document.getElementById(
                "categoryChart"
            );

        if (!canvas) return;

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart =
            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(totals),

                    datasets: [{
                        data:
                            Object.values(totals),
                        borderWidth: 2
                    }]

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

    /* =========================
       RELATÓRIOS
    ========================= */

    function updateReports() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) => b[1] - a[1]
                );

        if (!entries.length) {

            reportAnalysis.innerHTML = `
                <div class="empty-state">
                    Cadastre despesas para gerar sua análise.
                </div>
            `;

            updateReportChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum, [, value]) =>
                    sum + value,
                0
            );

        const biggest =
            entries[0];

        reportAnalysis.innerHTML = `

            <div class="category-summary-item">

                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Total gasto</strong>
                </div>

                <span>
                    ${formatMoney(total)}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Maior categoria</strong>
                </div>

                <span>
                    ${escapeHTML(biggest[0])}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Maior gasto</strong>
                </div>

                <span>
                    ${formatMoney(biggest[1])}
                </span>

            </div>

        `;

        updateReportChart(totals);

    }

    function updateReportChart(totals) {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );

        if (!canvas) return;

        if (reportCategoryChart) {
            reportCategoryChart.destroy();
        }

        reportCategoryChart =
            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(totals),

                    datasets: [{
                        data:
                            Object.values(totals),
                        borderWidth: 2
                    }]

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

    /* =================================================
       PREMIUM
    ================================================= */

    function updatePremium() {

        updatePremiumOverview();
        updateForecast();
        updateGoals();
        updateAlerts();
        updateComparison();
        updateBudgets();
        updatePremiumAnalysis();

    }

    /* =========================
       VISÃO PREMIUM
    ========================= */

    function updatePremiumOverview() {

        const totals =
            calculateMonthTotals();

        const economy =
            totals.income > 0
                ? (totals.balance /
                    totals.income) * 100
                : 0;

        const premiumEconomy =
            document.getElementById(
                "premiumEconomy"
            );

        const text =
            document.getElementById(
                "premiumPerformanceText"
            );

        premiumEconomy.textContent =
            `${economy.toFixed(1)}%`;

        if (totals.income === 0) {

            text.textContent =
                "Adicione lançamentos para acompanhar seu desempenho.";

        } else if (totals.balance >= 0) {

            text.textContent =
                `Você está mantendo ${economy.toFixed(1)}% da sua receita neste mês.`;

        } else {

            text.textContent =
                "Suas despesas estão acima das receitas neste mês.";

        }

    }

    /* =========================
       PREVISÃO DO MÊS
    ========================= */

    function updateForecast() {

        const forecastValue =
            document.getElementById(
                "premiumForecastValue"
            );

        const forecastText =
            document.getElementById(
                "premiumForecastText"
            );

        if (!forecastValue || !forecastText) {
            return;
        }

        const totals =
            calculateMonthTotals();

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            );

        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const elapsedDays =
            Math.max(
                1,
                Math.floor(
                    (today - start) /
                    86400000
                ) + 1
            );

        const totalDays =
            end.getDate();

        const remainingDays =
            Math.max(
                0,
                totalDays - elapsedDays
            );

        /*
         Só usa despesas que aconteceram
         até hoje para projetar o restante.
        */

        const monthItems =
            getPeriodTransactions(
                start,
                today
            );

        let expensesUntilToday = 0;

        monthItems.forEach(item => {

            if (item.type === "expense") {
                expensesUntilToday +=
                    Number(item.amount);
            }

        });

        const averageDailyExpense =
            expensesUntilToday /
            elapsedDays;

        const estimatedFutureExpenses =
            averageDailyExpense *
            remainingDays;

        const forecast =
            totals.balance -
            estimatedFutureExpenses;

        forecastValue.textContent =
            formatMoney(forecast);

        if (forecast >= 0) {

            forecastText.textContent =
                "Mantendo seu ritmo atual, a projeção indica fechamento positivo.";

        } else {

            forecastText.textContent =
                "Mantendo seu ritmo atual, existe possibilidade de fechar o mês no negativo.";

        }

    }

    /* =========================
       METAS
    ========================= */

    function updateGoals() {

        const list =
            document.getElementById(
                "goalsList"
            );

        if (!goals.length) {

            list.innerHTML = `
                <div class="empty-state">
                    Você ainda não criou nenhuma meta.
                </div>
            `;

            return;

        }

        list.innerHTML =
            goals.map(goal => {

                const target =
                    Number(goal.target);

                const saved =
                    Number(goal.saved);

                const percentage =
                    target > 0
                        ? Math.min(
                            100,
                            saved / target * 100
                        )
                        : 0;

                return `

                    <div class="goal-item">

                        <div class="goal-top">

                            <strong>
                                ${escapeHTML(goal.name)}
                            </strong>

                            <span>
                                ${percentage.toFixed(0)}%
                            </span>

                        </div>

                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                        <div class="goal-values">

                            <span>
                                ${formatMoney(saved)}
                            </span>

                            <span>
                                Meta: ${formatMoney(target)}
                            </span>

                            <button
                                class="goal-delete"
                                data-goal-id="${goal.id}"
                                type="button"
                            >
                                ×
                            </button>

                        </div>

                    </div>

                `;

            }).join("");

    }

    document
        .getElementById("addGoalBtn")
        .addEventListener("click", () => {

            goalModal.classList.remove("hidden");

        });

    document
        .getElementById("closeGoalModal")
        .addEventListener("click", () => {

            goalModal.classList.add("hidden");

        });

    goalModal
        .querySelector(".modal-overlay")
        .addEventListener("click", () => {

            goalModal.classList.add("hidden");

        });

    goalForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                document
                    .getElementById("goalName")
                    .value.trim();

            const target =
                Number(
                    document
                        .getElementById("goalTarget")
                        .value
                );

            const saved =
                Number(
                    document
                        .getElementById("goalSaved")
                        .value || 0
                );

            if (!name || target <= 0) {
                return;
            }

            goals.push({

                id:
                    `${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}`,

                name,
                target,
                saved:
                    Math.min(saved, target)

            });

            saveGoals();

            goalForm.reset();

            goalModal.classList.add("hidden");

            updatePremium();

        }
    );

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-goal-id]"
                );

            if (!button) return;

            const id =
                String(
                    button.dataset.goalId
                );

            goals =
                goals.filter(
                    goal =>
                        String(goal.id) !== id
                );

            saveGoals();

            updatePremium();

        }
    );

    /* =========================
       ALERTAS
    ========================= */

    function updateAlerts() {

        const container =
            document.getElementById(
                "premiumAlerts"
            );

        const totals =
            calculateMonthTotals();

        const alerts = [];

        if (
            totals.expense > 0 &&
            totals.income > 0 &&
            totals.expense >
                totals.income * 0.8
        ) {

            alerts.push(
                "Seus gastos já representam mais de 80% das receitas deste mês."
            );

        }

        const categoriesData =
            calculateCategories();

        Object.entries(categoriesData)
            .forEach(
                ([category, value]) => {

                    const limit =
                        Number(
                            budgets[category] || 0
                        );

                    if (
                        limit > 0 &&
                        value > limit
                    ) {

                        alerts.push(
                            `O orçamento de ${category} foi ultrapassado.`
                        );

                    }

                }
            );

        if (!alerts.length) {

            container.innerHTML =
                `<p>Nenhum alerta importante no momento. ✓</p>`;

            return;

        }

        container.innerHTML =
            alerts
                .map(
                    alert =>
                        `<div class="alert-item">🚨 ${escapeHTML(alert)}</div>`
                )
                .join("");

    }

    /* =========================
       COMPARAÇÃO MENSAL
    ========================= */

    function getMonthTotals(
        year,
        month
    ) {

        const start =
            new Date(
                year,
                month,
                1
            );

        const end =
            new Date(
                year,
                month + 1,
                0,
                23,
                59,
                59
            );

        const items =
            getPeriodTransactions(
                start,
                end
            );

        let income = 0;
        let expense = 0;

        items.forEach(item => {

            if (item.type === "income") {
                income += Number(item.amount);
            } else {
                expense += Number(item.amount);
            }

        });

        return {
            income,
            expense,
            balance:
                income - expense
        };

    }

    function updateComparison() {

        const container =
            document.getElementById(
                "monthlyComparison"
            );

        const now =
            new Date();

        const current =
            getMonthTotals(
                now.getFullYear(),
                now.getMonth()
            );

        const previous =
            getMonthTotals(
                now.getFullYear(),
                now.getMonth() - 1
            );

        if (
            current.expense === 0 &&
            previous.expense === 0
        ) {

            container.innerHTML =
                "Ainda não há dados suficientes para comparar.";

            return;

        }

        const difference =
            current.expense -
            previous.expense;

        if (difference < 0) {

            container.innerHTML = `
                Você gastou
                <strong class="comparison-positive">
                    ${formatMoney(Math.abs(difference))}
                </strong>
                a menos que no mês anterior. ✓
            `;

        } else if (difference > 0) {

            container.innerHTML = `
                Você gastou
                <strong class="comparison-negative">
                    ${formatMoney(difference)}
                </strong>
                a mais que no mês anterior.
            `;

        } else {

            container.innerHTML =
                "Seus gastos estão no mesmo nível do mês anterior.";

        }

    }

    /* =========================
       ORÇAMENTOS
    ========================= */

    function prepareBudgetCategories() {

        const select =
            document.getElementById(
                "budgetCategory"
            );

        select.innerHTML = "";

        categories
            .filter(
                category =>
                    category !== "Salário"
            )
            .forEach(category => {

                const option =
                    document.createElement("option");

                option.value = category;
                option.textContent = category;

                select.appendChild(option);

            });

    }

    function updateBudgets() {

        const list =
            document.getElementById(
                "budgetList"
            );

        const entries =
            Object.entries(budgets);

        if (!entries.length) {

            list.innerHTML =
                `<p>Nenhum orçamento definido.</p>`;

            return;

        }

        const totals =
            calculateCategories();

        list.innerHTML =
            entries.map(
                ([category, limit]) => {

                    const spent =
                        Number(
                            totals[category] || 0
                        );

                    const percentage =
                        limit > 0
                            ? Math.min(
                                100,
                                spent / limit * 100
                            )
                            : 0;

                    return `

                        <div class="budget-item">

                            <div class="budget-item-top">

                                <strong>
                                    ${escapeHTML(category)}
                                </strong>

                                <span>
                                    ${formatMoney(spent)}
                                    /
                                    ${formatMoney(limit)}
                                </span>

                            </div>

                            <div class="budget-progress">

                                <div
                                    style="width:${percentage}%"
                                ></div>

                            </div>

                        </div>

                    `;

                }
            ).join("");

    }

    document
        .getElementById("addBudgetBtn")
        .addEventListener("click", () => {

            prepareBudgetCategories();

            budgetModal.classList.remove(
                "hidden"
            );

        });

    document
        .getElementById("closeBudgetModal")
        .addEventListener("click", () => {

            budgetModal.classList.add(
                "hidden"
            );

        });

    budgetModal
        .querySelector(".modal-overlay")
        .addEventListener("click", () => {

            budgetModal.classList.add(
                "hidden"
            );

        });

    budgetForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const category =
                document
                    .getElementById(
                        "budgetCategory"
                    )
                    .value;

            const amount =
                Number(
                    document
                        .getElementById(
                            "budgetAmount"
                        )
                        .value
                );

            if (!category || amount <= 0) {
                return;
            }

            budgets[category] = amount;

            saveBudgets();

            budgetForm.reset();

            budgetModal.classList.add(
                "hidden"
            );

            updatePremium();

        }
    );

    /* =========================
       SIMULADOR
    ========================= */

    document
        .getElementById("simulateBtn")
        .addEventListener("click", () => {

            const amount =
                Number(
                    document
                        .getElementById(
                            "simulationAmount"
                        )
                        .value
                );

            const result =
                document.getElementById(
                    "simulationResult"
                );

            if (amount <= 0) {

                result.textContent =
                    "Digite um valor válido.";

                return;

            }

            const totals =
                calculateMonthTotals();

            const simulated =
                totals.balance - amount;

            if (simulated >= 0) {

                result.innerHTML = `
                    Depois dessa despesa,
                    seu saldo estimado seria
                    <strong class="comparison-positive">
                        ${formatMoney(simulated)}
                    </strong>.
                `;

            } else {

                result.innerHTML = `
                    Essa despesa deixaria seu saldo em
                    <strong class="comparison-negative">
                        ${formatMoney(simulated)}
                    </strong>.
                `;

            }

        });

    /* =========================
       ANÁLISE PREMIUM
    ========================= */

    function updatePremiumAnalysis() {

        const container =
            document.getElementById(
                "premiumAnalysis"
            );

        const totals =
            calculateMonthTotals();

        const categoriesData =
            calculateCategories();

        const entries =
            Object.entries(
                categoriesData
            ).sort(
                (a, b) => b[1] - a[1]
            );

        if (
            totals.income === 0 &&
            totals.expense === 0
        ) {

            container.textContent =
                "Adicione lançamentos para gerar sua análise.";

            return;

        }

        let text =
            `Receitas: ${formatMoney(totals.income)}. ` +
            `Despesas: ${formatMoney(totals.expense)}. ` +
            `Saldo: ${formatMoney(totals.balance)}.`;

        if (entries.length) {

            text +=
                ` Maior categoria de gasto: ${entries[0][0]} ` +
                `(${formatMoney(entries[0][1])}).`;

        }

        container.textContent = text;

    }

    /* =========================
       TEMA
    ========================= */

    document
        .getElementById("themeBtn")
        .addEventListener("click", () => {

            document.body.classList.toggle(
                "dark"
            );

            const dark =
                document.body.classList.contains(
                    "dark"
                );

            localStorage.setItem(
                "controles_dark",
                dark
            );

        });

    if (
        localStorage.getItem(
            "controles_dark"
        ) === "true"
    ) {

        document.body.classList.add("dark");

    }

    /* =========================
       EXPORTAR
    ========================= */

    document
        .getElementById("exportDataBtn")
        .addEventListener("click", () => {

            const data = {

                user:
                    currentUser,

                transactions:
                    transactions,

                goals:
                    goals,

                budgets:
                    budgets,

                exportedAt:
                    new Date().toISOString()

            };

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "controles-dados.json";

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

        });

    /* =========================
       ATIVAR PREMIUM
    ========================= */

    document
        .getElementById(
            "subscribePremiumBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                if (!currentUser) return;

                currentUser.plan =
                    "premium";

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(
                        currentUser
                    )
                );

                userPlan.textContent =
                    "ControleS Premium ⭐";

                updatePremium();

            }
        );

    /* =========================
       ATUALIZAÇÃO GERAL
    ========================= */

    function updateAll() {

        updateCategoryFilter();

        updateDashboard();

        updateRecentTransactions();

        updateAllTransactions();

        updateCategories();

        updateReports();

        updatePremium();

    }

    /* =========================
       INICIALIZAÇÃO
    ========================= */

    dateInput.value =
        todayISO();

    loadUser();

});

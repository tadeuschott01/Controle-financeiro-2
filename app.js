/* ============================================================
   CONTROLES — APP.JS
   Versão completa e funcional
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
    ===================================================== */

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

    /* PREMIUM */

    const premiumEconomyValue =
        document.getElementById("premiumEconomyValue");

    const premiumPerformanceText =
        document.getElementById("premiumPerformanceText");

    const goalsList =
        document.getElementById("goalsList");

    const smartAlerts =
        document.getElementById("smartAlerts");

    const monthlyComparison =
        document.getElementById("monthlyComparison");

    const budgetsList =
        document.getElementById("budgetsList");

    const premiumAnalysis =
        document.getElementById("premiumAnalysis");

    const simulationAmount =
        document.getElementById("simulationAmount");

    const simulationResult =
        document.getElementById("simulationResult");


    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = [];
    let goals = [];
    let budgets = [];

    try {
        transactions = JSON.parse(
            localStorage.getItem("controles_transactions") || "[]"
        );
    } catch {
        transactions = [];
    }

    try {
        goals = JSON.parse(
            localStorage.getItem("controles_goals") || "[]"
        );
    } catch {
        goals = [];
    }

    try {
        budgets = JSON.parse(
            localStorage.getItem("controles_budgets") || "[]"
        );
    } catch {
        budgets = [];
    }

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("controles_user") || "null"
        );
    } catch {
        currentUser = null;
    }

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       CATEGORIAS
    ===================================================== */

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


    /* =====================================================
       SALVAMENTO
    ===================================================== */

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


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

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

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")}`;
    }


    function escapeHTML(text) {

        return String(text ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
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


    /* =====================================================
       LOGIN
    ===================================================== */

    function loadUser() {

        if (!loginScreen || !app) return;

        if (!currentUser) {

            loginScreen.classList.remove("hidden");
            app.classList.add("hidden");

            return;
        }

        loginScreen.classList.add("hidden");
        app.classList.remove("hidden");

        if (userName) {
            userName.textContent =
                currentUser.name;
        }

        if (welcomeName) {
            welcomeName.textContent =
                currentUser.name;
        }

        if (userAvatar) {
            userAvatar.textContent =
                currentUser.name
                    .charAt(0)
                    .toUpperCase();
        }

        if (userPlan) {
            userPlan.textContent =
                currentUser.plan === "premium"
                    ? "ControleS Premium ⭐"
                    : "ControleS Grátis";
        }

        updateAll();
    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const nameInput =
                    document.getElementById("loginName");

                const emailInput =
                    document.getElementById("loginEmail");

                const passwordInput =
                    document.getElementById("loginPassword");

                const name =
                    nameInput?.value.trim() || "";

                const email =
                    emailInput?.value.trim() || "";

                const password =
                    passwordInput?.value || "";

                if (!name || !email || !password) {

                    alert(
                        "Preencha nome, e-mail e senha."
                    );

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
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "controles_user"
                );

                currentUser = null;

                app.classList.add("hidden");
                loginScreen.classList.remove("hidden");
            }
        );
    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

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

        if (pageTitle) {
            pageTitle.textContent =
                titles[sectionName] || "Dashboard";
        }

        if (sectionName === "premium") {
            updatePremium();
        }
    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                openSection(
                    item.dataset.section
                );

                document
                    .getElementById("sidebar")
                    ?.classList.remove("mobile-open");
            }
        );
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


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    ?.classList.toggle("mobile-open");
            }
        );
    }


    /* =====================================================
       MODAL DE LANÇAMENTO
    ===================================================== */

    function openModal() {

        if (!transactionModal) return;

        transactionModal.classList.remove("hidden");

        if (dateInput) {
            dateInput.value =
                dateInput.value || todayISO();
        }

        descriptionInput?.focus();
    }


    function closeModal() {

        transactionModal?.classList.add("hidden");

        transactionForm?.reset();

        selectedType = "income";

        updateTypeButtons();

        if (dateInput) {
            dateInput.value = todayISO();
        }

        if (frequencyInput) {
            frequencyInput.value = "once";
        }
    }


    document
        .getElementById("openTransactionBtn")
        ?.addEventListener("click", openModal);

    document
        .getElementById("newTransactionButton")
        ?.addEventListener("click", openModal);

    document
        .getElementById("closeModal")
        ?.addEventListener("click", closeModal);


    /* =====================================================
       MODAIS PREMIUM
    ===================================================== */

    function openPremiumModal(id) {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.remove("hidden");
        }
    }


    function closePremiumModal(id) {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.add("hidden");
        }
    }


    /* =====================================================
       TIPO RECEITA / DESPESA
    ===================================================== */

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

        button.addEventListener(
            "click",
            () => {

                selectedType =
                    button.dataset.type;

                updateTypeButtons();
            }
        );
    });


    /* =====================================================
       SALVAR LANÇAMENTO
    ===================================================== */

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const description =
                    descriptionInput?.value.trim() || "";

                const amount =
                    Number(amountInput?.value || 0);

                const date =
                    dateInput?.value || "";

                const frequency =
                    frequencyInput?.value || "once";

                const category =
                    transactionCategory?.value || "Outros";

                if (
                    !description ||
                    amount <= 0 ||
                    !date
                ) {

                    alert(
                        "Preencha todos os campos corretamente."
                    );

                    return;
                }

                transactions.push({

                    id:
                        Date.now() +
                        Math.floor(Math.random() * 1000),

                    type:
                        selectedType,

                    description,

                    amount,

                    date,

                    frequency,

                    category
                });

                saveTransactions();

                closeModal();

                updateAll();
            }
        );
    }


    /* =====================================================
       RECORRÊNCIAS
    ===================================================== */

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

        if (Number.isNaN(original.getTime())) {
            return occurrences;
        }

        if (
            transaction.frequency === "once" ||
            !transaction.frequency
        ) {

            if (
                original >= startDate &&
                original <= endDate
            ) {
                occurrences.push(
                    new Date(original)
                );
            }

            return occurrences;
        }

        let current =
            new Date(original);

        if (transaction.frequency === "daily") {

            while (current <= endDate) {

                if (current >= startDate) {
                    occurrences.push(
                        new Date(current)
                    );
                }

                current.setDate(
                    current.getDate() + 1
                );
            }

            return occurrences;
        }

        if (transaction.frequency === "weekly") {

            while (current <= endDate) {

                if (current >= startDate) {
                    occurrences.push(
                        new Date(current)
                    );
                }

                current.setDate(
                    current.getDate() + 7
                );
            }

            return occurrences;
        }

        if (transaction.frequency === "monthly") {

            while (current <= endDate) {

                if (current >= startDate) {
                    occurrences.push(
                        new Date(current)
                    );
                }

                const day =
                    current.getDate();

                current.setMonth(
                    current.getMonth() + 1
                );

                if (current.getDate() !== day) {
                    current.setDate(0);
                }
            }

            return occurrences;
        }

        return occurrences;
    }


    function getPeriodTransactions(
        startDate,
        endDate
    ) {

        const result = [];

        transactions.forEach(transaction => {

            transactionOccurrences(
                transaction,
                startDate,
                endDate
            ).forEach(date => {

                result.push({
                    ...transaction,
                    occurrenceDate: date
                });

            });

        });

        return result;
    }


    /* =====================================================
       MÊS ATUAL
    ===================================================== */

    function getCurrentMonthRange() {

        const now = new Date();

        return {

            start:
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
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

        const {
            start,
            end
        } = getCurrentMonthRange();

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


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const totals =
            calculateMonthTotals();

        if (balanceValue) {
            balanceValue.textContent =
                formatMoney(totals.balance);
        }

        if (incomeValue) {
            incomeValue.textContent =
                formatMoney(totals.income);
        }

        if (expenseValue) {
            expenseValue.textContent =
                formatMoney(totals.expense);
        }

        let economy = 0;

        if (totals.income > 0) {
            economy =
                (totals.balance / totals.income) * 100;
        }

        if (economyValue) {
            economyValue.textContent =
                `${economy.toFixed(1)}%`;
        }

        if (currentDate) {
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
        }

        updateFinanceChart();
    }


    /* =====================================================
       LANÇAMENTOS
    ===================================================== */

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
                    ${sign} ${formatMoney(transaction.amount)}
                </div>

                <button
                    type="button"
                    class="transaction-delete"
                    data-delete-id="${transaction.id}"
                >
                    ×
                </button>

            </div>
        `;
    }


    function updateRecentTransactions() {

        if (!recentTransactions) return;

        const {
            start,
            end
        } = getCurrentMonthRange();

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

        items = items.slice(0, 5);

        if (!items.length) {

            recentTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento neste mês.
                </div>
            `;

            return;
        }

        recentTransactions.innerHTML =
            items.map(
                createTransactionHTML
            ).join("");
    }


    function updateAllTransactions() {

        if (!allTransactions) return;

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 2,
                0,
                23,
                59,
                59
            );

        let items =
            getPeriodTransactions(
                start,
                end
            );

        const search =
            searchInput?.value
                .trim()
                .toLowerCase() || "";

        const type =
            typeFilter?.value || "all";

        const category =
            categoryFilter?.value || "all";

        items = items.filter(item => {

            const description =
                String(
                    item.description || ""
                ).toLowerCase();

            const categoryName =
                String(
                    item.category || ""
                ).toLowerCase();

            return (

                (!search ||
                    description.includes(search) ||
                    categoryName.includes(search))

                &&

                (type === "all" ||
                    item.type === type)

                &&

                (category === "all" ||
                    item.category === category)
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
            items.map(
                createTransactionHTML
            ).join("");
    }


    /* =====================================================
       EXCLUIR LANÇAMENTO
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (!button) return;

            const id =
                Number(button.dataset.deleteId);

            transactions =
                transactions.filter(
                    transaction =>
                        Number(transaction.id) !== id
                );

            saveTransactions();

            updateAll();
        }
    );


    /* =====================================================
       FILTROS
    ===================================================== */

    searchInput?.addEventListener(
        "input",
        updateAllTransactions
    );

    typeFilter?.addEventListener(
        "change",
        updateAllTransactions
    );

    categoryFilter?.addEventListener(
        "change",
        updateAllTransactions
    );


    function updateCategoryFilter() {

        if (!categoryFilter) return;

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


    /* =====================================================
       GRÁFICO FINANCEIRO
    ===================================================== */

    function updateFinanceChart() {

        const canvas =
            document.getElementById(
                "financeChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) return;

        const {
            income,
            expense
        } = calculateMonthTotals();

        financeChart?.destroy();

        financeChart =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {
                        labels: [
                            "Receitas",
                            "Despesas"
                        ],

                        datasets: [{
                            label: "Valor",

                            data: [
                                income,
                                expense
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
                                    callback: value =>
                                        formatMoney(value)
                                }
                            }
                        }
                    }
                }
            );
    }


    /* =====================================================
       CATEGORIAS
    ===================================================== */

    function calculateCategories() {

        const {
            start,
            end
        } = getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        const totals = {};

        items.forEach(item => {

            if (item.type !== "expense") return;

            const category =
                item.category || "Outros";

            totals[category] =
                (totals[category] || 0) +
                Number(item.amount);
        });

        return totals;
    }


    function updateCategories() {

        if (!categoryList) return;

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
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
                            ? (value / total) * 100
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

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) return;

        categoryChart?.destroy();

        categoryChart =
            new Chart(
                canvas,
                {
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
                }
            );
    }


    /* =====================================================
       RELATÓRIOS
    ===================================================== */

    function updateReports() {

        if (!reportAnalysis) return;

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
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
                    <strong>Total gasto</strong>
                </div>

                <span>
                    ${formatMoney(total)}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">
                    <strong>Maior categoria</strong>
                </div>

                <span>
                    ${escapeHTML(biggest[0])}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">
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

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) return;

        reportCategoryChart?.destroy();

        reportCategoryChart =
            new Chart(
                canvas,
                {
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
                }
            );
    }


    /* =====================================================
       PREMIUM — DESEMPENHO
    ===================================================== */

    function updatePremiumPerformance() {

        const totals =
            calculateMonthTotals();

        let economy = 0;

        if (totals.income > 0) {
            economy =
                (totals.balance /
                    totals.income) * 100;
        }

        if (premiumEconomyValue) {
            premiumEconomyValue.textContent =
                `${economy.toFixed(1)}%`;
        }

        if (premiumPerformanceText) {

            if (!totals.income) {

                premiumPerformanceText.textContent =
                    "Cadastre suas receitas e despesas para acompanhar seu desempenho.";

            } else if (economy >= 50) {

                premiumPerformanceText.textContent =
                    "Excelente! Você está mantendo uma boa parte da sua receita.";

            } else if (economy >= 20) {

                premiumPerformanceText.textContent =
                    "Seu resultado está positivo. Continue acompanhando seus gastos.";

            } else if (economy >= 0) {

                premiumPerformanceText.textContent =
                    "Seu saldo está positivo, mas há espaço para melhorar sua economia.";

            } else {

                premiumPerformanceText.textContent =
                    "Suas despesas estão acima das receitas neste mês.";
            }
        }
    }


    /* =====================================================
       PREMIUM — METAS
    ===================================================== */

    function updateGoals() {

        if (!goalsList) return;

        if (!goals.length) {

            goalsList.innerHTML = `
                <div class="empty-state">
                    Você ainda não criou nenhuma meta.
                </div>
            `;

            return;
        }

        goalsList.innerHTML =
            goals.map(goal => {

                const target =
                    Number(goal.target);

                const saved =
                    Number(goal.saved);

                const percentage =
                    target > 0
                        ? Math.min(
                            100,
                            (saved / target) * 100
                        )
                        : 0;

                return `

                    <div class="premium-list-item">

                        <div>

                            <strong>
                                ${escapeHTML(goal.name)}
                            </strong>

                            <small>
                                ${formatMoney(saved)}
                                de
                                ${formatMoney(target)}
                            </small>

                        </div>

                        <strong>
                            ${percentage.toFixed(0)}%
                        </strong>

                        <button
                            type="button"
                            data-delete-goal="${goal.id}"
                        >
                            ×
                        </button>

                    </div>

                `;
            }).join("");
    }


    /* =====================================================
       MODAL DE META
    ===================================================== */

    const goalModal =
        document.getElementById("goalModal");

    const goalForm =
        document.getElementById("goalForm");

    document
        .getElementById("newGoalBtn")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !== "premium"
                ) {

                    alert(
                        "Ative o ControleS Premium para usar as metas."
                    );

                    return;
                }

                openPremiumModal("goalModal");
            }
        );


    document
        .getElementById("closeGoalModal")
        ?.addEventListener(
            "click",
            () =>
                closePremiumModal("goalModal")
        );


    goalModal
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () =>
                closePremiumModal("goalModal")
        );


    if (goalForm) {

        goalForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document
                        .getElementById("goalName")
                        ?.value.trim();

                const target =
                    Number(
                        document
                            .getElementById("goalTarget")
                            ?.value || 0
                    );

                const saved =
                    Number(
                        document
                            .getElementById("goalSaved")
                            ?.value || 0
                    );

                if (!name || target <= 0) {

                    alert(
                        "Informe o nome e o valor da meta."
                    );

                    return;
                }

                goals.push({

                    id:
                        Date.now(),

                    name,

                    target,

                    saved
                });

                saveGoals();

                goalForm.reset();

                closePremiumModal("goalModal");

                updateGoals();
            }
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-goal]"
                );

            if (!button) return;

            const id =
                Number(
                    button.dataset.deleteGoal
                );

            goals =
                goals.filter(
                    goal =>
                        Number(goal.id) !== id
                );

            saveGoals();

            updateGoals();
        }
    );


    /* =====================================================
       PREMIUM — PREVISÃO
    ===================================================== */

    function calculateForecast() {

        const now = new Date();

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const endOfMonth =
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

        const totals =
            calculateMonthTotals();

        const elapsedDays =
            Math.max(
                1,
                Math.floor(
                    (
                        today -
                        startOfMonth
                    ) / 86400000
                ) + 1
            );

        const totalDays =
            endOfMonth.getDate();

        const remainingDays =
            Math.max(
                0,
                totalDays - elapsedDays
            );

        const averageDailyExpense =
            totals.expense /
            elapsedDays;

        const estimatedRemainingExpense =
            averageDailyExpense *
            remainingDays;

        const forecast =
            totals.balance -
            estimatedRemainingExpense;

        return {
            balance: totals.balance,
            income: totals.income,
            expense: totals.expense,
            averageDailyExpense,
            remainingDays,
            forecast
        };
    }


    function updateForecast() {

        if (!monthForecast) return;

        const data =
            calculateForecast();

        if (!transactions.length) {

            monthForecast.innerHTML = `
                <div class="empty-state">
                    Adicione seus lançamentos para visualizar sua previsão financeira.
                </div>
            `;

            return;
        }

        const positive =
            data.forecast >= 0;

        monthForecast.innerHTML = `

            <div class="forecast-card">

                <span>
                    SALDO ATUAL
                </span>

                <strong>
                    ${formatMoney(data.balance)}
                </strong>

            </div>

            <div class="forecast-card">

                <span>
                    GASTO MÉDIO DIÁRIO
                </span>

                <strong>
                    ${formatMoney(
                        data.averageDailyExpense
                    )}
                </strong>

            </div>

            <div class="forecast-card">

                <span>
                    ⏳ PREVISÃO DO FIM DO MÊS
                </span>

                <strong class="${
                    positive
                        ? "forecast-positive"
                        : "forecast-negative"
                }">

                    ${formatMoney(
                        data.forecast
                    )}

                </strong>

            </div>

            <div class="empty-state">

                ${
                    positive
                        ? "Mantendo seu ritmo atual, a projeção indica fechamento positivo."
                        : "Atenção: mantendo seu ritmo atual, a projeção indica saldo negativo."
                }

            </div>
        `;
    }


    /* =====================================================
       PREMIUM — COMPARAÇÃO MENSAL
    ===================================================== */

    function getMonthTotals(offset) {

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() + offset,
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + offset + 1,
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
            balance: income - expense
        };
    }


    function updateMonthlyComparison() {

        if (!monthlyComparison) return;

        const current =
            getMonthTotals(0);

        const previous =
            getMonthTotals(-1);

        const difference =
            current.expense -
            previous.expense;

        let message;

        if (!previous.expense) {

            message =
                "Ainda não existem despesas suficientes no mês anterior para uma comparação completa.";

        } else if (difference > 0) {

            message =
                `Você gastou ${formatMoney(
                    difference
                )} a mais que no mês anterior.`;

        } else if (difference < 0) {

            message =
                `Você gastou ${formatMoney(
                    Math.abs(difference)
                )} a menos que no mês anterior.`;

        } else {

            message =
                "Seus gastos ficaram iguais aos do mês anterior.";
        }

        monthlyComparison.innerHTML = `

            <div class="comparison-item">

                <span>
                    MÊS ANTERIOR
                </span>

                <strong>
                    ${formatMoney(previous.expense)}
                </strong>

            </div>

            <div class="comparison-item">

                <span>
                    MÊS ATUAL
                </span>

                <strong>
                    ${formatMoney(current.expense)}
                </strong>

            </div>

            <div class="empty-state">
                ${message}
            </div>
        `;
    }


    /* =====================================================
       PREMIUM — ORÇAMENTOS
    ===================================================== */

    function updateBudgets() {

        if (!budgetsList) return;

        if (!budgets.length) {

            budgetsList.innerHTML = `
                <div class="empty-state">
                    Nenhum orçamento definido.
                </div>
            `;

            return;
        }

        const spentByCategory =
            calculateCategories();

        budgetsList.innerHTML =
            budgets.map(budget => {

                const spent =
                    Number(
                        spentByCategory[
                            budget.category
                        ] || 0
                    );

                const limit =
                    Number(budget.limit);

                const percentage =
                    limit > 0
                        ? Math.min(
                            100,
                            (spent / limit) * 100
                        )
                        : 0;

                const exceeded =
                    spent > limit;

                return `

                    <div class="premium-list-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    budget.category
                                )}
                            </strong>

                            <small>
                                ${formatMoney(spent)}
                                de
                                ${formatMoney(limit)}
                            </small>

                        </div>

                        <strong>
                            ${percentage.toFixed(0)}%
                        </strong>

                        <button
                            type="button"
                            data-delete-budget="${budget.id}"
                        >
                            ×
                        </button>

                    </div>

                    ${
                        exceeded
                            ? `
                                <div class="empty-state">
                                    ⚠️ Limite ultrapassado nesta categoria.
                                </div>
                            `
                            : ""
                    }
                `;
            }).join("");
    }


    /* =====================================================
       MODAL DE ORÇAMENTO
    ===================================================== */

    const budgetModal =
        document.getElementById("budgetModal");

    const budgetForm =
        document.getElementById("budgetForm");


    document
        .getElementById("newBudgetBtn")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !== "premium"
                ) {

                    alert(
                        "Ative o ControleS Premium para usar os orçamentos."
                    );

                    return;
                }

                openPremiumModal("budgetModal");
            }
        );


    document
        .getElementById("closeBudgetModal")
        ?.addEventListener(
            "click",
            () =>
                closePremiumModal("budgetModal")
        );


    budgetModal
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () =>
                closePremiumModal("budgetModal")
        );


    if (budgetForm) {

        budgetForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const category =
                    document
                        .getElementById("budgetCategory")
                        ?.value;

                const limit =
                    Number(
                        document
                            .getElementById("budgetLimit")
                            ?.value || 0
                    );

                if (!category || limit <= 0) {

                    alert(
                        "Informe a categoria e o limite."
                    );

                    return;
                }

                const existing =
                    budgets.find(
                        budget =>
                            budget.category === category
                    );

                if (existing) {

                    existing.limit = limit;

                } else {

                    budgets.push({

                        id:
                            Date.now(),

                        category,

                        limit
                    });
                }

                saveBudgets();

                budgetForm.reset();

                closePremiumModal("budgetModal");

                updateBudgets();
            }
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-budget]"
                );

            if (!button) return;

            const id =
                Number(
                    button.dataset.deleteBudget
                );

            budgets =
                budgets.filter(
                    budget =>
                        Number(budget.id) !== id
                );

            saveBudgets();

            updateBudgets();
        }
    );


    /* =====================================================
       PREMIUM — SIMULADOR
    ===================================================== */

    document
        .getElementById("simulateBtn")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !== "premium"
                ) {

                    alert(
                        "Ative o ControleS Premium para usar o simulador."
                    );

                    return;
                }

                const amount =
                    Number(
                        simulationAmount?.value || 0
                    );

                if (amount <= 0) {

                    alert(
                        "Informe o valor da nova despesa."
                    );

                    return;
                }

                const totals =
                    calculateMonthTotals();

                const newBalance =
                    totals.balance - amount;

                const positive =
                    newBalance >= 0;

                if (simulationResult) {

                    simulationResult.innerHTML = `

                        <div class="simulation-card">

                            <span>
                                SALDO ATUAL
                            </span>

                            <strong>
                                ${formatMoney(
                                    totals.balance
                                )}
                            </strong>

                            <span>
                                NOVA DESPESA
                            </span>

                            <strong>
                                - ${formatMoney(amount)}
                            </strong>

                            <span>
                                SALDO APÓS A SIMULAÇÃO
                            </span>

                            <strong class="${
                                positive
                                    ? "forecast-positive"
                                    : "forecast-negative"
                            }">
                                ${formatMoney(
                                    newBalance
                                )}
                            </strong>

                        </div>
                    `;
                }
            }
        );


    /* =====================================================
       PREMIUM — ALERTAS INTELIGENTES
       
       Sem alertas agressivos.
       Mostra somente situações relevantes.
    ===================================================== */

    function updateSmartAlerts() {

        if (!smartAlerts) return;

        const alerts = [];

        const totals =
            calculateMonthTotals();

        const categoryTotals =
            calculateCategories();

        if (
            totals.income > 0 &&
            totals.expense > totals.income
        ) {

            alerts.push(
                "Suas despesas estão acima das receitas neste mês."
            );
        }

        Object.entries(categoryTotals)
            .forEach(([category, spent]) => {

                const budget =
                    budgets.find(
                        item =>
                            item.category === category
                    );

                if (
                    budget &&
                    spent > Number(budget.limit)
                ) {

                    alerts.push(
                        `O orçamento de ${category} foi ultrapassado.`
                    );
                }
            });

        if (!alerts.length) {

            smartAlerts.innerHTML = `
                <div class="empty-state">
                    Tudo certo por enquanto. Nenhuma mudança importante identificada. ✓
                </div>
            `;

            return;
        }

        smartAlerts.innerHTML =
            alerts.map(
                alert => `
                    <div class="premium-list-item">
                        <strong>⚠️ ${escapeHTML(alert)}</strong>
                    </div>
                `
            ).join("");
    }


    /* =====================================================
       PREMIUM — ANÁLISE FINANCEIRA
    ===================================================== */

    function updatePremiumAnalysis() {

        if (!premiumAnalysis) return;

        const totals =
            calculateMonthTotals();

        const categoriesData =
            calculateCategories();

        const entries =
            Object.entries(categoriesData)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );

        if (!transactions.length) {

            premiumAnalysis.innerHTML = `
                <div class="empty-state">
                    Cadastre lançamentos para gerar sua análise financeira.
                </div>
            `;

            return;
        }

        const biggest =
            entries[0];

        const economy =
            totals.income > 0
                ? (totals.balance /
                    totals.income) * 100
                : 0;

        premiumAnalysis.innerHTML = `

            <div class="category-summary-item">

                <strong>
                    Receitas
                </strong>

                <span>
                    ${formatMoney(totals.income)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Despesas
                </strong>

                <span>
                    ${formatMoney(totals.expense)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Saldo
                </strong>

                <span>
                    ${formatMoney(totals.balance)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Economia
                </strong>

                <span>
                    ${economy.toFixed(1)}%
                </span>

            </div>

            ${
                biggest
                    ? `
                        <div class="category-summary-item">

                            <strong>
                                Maior categoria de gasto
                            </strong>

                            <span>
                                ${escapeHTML(biggest[0])}
                                —
                                ${formatMoney(biggest[1])}
                            </span>

                        </div>
                    `
                    : ""
            }
        `;
    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    function updatePremium() {

        updatePremiumPerformance();
        updateGoals();
        updateForecast();
        updateMonthlyComparison();
        updateBudgets();
        updateSmartAlerts();
        updatePremiumAnalysis();
    }


    /* =====================================================
       ATIVAR PREMIUM
    ===================================================== */

    const subscribePremiumBtn =
        document.getElementById(
            "subscribePremiumBtn"
        );

    if (subscribePremiumBtn) {

        subscribePremiumBtn.addEventListener(
            "click",
            () => {

                if (!currentUser) {

                    alert(
                        "Entre na sua conta primeiro."
                    );

                    return;
                }

                currentUser.plan =
                    "premium";

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(currentUser)
                );

                if (userPlan) {

                    userPlan.textContent =
                        "ControleS Premium ⭐";
                }

                subscribePremiumBtn.textContent =
                    "Premium ativado ✓";

                subscribePremiumBtn.disabled =
                    true;

                updatePremium();
            }
        );
    }


    /* =====================================================
       TEMA ESCURO
    ===================================================== */

    const themeBtn =
        document.getElementById("themeBtn");

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                document.body.classList.toggle("dark");

                const dark =
                    document.body.classList.contains(
                        "dark"
                    );

                localStorage.setItem(
                    "controles_dark",
                    dark ? "true" : "false"
                );
            }
        );
    }


    if (
        localStorage.getItem(
            "controles_dark"
        ) === "true"
    ) {

        document.body.classList.add("dark");
    }


    /* =====================================================
       EXPORTAÇÃO DE DADOS
       
       Gera um arquivo organizado para guardar os dados.
       Não substitui documentação fiscal oficial.
    ===================================================== */

    const exportDataBtn =
        document.getElementById(
            "exportDataBtn"
        );

    if (exportDataBtn) {

        exportDataBtn.addEventListener(
            "click",
            () => {

                const data = {

                    aplicativo:
                        "ControleS",

                    usuario:
                        currentUser,

                    periodo:
                        new Date().toLocaleDateString(
                            "pt-BR"
                        ),

                    lancamentos:
                        transactions,

                    metas:
                        goals,

                    orcamentos:
                        budgets,

                    exportadoEm:
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
                                "application/json;charset=utf-8"
                        }
                    );

                const url =
                    URL.createObjectURL(blob);

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    `controles-exportacao-${todayISO()}.json`;

                document.body.appendChild(link);

                link.click();

                link.remove();

                URL.revokeObjectURL(url);
            }
        );
    }


    /* =====================================================
       FECHAR MODAIS COM ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            document
                .querySelectorAll(".modal")
                .forEach(modal => {
                    modal.classList.add("hidden");
                });
        }
    );


    /* =====================================================
       ATUALIZAÇÃO GERAL
    ===================================================== */

    function updateAll() {

        updateCategoryFilter();

        updateDashboard();

        updateRecentTransactions();

        updateAllTransactions();

        updateCategories();

        updateReports();

        updatePremium();
    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    if (dateInput) {
        dateInput.value = todayISO();
    }

    updateTypeButtons();

    loadUser();

});

/* =====================================================
   CONTROLES — APP.JS
   Versão completa e corrigida
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
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

    const transactionModal =
        document.getElementById("transactionModal");

    const transactionForm =
        document.getElementById("transactionForm");

    const descriptionInput =
        document.getElementById("descriptionInput");

    const amountInput =
        document.getElementById("amountInput");

    const dateInput =
        document.getElementById("dateInput");

    const frequencyInput =
        document.getElementById("frequencyInput");

    const transactionCategory =
        document.getElementById("transactionCategory");

    const recentTransactions =
        document.getElementById("recentTransactions");

    const allTransactions =
        document.getElementById("allTransactions");

    const searchInput =
        document.getElementById("searchInput");

    const typeFilter =
        document.getElementById("typeFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const balanceValue =
        document.getElementById("balanceValue");

    const incomeValue =
        document.getElementById("incomeValue");

    const expenseValue =
        document.getElementById("expenseValue");

    const economyValue =
        document.getElementById("economyValue");

    const categoryList =
        document.getElementById("categoryList");

    const reportAnalysis =
        document.getElementById("reportAnalysis");

    const monthForecast =
        document.getElementById("monthForecast");

    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = [];

    try {
        transactions = JSON.parse(
            localStorage.getItem("controles_transactions") || "[]"
        );
    } catch {
        transactions = [];
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
       UTILITÁRIOS
    ===================================================== */

    function saveTransactions() {
        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
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

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString("pt-BR");
    }

    function todayISO() {

        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
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

        return String(text ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
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
                currentUser.name || "Usuário";
        }

        if (welcomeName) {
            welcomeName.textContent =
                currentUser.name || "Usuário";
        }

        if (userAvatar) {

            userAvatar.textContent =
                (currentUser.name || "U")
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
            function(event) {

                event.preventDefault();

                const nameInput =
                    document.getElementById("loginName");

                const emailInput =
                    document.getElementById("loginEmail");

                const passwordInput =
                    document.getElementById("loginPassword");

                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";

                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";

                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";

                if (!name || !email || !password) {
                    return;
                }

                currentUser = {
                    name: name,
                    email: email,
                    plan: "free"
                };

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(currentUser)
                );

                if (nameInput) nameInput.value = "";
                if (emailInput) emailInput.value = "";
                if (passwordInput) passwordInput.value = "";

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

                if (app) {
                    app.classList.add("hidden");
                }

                if (loginScreen) {
                    loginScreen.classList.remove("hidden");
                }
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

                const sidebar =
                    document.getElementById("sidebar");

                if (sidebar) {
                    sidebar.classList.remove(
                        "mobile-open"
                    );
                }
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

                const sidebar =
                    document.getElementById("sidebar");

                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );
                }
            }
        );
    }

    /* =====================================================
       MODAL DE LANÇAMENTO
    ===================================================== */

    function openModal() {

        if (!transactionModal) return;

        transactionModal.classList.remove("hidden");

        if (dateInput && !dateInput.value) {
            dateInput.value = todayISO();
        }

        if (descriptionInput) {
            setTimeout(() => {
                descriptionInput.focus();
            }, 100);
        }
    }

    function closeModal() {

        if (!transactionModal) return;

        transactionModal.classList.add("hidden");

        if (transactionForm) {
            transactionForm.reset();
        }

        selectedType = "income";

        updateTypeButtons();

        if (dateInput) {
            dateInput.value = todayISO();
        }

        if (frequencyInput) {
            frequencyInput.value = "once";
        }
    }

    const openTransactionBtn =
        document.getElementById("openTransactionBtn");

    if (openTransactionBtn) {
        openTransactionBtn.addEventListener(
            "click",
            openModal
        );
    }

    const newTransactionButton =
        document.getElementById(
            "newTransactionButton"
        );

    if (newTransactionButton) {
        newTransactionButton.addEventListener(
            "click",
            openModal
        );
    }

    const closeModalButton =
        document.getElementById("closeModal");

    if (closeModalButton) {
        closeModalButton.addEventListener(
            "click",
            closeModal
        );
    }

    const modalOverlay =
        document.querySelector(
            "#transactionModal .modal-overlay"
        );

    if (modalOverlay) {
        modalOverlay.addEventListener(
            "click",
            closeModal
        );
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
                    descriptionInput
                        ? descriptionInput.value.trim()
                        : "";

                const amount =
                    amountInput
                        ? Number(amountInput.value)
                        : 0;

                const date =
                    dateInput
                        ? dateInput.value
                        : "";

                const frequency =
                    frequencyInput
                        ? frequencyInput.value
                        : "once";

                const category =
                    transactionCategory
                        ? transactionCategory.value
                        : "Outros";

                if (
                    !description ||
                    !amount ||
                    amount <= 0 ||
                    !date
                ) {
                    return;
                }

                const transaction = {

                    id:
                        Date.now() +
                        Math.floor(
                            Math.random() * 1000
                        ),

                    type:
                        selectedType,

                    description:
                        description,

                    amount:
                        amount,

                    date:
                        date,

                    frequency:
                        frequency,

                    category:
                        category
                };

                transactions.push(transaction);

                saveTransactions();

                closeModal();

                updateAll();
            }
        );
    }

    /* =====================================================
       OCORRÊNCIAS
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

                const originalDay =
                    current.getDate();

                current.setMonth(
                    current.getMonth() + 1
                );

                if (
                    current.getDate() !== originalDay
                ) {

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

            const occurrences =
                transactionOccurrences(
                    transaction,
                    startDate,
                    endDate
                );

            occurrences.forEach(date => {

                result.push({

                    ...transaction,

                    occurrenceDate:
                        date
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

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                0,
                0,
                0
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );

        return {
            start,
            end
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

            balance:
                income - expense
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
                formatMoney(
                    totals.balance
                );
        }

        if (incomeValue) {

            incomeValue.textContent =
                formatMoney(
                    totals.income
                );
        }

        if (expenseValue) {

            expenseValue.textContent =
                formatMoney(
                    totals.expense
                );
        }

        let economy = 0;

        if (totals.income > 0) {

            economy =
                (
                    totals.balance /
                    totals.income
                ) * 100;
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
       HTML DOS LANÇAMENTOS
    ===================================================== */

    function createTransactionHTML(
        transaction
    ) {

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

                        ${formatDate(
                            occurrenceDate
                        )}

                        •

                        ${frequencyLabel(
                            transaction.frequency
                        )}

                    </small>

                </div>

                <div class="transaction-value ${valueClass}">

                    ${sign}
                    ${formatMoney(
                        transaction.amount
                    )}

                </div>

                <button
                    type="button"
                    class="transaction-delete"
                    data-delete-id="${transaction.id}"
                    title="Excluir lançamento"
                >
                    ×
                </button>

            </div>
        `;
    }

    /* =====================================================
       LANÇAMENTOS RECENTES
    ===================================================== */

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

    /* =====================================================
       TODOS OS LANÇAMENTOS
    ===================================================== */

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
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const type =
            typeFilter
                ? typeFilter.value
                : "all";

        const category =
            categoryFilter
                ? categoryFilter.value
                : "all";

        items =
            items.filter(item => {

                const description =
                    String(
                        item.description || ""
                    ).toLowerCase();

                const categoryName =
                    String(
                        item.category || ""
                    ).toLowerCase();

                const matchesSearch =
                    !search ||
                    description.includes(search) ||
                    categoryName.includes(search);

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

    /* =====================================================
       EXCLUSÃO
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
                Number(
                    button.dataset.deleteId
                );

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

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            updateAllTransactions
        );
    }

    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            updateAllTransactions
        );
    }

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            updateAllTransactions
        );
    }

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
                document.createElement(
                    "option"
                );

            option.value = category;

            option.textContent = category;

            categoryFilter.appendChild(
                option
            );
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

        if (!canvas) return;

        if (typeof Chart === "undefined") return;

        const {
            income,
            expense
        } = calculateMonthTotals();

        if (financeChart) {
            financeChart.destroy();
        }

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

                        datasets: [
                            {
                                label: "Valor",

                                data: [
                                    income,
                                    expense
                                ],

                                borderWidth: 0
                            }
                        ]
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
                                            formatMoney(
                                                value
                                            )
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

            if (item.type !== "expense") {
                return;
            }

            const category =
                item.category || "Outros";

            if (!totals[category]) {
                totals[category] = 0;
            }

            totals[category] +=
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
            entries
                .map(
                    ([category, value]) => {

                        const percentage =
                            total > 0
                                ? (
                                    value /
                                    total
                                ) * 100
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
                )
                .join("");

        updateCategoryChart(totals);
    }

    function updateCategoryChart(totals) {

        const canvas =
            document.getElementById(
                "categoryChart"
            );

        if (!canvas) return;

        if (typeof Chart === "undefined") return;

        if (categoryChart) {
            categoryChart.destroy();
        }

        const labels =
            Object.keys(totals);

        const values =
            Object.values(totals);

        if (!labels.length) {
            return;
        }

        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: labels,

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

                    <div class="category-dot"></div>

                    <strong>
                        Total gasto
                    </strong>

                </div>

                <span>
                    ${formatMoney(total)}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Maior categoria
                    </strong>

                </div>

                <span>
                    ${escapeHTML(biggest[0])}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Maior gasto
                    </strong>

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

        if (typeof Chart === "undefined") return;

        if (reportCategoryChart) {
            reportCategoryChart.destroy();
        }

        const labels =
            Object.keys(totals);

        const values =
            Object.values(totals);

        if (!labels.length) {
            return;
        }

        reportCategoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: labels,

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
                }
            );
    }

    /* =====================================================
       PREMIUM
    ===================================================== */

    function calculatePremiumPerformance() {

        const totals =
            calculateMonthTotals();

        let economy = 0;

        if (totals.income > 0) {

            economy =
                (
                    totals.balance /
                    totals.income
                ) * 100;
        }

        return {
            ...totals,
            economy
        };
    }

    function updatePremiumPerformance() {

        const data =
            calculatePremiumPerformance();

        const premiumEconomyValue =
            document.getElementById(
                "premiumEconomyValue"
            );

        const premiumPerformanceText =
            document.getElementById(
                "premiumPerformanceText"
            );

        if (premiumEconomyValue) {

            premiumEconomyValue.textContent =
                `${data.economy.toFixed(1)}%`;
        }

        if (premiumPerformanceText) {

            if (!transactions.length) {

                premiumPerformanceText.textContent =
                    "Cadastre seus lançamentos para acompanhar seu desempenho.";

            } else if (data.economy >= 50) {

                premiumPerformanceText.textContent =
                    "Excelente! Você está conseguindo preservar uma boa parte da sua receita.";

            } else if (data.economy >= 20) {

                premiumPerformanceText.textContent =
                    "Bom trabalho! Você está mantendo parte importante da sua receita.";

            } else if (data.economy >= 0) {

                premiumPerformanceText.textContent =
                    "Seu saldo está positivo, mas existe espaço para melhorar sua economia.";

            } else {

                premiumPerformanceText.textContent =
                    "Suas despesas estão maiores que suas receitas neste mês.";
            }
        }
    }

    /* =====================================================
       PREVISÃO CORRIGIDA
       
       IMPORTANTE:
       NÃO transforma o total gasto em gasto diário.

       Exemplo:
       Receita = R$ 2.200
       Despesa = R$ 800
       Saldo = R$ 1.400

       Se não houver novos lançamentos previstos,
       a previsão continua R$ 1.400.

       Apenas lançamentos recorrentes que ainda
       acontecerão no restante do mês entram na projeção.
    ===================================================== */

    function calculateForecast() {

        const now = new Date();

        const {
            start,
            end
        } = getCurrentMonthRange();

        const totals =
            calculateMonthTotals();

        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0,
                0,
                0
            );

        /*
         Busca somente ocorrências FUTURAS
         dentro do restante do mês.
        */

        let futureIncome = 0;
        let futureExpense = 0;

        transactions.forEach(transaction => {

            const occurrences =
                transactionOccurrences(
                    transaction,
                    today,
                    end
                );

            occurrences.forEach(date => {

                /*
                 Se a ocorrência for hoje e já foi
                 contabilizada no saldo atual,
                 não conta novamente.
                */

                const isToday =
                    date.getTime() ===
                    today.getTime();

                if (isToday) {
                    return;
                }

                if (transaction.type === "income") {

                    futureIncome +=
                        Number(transaction.amount);

                } else {

                    futureExpense +=
                        Number(transaction.amount);
                }
            });
        });

        /*
         Previsão:

         saldo atual
         + receitas futuras
         - despesas futuras
        */

        const forecast =
            totals.balance +
            futureIncome -
            futureExpense;

        const remainingDays =
            Math.max(
                0,
                Math.ceil(
                    (
                        end -
                        today
                    ) / 86400000
                )
            );

        return {

            balance:
                totals.balance,

            income:
                totals.income,

            expense:
                totals.expense,

            futureIncome,

            futureExpense,

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

                    Adicione seus lançamentos para visualizar
                    sua previsão financeira.

                </div>
            `;

            return;
        }

        const positive =
            data.forecast >= 0;

        const message =
            positive

                ? "Mantendo os lançamentos previstos, a projeção indica fechamento positivo."

                : "Atenção: os lançamentos previstos indicam possível saldo negativo no fim do mês.";

        monthForecast.innerHTML = `

            <div class="forecast-card">

                <span>
                    SALDO ATUAL
                </span>

                <strong>
                    ${formatMoney(
                        data.balance
                    )}
                </strong>

            </div>


            <div class="forecast-card">

                <span>
                    📅 DIAS RESTANTES
                </span>

                <strong>
                    ${data.remainingDays}
                </strong>

            </div>


            <div class="forecast-card">

                <span>
                    ↗ RECEITAS PREVISTAS
                </span>

                <strong>
                    ${formatMoney(
                        data.futureIncome
                    )}
                </strong>

            </div>


            <div class="forecast-card">

                <span>
                    ↘ DESPESAS PREVISTAS
                </span>

                <strong>
                    ${formatMoney(
                        data.futureExpense
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

                ${message}

            </div>
        `;
    }

    /* =====================================================
       METAS PREMIUM
    ===================================================== */

    let goals = [];

    try {

        goals =
            JSON.parse(
                localStorage.getItem(
                    "controles_goals"
                ) || "[]"
            );

    } catch {

        goals = [];
    }

    function saveGoals() {

        localStorage.setItem(
            "controles_goals",
            JSON.stringify(goals)
        );
    }

    function updateGoals() {

        const goalsList =
            document.getElementById(
                "goalsList"
            );

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
                    Number(goal.target || 0);

                const saved =
                    Number(goal.saved || 0);

                const percentage =
                    target > 0
                        ? Math.min(
                            100,
                            (saved / target) * 100
                        )
                        : 0;

                return `

                    <div class="premium-goal-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    goal.name
                                )}
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

                    </div>
                `;

            }).join("");
    }

    const newGoalBtn =
        document.getElementById(
            "newGoalBtn"
        );

    const goalModal =
        document.getElementById(
            "goalModal"
        );

    const goalForm =
        document.getElementById(
            "goalForm"
        );

    const closeGoalModal =
        document.getElementById(
            "closeGoalModal"
        );

    function openGoalModal() {

        if (goalModal) {
            goalModal.classList.remove("hidden");
        }
    }

    function closeGoalModalFunction() {

        if (goalModal) {
            goalModal.classList.add("hidden");
        }

        if (goalForm) {
            goalForm.reset();
        }
    }

    if (newGoalBtn) {

        newGoalBtn.addEventListener(
            "click",
            openGoalModal
        );
    }

    if (closeGoalModal) {

        closeGoalModal.addEventListener(
            "click",
            closeGoalModalFunction
        );
    }

    if (goalModal) {

        const overlay =
            goalModal.querySelector(
                ".modal-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeGoalModalFunction
            );
        }
    }

    if (goalForm) {

        goalForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document.getElementById(
                        "goalName"
                    )?.value.trim();

                const target =
                    Number(
                        document.getElementById(
                            "goalTarget"
                        )?.value || 0
                    );

                const saved =
                    Number(
                        document.getElementById(
                            "goalSaved"
                        )?.value || 0
                    );

                if (!name || target <= 0) {
                    return;
                }

                goals.push({

                    id: Date.now(),

                    name,

                    target,

                    saved:
                        Math.max(
                            0,
                            saved
                        )
                });

                saveGoals();

                closeGoalModalFunction();

                updateGoals();
            }
        );
    }

    /* =====================================================
       ORÇAMENTOS PREMIUM
    ===================================================== */

    let budgets = [];

    try {

        budgets =
            JSON.parse(
                localStorage.getItem(
                    "controles_budgets"
                ) || "[]"
            );

    } catch {

        budgets = [];
    }

    function saveBudgets() {

        localStorage.setItem(
            "controles_budgets",
            JSON.stringify(budgets)
        );
    }

    function updateBudgets() {

        const budgetsList =
            document.getElementById(
                "budgetsList"
            );

        if (!budgetsList) return;

        if (!budgets.length) {

            budgetsList.innerHTML = `

                <div class="empty-state">
                    Nenhum orçamento definido.
                </div>
            `;

            return;
        }

        const expenses =
            calculateCategories();

        budgetsList.innerHTML =
            budgets.map(budget => {

                const spent =
                    Number(
                        expenses[budget.category] || 0
                    );

                const limit =
                    Number(
                        budget.limit || 0
                    );

                const percentage =
                    limit > 0
                        ? Math.min(
                            100,
                            (spent / limit) * 100
                        )
                        : 0;

                return `

                    <div class="premium-budget-item">

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

                    </div>
                `;

            }).join("");
    }

    const newBudgetBtn =
        document.getElementById(
            "newBudgetBtn"
        );

    const budgetModal =
        document.getElementById(
            "budgetModal"
        );

    const budgetForm =
        document.getElementById(
            "budgetForm"
        );

    const closeBudgetModal =
        document.getElementById(
            "closeBudgetModal"
        );

    function openBudgetModal() {

        if (budgetModal) {
            budgetModal.classList.remove("hidden");
        }
    }

    function closeBudgetModalFunction() {

        if (budgetModal) {
            budgetModal.classList.add("hidden");
        }

        if (budgetForm) {
            budgetForm.reset();
        }
    }

    if (newBudgetBtn) {

        newBudgetBtn.addEventListener(
            "click",
            openBudgetModal
        );
    }

    if (closeBudgetModal) {

        closeBudgetModal.addEventListener(
            "click",
            closeBudgetModalFunction
        );
    }

    if (budgetModal) {

        const overlay =
            budgetModal.querySelector(
                ".modal-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeBudgetModalFunction
            );
        }
    }

    if (budgetForm) {

        budgetForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const category =
                    document.getElementById(
                        "budgetCategory"
                    )?.value;

                const limit =
                    Number(
                        document.getElementById(
                            "budgetLimit"
                        )?.value || 0
                    );

                if (!category || limit <= 0) {
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

                        id: Date.now(),

                        category,

                        limit
                    });
                }

                saveBudgets();

                closeBudgetModalFunction();

                updateBudgets();
            }
        );
    }

    /* =====================================================
       ALERTAS INTELIGENTES
    ===================================================== */

    function updateSmartAlerts() {

        const smartAlerts =
            document.getElementById(
                "smartAlerts"
            );

        if (!smartAlerts) return;

        const totals =
            calculateMonthTotals();

        const alerts = [];

        if (
            totals.expense > totals.income &&
            totals.income > 0
        ) {

            alerts.push(`
                <div class="alert-item">
                    🚨 Suas despesas estão maiores que suas receitas.
                </div>
            `);
        }

        const categoryTotals =
            calculateCategories();

        Object.entries(budgets).forEach(() => {});

        budgets.forEach(budget => {

            const spent =
                Number(
                    categoryTotals[
                        budget.category
                    ] || 0
                );

            const limit =
                Number(budget.limit || 0);

            if (
                limit > 0 &&
                spent >= limit
            ) {

                alerts.push(`
                    <div class="alert-item">
                        ⚠️ O orçamento de ${escapeHTML(
                            budget.category
                        )} atingiu o limite.
                    </div>
                `);
            }
        });

        if (!alerts.length) {

            smartAlerts.innerHTML = `

                <div class="empty-state">
                    Nenhum alerta importante no momento. ✓
                </div>
            `;

            return;
        }

        smartAlerts.innerHTML =
            alerts.join("");
    }

    /* =====================================================
       COMPARAÇÃO MENSAL
    ===================================================== */

    function updateMonthlyComparison() {

        const container =
            document.getElementById(
                "monthlyComparison"
            );

        if (!container) return;

        const now = new Date();

        const currentStart =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const currentEnd =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );

        const previousStart =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        const previousEnd =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
                23,
                59,
                59
            );

        const current =
            getPeriodTransactions(
                currentStart,
                currentEnd
            );

        const previous =
            getPeriodTransactions(
                previousStart,
                previousEnd
            );

        const currentExpense =
            current
                .filter(
                    item =>
                        item.type === "expense"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount),
                    0
                );

        const previousExpense =
            previous
                .filter(
                    item =>
                        item.type === "expense"
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount),
                    0
                );

        const difference =
            currentExpense -
            previousExpense;

        let message;

        if (previousExpense === 0) {

            message =
                "Ainda não há despesas suficientes no mês anterior para uma comparação.";

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
                "Seus gastos estão iguais aos do mês anterior.";
        }

        container.innerHTML = `

            <div class="comparison-card">

                <strong>
                    ${message}
                </strong>

                <small>
                    Mês atual: ${formatMoney(currentExpense)}
                    • Mês anterior: ${formatMoney(previousExpense)}
                </small>

            </div>
        `;
    }

    /* =====================================================
       SIMULADOR FINANCEIRO
    ===================================================== */

    const simulateBtn =
        document.getElementById(
            "simulateBtn"
        );

    const simulationAmount =
        document.getElementById(
            "simulationAmount"
        );

    const simulationResult =
        document.getElementById(
            "simulationResult"
        );

    if (simulateBtn) {

        simulateBtn.addEventListener(
            "click",
            () => {

                const amount =
                    Number(
                        simulationAmount?.value || 0
                    );

                if (amount <= 0) {

                    if (simulationResult) {

                        simulationResult.innerHTML =
                            "Digite um valor para simular.";
                    }

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

                        <div class="simulation-box">

                            <span>
                                SALDO ATUAL
                            </span>

                            <strong>
                                ${formatMoney(
                                    totals.balance
                                )}
                            </strong>

                            <span>
                                NOVO SALDO APÓS A DESPESA
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
    }

    /* =====================================================
       ANÁLISE PREMIUM
    ===================================================== */

    function updatePremiumAnalysis() {

        const premiumAnalysis =
            document.getElementById(
                "premiumAnalysis"
            );

        if (!premiumAnalysis) return;

        const totals =
            calculateMonthTotals();

        const categoriesTotals =
            calculateCategories();

        const entries =
            Object.entries(
                categoriesTotals
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );

        const biggest =
            entries.length
                ? entries[0]
                : null;

        let text = "";

        if (!transactions.length) {

            text =
                "Cadastre seus lançamentos para receber uma análise financeira personalizada.";

        } else {

            text =
                `Receitas: ${formatMoney(
                    totals.income
                )}. Despesas: ${formatMoney(
                    totals.expense
                )}. Saldo: ${formatMoney(
                    totals.balance
                )}.`;

            if (biggest) {

                text +=
                    ` Maior categoria de gasto: ${
                        biggest[0]
                    } (${formatMoney(
                        biggest[1]
                    )}).`;
            }
        }

        premiumAnalysis.innerHTML = `

            <div class="analysis-box">

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>
        `;
    }

    /* =====================================================
       PREMIUM
    ===================================================== */

    function updatePremium() {

        updatePremiumPerformance();

        updateForecast();

        updateGoals();

        updateBudgets();

        updateSmartAlerts();

        updateMonthlyComparison();

        updatePremiumAnalysis();
    }

    const subscribePremiumBtn =
        document.getElementById(
            "subscribePremiumBtn"
        );

    if (subscribePremiumBtn) {

        subscribePremiumBtn.addEventListener(
            "click",
            () => {

                if (!currentUser) {
                    return;
                }

                currentUser.plan =
                    "premium";

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(
                        currentUser
                    )
                );

                if (userPlan) {

                    userPlan.textContent =
                        "ControleS Premium ⭐";
                }

                updatePremium();

                alert(
                    "Parabéns! O ControleS Premium foi ativado neste dispositivo. ⭐"
                );
            }
        );
    }

    /* =====================================================
       TEMA ESCURO
    ===================================================== */

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark"
                );

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

        document.body.classList.add(
            "dark"
        );
    }

    /* =====================================================
       EXPORTAÇÃO DE DADOS
    ===================================================== */

    const exportDataBtn =
        document.getElementById(
            "exportDataBtn"
        );

    if (exportDataBtn) {

        exportDataBtn.addEventListener(
            "click",
            () => {

                const totals =
                    calculateMonthTotals();

                const data = {

                    aplicativo:
                        "ControleS",

                    versao:
                        "1.0",

                    usuario:
                        currentUser,

                    resumoFinanceiro: {

                        receitas:
                            totals.income,

                        despesas:
                            totals.expense,

                        saldo:
                            totals.balance
                    },

                    lancamentos:
                        transactions,

                    metas:
                        goals,

                    orcamentos:
                        budgets,

                    exportadoEm:
                        new Date().toLocaleString(
                            "pt-BR"
                        )
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
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                link.download =
                    `controles-backup-${todayISO()}.json`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                setTimeout(() => {

                    URL.revokeObjectURL(
                        url
                    );

                }, 1000);
            }
        );
    }

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

        dateInput.value =
            todayISO();
    }

    updateTypeButtons();

    loadUser();

    console.log(
        "ControleS carregado com sucesso."
    );

});

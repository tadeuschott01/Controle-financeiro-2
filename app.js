/* =====================================================
   CONTROLES — APP.JS
   VERSÃO DEFINITIVA
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

    const smartAlerts =
        document.getElementById("smartAlerts");

    const monthlyComparison =
        document.getElementById("monthlyComparison");

    const premiumAnalysis =
        document.getElementById("premiumAnalysis");

    const goalsList =
        document.getElementById("goalsList");

    const budgetsList =
        document.getElementById("budgetsList");

    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = [];

    try {
        transactions = JSON.parse(
            localStorage.getItem("controles_transactions") || "[]"
        );

        if (!Array.isArray(transactions)) {
            transactions = [];
        }

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

    let goals = [];

    try {
        goals = JSON.parse(
            localStorage.getItem("controles_goals") || "[]"
        );

        if (!Array.isArray(goals)) {
            goals = [];
        }

    } catch {
        goals = [];
    }

    let budgets = [];

    try {
        budgets = JSON.parse(
            localStorage.getItem("controles_budgets") || "[]"
        );

        if (!Array.isArray(budgets)) {
            budgets = [];
        }

    } catch {
        budgets = [];
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

        const date =
            new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString("pt-BR");

    }

    function todayISO() {

        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

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

    function getDateOnly(date) {

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

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
            event => {

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

            if (
                !button.classList.contains("nav-item")
            ) {

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

        if (dateInput) {
            dateInput.value =
                dateInput.value || todayISO();
        }

        if (descriptionInput) {
            descriptionInput.focus();
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
        document.getElementById(
            "openTransactionBtn"
        );

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
        document.getElementById(
            "closeModal"
        );

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeModal
        );

    }

    /* =====================================================
       MODAIS PREMIUM
    ===================================================== */

    const goalModal =
        document.getElementById("goalModal");

    const budgetModal =
        document.getElementById("budgetModal");

    function openGoalModal() {

        if (currentUser?.plan !== "premium") {

            alert(
                "Essa função faz parte do ControleS Premium."
            );

            return;

        }

        if (goalModal) {
            goalModal.classList.remove("hidden");
        }

    }

    function closeGoalModal() {

        if (goalModal) {
            goalModal.classList.add("hidden");
        }

        const form =
            document.getElementById("goalForm");

        if (form) {
            form.reset();
        }

    }

    function openBudgetModal() {

        if (currentUser?.plan !== "premium") {

            alert(
                "Essa função faz parte do ControleS Premium."
            );

            return;

        }

        if (budgetModal) {
            budgetModal.classList.remove("hidden");
        }

    }

    function closeBudgetModal() {

        if (budgetModal) {
            budgetModal.classList.add("hidden");
        }

        const form =
            document.getElementById("budgetForm");

        if (form) {
            form.reset();
        }

    }

    const newGoalBtn =
        document.getElementById("newGoalBtn");

    if (newGoalBtn) {
        newGoalBtn.addEventListener(
            "click",
            openGoalModal
        );
    }

    const closeGoalModalBtn =
        document.getElementById(
            "closeGoalModal"
        );

    if (closeGoalModalBtn) {
        closeGoalModalBtn.addEventListener(
            "click",
            closeGoalModal
        );
    }

    const newBudgetBtn =
        document.getElementById("newBudgetBtn");

    if (newBudgetBtn) {
        newBudgetBtn.addEventListener(
            "click",
            openBudgetModal
        );
    }

    const closeBudgetModalBtn =
        document.getElementById(
            "closeBudgetModal"
        );

    if (closeBudgetModalBtn) {
        closeBudgetModalBtn.addEventListener(
            "click",
            closeBudgetModal
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

                    alert(
                        "Preencha os dados do lançamento."
                    );

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

                    description,

                    amount,

                    date,

                    frequency,

                    category

                };

                transactions.push(
                    transaction
                );

                saveTransactions();

                closeModal();

                updateAll();

            }
        );

    }

    /* =====================================================
       OCORRÊNCIAS
       
       CORREÇÃO:
       As recorrências continuam sendo exibidas
       corretamente, mas a previsão Premium NÃO
       multiplica uma despesa mensal pelo número
       de dias restantes.
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
                    current.getDate() !==
                    originalDay
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

            const amount =
                Number(item.amount) || 0;

            if (item.type === "income") {

                income += amount;

            } else {

                expense += amount;

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
       HTML LANÇAMENTO
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

            const exists =
                transactions.some(
                    transaction =>
                        Number(transaction.id) === id
                );

            if (!exists) return;

            if (
                !confirm(
                    "Deseja excluir este lançamento?"
                )
            ) {
                return;
            }

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
                Number(item.amount) || 0;

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

        updateCategoryChart(
            totals
        );

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

        updateReportChart(
            totals
        );

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

                }
            );

    }

    /* =====================================================
       PREMIUM — PREVISÃO DEFINITIVA
       
       IMPORTANTE:
       A previsão NÃO usa as ocorrências futuras
       de despesas recorrentes.

       Ela usa:
       
       1. saldo atual do mês
       2. despesas reais já ocorridas
       3. dias já passados
       4. média diária real
       5. dias restantes

       Portanto uma despesa mensal de R$ 800
       não vira R$ 800 todos os dias.
    ===================================================== */

    function calculateForecast() {

        const now = new Date();

        const currentYear =
            now.getFullYear();

        const currentMonth =
            now.getMonth();

        const today =
            getDateOnly(now);

        const startOfMonth =
            new Date(
                currentYear,
                currentMonth,
                1
            );

        const endOfMonth =
            new Date(
                currentYear,
                currentMonth + 1,
                0
            );

        const totalDays =
            endOfMonth.getDate();

        const elapsedDays =
            Math.max(
                1,
                today.getDate()
            );

        const remainingDays =
            Math.max(
                0,
                totalDays -
                elapsedDays
            );

        /*
         IMPORTANTE:
         Pegamos somente os lançamentos que
         realmente aconteceram até HOJE.
        */

        const periodStart =
            new Date(
                currentYear,
                currentMonth,
                1,
                0,
                0,
                0
            );

        const periodEnd =
            new Date(
                currentYear,
                currentMonth,
                today.getDate(),
                23,
                59,
                59
            );

        const occurredItems =
            getPeriodTransactions(
                periodStart,
                periodEnd
            );

        let income = 0;
        let expense = 0;

        occurredItems.forEach(item => {

            const amount =
                Number(item.amount) || 0;

            if (item.type === "income") {

                income += amount;

            } else {

                expense += amount;

            }

        });

        /*
         Média diária baseada somente
         nos gastos que já aconteceram.
        */

        const averageDailyExpense =
            expense / elapsedDays;

        /*
         Quanto provavelmente será gasto
         nos dias restantes.
        */

        const estimatedRemainingExpense =
            averageDailyExpense *
            remainingDays;

        /*
         Saldo real até hoje.
        */

        const currentBalance =
            income - expense;

        /*
         Previsão de fechamento.
        */

        const forecast =
            currentBalance -
            estimatedRemainingExpense;

        return {

            balance:
                currentBalance,

            income,

            expense,

            averageDailyExpense,

            estimatedRemainingExpense,

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

                ? "Mantendo o ritmo atual de gastos, a projeção indica fechamento positivo."

                : "Atenção: mantendo o ritmo atual de gastos, a projeção indica saldo negativo.";

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

                ${message}

            </div>

        `;

    }

    /* =====================================================
       PREMIUM — DESEMPENHO
    ===================================================== */

    function updatePremiumPerformance() {

        const performanceText =
            document.getElementById(
                "premiumPerformanceText"
            );

        const premiumEconomyValue =
            document.getElementById(
                "premiumEconomyValue"
            );

        if (!performanceText &&
            !premiumEconomyValue) {
            return;
        }

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

        if (premiumEconomyValue) {

            premiumEconomyValue.textContent =
                `${economy.toFixed(1)}%`;

        }

        if (performanceText) {

            if (!transactions.length) {

                performanceText.textContent =
                    "Cadastre seus lançamentos para acompanhar seu desempenho.";

            } else if (economy >= 20) {

                performanceText.textContent =
                    "Excelente! Você está conseguindo preservar uma boa parte da sua renda.";

            } else if (economy >= 0) {

                performanceText.textContent =
                    "Você está no caminho certo. Continue acompanhando seus gastos.";

            } else {

                performanceText.textContent =
                    "Seus gastos estão acima das receitas neste mês. Vale revisar suas categorias.";

            }

        }

    }

    /* =====================================================
       PREMIUM — ALERTAS INTELIGENTES
    ===================================================== */

    function updateSmartAlerts() {

        if (!smartAlerts) return;

        const totals =
            calculateMonthTotals();

        const categoriesTotals =
            calculateCategories();

        const alerts = [];

        if (
            totals.expense >
            totals.income &&
            totals.income > 0
        ) {

            alerts.push(
                "⚠️ Suas despesas já ultrapassaram suas receitas neste mês."
            );

        }

        Object.entries(categoriesTotals)
            .forEach(([category, value]) => {

                if (
                    totals.income > 0 &&
                    value >
                    totals.income * 0.30
                ) {

                    alerts.push(
                        `📌 ${category} representa mais de 30% da sua renda neste mês.`
                    );

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
            alerts
                .map(
                    alert => `

                        <div class="premium-list-item">
                            ${escapeHTML(alert)}
                        </div>

                    `
                )
                .join("");

    }

    /* =====================================================
       PREMIUM — COMPARAÇÃO MENSAL
    ===================================================== */

    function getMonthTotals(year, month) {

        const start =
            new Date(
                year,
                month,
                1,
                0,
                0,
                0
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

            const amount =
                Number(item.amount) || 0;

            if (item.type === "income") {
                income += amount;
            } else {
                expense += amount;
            }

        });

        return {
            income,
            expense,
            balance:
                income - expense
        };

    }

    function updateMonthlyComparison() {

        if (!monthlyComparison) return;

        const now = new Date();

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

        const expenseDifference =
            current.expense -
            previous.expense;

        const incomeDifference =
            current.income -
            previous.income;

        monthlyComparison.innerHTML = `

            <div class="comparison-item">

                <span>
                    Receitas este mês
                </span>

                <strong>
                    ${formatMoney(current.income)}
                </strong>

            </div>

            <div class="comparison-item">

                <span>
                    Receitas mês anterior
                </span>

                <strong>
                    ${formatMoney(previous.income)}
                </strong>

            </div>

            <div class="comparison-item">

                <span>
                    Despesas este mês
                </span>

                <strong>
                    ${formatMoney(current.expense)}
                </strong>

            </div>

            <div class="comparison-item">

                <span>
                    Despesas mês anterior
                </span>

                <strong>
                    ${formatMoney(previous.expense)}
                </strong>

            </div>

            <div class="empty-state">

                ${
                    expenseDifference <= 0
                        ? "✓ Você gastou menos ou o mesmo que no mês anterior."
                        : "⚠️ Você gastou mais que no mês anterior."
                }

                <br><br>

                Diferença de receitas:
                ${formatMoney(incomeDifference)}

                <br>

                Diferença de despesas:
                ${formatMoney(expenseDifference)}

            </div>

        `;

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
            goals
                .map(goal => {

                    const target =
                        Number(goal.target) || 0;

                    const saved =
                        Number(goal.saved) || 0;

                    const percentage =
                        target > 0
                            ? Math.min(
                                100,
                                (
                                    saved /
                                    target
                                ) * 100
                            )
                            : 0;

                    return `

                        <div class="premium-list-item">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        goal.name
                                    )}
                                </strong>

                                <br>

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
                                class="premium-small-button"
                                data-delete-goal="${goal.id}"
                            >
                                Excluir
                            </button>

                        </div>

                    `;

                })
                .join("");

    }

    const goalForm =
        document.getElementById("goalForm");

    if (goalForm) {

        goalForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (
                    currentUser?.plan !==
                    "premium"
                ) {

                    alert(
                        "Essa função faz parte do ControleS Premium."
                    );

                    return;

                }

                const name =
                    document.getElementById(
                        "goalName"
                    )?.value.trim();

                const target =
                    Number(
                        document.getElementById(
                            "goalTarget"
                        )?.value
                    );

                const saved =
                    Number(
                        document.getElementById(
                            "goalSaved"
                        )?.value
                    ) || 0;

                if (
                    !name ||
                    !target ||
                    target <= 0
                ) {

                    alert(
                        "Preencha os dados da meta."
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

                closeGoalModal();

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
       PREMIUM — ORÇAMENTO
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

        const categoryTotals =
            calculateCategories();

        budgetsList.innerHTML =
            budgets
                .map(budget => {

                    const limit =
                        Number(budget.limit) || 0;

                    const spent =
                        Number(
                            categoryTotals[
                                budget.category
                            ] || 0
                        );

                    const percentage =
                        limit > 0
                            ? (
                                spent /
                                limit
                            ) * 100
                            : 0;

                    const exceeded =
                        percentage >= 100;

                    return `

                        <div class="premium-list-item">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        budget.category
                                    )}
                                </strong>

                                <br>

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
                                class="premium-small-button"
                                data-delete-budget="${budget.id}"
                            >
                                Excluir
                            </button>

                            <div>

                                ${
                                    exceeded
                                        ? "⚠️ Limite ultrapassado"
                                        : "✓ Dentro do orçamento"
                                }

                            </div>

                        </div>

                    `;

                })
                .join("");

    }

    const budgetForm =
        document.getElementById("budgetForm");

    if (budgetForm) {

        budgetForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (
                    currentUser?.plan !==
                    "premium"
                ) {

                    alert(
                        "Essa função faz parte do ControleS Premium."
                    );

                    return;

                }

                const category =
                    document.getElementById(
                        "budgetCategory"
                    )?.value;

                const limit =
                    Number(
                        document.getElementById(
                            "budgetLimit"
                        )?.value
                    );

                if (
                    !category ||
                    !limit ||
                    limit <= 0
                ) {

                    alert(
                        "Informe um limite válido."
                    );

                    return;

                }

                budgets =
                    budgets.filter(
                        budget =>
                            budget.category !==
                            category
                    );

                budgets.push({

                    id:
                        Date.now(),

                    category,

                    limit

                });

                saveBudgets();

                closeBudgetModal();

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

    const simulateBtn =
        document.getElementById(
            "simulateBtn"
        );

    if (simulateBtn) {

        simulateBtn.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !==
                    "premium"
                ) {

                    alert(
                        "O simulador faz parte do ControleS Premium."
                    );

                    return;

                }

                const input =
                    document.getElementById(
                        "simulationAmount"
                    );

                const result =
                    document.getElementById(
                        "simulationResult"
                    );

                if (!input || !result) return;

                const amount =
                    Number(input.value);

                if (!amount || amount <= 0) {

                    result.innerHTML = `
                        <div class="empty-state">
                            Informe um valor para simular.
                        </div>
                    `;

                    return;

                }

                const totals =
                    calculateMonthTotals();

                const simulatedBalance =
                    totals.balance -
                    amount;

                result.innerHTML = `

                    <div class="simulation-card">

                        <span>
                            SALDO ATUAL
                        </span>

                        <strong>
                            ${formatMoney(
                                totals.balance
                            )}
                        </strong>

                    </div>

                    <div class="simulation-card">

                        <span>
                            NOVA DESPESA
                        </span>

                        <strong>
                            - ${formatMoney(amount)}
                        </strong>

                    </div>

                    <div class="simulation-card">

                        <span>
                            SALDO APÓS A SIMULAÇÃO
                        </span>

                        <strong>
                            ${formatMoney(
                                simulatedBalance
                            )}
                        </strong>

                    </div>

                `;

            }
        );

    }

    /* =====================================================
       PREMIUM — ANÁLISE
    ===================================================== */

    function updatePremiumAnalysis() {

        if (!premiumAnalysis) return;

        const totals =
            calculateMonthTotals();

        const categoriesTotals =
            calculateCategories();

        const entries =
            Object.entries(
                categoriesTotals
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

        if (!transactions.length) {

            premiumAnalysis.innerHTML = `

                <div class="empty-state">
                    Cadastre lançamentos para receber sua análise financeira.
                </div>

            `;

            return;

        }

        const biggest =
            entries.length
                ? entries[0]
                : null;

        let text = "";

        if (
            totals.balance >= 0
        ) {

            text =
                "Seu mês está positivo até o momento. Continue acompanhando seus gastos para manter o equilíbrio.";

        } else {

            text =
                "Seu mês está negativo. Analise suas principais categorias e procure reduzir despesas não essenciais.";

        }

        premiumAnalysis.innerHTML = `

            <div class="premium-list-item">

                <strong>
                    Situação atual
                </strong>

                <br>

                ${text}

            </div>

            ${
                biggest
                    ? `
                        <div class="premium-list-item">

                            <strong>
                                Maior categoria de gasto
                            </strong>

                            <br>

                            ${escapeHTML(biggest[0])}

                            —
                            ${formatMoney(biggest[1])}

                        </div>
                    `
                    : ""
            }

            <div class="premium-list-item">

                <strong>
                    Saldo projetado
                </strong>

                <br>

                ${formatMoney(
                    calculateForecast().forecast
                )}

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

                    alert(
                        "Entre no ControleS para continuar."
                    );

                    return;

                }

                if (
                    currentUser.plan ===
                    "premium"
                ) {

                    alert(
                        "Você já é Premium! ⭐"
                    );

                    return;

                }

                /*
                 Nesta versão local, o botão ativa
                 o Premium imediatamente.
                 
                 Quando o Supabase/pagamento for
                 integrado, este ponto será substituído
                 pelo sistema real de assinatura.
                */

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

                alert(
                    "ControleS Premium ativado! ⭐"
                );

                updatePremium();

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
       
       Exporta um arquivo completo para backup.
       Inclui:
       - usuário
       - lançamentos
       - metas
       - orçamentos
       - data da exportação
    ===================================================== */

    const exportDataBtn =
        document.getElementById(
            "exportDataBtn"
        );

    if (exportDataBtn) {

        exportDataBtn.addEventListener(
            "click",
            () => {

                if (!currentUser) {

                    alert(
                        "Entre no ControleS para exportar seus dados."
                    );

                    return;

                }

                const data = {

                    aplicativo:
                        "ControleS",

                    usuario:
                        currentUser,

                    lancamentos:
                        transactions,

                    metas:
                        goals,

                    orcamentos:
                        budgets,

                    exportadoEm:
                        new Date().toISOString(),

                    observacao:
                        "Arquivo de backup dos dados financeiros cadastrados no ControleS."

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

                setTimeout(
                    () => {
                        URL.revokeObjectURL(url);
                    },
                    1000
                );

                alert(
                    "Seus dados foram exportados com sucesso."
                );

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

        updateForecast();

        updatePremiumPerformance();

        updateGoals();

        updateBudgets();

        updateSmartAlerts();

        updateMonthlyComparison();

        updatePremiumAnalysis();

    }

    /* =====================================================
       FECHAR MODAIS CLICANDO FORA
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                const modal =
                    event.target.closest(
                        ".modal"
                    );

                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }

        }
    );

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
        "ControleS: app.js carregado com sucesso."
    );

});

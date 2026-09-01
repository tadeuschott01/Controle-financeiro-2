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

    const premiumEconomyValue =
        document.getElementById("premiumEconomyValue");

    const premiumPerformanceText =
        document.getElementById("premiumPerformanceText");

    const premiumAnalysis =
        document.getElementById("premiumAnalysis");

    const smartAlerts =
        document.getElementById("smartAlerts");

    const monthlyComparison =
        document.getElementById("monthlyComparison");

    const budgetsList =
        document.getElementById("budgetsList");

    const goalsList =
        document.getElementById("goalsList");


    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = [];

    try {

        transactions =
            JSON.parse(
                localStorage.getItem(
                    "controles_transactions"
                ) || "[]"
            );

    } catch {

        transactions = [];

    }


    let currentUser = null;

    try {

        currentUser =
            JSON.parse(
                localStorage.getItem(
                    "controles_user"
                ) || "null"
            );

    } catch {

        currentUser = null;

    }


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


    let budgets = {};

    try {

        budgets =
            JSON.parse(
                localStorage.getItem(
                    "controles_budgets"
                ) || "{}"
            );

    } catch {

        budgets = {};

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

        return Number(value || 0)
            .toLocaleString(
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
            new Date(
                dateString + "T00:00:00"
            );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString(
            "pt-BR"
        );

    }


    function todayISO() {

        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
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

        return (
            labels[frequency] ||
            "Única"
        );

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

        if (!currentUser) {

            loginScreen.classList.remove(
                "hidden"
            );

            app.classList.add(
                "hidden"
            );

            return;

        }


        loginScreen.classList.add(
            "hidden"
        );

        app.classList.remove(
            "hidden"
        );


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
                    document.getElementById(
                        "loginName"
                    );

                const emailInput =
                    document.getElementById(
                        "loginEmail"
                    );

                const passwordInput =
                    document.getElementById(
                        "loginPassword"
                    );


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


                if (
                    !name ||
                    !email ||
                    !password
                ) {

                    return;

                }


                currentUser = {

                    name,
                    email,
                    plan: "free"

                };


                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(
                        currentUser
                    )
                );


                loginScreen.classList.add(
                    "hidden"
                );

                app.classList.remove(
                    "hidden"
                );


                if (nameInput) {
                    nameInput.value = "";
                }

                if (emailInput) {
                    emailInput.value = "";
                }

                if (passwordInput) {
                    passwordInput.value = "";
                }


                loadUser();

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "controles_user"
                );

                currentUser = null;

                app.classList.add(
                    "hidden"
                );

                loginScreen.classList.remove(
                    "hidden"
                );

            }
        );

    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    const sections =
        document.querySelectorAll(
            ".section"
        );


    function openSection(sectionName) {

        sections.forEach(
            section => {

                section.classList.add(
                    "hidden"
                );

            }
        );


        const selected =
            document.getElementById(
                sectionName
            );


        if (selected) {

            selected.classList.remove(
                "hidden"
            );

        }


        navItems.forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    sectionName
                );

            }
        );


        const titles = {

            dashboard: "Dashboard",
            transactions: "Lançamentos",
            categories: "Categorias",
            reports: "Relatórios",
            premium: "Premium"

        };


        if (pageTitle) {

            pageTitle.textContent =
                titles[sectionName] ||
                "Dashboard";

        }


        if (
            sectionName === "premium"
        ) {

            updatePremium();

        }

    }


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    openSection(
                        item.dataset.section
                    );


                    const sidebar =
                        document.getElementById(
                            "sidebar"
                        );


                    if (sidebar) {

                        sidebar.classList.remove(
                            "mobile-open"
                        );

                    }

                }
            );

        }
    );


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(button => {

            if (
                !button.classList.contains(
                    "nav-item"
                )
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
        document.getElementById(
            "mobileMenuBtn"
        );


    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );


                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                }

            }
        );

    }


    /* =====================================================
       MODAL LANÇAMENTO
    ===================================================== */

    function openModal() {

        if (!transactionModal) return;

        transactionModal.classList.remove(
            "hidden"
        );


        if (dateInput) {

            dateInput.value =
                dateInput.value ||
                todayISO();

        }


        if (descriptionInput) {

            setTimeout(
                () =>
                    descriptionInput.focus(),
                100
            );

        }

    }


    function closeModal() {

        if (!transactionModal) return;

        transactionModal.classList.add(
            "hidden"
        );


        if (transactionForm) {

            transactionForm.reset();

        }


        selectedType = "income";

        updateTypeButtons();


        if (dateInput) {

            dateInput.value =
                todayISO();

        }


        if (frequencyInput) {

            frequencyInput.value =
                "once";

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


    const modalOverlay =
        transactionModal
            ? transactionModal.querySelector(
                ".modal-overlay"
            )
            : null;


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================================
       TIPO
    ===================================================== */

    const typeButtons =
        document.querySelectorAll(
            ".type-option"
        );


    function updateTypeButtons() {

        typeButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.type ===
                    selectedType
                );

            }
        );

    }


    typeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedType =
                        button.dataset.type;

                    updateTypeButtons();

                }
            );

        }
    );


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
                        ? Number(
                            amountInput.value
                        )
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
                        Math.floor(
                            Math.random() * 10000
                        ),

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
                transaction.date +
                "T00:00:00"
            );


        if (
            Number.isNaN(
                original.getTime()
            )
        ) {

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


        if (
            transaction.frequency === "daily"
        ) {

            while (
                current <= endDate
            ) {

                if (
                    current >= startDate
                ) {

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


        if (
            transaction.frequency === "weekly"
        ) {

            while (
                current <= endDate
            ) {

                if (
                    current >= startDate
                ) {

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


        if (
            transaction.frequency === "monthly"
        ) {

            while (
                current <= endDate
            ) {

                if (
                    current >= startDate
                ) {

                    occurrences.push(
                        new Date(current)
                    );

                }


                const day =
                    current.getDate();


                current.setMonth(
                    current.getMonth() + 1
                );


                if (
                    current.getDate() !== day
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


        transactions.forEach(
            transaction => {

                const occurrences =
                    transactionOccurrences(
                        transaction,
                        startDate,
                        endDate
                    );


                occurrences.forEach(
                    date => {

                        result.push({

                            ...transaction,

                            occurrenceDate:
                                date

                        });

                    }
                );

            }
        );


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
        } =
            getCurrentMonthRange();


        const items =
            getPeriodTransactions(
                start,
                end
            );


        let income = 0;
        let expense = 0;


        items.forEach(
            item => {

                if (
                    item.type === "income"
                ) {

                    income +=
                        Number(
                            item.amount
                        );

                } else {

                    expense +=
                        Number(
                            item.amount
                        );

                }

            }
        );


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


        if (
            totals.income > 0
        ) {

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
       HTML TRANSAÇÃO
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
       RECENTES
    ===================================================== */

    function updateRecentTransactions() {

        if (!recentTransactions) return;


        const {
            start,
            end
        } =
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
                .map(
                    createTransactionHTML
                )
                .join("");

    }


    /* =====================================================
       TODOS LANÇAMENTOS
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
            items.filter(
                item => {

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
                        description.includes(
                            search
                        ) ||
                        categoryName.includes(
                            search
                        );


                    const matchesType =
                        type === "all" ||
                        item.type === type;


                    const matchesCategory =
                        category === "all" ||
                        item.category ===
                        category;


                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesCategory
                    );

                }
            );


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
                .map(
                    createTransactionHTML
                )
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


            const confirmDelete =
                confirm(
                    "Deseja excluir este lançamento?"
                );


            if (!confirmDelete) return;


            transactions =
                transactions.filter(
                    transaction =>
                        Number(
                            transaction.id
                        ) !== id
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


        categories.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;


                option.textContent =
                    category;


                categoryFilter.appendChild(
                    option
                );

            }
        );


        categoryFilter.value =
            categories.includes(
                current
            )
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

        if (
            typeof Chart ===
            "undefined"
        ) return;


        const {
            income,
            expense
        } =
            calculateMonthTotals();


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
        } =
            getCurrentMonthRange();


        const items =
            getPeriodTransactions(
                start,
                end
            );


        const totals = {};


        items.forEach(
            item => {

                if (
                    item.type !==
                    "expense"
                ) {
                    return;
                }


                const category =
                    item.category ||
                    "Outros";


                totals[category] =
                    (
                        totals[category] ||
                        0
                    ) +
                    Number(
                        item.amount
                    );

            }
        );


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
                                        ${escapeHTML(
                                            category
                                        )}
                                    </strong>

                                </div>

                                <span>
                                    ${formatMoney(
                                        value
                                    )}
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


    function updateCategoryChart(
        totals
    ) {

        const canvas =
            document.getElementById(
                "categoryChart"
            );


        if (!canvas) return;

        if (
            typeof Chart ===
            "undefined"
        ) return;


        if (categoryChart) {

            categoryChart.destroy();

        }


        if (
            !Object.keys(totals).length
        ) {

            return;

        }


        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            Object.keys(
                                totals
                            ),

                        datasets: [

                            {

                                data:
                                    Object.values(
                                        totals
                                    ),

                                borderWidth: 2

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

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
                    ${escapeHTML(
                        biggest[0]
                    )}
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
                    ${formatMoney(
                        biggest[1]
                    )}
                </span>

            </div>

        `;


        updateReportChart(
            totals
        );

    }


    function updateReportChart(
        totals
    ) {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );


        if (!canvas) return;

        if (
            typeof Chart ===
            "undefined"
        ) return;


        if (reportCategoryChart) {

            reportCategoryChart.destroy();

        }


        if (
            !Object.keys(totals).length
        ) {

            return;

        }


        reportCategoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            Object.keys(
                                totals
                            ),

                        datasets: [

                            {

                                data:
                                    Object.values(
                                        totals
                                    ),

                                borderWidth: 2

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       PREVISÃO CORRIGIDA
       
       IMPORTANTE:
       A previsão considera apenas despesas
       que realmente aconteceram até hoje.

       Exemplo:
       Receita = 2.200
       Despesa = 800
       Saldo = 1.400

       Se foram gastos R$800 em 1 dia,
       NÃO significa que você gasta R$800
       todos os dias.

       Usamos uma média baseada nos DIAS
       EM QUE EXISTIRAM DESPESAS.
    ===================================================== */

    function calculateForecast() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            now.getMonth();


        const today =
            new Date(
                year,
                month,
                now.getDate(),
                23,
                59,
                59
            );


        const startOfMonth =
            new Date(
                year,
                month,
                1,
                0,
                0,
                0
            );


        const endOfMonth =
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
                startOfMonth,
                today
            );


        let income = 0;

        let expense = 0;


        const expenseByDay = {};


        items.forEach(
            item => {

                const value =
                    Number(
                        item.amount
                    );


                if (
                    item.type ===
                    "income"
                ) {

                    income += value;

                } else {

                    expense += value;


                    const day =
                        item.occurrenceDate
                            .toISOString()
                            .split("T")[0];


                    expenseByDay[day] =
                        (
                            expenseByDay[day] ||
                            0
                        ) +
                        value;

                }

            }
        );


        const balance =
            income - expense;


        /*
         Número real de dias desde
         o início do mês.
        */

        const elapsedDays =
            Math.max(
                1,
                now.getDate()
            );


        /*
         Quantidade de dias restantes.
        */

        const totalDays =
            endOfMonth.getDate();


        const remainingDays =
            Math.max(
                0,
                totalDays -
                elapsedDays
            );


        /*
         Dias em que realmente houve gasto.
        */

        const expenseDays =
            Object.keys(
                expenseByDay
            ).length;


        /*
         MÉDIA DE GASTO
         
         Se houve gasto em apenas 1 dia,
         a média é mostrada como o gasto
         real daquele dia.

         Não usamos essa média para projetar
         automaticamente milhares de reais
         para o restante do mês.
        */

        const averageDailyExpense =
            expenseDays > 0
                ? expense /
                    expenseDays
                : 0;


        /*
         Para uma previsão mais segura,
         usamos a média de gasto considerando
         o período completo já transcorrido.

         Isso impede que um único lançamento
         de R$800 no primeiro dia vire
         R$24.000 de previsão.
        */

        const periodDailyExpense =
            expense /
            elapsedDays;


        /*
         Projeção do restante do mês.
        */

        const estimatedRemainingExpense =
            periodDailyExpense *
            remainingDays;


        /*
         Saldo projetado.
        */

        const forecast =
            balance -
            estimatedRemainingExpense;


        return {

            balance,

            income,

            expense,

            elapsedDays,

            remainingDays,

            expenseDays,

            averageDailyExpense,

            periodDailyExpense,

            estimatedRemainingExpense,

            forecast

        };

    }


    function updateForecast() {

        if (!monthForecast) return;


        const data =
            calculateForecast();


        if (
            !transactions.length
        ) {

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

                ? "Mantendo o ritmo atual, a projeção indica fechamento positivo."

                : "Atenção: mantendo o ritmo atual, a projeção indica saldo negativo.";


        monthForecast.innerHTML = `

            <div class="forecast-content">

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
                        GASTO MÉDIO POR DIA DO MÊS
                    </span>

                    <strong>
                        ${formatMoney(
                            data.periodDailyExpense
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

            </div>


            <div class="empty-state">

                ${message}

            </div>

        `;

    }


    /* =====================================================
       DESEMPENHO PREMIUM
    ===================================================== */

    function updatePremiumPerformance() {

        const totals =
            calculateMonthTotals();


        let economy = 0;


        if (
            totals.income > 0
        ) {

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


        if (premiumPerformanceText) {

            if (
                totals.income === 0
            ) {

                premiumPerformanceText.textContent =
                    "Cadastre suas receitas e despesas para acompanhar seu desempenho.";

            } else if (
                totals.balance >= 0
            ) {

                premiumPerformanceText.textContent =
                    `Você está mantendo ${economy.toFixed(1)}% da sua receita neste mês.`;

            } else {

                premiumPerformanceText.textContent =
                    "Suas despesas estão acima das receitas neste mês.";

            }

        }

    }


    /* =====================================================
       METAS
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
                .map(
                    goal => {

                        const target =
                            Number(
                                goal.target
                            );


                        const saved =
                            Number(
                                goal.saved
                            );


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

                            <div class="category-summary-item">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            goal.name
                                        )}
                                    </strong>

                                    <small style="display:block;margin-top:5px;color:var(--text-light)">
                                        ${formatMoney(saved)}
                                        de
                                        ${formatMoney(target)}
                                    </small>

                                </div>

                                <span>
                                    ${percentage.toFixed(0)}%
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    const newGoalBtn =
        document.getElementById(
            "newGoalBtn"
        );


    const goalModal =
        document.getElementById(
            "goalModal"
        );


    const closeGoalModal =
        document.getElementById(
            "closeGoalModal"
        );


    const goalForm =
        document.getElementById(
            "goalForm"
        );


    if (newGoalBtn) {

        newGoalBtn.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !==
                    "premium"
                ) {

                    alert(
                        "Ative o ControleS Premium para criar metas."
                    );

                    return;

                }


                goalModal.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (closeGoalModal) {

        closeGoalModal.addEventListener(
            "click",
            () => {

                goalModal.classList.add(
                    "hidden"
                );

            }
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
                () => {

                    goalModal.classList.add(
                        "hidden"
                    );

                }
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
                    ).value.trim();


                const target =
                    Number(
                        document.getElementById(
                            "goalTarget"
                        ).value
                    );


                const saved =
                    Number(
                        document.getElementById(
                            "goalSaved"
                        ).value
                    ) || 0;


                if (
                    !name ||
                    target <= 0
                ) {

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

                goalModal.classList.add(
                    "hidden"
                );

                updateGoals();

            }
        );

    }


    /* =====================================================
       ORÇAMENTOS
    ===================================================== */

    function updateBudgets() {

        if (!budgetsList) return;


        const entries =
            Object.entries(
                budgets
            );


        if (!entries.length) {

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
            entries
                .map(
                    ([category, limit]) => {

                        const spent =
                            Number(
                                categoryTotals[
                                    category
                                ] || 0
                            );


                        const percentage =
                            Number(limit) > 0
                                ? Math.min(
                                    100,
                                    (
                                        spent /
                                        Number(limit)
                                    ) * 100
                                )
                                : 0;


                        return `

                            <div class="category-summary-item">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            category
                                        )}
                                    </strong>

                                    <small style="display:block;margin-top:4px;color:var(--text-light)">
                                        ${formatMoney(spent)}
                                        de
                                        ${formatMoney(limit)}
                                    </small>

                                </div>

                                <span>
                                    ${percentage.toFixed(0)}%
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    const newBudgetBtn =
        document.getElementById(
            "newBudgetBtn"
        );


    const budgetModal =
        document.getElementById(
            "budgetModal"
        );


    const closeBudgetModal =
        document.getElementById(
            "closeBudgetModal"
        );


    const budgetForm =
        document.getElementById(
            "budgetForm"
        );


    if (newBudgetBtn) {

        newBudgetBtn.addEventListener(
            "click",
            () => {

                if (
                    currentUser?.plan !==
                    "premium"
                ) {

                    alert(
                        "Ative o ControleS Premium para definir orçamentos."
                    );

                    return;

                }


                budgetModal.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (closeBudgetModal) {

        closeBudgetModal.addEventListener(
            "click",
            () => {

                budgetModal.classList.add(
                    "hidden"
                );

            }
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
                () => {

                    budgetModal.classList.add(
                        "hidden"
                    );

                }
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
                    ).value;


                const limit =
                    Number(
                        document.getElementById(
                            "budgetLimit"
                        ).value
                    );


                if (
                    !category ||
                    limit <= 0
                ) {

                    return;

                }


                budgets[category] =
                    limit;


                saveBudgets();

                budgetForm.reset();

                budgetModal.classList.add(
                    "hidden"
                );

                updateBudgets();

            }
        );

    }


    /* =====================================================
       ALERTAS
    ===================================================== */

    function updateAlerts() {

        if (!smartAlerts) return;


        const totals =
            calculateMonthTotals();


        const alerts = [];


        if (
            totals.expense >
            totals.income &&
            totals.income > 0
        ) {

            alerts.push(
                "🚨 Suas despesas estão maiores que suas receitas neste mês."
            );

        }


        const categoryTotals =
            calculateCategories();


        Object.entries(
            budgets
        ).forEach(
            ([category, limit]) => {

                const spent =
                    Number(
                        categoryTotals[
                            category
                        ] || 0
                    );


                if (
                    spent >=
                    Number(limit)
                ) {

                    alerts.push(
                        `⚠️ O orçamento de ${category} foi atingido.`
                    );

                }

            }
        );


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

                        <div class="category-summary-item">

                            <strong>
                                ${escapeHTML(alert)}
                            </strong>

                        </div>

                    `
                )
                .join("");

    }


    /* =====================================================
       COMPARAÇÃO MENSAL
    ===================================================== */

    function calculateMonthExpense(
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


        return items.reduce(
            (total, item) => {

                if (
                    item.type ===
                    "expense"
                ) {

                    return (
                        total +
                        Number(
                            item.amount
                        )
                    );

                }

                return total;

            },
            0
        );

    }


    function updateMonthlyComparison() {

        if (!monthlyComparison) return;


        const now =
            new Date();


        const current =
            calculateMonthExpense(
                now.getFullYear(),
                now.getMonth()
            );


        const previous =
            calculateMonthExpense(
                now.getFullYear(),
                now.getMonth() - 1
            );


        if (
            current === 0 &&
            previous === 0
        ) {

            monthlyComparison.innerHTML = `

                <div class="empty-state">
                    Ainda não há dados suficientes para comparar os meses.
                </div>

            `;

            return;

        }


        const difference =
            current -
            previous;


        let message;


        if (
            difference > 0
        ) {

            message =
                `Você gastou ${formatMoney(
                    difference
                )} a mais que no mês anterior.`;

        } else if (
            difference < 0
        ) {

            message =
                `Você gastou ${formatMoney(
                    Math.abs(difference)
                )} a menos que no mês anterior.`;

        } else {

            message =
                "Seus gastos estão iguais aos do mês anterior.";

        }


        monthlyComparison.innerHTML = `

            <div class="category-summary-item">

                <strong>
                    ${message}
                </strong>

            </div>

            <div class="category-summary-item">

                <span>
                    Mês atual
                </span>

                <strong>
                    ${formatMoney(current)}
                </strong>

            </div>

            <div class="category-summary-item">

                <span>
                    Mês anterior
                </span>

                <strong>
                    ${formatMoney(previous)}
                </strong>

            </div>

        `;

    }


    /* =====================================================
       SIMULADOR
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
                        "Ative o ControleS Premium para usar o simulador."
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


                const amount =
                    Number(
                        input.value
                    );


                if (
                    amount <= 0
                ) {

                    result.textContent =
                        "Digite um valor válido.";

                    return;

                }


                const totals =
                    calculateMonthTotals();


                const newBalance =
                    totals.balance -
                    amount;


                result.innerHTML = `

                    Saldo atual:
                    <strong>
                        ${formatMoney(
                            totals.balance
                        )}
                    </strong>

                    <br>

                    Saldo após a despesa:
                    <strong>
                        ${formatMoney(
                            newBalance
                        )}
                    </strong>

                `;

            }
        );

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    function updatePremiumAnalysis() {

        if (!premiumAnalysis) return;


        const totals =
            calculateMonthTotals();


        const categoryTotals =
            calculateCategories();


        const entries =
            Object.entries(
                categoryTotals
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );


        const biggest =
            entries.length
                ? entries[0]
                : null;


        premiumAnalysis.innerHTML = `

            <div class="category-summary-item">

                <strong>
                    Receitas
                </strong>

                <span>
                    ${formatMoney(
                        totals.income
                    )}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Despesas
                </strong>

                <span>
                    ${formatMoney(
                        totals.expense
                    )}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Saldo
                </strong>

                <span>
                    ${formatMoney(
                        totals.balance
                    )}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Maior categoria de gasto
                </strong>

                <span>
                    ${
                        biggest
                            ? `${escapeHTML(
                                biggest[0]
                            )} (${formatMoney(
                                biggest[1]
                            )})`
                            : "Nenhuma"
                    }
                </span>

            </div>

        `;

    }


    function updatePremium() {

        updatePremiumPerformance();

        updateGoals();

        updateForecast();

        updateAlerts();

        updateMonthlyComparison();

        updateBudgets();

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
                        "Entre no ControleS primeiro."
                    );

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


                alert(
                    "🎉 ControleS Premium ativado com sucesso!"
                );


                updatePremium();

            }
        );

    }


    /* =====================================================
       TEMA
    ===================================================== */

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );


    function updateThemeButton() {

        if (!themeBtn) return;


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeBtn.innerHTML =
            dark
                ? "<span>☀️</span><span>Tema claro</span>"
                : "<span>🌙</span><span>Tema escuro</span>";

    }


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
                    dark
                        ? "true"
                        : "false"
                );


                updateThemeButton();

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


    updateThemeButton();


    /* =====================================================
       EXPORTAÇÃO
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
                        "Arquivo de backup dos dados financeiros do ControleS."

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


                const date =
                    new Date()
                        .toISOString()
                        .slice(0,10);


                link.download =
                    `controles-backup-${date}.json`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                alert(
                    "💾 Seus dados foram exportados com sucesso."
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

        updatePremiumPerformance();

        updateGoals();

        updateForecast();

        updateAlerts();

        updateMonthlyComparison();

        updateBudgets();

        updatePremiumAnalysis();

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

});

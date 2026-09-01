/* =====================================================
   CONTROLES — APP.JS
   Versão completa — Premium + Login + Finanças
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

    const goalsList =
        document.getElementById("goalsList");

    const budgetsList =
        document.getElementById("budgetsList");

    const smartAlerts =
        document.getElementById("smartAlerts");

    const monthlyComparison =
        document.getElementById("monthlyComparison");

    const premiumAnalysis =
        document.getElementById("premiumAnalysis");


    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = [];

    try {

        transactions = JSON.parse(
            localStorage.getItem(
                "controles_transactions"
            ) || "[]"
        );

    } catch {

        transactions = [];

    }


    let currentUser = null;

    try {

        currentUser = JSON.parse(
            localStorage.getItem(
                "controles_user"
            ) || "null"
        );

    } catch {

        currentUser = null;

    }


    let goals = [];

    try {

        goals = JSON.parse(
            localStorage.getItem(
                "controles_goals"
            ) || "[]"
        );

    } catch {

        goals = [];

    }


    let budgets = {};

    try {

        budgets = JSON.parse(
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
            new Date(
                dateString + "T00:00:00"
            );

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

        if (!loginScreen || !app) return;


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
                    JSON.stringify(
                        currentUser
                    )
                );


                if (nameInput)
                    nameInput.value = "";


                if (emailInput)
                    emailInput.value = "";


                if (passwordInput)
                    passwordInput.value = "";


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

                if (app)
                    app.classList.add(
                        "hidden"
                    );

                if (loginScreen)
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


    function openSection(
        sectionName
    ) {

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
        .forEach(
            button => {

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

            }
        );


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

        if (!transactionModal)
            return;


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

        if (!transactionModal)
            return;


        transactionModal.classList.add(
            "hidden"
        );


        if (transactionForm) {

            transactionForm.reset();

        }


        selectedType =
            "income";


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


    const transactionOverlay =
        transactionModal
            ? transactionModal.querySelector(
                ".modal-overlay"
            )
            : null;


    if (transactionOverlay) {

        transactionOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================================
       TIPO RECEITA / DESPESA
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
                    !amount ||
                    amount <= 0 ||
                    !date
                ) {

                    alert(
                        "Preencha os dados do lançamento."
                    );

                    return;

                }


                transactions.push({

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
            transaction.frequency ===
                "once" ||
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
            transaction.frequency ===
            "daily"
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
            transaction.frequency ===
            "weekly"
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
            transaction.frequency ===
            "monthly"
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
                    current.getDate() !==
                    day
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

        const now =
            new Date();


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
       TRANSAÇÕES
    ===================================================== */

    function createTransactionHTML(
        transaction
    ) {

        const sign =
            transaction.type ===
            "income"
                ? "+"
                : "-";


        const valueClass =
            transaction.type ===
            "income"
                ? "income"
                : "expense";


        const icon =
            transaction.type ===
            "income"
                ? "↗"
                : "↘";


        const occurrenceDate =
            transaction.occurrenceDate
                ? transaction
                    .occurrenceDate
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


    function updateRecentTransactions() {

        if (!recentTransactions)
            return;


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


    function updateAllTransactions() {

        if (!allTransactions)
            return;


        const now =
            new Date();


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
                            item.description ||
                            ""
                        ).toLowerCase();


                    const categoryName =
                        String(
                            item.category ||
                            ""
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


            const exists =
                transactions.some(
                    transaction =>
                        Number(
                            transaction.id
                        ) === id
                );


            if (!exists) return;


            if (
                !confirm(
                    "Excluir este lançamento?"
                )
            ) {

                return;

            }


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

        if (!categoryFilter)
            return;


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

                                label:
                                    "Valor",

                                data: [
                                    income,
                                    expense
                                ],

                                borderWidth:
                                    0

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {
                                display:
                                    false
                            }

                        },

                        scales: {

                            y: {

                                beginAtZero:
                                    true,

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
                ) return;


                const category =
                    item.category ||
                    "Outros";


                if (
                    !totals[category]
                ) {

                    totals[category] =
                        0;

                }


                totals[category] +=
                    Number(
                        item.amount
                    );

            }
        );


        return totals;

    }


    function updateCategories() {

        if (!categoryList)
            return;


        const totals =
            calculateCategories();


        const entries =
            Object.entries(
                totals
            ).sort(
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
                                    (${percentage.toFixed(
                                        1
                                    )}%)
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


        const labels =
            Object.keys(totals);


        const values =
            Object.values(totals);


        if (!labels.length) return;


        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels,

                        datasets: [

                            {

                                data:
                                    values,

                                borderWidth:
                                    2

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

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

        if (!reportAnalysis)
            return;


        const totals =
            calculateCategories();


        const entries =
            Object.entries(
                totals
            ).sort(
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


        const labels =
            Object.keys(totals);


        const values =
            Object.values(totals);


        if (!labels.length) return;


        reportCategoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels,

                        datasets: [

                            {

                                data:
                                    values,

                                borderWidth:
                                    2

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

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
       PREMIUM — PREVISÃO CORRIGIDA
    ===================================================== */

    function calculateForecast() {

        const now =
            new Date();


        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                0,
                0,
                0
            );


        const endOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );


        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59
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
                totalDays -
                elapsedDays
            );


        /*
           PROJEÇÃO INTELIGENTE

           O cálculo considera apenas
           os dias que realmente já passaram.

           Assim, se houver um gasto de
           R$ 800 em um único lançamento,
           ele não será simplesmente tratado
           como R$ 800 todos os dias.
        */


        let projectedExpense =
            totals.expense;


        let averageDailyExpense =
            0;


        if (
            totals.expense > 0 &&
            elapsedDays > 0
        ) {

            averageDailyExpense =
                totals.expense /
                elapsedDays;

        }


        /*
           Só projetamos gastos futuros
           quando já existe algum histórico
           suficiente no mês.

           Nos primeiros dias, mantemos
           a previsão mais conservadora.
        */


        if (
            elapsedDays >= 3
        ) {

            projectedExpense =
                totals.expense +
                (
                    averageDailyExpense *
                    remainingDays
                );

        }


        /*
           Receita prevista:

           Mantemos a receita já registrada
           no mês. Assim a previsão não inventa
           salário ou receita futura.
        */


        const forecast =
            totals.income -
            projectedExpense;


        return {

            balance:
                totals.balance,

            income:
                totals.income,

            expense:
                totals.expense,

            averageDailyExpense,

            remainingDays,

            forecast,

            elapsedDays,

            totalDays

        };

    }


    function updateForecast() {

        if (!monthForecast)
            return;


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

                ? "Mantendo seu ritmo atual, a projeção indica fechamento positivo."

                : "Atenção: mantendo seu ritmo atual, a projeção indica saldo negativo.";


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


            <div class="forecast-details">

                <span>
                    ${data.remainingDays}
                    dias restantes no mês
                </span>

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

        const totals =
            calculateMonthTotals();


        const economy =
            totals.income > 0
                ? (
                    totals.balance /
                    totals.income
                ) * 100
                : 0;


        const performanceText =
            document.getElementById(
                "premiumPerformanceText"
            );


        const premiumEconomyValue =
            document.getElementById(
                "premiumEconomyValue"
            );


        if (premiumEconomyValue) {

            premiumEconomyValue.textContent =
                `${economy.toFixed(1)}%`;

        }


        if (performanceText) {

            if (
                totals.income === 0
            ) {

                performanceText.textContent =
                    "Cadastre suas receitas e despesas para acompanhar seu desempenho.";

            } else if (
                economy >= 50
            ) {

                performanceText.textContent =
                    "Excelente! Você está mantendo uma boa parte da sua receita.";

            } else if (
                economy >= 20
            ) {

                performanceText.textContent =
                    "Seu mês está equilibrado. Continue acompanhando seus gastos.";

            } else if (
                economy >= 0
            ) {

                performanceText.textContent =
                    "Sua economia está baixa. O Premium pode ajudar você a identificar oportunidades.";

            } else {

                performanceText.textContent =
                    "Suas despesas estão acima das receitas neste mês.";

            }

        }

    }


    /* =====================================================
       PREMIUM — METAS
    ===================================================== */

    function updateGoals() {

        if (!goalsList)
            return;


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

                            <div class="premium-goal">

                                <div class="premium-goal-top">

                                    <strong>
                                        🎯 ${escapeHTML(
                                            goal.name
                                        )}
                                    </strong>

                                    <button
                                        type="button"
                                        class="premium-delete"
                                        data-delete-goal="${
                                            goal.id
                                        }"
                                    >
                                        ×
                                    </button>

                                </div>

                                <div class="goal-values">

                                    <span>
                                        ${formatMoney(
                                            saved
                                        )}
                                    </span>

                                    <span>
                                        ${formatMoney(
                                            target
                                        )}
                                    </span>

                                </div>

                                <div class="goal-progress">

                                    <div
                                        style="width:${percentage}%"
                                    ></div>

                                </div>

                                <small>
                                    ${percentage.toFixed(
                                        0
                                    )}% concluído
                                </small>

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


    const goalForm =
        document.getElementById(
            "goalForm"
        );


    const closeGoalModal =
        document.getElementById(
            "closeGoalModal"
        );


    function openGoalModal() {

        if (!goalModal) return;

        goalModal.classList.remove(
            "hidden"
        );

    }


    function closeGoalModalFunction() {

        if (!goalModal) return;

        goalModal.classList.add(
            "hidden"
        );

        if (goalForm)
            goalForm.reset();

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
                        ).value || 0
                    );


                if (
                    !name ||
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

                closeGoalModalFunction();

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
       PREMIUM — ORÇAMENTOS
    ===================================================== */

    function updateBudgets() {

        if (!budgetsList)
            return;


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


        const expenses =
            calculateCategories();


        budgetsList.innerHTML =
            entries
                .map(
                    ([category, limit]) => {

                        const spent =
                            Number(
                                expenses[
                                    category
                                ] || 0
                            );


                        const percentage =
                            limit > 0
                                ? Math.min(
                                    100,
                                    (
                                        spent /
                                        Number(
                                            limit
                                        )
                                    ) * 100
                                )
                                : 0;


                        return `

                            <div class="budget-item">

                                <div class="budget-top">

                                    <strong>
                                        💰 ${escapeHTML(
                                            category
                                        )}
                                    </strong>

                                    <button
                                        type="button"
                                        class="premium-delete"
                                        data-delete-budget="${escapeHTML(
                                            category
                                        )}"
                                    >
                                        ×
                                    </button>

                                </div>

                                <div class="budget-values">

                                    <span>
                                        Gasto:
                                        ${formatMoney(
                                            spent
                                        )}
                                    </span>

                                    <span>
                                        Limite:
                                        ${formatMoney(
                                            limit
                                        )}
                                    </span>

                                </div>

                                <div class="goal-progress">

                                    <div
                                        style="width:${percentage}%"
                                    ></div>

                                </div>

                                <small>
                                    ${percentage.toFixed(
                                        0
                                    )}% utilizado
                                </small>

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


    const budgetForm =
        document.getElementById(
            "budgetForm"
        );


    const closeBudgetModal =
        document.getElementById(
            "closeBudgetModal"
        );


    function openBudgetModal() {

        if (!budgetModal) return;

        budgetModal.classList.remove(
            "hidden"
        );

    }


    function closeBudgetModalFunction() {

        if (!budgetModal) return;

        budgetModal.classList.add(
            "hidden"
        );

        if (budgetForm)
            budgetForm.reset();

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

                    alert(
                        "Informe um limite válido."
                    );

                    return;

                }


                budgets[category] =
                    limit;


                saveBudgets();

                closeBudgetModalFunction();

                updateBudgets();

                updatePremium();

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


            const category =
                button.dataset.deleteBudget;


            delete budgets[
                category
            ];


            saveBudgets();

            updateBudgets();

        }
    );


    /* =====================================================
       PREMIUM — ALERTAS
    ===================================================== */

    function updateSmartAlerts() {

        if (!smartAlerts)
            return;


        const totals =
            calculateMonthTotals();


        const expenses =
            calculateCategories();


        const alerts = [];


        if (
            totals.income > 0 &&
            totals.expense >
                totals.income
        ) {

            alerts.push(
                "Suas despesas já ultrapassaram suas receitas neste mês."
            );

        }


        Object.entries(
            budgets
        ).forEach(
            ([category, limit]) => {

                const spent =
                    Number(
                        expenses[
                            category
                        ] || 0
                    );


                if (
                    spent >=
                    Number(limit)
                ) {

                    alerts.push(
                        `O orçamento de ${category} foi ultrapassado.`
                    );

                } else if (
                    spent >=
                    Number(limit) * 0.8
                ) {

                    alerts.push(
                        `Você já utilizou mais de 80% do orçamento de ${category}.`
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

                        <div class="premium-alert">
                            🚨
                            <span>
                                ${escapeHTML(
                                    alert
                                )}
                            </span>
                        </div>

                    `
                )
                .join("");

    }


    /* =====================================================
       PREMIUM — COMPARAÇÃO MENSAL
    ===================================================== */

    function calculateMonthTotalsFor(
        year,
        month
    ) {

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


        items.forEach(
            item => {

                if (
                    item.type ===
                    "income"
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


    function updateMonthlyComparison() {

        if (!monthlyComparison)
            return;


        const now =
            new Date();


        const current =
            calculateMonthTotalsFor(
                now.getFullYear(),
                now.getMonth()
            );


        const previous =
            calculateMonthTotalsFor(
                now.getMonth() === 0
                    ? now.getFullYear() - 1
                    : now.getFullYear(),
                now.getMonth() === 0
                    ? 11
                    : now.getMonth() - 1
            );


        const difference =
            current.expense -
            previous.expense;


        let message;


        if (
            previous.expense === 0 &&
            current.expense === 0
        ) {

            message =
                "Ainda não existem despesas suficientes para comparar.";

        } else if (
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

            <div class="comparison-box">

                <span>
                    MÊS ANTERIOR
                </span>

                <strong>
                    ${formatMoney(
                        previous.expense
                    )}
                </strong>

            </div>


            <div class="comparison-box">

                <span>
                    MÊS ATUAL
                </span>

                <strong>
                    ${formatMoney(
                        current.expense
                    )}
                </strong>

            </div>


            <div class="empty-state">
                ${message}
            </div>

        `;

    }


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

                const input =
                    document.getElementById(
                        "simulationAmount"
                    );


                const result =
                    document.getElementById(
                        "simulationResult"
                    );


                const amount =
                    input
                        ? Number(
                            input.value
                        )
                        : 0;


                if (
                    !result
                ) return;


                if (
                    !amount ||
                    amount <= 0
                ) {

                    result.innerHTML = `

                        <div class="empty-state">
                            Informe um valor para simular.
                        </div>

                    `;

                    return;

                }


                const totals =
                    calculateMonthTotals();


                const newBalance =
                    totals.balance -
                    amount;


                const positive =
                    newBalance >= 0;


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
                            - ${formatMoney(
                                amount
                            )}
                        </strong>

                    </div>


                    <div class="simulation-card">

                        <span>
                            SALDO APÓS A COMPRA
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
        );

    }


    /* =====================================================
       PREMIUM — ANÁLISE
    ===================================================== */

    function updatePremiumAnalysis() {

        if (!premiumAnalysis)
            return;


        const totals =
            calculateMonthTotals();


        const categories =
            calculateCategories();


        const entries =
            Object.entries(
                categories
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );


        const biggest =
            entries.length
                ? entries[0]
                : null;


        premiumAnalysis.innerHTML = `

            <div class="premium-analysis-grid">

                <div>

                    <span>
                        RECEITAS
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.income
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        DESPESAS
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.expense
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        SALDO
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.balance
                        )}
                    </strong>

                </div>

            </div>


            <div class="premium-analysis-message">

                ${
                    biggest

                        ? `Sua maior categoria de gasto é
                           <strong>${escapeHTML(
                               biggest[0]
                           )}</strong>,
                           com ${formatMoney(
                               biggest[1]
                           )}.`

                        : "Cadastre despesas para receber uma análise personalizada."
                }

            </div>

        `;

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    function updatePremium() {

        updatePremiumPerformance();

        updateGoals();

        updateForecast();

        updateSmartAlerts();

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

                if (!currentUser)
                    return;


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
                    "Parabéns! Seu ControleS agora está no Premium ⭐"
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
                    dark
                        ? "true"
                        : "false"
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

                if (
                    !transactions.length
                ) {

                    alert(
                        "Não existem lançamentos para exportar."
                    );

                    return;

                }


                const data = {

                    sistema:
                        "ControleS",

                    usuario:
                        currentUser,

                    dataExportacao:
                        new Date().toLocaleString(
                            "pt-BR"
                        ),

                    totalLancamentos:
                        transactions.length,

                    lancamentos:
                        transactions

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
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    `controles-exportacao-${todayISO()}.json`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                alert(
                    "Dados exportados com sucesso."
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

});

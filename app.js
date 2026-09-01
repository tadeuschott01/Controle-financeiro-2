/* =====================================================
   CONTROLES — APP.JS
   Versão completa e compatível com o HTML atual
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    const loginScreen = $("loginScreen");
    const loginForm = $("loginForm");
    const app = $("app");

    const userName = $("userName");
    const userAvatar = $("userAvatar");
    const welcomeName = $("welcomeName");
    const userPlan = $("userPlan");

    const pageTitle = $("pageTitle");
    const currentDate = $("currentDate");

    const transactionModal = $("transactionModal");
    const transactionForm = $("transactionForm");

    const descriptionInput = $("descriptionInput");
    const amountInput = $("amountInput");
    const dateInput = $("dateInput");
    const frequencyInput = $("frequencyInput");
    const transactionCategory = $("transactionCategory");

    const recentTransactions = $("recentTransactions");
    const allTransactions = $("allTransactions");

    const searchInput = $("searchInput");
    const typeFilter = $("typeFilter");
    const categoryFilter = $("categoryFilter");

    const balanceValue = $("balanceValue");
    const incomeValue = $("incomeValue");
    const expenseValue = $("expenseValue");
    const economyValue = $("economyValue");

    const categoryList = $("categoryList");
    const reportAnalysis = $("reportAnalysis");

    const monthForecast = $("monthForecast");
    const smartAlerts = $("smartAlerts");
    const monthlyComparison = $("monthlyComparison");
    const goalsList = $("goalsList");
    const budgetsList = $("budgetsList");

    const simulationAmount = $("simulationAmount");
    const simulationResult = $("simulationResult");

    const premiumEconomyValue = $("premiumEconomyValue");
    const premiumPerformanceText = $("premiumPerformanceText");
    const premiumAnalysis = $("premiumAnalysis");


    /* =====================================================
       DADOS
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

    let transactions = readStorage(
        "controles_transactions",
        []
    );

    let goals = readStorage(
        "controles_goals",
        []
    );

    let budgets = readStorage(
        "controles_budgets",
        []
    );

    let currentUser = readStorage(
        "controles_user",
        null
    );

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       STORAGE
    ===================================================== */

    function readStorage(key, fallback) {

        try {

            const value =
                localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : fallback;

        } catch {

            return fallback;

        }

    }


    function saveStorage(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }


    function saveTransactions() {
        saveStorage(
            "controles_transactions",
            transactions
        );
    }


    function saveGoals() {
        saveStorage(
            "controles_goals",
            goals
        );
    }


    function saveBudgets() {
        saveStorage(
            "controles_budgets",
            budgets
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

        const date =
            new Date(dateString + "T00:00:00");

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


    function getCurrentMonthRange() {

        const now = new Date();

        return {

            start: new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                0,
                0,
                0
            ),

            end: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            )

        };

    }


    function getPreviousMonthRange() {

        const now = new Date();

        return {

            start: new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            ),

            end: new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
                23,
                59,
                59
            )

        };

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

        const name =
            currentUser.name || "Usuário";

        if (userName) {
            userName.textContent = name;
        }

        if (welcomeName) {
            welcomeName.textContent = name;
        }

        if (userAvatar) {

            userAvatar.textContent =
                name.charAt(0).toUpperCase();

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
            (event) => {

                event.preventDefault();

                const nameInput =
                    $("loginName");

                const emailInput =
                    $("loginEmail");

                const passwordInput =
                    $("loginPassword");

                const name =
                    nameInput?.value.trim() || "";

                const email =
                    emailInput?.value.trim() || "";

                const password =
                    passwordInput?.value || "";


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


                saveStorage(
                    "controles_user",
                    currentUser
                );


                loadUser();

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        $("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                currentUser = null;

                localStorage.removeItem(
                    "controles_user"
                );

                if (app) {
                    app.classList.add("hidden");
                }

                if (loginScreen) {
                    loginScreen.classList.remove(
                        "hidden"
                    );
                }

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

        sections.forEach(section => {

            section.classList.add("hidden");

        });


        const selected =
            $(sectionName);

        if (selected) {

            selected.classList.remove(
                "hidden"
            );

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
                titles[sectionName] ||
                "Dashboard";

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
                    $("sidebar");

                if (sidebar) {

                    sidebar.classList.remove(
                        "mobile-open"
                    );

                }

            }
        );

    });


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(element => {

            if (
                !element.classList.contains(
                    "nav-item"
                )
            ) {

                element.addEventListener(
                    "click",
                    () => {

                        openSection(
                            element.dataset.section
                        );

                    }
                );

            }

        });


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const mobileMenuBtn =
        $("mobileMenuBtn");

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const sidebar =
                    $("sidebar");

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

        transactionModal.classList.remove(
            "hidden"
        );

        if (dateInput) {
            dateInput.value =
                dateInput.value ||
                todayISO();
        }

        if (descriptionInput) {
            descriptionInput.focus();
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
            dateInput.value = todayISO();
        }

        if (frequencyInput) {
            frequencyInput.value = "once";
        }

    }


    $("openTransactionBtn")
        ?.addEventListener(
            "click",
            openModal
        );


    $("newTransactionButton")
        ?.addEventListener(
            "click",
            openModal
        );


    $("closeModal")
        ?.addEventListener(
            "click",
            closeModal
        );


    const transactionOverlay =
        transactionModal?.querySelector(
            ".modal-overlay"
        );

    if (transactionOverlay) {

        transactionOverlay.addEventListener(
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
                    descriptionInput?.value.trim() ||
                    "";

                const amount =
                    Number(
                        amountInput?.value || 0
                    );

                const date =
                    dateInput?.value || "";

                const frequency =
                    frequencyInput?.value ||
                    "once";

                const category =
                    transactionCategory?.value ||
                    "Outros";


                if (
                    !description ||
                    amount <= 0 ||
                    !date
                ) {

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


        while (current <= endDate) {

            if (current >= startDate) {

                occurrences.push(
                    new Date(current)
                );

            }


            if (
                transaction.frequency ===
                "daily"
            ) {

                current.setDate(
                    current.getDate() + 1
                );

            }

            else if (
                transaction.frequency ===
                "weekly"
            ) {

                current.setDate(
                    current.getDate() + 7
                );

            }

            else if (
                transaction.frequency ===
                "monthly"
            ) {

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

            else {

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
       TOTAIS
    ===================================================== */

    function calculateTotals(
        startDate,
        endDate
    ) {

        const items =
            getPeriodTransactions(
                startDate,
                endDate
            );


        let income = 0;
        let expense = 0;


        items.forEach(item => {

            if (
                item.type === "income"
            ) {

                income +=
                    Number(item.amount);

            } else {

                expense +=
                    Number(item.amount);

            }

        });


        return {

            income,
            expense,
            balance: income - expense

        };

    }


    function calculateMonthTotals() {

        const range =
            getCurrentMonthRange();

        return calculateTotals(
            range.start,
            range.end
        );

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


        const economy =
            totals.income > 0
                ? (
                    totals.balance /
                    totals.income
                ) * 100
                : 0;


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

    function createTransactionHTML(
        transaction
    ) {

        const income =
            transaction.type === "income";

        const sign =
            income ? "+" : "-";

        const valueClass =
            income
                ? "income"
                : "expense";

        const icon =
            income ? "↗" : "↘";


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


    function updateRecentTransactions() {

        if (!recentTransactions) return;

        const range =
            getCurrentMonthRange();

        let items =
            getPeriodTransactions(
                range.start,
                range.end
            );


        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );


        items =
            items.slice(0, 5);


        recentTransactions.innerHTML =
            items.length

                ? items
                    .map(createTransactionHTML)
                    .join("")

                : `
                    <div class="empty-state">
                        Nenhum lançamento neste mês.
                    </div>
                `;

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


        items =
            items.filter(item => {

                const description =
                    String(
                        item.description || ""
                    ).toLowerCase();

                const itemCategory =
                    String(
                        item.category || ""
                    ).toLowerCase();


                return (

                    (
                        !search ||
                        description.includes(search) ||
                        itemCategory.includes(search)
                    )

                    &&

                    (
                        type === "all" ||
                        item.type === type
                    )

                    &&

                    (
                        category === "all" ||
                        item.category === category
                    )

                );

            });


        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );


        allTransactions.innerHTML =
            items.length

                ? items
                    .map(createTransactionHTML)
                    .join("")

                : `
                    <div class="empty-state">
                        Nenhum lançamento encontrado.
                    </div>
                `;

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
       GRÁFICOS
    ===================================================== */

    function updateFinanceChart() {

        const canvas =
            $("financeChart");

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) return;


        const totals =
            calculateMonthTotals();


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

                        datasets: [

                            {

                                label: "Valor",

                                data: [
                                    totals.income,
                                    totals.expense
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

    function calculateCategories(
        startDate,
        endDate
    ) {

        const totals = {};

        const items =
            getPeriodTransactions(
                startDate,
                endDate
            );


        items.forEach(item => {

            if (
                item.type !== "expense"
            ) return;


            const category =
                item.category ||
                "Outros";


            totals[category] =
                (
                    totals[category] || 0
                ) +
                Number(item.amount);

        });


        return totals;

    }


    function updateCategories() {

        if (!categoryList) return;


        const range =
            getCurrentMonthRange();


        const totals =
            calculateCategories(
                range.start,
                range.end
            );


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


    function updateCategoryChart(
        totals
    ) {

        const canvas =
            $("categoryChart");

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) return;


        categoryChart?.destroy();


        const labels =
            Object.keys(totals);

        const values =
            Object.values(totals);


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


        const range =
            getCurrentMonthRange();


        const totals =
            calculateCategories(
                range.start,
                range.end
            );


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
            $("reportCategoryChart");

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

                        datasets: [

                            {

                                data:
                                    Object.values(totals),

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


        if (premiumEconomyValue) {

            premiumEconomyValue.textContent =
                `${economy.toFixed(1)}%`;

        }


        if (premiumPerformanceText) {

            if (!transactions.length) {

                premiumPerformanceText.textContent =
                    "Cadastre seus lançamentos para acompanhar seu desempenho.";

            }

            else if (economy >= 50) {

                premiumPerformanceText.textContent =
                    `Você está mantendo ${economy.toFixed(1)}% da sua receita neste mês. Excelente controle financeiro.`;

            }

            else if (economy >= 20) {

                premiumPerformanceText.textContent =
                    `Você está mantendo ${economy.toFixed(1)}% da sua receita neste mês. Continue acompanhando seus gastos.`;

            }

            else {

                premiumPerformanceText.textContent =
                    `Sua economia está em ${economy.toFixed(1)}%. O Premium pode ajudar você a identificar onde reduzir gastos.`;

            }

        }

    }


    /* =====================================================
       PREMIUM — METAS
    ===================================================== */

    $("newGoalBtn")
        ?.addEventListener(
            "click",
            () => {

                $("goalModal")
                    ?.classList.remove("hidden");

                $("goalName")?.focus();

            }
        );


    $("closeGoalModal")
        ?.addEventListener(
            "click",
            () => {

                $("goalModal")
                    ?.classList.add("hidden");

            }
        );


    $("goalModal")
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () => {

                $("goalModal")
                    ?.classList.add("hidden");

            }
        );


    $("goalForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    $("goalName")
                        ?.value.trim() || "";


                const target =
                    Number(
                        $("goalTarget")
                            ?.value || 0
                    );


                const saved =
                    Number(
                        $("goalSaved")
                            ?.value || 0
                    );


                if (
                    !name ||
                    target <= 0
                ) return;


                goals.push({

                    id: Date.now(),

                    name,

                    target,

                    saved:
                        Math.min(
                            Math.max(
                                saved,
                                0
                            ),
                            target
                        )

                });


                saveGoals();

                $("goalForm").reset();

                $("goalModal")
                    ?.classList.add("hidden");

                updateGoals();

            }
        );


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

                    const percentage =
                        goal.target > 0
                            ? (
                                goal.saved /
                                goal.target
                            ) * 100
                            : 0;


                    return `

                        <div class="premium-list-item">

                            <div>

                                <strong>
                                    🎯 ${escapeHTML(
                                        goal.name
                                    )}
                                </strong>

                                <small>
                                    ${formatMoney(
                                        goal.saved
                                    )}
                                    de
                                    ${formatMoney(
                                        goal.target
                                    )}
                                </small>

                            </div>

                            <strong>
                                ${Math.min(
                                    percentage,
                                    100
                                ).toFixed(0)}%
                            </strong>

                            <button
                                type="button"
                                data-delete-goal="${goal.id}"
                            >
                                ×
                            </button>

                        </div>

                    `;

                })
                .join("");

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

        const totals =
            calculateMonthTotals();


        const day =
            now.getDate();


        const days =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();


        const averageExpense =
            day > 0
                ? totals.expense / day
                : 0;


        const remaining =
            Math.max(
                0,
                days - day
            );


        const forecast =
            totals.balance -
            (
                averageExpense *
                remaining
            );


        return {

            ...totals,

            averageExpense,

            remaining,

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
                        data.averageExpense
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

        `;

    }


    /* =====================================================
       PREMIUM — ALERTAS INTELIGENTES
    ===================================================== */

    function updateSmartAlerts() {

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
                "Suas despesas já ultrapassaram suas receitas neste mês."
            );

        }


        const categoriesTotals =
            calculateCategories(
                getCurrentMonthRange().start,
                getCurrentMonthRange().end
            );


        const entries =
            Object.entries(
                categoriesTotals
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );


        if (entries.length) {

            const biggest =
                entries[0];


            if (
                totals.expense > 0 &&
                biggest[1] >
                    totals.expense * 0.4
            ) {

                alerts.push(
                    `${biggest[0]} representa mais de 40% das suas despesas neste mês.`
                );

            }

        }


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
                            <span>⚠️</span>
                            <p>${escapeHTML(
                                alert
                            )}</p>
                        </div>
                    `
                )
                .join("");

    }


    /* =====================================================
       PREMIUM — COMPARAÇÃO MENSAL
    ===================================================== */

    function updateMonthlyComparison() {

        if (!monthlyComparison) return;


        const current =
            calculateMonthTotals();


        const previousRange =
            getPreviousMonthRange();


        const previous =
            calculateTotals(
                previousRange.start,
                previousRange.end
            );


        const expenseDifference =
            current.expense -
            previous.expense;


        const incomeDifference =
            current.income -
            previous.income;


        const expenseText =
            expenseDifference > 0
                ? `Você gastou ${formatMoney(
                    expenseDifference
                )} a mais que no mês anterior.`
                : expenseDifference < 0
                    ? `Você gastou ${formatMoney(
                        Math.abs(
                            expenseDifference
                        )
                    )} a menos que no mês anterior.`
                    : "Seus gastos estão iguais aos do mês anterior.";


        monthlyComparison.innerHTML = `

            <div class="comparison-item">

                <span>
                    RECEITAS
                </span>

                <strong>
                    ${formatMoney(
                        current.income
                    )}
                </strong>

                <small>
                    ${
                        incomeDifference >= 0
                            ? "↑ "
                            : "↓ "
                    }
                    ${formatMoney(
                        Math.abs(
                            incomeDifference
                        )
                    )}
                    vs. mês anterior
                </small>

            </div>

            <div class="comparison-item">

                <span>
                    DESPESAS
                </span>

                <strong>
                    ${formatMoney(
                        current.expense
                    )}
                </strong>

                <small>
                    ${
                        expenseDifference <= 0
                            ? "↓ "
                            : "↑ "
                    }
                    ${formatMoney(
                        Math.abs(
                            expenseDifference
                        )
                    )}
                    vs. mês anterior
                </small>

            </div>

            <div class="comparison-highlight">

                📊 ${escapeHTML(
                    expenseText
                )}

            </div>

        `;

    }


    /* =====================================================
       PREMIUM — ORÇAMENTO
    ===================================================== */

    $("newBudgetBtn")
        ?.addEventListener(
            "click",
            () => {

                $("budgetModal")
                    ?.classList.remove("hidden");

            }
        );


    $("closeBudgetModal")
        ?.addEventListener(
            "click",
            () => {

                $("budgetModal")
                    ?.classList.add("hidden");

            }
        );


    $("budgetModal")
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () => {

                $("budgetModal")
                    ?.classList.add("hidden");

            }
        );


    $("budgetForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const category =
                    $("budgetCategory")
                        ?.value || "";


                const limit =
                    Number(
                        $("budgetLimit")
                            ?.value || 0
                    );


                if (
                    !category ||
                    limit <= 0
                ) return;


                budgets =
                    budgets.filter(
                        budget =>
                            budget.category !==
                            category
                    );


                budgets.push({

                    id: Date.now(),

                    category,

                    limit

                });


                saveBudgets();

                $("budgetForm").reset();

                $("budgetModal")
                    ?.classList.add("hidden");

                updateBudgets();

            }
        );


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


        const range =
            getCurrentMonthRange();


        const spent =
            calculateCategories(
                range.start,
                range.end
            );


        budgetsList.innerHTML =
            budgets
                .map(budget => {

                    const used =
                        Number(
                            spent[
                                budget.category
                            ] || 0
                        );


                    const percentage =
                        budget.limit > 0
                            ? (
                                used /
                                budget.limit
                            ) * 100
                            : 0;


                    const exceeded =
                        percentage >= 100;


                    return `

                        <div class="premium-list-item">

                            <div>

                                <strong>
                                    💰 ${escapeHTML(
                                        budget.category
                                    )}
                                </strong>

                                <small>
                                    ${formatMoney(
                                        used
                                    )}
                                    de
                                    ${formatMoney(
                                        budget.limit
                                    )}
                                </small>

                            </div>

                            <strong class="${
                                exceeded
                                    ? "budget-danger"
                                    : ""
                            }">
                                ${Math.min(
                                    percentage,
                                    999
                                ).toFixed(0)}%
                            </strong>

                            <button
                                type="button"
                                data-delete-budget="${budget.id}"
                            >
                                ×
                            </button>

                        </div>

                    `;

                })
                .join("");

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

    $("simulateBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!simulationResult) return;


                const amount =
                    Number(
                        simulationAmount?.value ||
                        0
                    );


                if (
                    amount <= 0
                ) {

                    simulationResult.innerHTML = `
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
        );


    /* =====================================================
       PREMIUM — ANÁLISE
    ===================================================== */

    function updatePremiumAnalysis() {

        if (!premiumAnalysis) return;


        const totals =
            calculateMonthTotals();


        const categoriesTotals =
            calculateCategories(
                getCurrentMonthRange().start,
                getCurrentMonthRange().end
            );


        const entries =
            Object.entries(
                categoriesTotals
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );


        if (
            totals.income === 0 &&
            totals.expense === 0
        ) {

            premiumAnalysis.innerHTML = `
                <div class="empty-state">
                    Cadastre lançamentos para gerar sua análise financeira.
                </div>
            `;

            return;

        }


        const biggest =
            entries[0];


        premiumAnalysis.innerHTML = `

            <div class="analysis-item">

                <span>
                    Receitas
                </span>

                <strong>
                    ${formatMoney(
                        totals.income
                    )}
                </strong>

            </div>

            <div class="analysis-item">

                <span>
                    Despesas
                </span>

                <strong>
                    ${formatMoney(
                        totals.expense
                    )}
                </strong>

            </div>

            <div class="analysis-item">

                <span>
                    Saldo
                </span>

                <strong>
                    ${formatMoney(
                        totals.balance
                    )}
                </strong>

            </div>

            ${
                biggest
                    ? `
                        <div class="analysis-item">

                            <span>
                                Maior categoria de gasto
                            </span>

                            <strong>
                                ${escapeHTML(
                                    biggest[0]
                                )}
                                —
                                ${formatMoney(
                                    biggest[1]
                                )}
                            </strong>

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

        updateSmartAlerts();

        updateMonthlyComparison();

        updateBudgets();

        updatePremiumAnalysis();

    }


    $("subscribePremiumBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!currentUser) return;


                currentUser.plan =
                    "premium";


                saveStorage(
                    "controles_user",
                    currentUser
                );


                if (userPlan) {

                    userPlan.textContent =
                        "ControleS Premium ⭐";

                }


                updatePremium();

            }
        );


    /* =====================================================
       TEMA ESCURO
    ===================================================== */

    const themeBtn =
        $("themeBtn");


    function loadTheme() {

        if (
            localStorage.getItem(
                "controles_dark"
            ) === "true"
        ) {

            document.body.classList.add(
                "dark"
            );

        }

    }


    themeBtn?.addEventListener(
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


    loadTheme();


    /* =====================================================
       EXPORTAÇÃO
    ===================================================== */

    $("exportDataBtn")
        ?.addEventListener(
            "click",
            () => {

                const exportData = {

                    aplicativo:
                        "ControleS",

                    versao:
                        "1.0",

                    usuario:
                        currentUser,

                    exportadoEm:
                        new Date().toLocaleString(
                            "pt-BR"
                        ),

                    resumo:
                        calculateMonthTotals(),

                    lancamentos:
                        transactions,

                    metasFinanceiras:
                        goals,

                    orcamentos:
                        budgets

                };


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                exportData,
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
                    `controles-exportacao-${todayISO()}.json`;


                document.body.appendChild(
                    link
                );


                link.click();

                link.remove();

                URL.revokeObjectURL(
                    url
                );

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

        dateInput.value =
            todayISO();

    }


    updateTypeButtons();

    loadUser();

});

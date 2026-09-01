/* =====================================================
   CONTROLES — APP.JS
   Versão completa
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

                if (
                    !name ||
                    !email ||
                    !password
                ) {
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

                if (nameInput) {
                    nameInput.value = "";
                }

                if (emailInput) {
                    emailInput.value = "";
                }

                if (passwordInput) {
                    passwordInput.value = "";
                }

                loginScreen.classList.add("hidden");
                app.classList.remove("hidden");

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
       MODAL
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

            dateInput.value =
                todayISO();

        }

        if (frequencyInput) {

            frequencyInput.value =
                "once";

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
        document.querySelector(".modal-overlay");

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
       RECORRÊNCIAS
       
       IMPORTANTE:
       A receita mensal aparece somente 1 vez
       em cada mês, nunca diariamente.
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


        /* DIÁRIA */

        if (
            transaction.frequency === "daily"
        ) {

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


        /* SEMANAL */

        if (
            transaction.frequency === "weekly"
        ) {

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


        /* MENSAL */

        if (
            transaction.frequency === "monthly"
        ) {

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

                /*
                 Evita problemas de datas como
                 31 de janeiro -> março.
                */

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
       
       Agora mostra somente uma janela de 3 meses:
       mês anterior + mês atual + próximo mês.
       Isso evita a aparência de repetição de 1 ano.
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

            if (
                item.type !== "expense"
            ) {
                return;
            }


            const category =
                item.category || "Outros";


            if (
                !totals[category]
            ) {

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

        if (typeof Chart === "undefined") return;


        if (categoryChart) {

            categoryChart.destroy();

        }


        categoryChart =
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


    function updateReportChart(
        totals
    ) {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );


        if (!canvas) return;

        if (typeof Chart === "undefined") return;


        if (reportCategoryChart) {

            reportCategoryChart.destroy();

        }


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
       PREMIUM — PREVISÃO DO FIM DO MÊS
       
       A previsão NÃO calcula um ano inteiro.
       Ela olha apenas para o mês atual.
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
                    ) /
                    86400000
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

            balance:
                totals.balance,

            income:
                totals.income,

            expense:
                totals.expense,

            averageDailyExpense,

            remainingDays,

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

                ? "Mantendo seu ritmo atual, a projeção indica fechamento positivo."

                : "Atenção: mantendo seu ritmo atual, a projeção indica saldo negativo.";


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

                ${message}

            </div>

        `;

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    function updatePremium() {

        updateForecast();

    }


    const subscribePremiumBtn =
        document.getElementById(
            "subscribePremiumBtn"
        );


    if (subscribePremiumBtn) {

        subscribePremiumBtn.addEventListener(
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


                if (userPlan) {

                    userPlan.textContent =
                        "ControleS Premium ⭐";

                }


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
       EXPORTAR DADOS
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

                    user:
                        currentUser,

                    transactions:
                        transactions,

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
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    "controles-dados.json";


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

/* =====================================================
   CONTROLES — APP.JS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    const loginForm = document.getElementById("loginForm");

    const loginName = document.getElementById("loginName");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const userPlan = document.getElementById("userPlan");

    const pageTitle = document.getElementById("pageTitle");
    const currentDate = document.getElementById("currentDate");

    const balanceValue = document.getElementById("balanceValue");
    const incomeValue = document.getElementById("incomeValue");
    const expenseValue = document.getElementById("expenseValue");
    const economyValue = document.getElementById("economyValue");

    const recentTransactions =
        document.getElementById("recentTransactions");

    const allTransactions =
        document.getElementById("allTransactions");

    const categoryList =
        document.getElementById("categoryList");

    const reportAnalysis =
        document.getElementById("reportAnalysis");

    const monthForecast =
        document.getElementById("monthForecast");

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

    const transactionCategory =
        document.getElementById("transactionCategory");

    const searchInput =
        document.getElementById("searchInput");

    const typeFilter =
        document.getElementById("typeFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const themeBtn =
        document.getElementById("themeBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const exportDataBtn =
        document.getElementById("exportDataBtn");

    const openTransactionBtn =
        document.getElementById("openTransactionBtn");

    const newTransactionButton =
        document.getElementById("newTransactionButton");

    const closeModal =
        document.getElementById("closeModal");

    const subscribePremiumBtn =
        document.getElementById("subscribePremiumBtn");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.getElementById("sidebar");


    /* =====================================================
       DADOS
    ===================================================== */

    let transactions =
        JSON.parse(localStorage.getItem("controles_transactions")) || [];

    let currentType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

    function saveTransactions() {
        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
        );
    }


    function formatCurrency(value) {

        return Number(value || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function formatDate(date) {

        if (!date) return "";

        const parts = date.split("-");

        if (parts.length !== 3) return date;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }


    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    function getUser() {

        return JSON.parse(
            localStorage.getItem("controles_user")
        );
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    function showApp() {

        loginScreen.classList.add("hidden");
        app.classList.remove("hidden");

        const user = getUser();

        if (user) {

            userName.textContent = user.name;
            welcomeName.textContent = user.name;

            const firstLetter =
                user.name
                    .trim()
                    .charAt(0)
                    .toUpperCase();

            userAvatar.textContent =
                firstLetter || "U";
        }

        updateDate();
        updateDashboard();
    }


    function showLogin() {

        loginScreen.classList.remove("hidden");
        app.classList.add("hidden");
    }


    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name =
            loginName.value.trim();

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        if (!name || !email || !password) {

            alert("Preencha todos os campos.");

            return;
        }

        const user = {
            name,
            email
        };

        localStorage.setItem(
            "controles_user",
            JSON.stringify(user)
        );

        showApp();
    });


    /* =====================================================
       DATA
    ===================================================== */

    function updateDate() {

        const now = new Date();

        currentDate.textContent =
            now.toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
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


    function openSection(sectionId) {

        sections.forEach(section => {

            section.classList.add("hidden");

        });

        const selected =
            document.getElementById(sectionId);

        if (selected) {

            selected.classList.remove("hidden");

        }


        navItems.forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.section === sectionId
            ) {

                item.classList.add("active");

            }

        });


        const titles = {

            dashboard: "Dashboard",

            transactions: "Lançamentos",

            categories: "Categorias",

            reports: "Relatórios",

            premium: "Premium"

        };


        pageTitle.textContent =
            titles[sectionId] ||
            "Dashboard";


        if (window.innerWidth <= 900) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }


        if (sectionId === "categories") {

            setTimeout(
                renderCategoryChart,
                100
            );

        }


        if (sectionId === "reports") {

            setTimeout(
                renderReportChart,
                100
            );

        }


        if (sectionId === "premium") {

            renderForecast();

        }

    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                openSection(
                    item.dataset.section
                );

            }
        );

    });


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
       MODAL
    ===================================================== */

    function openModal() {

        transactionModal.classList.remove(
            "hidden"
        );

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

        descriptionInput.focus();
    }


    function closeTransactionModal() {

        transactionModal.classList.add(
            "hidden"
        );

        transactionForm.reset();

        currentType = "income";

        updateTypeButtons();
    }


    openTransactionBtn.addEventListener(
        "click",
        openModal
    );


    newTransactionButton.addEventListener(
        "click",
        openModal
    );


    closeModal.addEventListener(
        "click",
        closeTransactionModal
    );


    document
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            closeTransactionModal
        );


    /* =====================================================
       TIPO DA TRANSAÇÃO
    ===================================================== */

    const typeButtons =
        document.querySelectorAll(
            ".type-option"
        );


    function updateTypeButtons() {

        typeButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.type === currentType
            );

        });

    }


    typeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentType =
                    button.dataset.type;

                updateTypeButtons();

            }
        );

    });


    /* =====================================================
       SALVAR TRANSAÇÃO
    ===================================================== */

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

            const category =
                transactionCategory.value;


            if (
                !description ||
                !amount ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Preencha os dados corretamente."
                );

                return;
            }


            const transaction = {

                id: Date.now(),

                type: currentType,

                description,

                amount,

                date,

                category

            };


            transactions.unshift(
                transaction
            );


            saveTransactions();

            closeTransactionModal();

            updateDashboard();

            alert(
                "Lançamento salvo com sucesso!"
            );

        }
    );


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function calculateTotals() {

        let income = 0;
        let expense = 0;


        transactions.forEach(transaction => {

            if (
                transaction.type === "income"
            ) {

                income +=
                    Number(transaction.amount);

            } else {

                expense +=
                    Number(transaction.amount);

            }

        });


        return {

            income,

            expense,

            balance:
                income - expense

        };

    }


    function updateDashboard() {

        const totals =
            calculateTotals();


        balanceValue.textContent =
            formatCurrency(
                totals.balance
            );


        incomeValue.textContent =
            formatCurrency(
                totals.income
            );


        expenseValue.textContent =
            formatCurrency(
                totals.expense
            );


        let economy = 0;


        if (totals.income > 0) {

            economy =
                (
                    (totals.income -
                        totals.expense)
                    /
                    totals.income
                ) * 100;

        }


        economyValue.textContent =
            `${Math.max(
                0,
                economy
            ).toFixed(0)}%`;


        renderRecentTransactions();

        renderAllTransactions();

        updateCategoryFilter();

        renderCategoryList();

        renderReportAnalysis();

        renderForecast();

        renderFinanceChart();

    }


    /* =====================================================
       TRANSAÇÕES RECENTES
    ===================================================== */

    function renderRecentTransactions() {

        if (!recentTransactions) return;


        const recent =
            transactions.slice(0, 5);


        if (!recent.length) {

            recentTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento cadastrado ainda.
                </div>
            `;

            return;
        }


        recentTransactions.innerHTML =
            recent.map(
                transactionHTML
            ).join("");

    }


    function transactionHTML(transaction) {

        const isIncome =
            transaction.type === "income";


        return `

            <div class="transaction">

                <div class="transaction-icon">
                    ${isIncome ? "↗" : "↘"}
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
                            transaction.date
                        )}
                    </small>

                </div>

                <div class="
                    transaction-value
                    ${isIncome
                        ? "income"
                        : "expense"}
                ">

                    ${isIncome ? "+" : "-"}
                    ${formatCurrency(
                        transaction.amount
                    )}

                </div>

                <button
                    class="transaction-delete"
                    data-delete-id="${transaction.id}"
                    title="Excluir"
                >
                    ×
                </button>

            </div>

        `;

    }


    /* =====================================================
       TODOS OS LANÇAMENTOS
    ===================================================== */

    function renderAllTransactions() {

        if (!allTransactions) return;


        const search =
            (
                searchInput?.value ||
                ""
            )
            .toLowerCase()
            .trim();


        const type =
            typeFilter?.value ||
            "all";


        const category =
            categoryFilter?.value ||
            "all";


        const filtered =
            transactions.filter(
                transaction => {

                    const matchesSearch =
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

                }
            );


        if (!filtered.length) {

            allTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento encontrado.
                </div>
            `;

            return;

        }


        allTransactions.innerHTML =
            filtered
                .map(transactionHTML)
                .join("");

    }


    /* =====================================================
       EXCLUIR
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


            const confirmed =
                confirm(
                    "Deseja excluir este lançamento?"
                );


            if (!confirmed) return;


            transactions =
                transactions.filter(
                    transaction =>
                        transaction.id !== id
                );


            saveTransactions();

            updateDashboard();

        }
    );


    /* =====================================================
       FILTROS
    ===================================================== */

    searchInput?.addEventListener(
        "input",
        renderAllTransactions
    );


    typeFilter?.addEventListener(
        "change",
        renderAllTransactions
    );


    function updateCategoryFilter() {

        if (!categoryFilter) return;


        const currentValue =
            categoryFilter.value;


        const categories =
            [
                ...new Set(
                    transactions.map(
                        transaction =>
                            transaction.category
                    )
                )
            ]
            .sort();


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


        if (
            categories.includes(
                currentValue
            )
        ) {

            categoryFilter.value =
                currentValue;

        }

    }


    categoryFilter?.addEventListener(
        "change",
        renderAllTransactions
    );


    /* =====================================================
       GRÁFICO FINANCEIRO
    ===================================================== */

    function renderFinanceChart() {

        const canvas =
            document.getElementById(
                "financeChart"
            );


        if (!canvas) return;


        if (financeChart) {

            financeChart.destroy();

        }


        const now =
            new Date();


        const labels = [];

        const incomeData = [];

        const expenseData = [];


        for (
            let i = 5;
            i >= 0;
            i--
        ) {

            const date =
                new Date(
                    now.getFullYear(),
                    now.getMonth() - i,
                    1
                );


            const month =
                date.getMonth();

            const year =
                date.getFullYear();


            labels.push(
                date.toLocaleDateString(
                    "pt-BR",
                    {
                        month: "short"
                    }
                )
            );


            let income = 0;
            let expense = 0;


            transactions.forEach(
                transaction => {

                    const transactionDate =
                        new Date(
                            transaction.date +
                            "T00:00:00"
                        );


                    if (
                        transactionDate.getMonth()
                            === month &&
                        transactionDate.getFullYear()
                            === year
                    ) {

                        if (
                            transaction.type ===
                            "income"
                        ) {

                            income +=
                                Number(
                                    transaction.amount
                                );

                        } else {

                            expense +=
                                Number(
                                    transaction.amount
                                );

                        }

                    }

                }
            );


            incomeData.push(income);

            expenseData.push(expense);

        }


        financeChart =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels,

                        datasets: [

                            {
                                label: "Receitas",
                                data: incomeData
                            },

                            {
                                label: "Despesas",
                                data: expenseData
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

                        },

                        scales: {

                            y: {

                                beginAtZero: true

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       CATEGORIAS
    ===================================================== */

    function getExpenseCategories() {

        const categories = {};


        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .forEach(
                transaction => {

                    const category =
                        transaction.category;

                    categories[category] =
                        (
                            categories[category] ||
                            0
                        ) +
                        Number(
                            transaction.amount
                        );

                }
            );


        return categories;

    }


    function renderCategoryChart() {

        const canvas =
            document.getElementById(
                "categoryChart"
            );


        if (!canvas) return;


        if (categoryChart) {

            categoryChart.destroy();

        }


        const categories =
            getExpenseCategories();


        const labels =
            Object.keys(categories);


        const values =
            Object.values(categories);


        if (!labels.length) {

            categoryChart =
                new Chart(
                    canvas,
                    {
                        type: "doughnut",

                        data: {

                            labels: [
                                "Sem despesas"
                            ],

                            datasets: [
                                {
                                    data: [1]
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
                                data: values
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
       ANÁLISE POR CATEGORIA
    ===================================================== */

    function renderCategoryList() {

        if (!categoryList) return;


        const categories =
            getExpenseCategories();


        const total =
            Object.values(categories)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );


        const entries =
            Object.entries(
                categories
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


        if (!entries.length) {

            categoryList.innerHTML = `
                <div class="empty-state">
                    Cadastre despesas para visualizar a análise por categoria.
                </div>
            `;

            return;

        }


        categoryList.innerHTML =
            entries.map(
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

                                <span class="category-dot"></span>

                                <strong>
                                    ${escapeHTML(
                                        category
                                    )}
                                </strong>

                            </div>

                            <span>
                                ${formatCurrency(
                                    value
                                )}
                                •
                                ${percentage.toFixed(
                                    1
                                )}%
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       RELATÓRIOS
    ===================================================== */

    function renderReportChart() {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );


        if (!canvas) return;


        if (reportCategoryChart) {

            reportCategoryChart.destroy();

        }


        const categories =
            getExpenseCategories();


        const labels =
            Object.keys(categories);


        const values =
            Object.values(categories);


        reportCategoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            labels.length
                                ? labels
                                : [
                                    "Sem despesas"
                                ],

                        datasets: [
                            {
                                data:
                                    values.length
                                        ? values
                                        : [1]
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


    function renderReportAnalysis() {

        if (!reportAnalysis) return;


        const totals =
            calculateTotals();


        if (
            transactions.length === 0
        ) {

            reportAnalysis.innerHTML = `
                <div class="empty-state">
                    Cadastre lançamentos para gerar sua análise.
                </div>
            `;

            return;

        }


        const categories =
            getExpenseCategories();


        const entries =
            Object.entries(
                categories
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


        const biggest =
            entries[0];


        let html = `

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Saldo atual
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        totals.balance
                    )}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Total de receitas
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        totals.income
                    )}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Total de despesas
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        totals.expense
                    )}
                </span>

            </div>

        `;


        if (biggest) {

            html += `

                <div class="category-summary-item">

                    <div class="category-summary-left">

                        <span class="category-dot"></span>

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

            `;

        }


        reportAnalysis.innerHTML =
            html;

    }


    /* =====================================================
       PREVISÃO DO FIM DO MÊS — PREMIUM
    ===================================================== */

    function renderForecast() {

        if (!monthForecast) return;


        if (!transactions.length) {

            monthForecast.innerHTML = `
                <div class="empty-state">
                    Adicione seus lançamentos para visualizar
                    uma previsão financeira.
                </div>
            `;

            return;

        }


        const totals =
            calculateTotals();


        const now =
            new Date();


        const day =
            now.getDate();


        const lastDay =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();


        const daysPassed =
            Math.max(day, 1);


        const daysRemaining =
            Math.max(
                lastDay - day,
                0
            );


        const dailyExpense =
            totals.expense /
            daysPassed;


        const predictedExpense =
            totals.expense +
            (
                dailyExpense *
                daysRemaining
            );


        const predictedBalance =
            totals.income -
            predictedExpense;


        monthForecast.innerHTML = `

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Saldo atual
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        totals.balance
                    )}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Gasto médio diário
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        dailyExpense
                    )}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Previsão de despesas
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        predictedExpense
                    )}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <span class="category-dot"></span>

                    <strong>
                        Previsão de saldo
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        predictedBalance
                    )}
                </span>

            </div>

        `;

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    subscribePremiumBtn?.addEventListener(
        "click",
        () => {

            const user =
                getUser();


            if (!user) return;


            localStorage.setItem(
                "controles_premium",
                "true"
            );


            userPlan.textContent =
                "ControleS Premium ⭐";


            subscribePremiumBtn.textContent =
                "Premium ativado ⭐";


            subscribePremiumBtn.disabled =
                true;


            alert(
                "Premium ativado com sucesso! ⭐"
            );

        }
    );


    function loadPremium() {

        const premium =
            localStorage.getItem(
                "controles_premium"
            );


        if (premium === "true") {

            userPlan.textContent =
                "ControleS Premium ⭐";


            if (subscribePremiumBtn) {

                subscribePremiumBtn.textContent =
                    "Premium ativado ⭐";

                subscribePremiumBtn.disabled =
                    true;

            }

        }

    }


    /* =====================================================
       TEMA ESCURO
    ===================================================== */

    function loadTheme() {

        const dark =
            localStorage.getItem(
                "controles_dark"
            );


        if (dark === "true") {

            document.body.classList.add(
                "dark"
            );

            themeBtn.innerHTML =
                "<span>☀️</span><span>Tema claro</span>";

        }

    }


    themeBtn.addEventListener(
        "click",
        () => {

            const dark =
                document.body.classList.toggle(
                    "dark"
                );


            localStorage.setItem(
                "controles_dark",
                dark
            );


            themeBtn.innerHTML =
                dark
                    ? "<span>☀️</span><span>Tema claro</span>"
                    : "<span>🌙</span><span>Tema escuro</span>";

        }
    );


    /* =====================================================
       EXPORTAR DADOS
    ===================================================== */

    exportDataBtn.addEventListener(
        "click",
        () => {

            const data = {

                user: getUser(),

                transactions,

                premium:
                    localStorage.getItem(
                        "controles_premium"
                    ) === "true",

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


            link.click();


            URL.revokeObjectURL(
                url
            );

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Deseja sair do ControleS?"
                );


            if (!confirmed) return;


            localStorage.removeItem(
                "controles_user"
            );


            showLogin();

            loginForm.reset();

        }
    );


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    loadTheme();

    loadPremium();


    const savedUser =
        getUser();


    if (savedUser) {

        showApp();

    } else {

        showLogin();

    }

});

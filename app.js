/* =====================================================
   CONTROLES — APP.JS
   Controle financeiro
===================================================== */

"use strict";

/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const STORAGE_KEYS = {
    USER: "controles_user",
    TRANSACTIONS: "controles_transactions",
    THEME: "controles_theme",
    PREMIUM: "controles_premium"
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
let currentUser = null;
let selectedType = "income";

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;


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
const userPlan = document.getElementById("userPlan");
const userAvatar = document.getElementById("userAvatar");
const welcomeName = document.getElementById("welcomeName");

const pageTitle = document.getElementById("pageTitle");
const currentDate = document.getElementById("currentDate");

const sidebar = document.getElementById("sidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const themeBtn = document.getElementById("themeBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const logoutBtn = document.getElementById("logoutBtn");

const openTransactionBtn =
    document.getElementById("openTransactionBtn");

const newTransactionButton =
    document.getElementById("newTransactionButton");

const transactionModal =
    document.getElementById("transactionModal");

const closeModal =
    document.getElementById("closeModal");

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

const typeOptions =
    document.querySelectorAll(".type-option");

const balanceValue =
    document.getElementById("balanceValue");

const incomeValue =
    document.getElementById("incomeValue");

const expenseValue =
    document.getElementById("expenseValue");

const economyValue =
    document.getElementById("economyValue");

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

const categoryList =
    document.getElementById("categoryList");

const reportAnalysis =
    document.getElementById("reportAnalysis");

const monthForecast =
    document.getElementById("monthForecast");

const subscribePremiumBtn =
    document.getElementById("subscribePremiumBtn");


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadUser();
    loadTransactions();
    loadTheme();

    setCurrentDate();
    populateCategoryFilter();

    setupNavigation();
    setupEvents();

    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }
});


/* =====================================================
   LOGIN
===================================================== */

function setupEvents() {

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (openTransactionBtn) {
        openTransactionBtn.addEventListener(
            "click",
            openTransactionModal
        );
    }

    if (newTransactionButton) {
        newTransactionButton.addEventListener(
            "click",
            openTransactionModal
        );
    }

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeTransactionModal
        );
    }

    document
        .querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            closeTransactionModal
        );

    if (transactionForm) {
        transactionForm.addEventListener(
            "submit",
            saveTransaction
        );
    }

    typeOptions.forEach(option => {

        option.addEventListener("click", () => {

            selectedType =
                option.dataset.type || "income";

            typeOptions.forEach(item => {
                item.classList.remove("active");
            });

            option.classList.add("active");
        });

    });

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            renderAllTransactions
        );
    }

    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            renderAllTransactions
        );
    }

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            renderAllTransactions
        );
    }

    if (themeBtn) {
        themeBtn.addEventListener(
            "click",
            toggleTheme
        );
    }

    if (exportDataBtn) {
        exportDataBtn.addEventListener(
            "click",
            exportData
        );
    }

    if (logoutBtn) {
        logoutBtn.addEventListener(
            "click",
            logout
        );
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener(
            "click",
            () => {
                sidebar.classList.toggle(
                    "mobile-open"
                );
            }
        );
    }

    if (subscribePremiumBtn) {
        subscribePremiumBtn.addEventListener(
            "click",
            activatePremium
        );
    }

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeTransactionModal();
            }

        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

function handleLogin(event) {

    event.preventDefault();

    const name =
        loginName.value.trim();

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value.trim();

    if (!name || !email || !password) {
        alert("Preencha todos os campos.");
        return;
    }

    if (password.length < 4) {
        alert("A senha precisa ter pelo menos 4 caracteres.");
        return;
    }

    currentUser = {
        name,
        email
    };

    localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(currentUser)
    );

    showApp();
}


function loadUser() {

    try {

        const savedUser =
            localStorage.getItem(
                STORAGE_KEYS.USER
            );

        if (savedUser) {
            currentUser =
                JSON.parse(savedUser);
        }

    } catch (error) {

        console.error(
            "Erro ao carregar usuário:",
            error
        );

        currentUser = null;
    }
}


function showLogin() {

    loginScreen?.classList.remove("hidden");
    app?.classList.add("hidden");
}


function showApp() {

    loginScreen?.classList.add("hidden");
    app?.classList.remove("hidden");

    updateUserInterface();
    updateDashboard();

    showSection("dashboard");
}


function logout() {

    const confirmLogout =
        confirm(
            "Deseja realmente sair do ControleS?"
        );

    if (!confirmLogout) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEYS.USER
    );

    currentUser = null;

    showLogin();
}


/* =====================================================
   USUÁRIO
===================================================== */

function updateUserInterface() {

    if (!currentUser) {
        return;
    }

    const name =
        currentUser.name || "Usuário";

    const firstLetter =
        name.charAt(0).toUpperCase();

    if (userName) {
        userName.textContent = name;
    }

    if (welcomeName) {
        welcomeName.textContent = name;
    }

    if (userAvatar) {
        userAvatar.textContent =
            firstLetter;
    }

    if (userPlan) {

        userPlan.textContent =
            isPremium()
                ? "ControleS Premium ⭐"
                : "ControleS Grátis";
    }
}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const section =
                    item.dataset.section;

                if (section) {
                    showSection(section);
                }

                sidebar?.classList.remove(
                    "mobile-open"
                );
            }
        );

    });


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(element => {

            if (
                element.classList.contains(
                    "nav-item"
                )
            ) {
                return;
            }

            element.addEventListener(
                "click",
                () => {

                    const section =
                        element.dataset.section;

                    if (section) {
                        showSection(section);
                    }
                }
            );

        });
}


function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".section"
        );

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    const target =
        document.getElementById(
            sectionName
        );

    if (target) {
        target.classList.remove("hidden");
    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

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


    if (sectionName === "dashboard") {
        updateDashboard();
    }

    if (sectionName === "transactions") {
        renderAllTransactions();
    }

    if (sectionName === "categories") {
        updateCategorySection();
    }

    if (sectionName === "reports") {
        updateReports();
    }

    if (sectionName === "premium") {
        updatePremium();
    }
}


/* =====================================================
   DATA
===================================================== */

function loadTransactions() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.TRANSACTIONS
            );

        if (saved) {

            transactions =
                JSON.parse(saved);

            if (!Array.isArray(transactions)) {
                transactions = [];
            }
        }

    } catch (error) {

        console.error(
            "Erro ao carregar lançamentos:",
            error
        );

        transactions = [];
    }
}


function saveTransactionsToStorage() {

    localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
    );
}


/* =====================================================
   MODAL
===================================================== */

function openTransactionModal() {

    transactionModal?.classList.remove(
        "hidden"
    );

    if (dateInput && !dateInput.value) {
        dateInput.value =
            getTodayISO();
    }

    setTimeout(() => {
        descriptionInput?.focus();
    }, 100);
}


function closeTransactionModal() {

    transactionModal?.classList.add(
        "hidden"
    );
}


function resetTransactionForm() {

    transactionForm?.reset();

    selectedType = "income";

    typeOptions.forEach(
        option => {

            option.classList.toggle(
                "active",
                option.dataset.type === "income"
            );

        }
    );

    if (dateInput) {
        dateInput.value =
            getTodayISO();
    }
}


/* =====================================================
   SALVAR LANÇAMENTO
===================================================== */

function saveTransaction(event) {

    event.preventDefault();

    const description =
        descriptionInput.value.trim();

    const amount =
        Number(amountInput.value);

    const date =
        dateInput.value;

    const category =
        transactionCategory.value;

    if (!description) {
        alert("Digite uma descrição.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Digite um valor válido.");
        return;
    }

    if (!date) {
        alert("Selecione uma data.");
        return;
    }

    const transaction = {

        id:
            Date.now().toString(),

        description,

        amount,

        type:
            selectedType,

        category,

        date,

        createdAt:
            new Date().toISOString()
    };

    transactions.push(transaction);

    saveTransactionsToStorage();

    resetTransactionForm();
    closeTransactionModal();

    updateDashboard();
    updateCategorySection();
    updateReports();
    updatePremium();

    alert("Lançamento salvo com sucesso!");


    const activeSection =
        document.querySelector(
            ".nav-item.active"
        )?.dataset.section;

    if (activeSection === "transactions") {
        renderAllTransactions();
    }
}


/* =====================================================
   EXCLUIR TRANSAÇÃO
===================================================== */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );

    if (!transaction) {
        return;
    }

    const confirmDelete =
        confirm(
            `Excluir "${transaction.description}"?`
        );

    if (!confirmDelete) {
        return;
    }

    transactions =
        transactions.filter(
            item => item.id !== id
        );

    saveTransactionsToStorage();

    updateDashboard();
    renderAllTransactions();
    updateCategorySection();
    updateReports();
    updatePremium();
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totals =
        calculateTotals();

    const balance =
        totals.income -
        totals.expense;


    if (balanceValue) {
        balanceValue.textContent =
            formatCurrency(balance);
    }

    if (incomeValue) {
        incomeValue.textContent =
            formatCurrency(
                totals.income
            );
    }

    if (expenseValue) {
        expenseValue.textContent =
            formatCurrency(
                totals.expense
            );
    }


    const economy =
        totals.income > 0
            ? (
                (balance /
                    totals.income) *
                100
            )
            : 0;

    if (economyValue) {
        economyValue.textContent =
            `${Math.max(
                0,
                economy
            ).toFixed(1)}%`;
    }


    renderRecentTransactions();
    renderFinanceChart();
}


/* =====================================================
   TOTAIS
===================================================== */

function calculateTotals() {

    let income = 0;
    let expense = 0;

    transactions.forEach(
        transaction => {

            const amount =
                Number(transaction.amount) || 0;

            if (
                transaction.type ===
                "income"
            ) {
                income += amount;
            }

            if (
                transaction.type ===
                "expense"
            ) {
                expense += amount;
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
   TRANSAÇÕES RECENTES
===================================================== */

function renderRecentTransactions() {

    if (!recentTransactions) {
        return;
    }

    const sorted =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    if (sorted.length === 0) {

        recentTransactions.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento cadastrado ainda.
            </div>
        `;

        return;
    }


    recentTransactions.innerHTML =
        sorted
            .map(
                transaction =>
                    createTransactionHTML(
                        transaction,
                        true
                    )
            )
            .join("");
}


/* =====================================================
   TODOS OS LANÇAMENTOS
===================================================== */

function renderAllTransactions() {

    if (!allTransactions) {
        return;
    }

    const search =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const selectedType =
        typeFilter?.value ||
        "all";

    const selectedCategory =
        categoryFilter?.value ||
        "all";


    const filtered =
        transactions
            .filter(transaction => {

                const matchesSearch =
                    !search ||
                    transaction.description
                        .toLowerCase()
                        .includes(search) ||
                    transaction.category
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    selectedType === "all" ||
                    transaction.type ===
                    selectedType;

                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category ===
                    selectedCategory;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );
            })
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    if (filtered.length === 0) {

        allTransactions.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;
    }


    allTransactions.innerHTML =
        filtered
            .map(
                transaction =>
                    createTransactionHTML(
                        transaction,
                        false
                    )
            )
            .join("");
}


/* =====================================================
   HTML TRANSAÇÃO
===================================================== */

function createTransactionHTML(
    transaction,
    compact = false
) {

    const isIncome =
        transaction.type === "income";

    const icon =
        isIncome
            ? "↗"
            : "↘";

    const sign =
        isIncome
            ? "+"
            : "-";

    const date =
        formatDate(
            transaction.date
        );

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
                    • ${date}
                </small>

            </div>

            <div class="
                transaction-value
                ${isIncome ? "income" : "expense"}
            ">
                ${sign}
                ${formatCurrency(
                    Number(transaction.amount)
                )}
            </div>

            ${
                compact
                    ? ""
                    : `
                        <button
                            class="transaction-delete"
                            type="button"
                            onclick="deleteTransaction('${transaction.id}')"
                            aria-label="Excluir lançamento"
                        >
                            ×
                        </button>
                    `
            }

        </div>
    `;
}


/* =====================================================
   FILTRO DE CATEGORIAS
===================================================== */

function populateCategoryFilter() {

    if (!categoryFilter) {
        return;
    }

    categoryFilter.innerHTML = `
        <option value="all">
            Todas categorias
        </option>
    `;

    CATEGORIES.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(
                option
            );
        }
    );
}


/* =====================================================
   GRÁFICO FINANCEIRO
===================================================== */

function renderFinanceChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    const monthly =
        getMonthlyTotals();


    if (financeChart) {
        financeChart.destroy();
    }


    financeChart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "bar",

                data: {

                    labels:
                        monthly.labels,

                    datasets: [

                        {
                            label:
                                "Receitas",

                            data:
                                monthly.income,

                            backgroundColor:
                                "#16a34a",

                            borderRadius:
                                8
                        },

                        {
                            label:
                                "Despesas",

                            data:
                                monthly.expense,

                            backgroundColor:
                                "#dc2626",

                            borderRadius:
                                8
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {
                        legend: {
                            display: true
                        }
                    },

                    scales: {

                        y: {
                            beginAtZero: true,

                            ticks: {
                                callback:
                                    value =>
                                        formatCurrency(
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
   DADOS MENSAIS
===================================================== */

function getMonthlyTotals() {

    const now =
        new Date();

    const labels = [];
    const income = [];
    const expense = [];

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


        let monthIncome = 0;
        let monthExpense = 0;


        transactions.forEach(
            transaction => {

                const transactionDate =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );

                if (
                    transactionDate.getMonth() ===
                    month &&
                    transactionDate.getFullYear() ===
                    year
                ) {

                    if (
                        transaction.type ===
                        "income"
                    ) {
                        monthIncome +=
                            Number(
                                transaction.amount
                            ) || 0;
                    }

                    if (
                        transaction.type ===
                        "expense"
                    ) {
                        monthExpense +=
                            Number(
                                transaction.amount
                            ) || 0;
                    }
                }
            }
        );


        income.push(monthIncome);
        expense.push(monthExpense);
    }

    return {
        labels,
        income,
        expense
    };
}


/* =====================================================
   CATEGORIAS
===================================================== */

function updateCategorySection() {

    renderCategoryChart();
    renderCategoryAnalysis();
}


function getCategoryTotals() {

    const totals = {};

    transactions
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )
        .forEach(
            transaction => {

                const category =
                    transaction.category ||
                    "Outros";

                totals[category] =
                    (
                        totals[category] ||
                        0
                    ) +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    );
            }
        );

    return totals;
}


/* =====================================================
   GRÁFICO DE CATEGORIAS
===================================================== */

function renderCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    const totals =
        getCategoryTotals();

    const labels =
        Object.keys(totals);

    const values =
        Object.values(totals);


    if (categoryChart) {
        categoryChart.destroy();
    }


    if (labels.length === 0) {

        categoryChart =
            new Chart(
                canvas.getContext("2d"),
                {
                    type: "doughnut",

                    data: {
                        labels: [
                            "Sem despesas"
                        ],

                        datasets: [
                            {
                                data: [1],
                                backgroundColor: [
                                    "#e5ebe7"
                                ]
                            }
                        ]
                    },

                    options: {
                        responsive: true,
                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                display: true
                            }
                        }
                    }
                }
            );

        return;
    }


    categoryChart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            data: values,

                            backgroundColor: [
                                "#f28c28",
                                "#16a34a",
                                "#2f6b50",
                                "#dc2626",
                                "#ffad4d",
                                "#12372a",
                                "#6b756f",
                                "#d96f12",
                                "#4f8a70",
                                "#9ca3af",
                                "#071d15"
                            ],

                            borderWidth: 2
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "65%",

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

function renderCategoryAnalysis() {

    if (!categoryList) {
        return;
    }

    const totals =
        getCategoryTotals();

    const entries =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (entries.length === 0) {

        categoryList.innerHTML = `
            <div class="empty-state">
                Cadastre despesas para visualizar
                a análise por categoria.
            </div>
        `;

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
                                ${formatCurrency(value)}
                                · ${percentage.toFixed(1)}%
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

function updateReports() {

    renderReportCategoryChart();
    renderReportAnalysis();
}


function renderReportCategoryChart() {

    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    const totals =
        getCategoryTotals();

    const labels =
        Object.keys(totals);

    const values =
        Object.values(totals);


    if (reportCategoryChart) {
        reportCategoryChart.destroy();
    }


    reportCategoryChart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "doughnut",

                data: {

                    labels:
                        labels.length
                            ? labels
                            : ["Sem despesas"],

                    datasets: [
                        {
                            data:
                                values.length
                                    ? values
                                    : [1],

                            backgroundColor: [
                                "#f28c28",
                                "#16a34a",
                                "#2f6b50",
                                "#dc2626",
                                "#ffad4d",
                                "#12372a",
                                "#6b756f",
                                "#d96f12",
                                "#4f8a70",
                                "#9ca3af",
                                "#071d15"
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "62%",

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
   ANÁLISE FINANCEIRA
===================================================== */

function renderReportAnalysis() {

    if (!reportAnalysis) {
        return;
    }

    const totals =
        calculateTotals();

    const categoryTotals =
        getCategoryTotals();

    const categories =
        Object.entries(
            categoryTotals
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    if (
        transactions.length === 0
    ) {

        reportAnalysis.innerHTML = `
            <div class="empty-state">
                Cadastre lançamentos para gerar
                sua análise.
            </div>
        `;

        return;
    }


    const balance =
        totals.income -
        totals.expense;


    const saving =
        totals.income > 0
            ? (
                balance /
                totals.income
            ) * 100
            : 0;


    const biggestCategory =
        categories.length
            ? categories[0][0]
            : "Nenhuma";


    const biggestValue =
        categories.length
            ? categories[0][1]
            : 0;


    let statusText = "";

    if (balance > 0) {
        statusText =
            "Seu saldo está positivo. Continue acompanhando seus gastos para manter esse resultado.";
    } else if (balance < 0) {
        statusText =
            "Suas despesas estão acima das receitas. Vale a pena revisar as categorias com maior gasto.";
    } else {
        statusText =
            "Suas receitas e despesas estão equilibradas neste momento.";
    }


    reportAnalysis.innerHTML = `

        <div class="category-summary-item">

            <div class="category-summary-left">
                <div class="category-dot"></div>

                <strong>
                    Saldo atual
                </strong>
            </div>

            <span>
                ${formatCurrency(balance)}
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
                    biggestCategory
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
                ${formatCurrency(
                    biggestValue
                )}
            </span>

        </div>


        <div class="category-summary-item">

            <div class="category-summary-left">
                <div class="category-dot"></div>

                <strong>
                    Economia
                </strong>
            </div>

            <span>
                ${Math.max(
                    0,
                    saving
                ).toFixed(1)}%
            </span>

        </div>


        <div class="empty-state">
            ${statusText}
        </div>
    `;
}


/* =====================================================
   PREMIUM
===================================================== */

function isPremium() {

    return (
        localStorage.getItem(
            STORAGE_KEYS.PREMIUM
        ) === "true"
    );
}


function activatePremium() {

    if (isPremium()) {

        alert(
            "Você já está usando o ControleS Premium ⭐"
        );

        return;
    }


    const confirmPremium =
        confirm(
            "Ativar o ControleS Premium neste dispositivo?"
        );


    if (!confirmPremium) {
        return;
    }


    localStorage.setItem(
        STORAGE_KEYS.PREMIUM,
        "true"
    );

    updateUserInterface();
    updatePremium();

    alert(
        "ControleS Premium ativado! ⭐"
    );
}


function updatePremium() {

    if (!monthForecast) {
        return;
    }


    if (!isPremium()) {

        monthForecast.innerHTML = `

            <div class="empty-state">

                ⭐
                <br><br>

                Ative o ControleS Premium
                para desbloquear a
                <strong>
                    previsão do fim do mês.
                </strong>

                <br><br>

                <button
                    class="btn-primary"
                    type="button"
                    onclick="activatePremium()"
                >
                    Ativar Premium ⭐
                </button>

            </div>
        `;

        return;
    }


    renderMonthForecast();
}


/* =====================================================
   PREVISÃO DO FIM DO MÊS
===================================================== */

function renderMonthForecast() {

    if (!monthForecast) {
        return;
    }


    const totals =
        calculateCurrentMonthTotals();


    if (
        totals.income === 0 &&
        totals.expense === 0
    ) {

        monthForecast.innerHTML = `
            <div class="empty-state">
                Adicione seus lançamentos deste mês
                para visualizar uma previsão financeira.
            </div>
        `;

        return;
    }


    const now =
        new Date();

    const currentDay =
        now.getDate();

    const lastDay =
        new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        ).getDate();


    const daysPassed =
        Math.max(
            currentDay,
            1
        );


    const remainingDays =
        Math.max(
            lastDay -
            currentDay,
            0
        );


    const dailyExpense =
        totals.expense /
        daysPassed;


    const estimatedRemainingExpense =
        dailyExpense *
        remainingDays;


    const estimatedEndBalance =
        totals.income -
        totals.expense -
        estimatedRemainingExpense;


    let message = "";

    if (
        estimatedEndBalance > 0
    ) {

        message =
            "Mantendo o ritmo atual, a tendência é terminar o mês com saldo positivo.";

    } else if (
        estimatedEndBalance < 0
    ) {

        message =
            "Mantendo o ritmo atual, existe risco de terminar o mês no negativo. Revise seus maiores gastos.";

    } else {

        message =
            "Sua previsão indica um fechamento próximo do equilíbrio.";
    }


    monthForecast.innerHTML = `

        <div class="category-summary-item">

            <div class="category-summary-left">
                <div class="category-dot"></div>

                <strong>
                    Saldo atual
                </strong>
            </div>

            <span>
                ${formatCurrency(
                    totals.income -
                    totals.expense
                )}
            </span>

        </div>


        <div class="category-summary-item">

            <div class="category-summary-left">
                <div class="category-dot"></div>

                <strong>
                    Média diária de gastos
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
                <div class="category-dot"></div>

                <strong>
                    Dias restantes
                </strong>
            </div>

            <span>
                ${remainingDays} dias
            </span>

        </div>


        <div class="category-summary-item">

            <div class="category-summary-left">

                <div class="category-dot"></div>

                <strong>
                    ⏳ Previsão de saldo
                </strong>

            </div>

            <span>
                ${formatCurrency(
                    estimatedEndBalance
                )}
            </span>

        </div>


        <div class="empty-state">
            ${message}
        </div>
    `;
}


function calculateCurrentMonthTotals() {

    const now =
        new Date();

    const month =
        now.getMonth();

    const year =
        now.getFullYear();


    let income = 0;
    let expense = 0;


    transactions.forEach(
        transaction => {

            const date =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            if (
                date.getMonth() !== month ||
                date.getFullYear() !== year
            ) {
                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {
                income += amount;
            }


            if (
                transaction.type ===
                "expense"
            ) {
                expense += amount;
            }

        }
    );


    return {
        income,
        expense
    };
}


/* =====================================================
   TEMA ESCURO
===================================================== */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            STORAGE_KEYS.THEME
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        updateThemeButton(true);

    } else {

        document.body.classList.remove(
            "dark"
        );

        updateThemeButton(false);
    }
}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        STORAGE_KEYS.THEME,
        isDark
            ? "dark"
            : "light"
    );


    updateThemeButton(isDark);


    setTimeout(() => {

        renderFinanceChart();
        renderCategoryChart();
        renderReportCategoryChart();

    }, 100);
}


function updateThemeButton(isDark) {

    if (!themeBtn) {
        return;
    }


    if (isDark) {

        themeBtn.innerHTML = `
            <span>☀️</span>
            <span>Tema claro</span>
        `;

    } else {

        themeBtn.innerHTML = `
            <span>🌙</span>
            <span>Tema escuro</span>
        `;
    }
}


/* =====================================================
   EXPORTAR DADOS
===================================================== */

function exportData() {

    if (
        !transactions.length
    ) {

        alert(
            "Não existem lançamentos para exportar."
        );

        return;
    }


    const data = {

        app:
            "ControleS",

        exportadoEm:
            new Date().toISOString(),

        usuario:
            currentUser,

        premium:
            isPremium(),

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

    link.href = url;

    link.download =
        "controles-dados.json";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(url);
}


/* =====================================================
   DATA
===================================================== */

function getTodayISO() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function setCurrentDate() {

    if (!currentDate) {
        return;
    }


    const now =
        new Date();


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


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "pt-BR"
    );
}


/* =====================================================
   MOEDA
===================================================== */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value) || 0
    );
}


/* =====================================================
   SEGURANÇA — HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   EXPOR FUNÇÕES
===================================================== */

window.deleteTransaction =
    deleteTransaction;

window.activatePremium =
    activatePremium;

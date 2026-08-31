/* =====================================================
   CONTROLES APP
   ControleS — Sistema Financeiro
===================================================== */


/* =====================================================
   ESTADO
===================================================== */

let transactions = [];

let currentType = "income";

let chart = null;

let categoryChart = null;

let reportCategoryChart = null;


/* =====================================================
   ELEMENTOS
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const app =
    document.getElementById("app");

const loginForm =
    document.getElementById("loginForm");

const modal =
    document.getElementById("transactionModal");

const form =
    document.getElementById("transactionForm");

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

const pageTitle =
    document.getElementById("pageTitle");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   UTILIDADES
===================================================== */

function money(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function today() {

    const date =
        new Date();

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


function formatDate(date) {

    if (!date) {
        return "";
    }

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =====================================================
   LOGIN
===================================================== */

function checkLogin() {

    const user =
        localStorage.getItem(
            "controleS_user"
        );

    if (user) {

        showApp();

    } else {

        showLogin();

    }

}


function showLogin() {

    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

    if (app) {

        app.classList.add(
            "hidden"
        );

    }

}


function showApp() {

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }

    if (app) {

        app.classList.remove(
            "hidden"
        );

    }

}


loginForm?.addEventListener(
    "submit",
    function(event) {

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
            nameInput?.value.trim();

        const email =
            emailInput?.value.trim();

        const password =
            passwordInput?.value.trim();

        if (
            !name ||
            !email ||
            !password
        ) {

            return;

        }

        localStorage.setItem(
            "controleS_user",
            name
        );

        localStorage.setItem(
            "controleS_email",
            email
        );

        showApp();

        loadUser();

        renderAll();

    }
);


/* =====================================================
   DADOS
===================================================== */

function saveData() {

    localStorage.setItem(
        "controleS_transactions",
        JSON.stringify(
            transactions
        )
    );

}


function loadData() {

    const data =
        localStorage.getItem(
            "controleS_transactions"
        );

    if (!data) {

        transactions = [];

        return;

    }

    try {

        const parsed =
            JSON.parse(data);

        transactions =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        transactions = [];

    }

}


/* =====================================================
   USUÁRIO
===================================================== */

function loadUser() {

    const user =
        localStorage.getItem(
            "controleS_user"
        ) || "Usuário";

    const name =
        document.getElementById(
            "userName"
        );

    const avatar =
        document.getElementById(
            "userAvatar"
        );

    const welcome =
        document.getElementById(
            "welcomeName"
        );

    if (name) {

        name.textContent =
            user;

    }

    if (avatar) {

        avatar.textContent =
            user
                .charAt(0)
                .toUpperCase();

    }

    if (welcome) {

        welcome.textContent =
            user;

    }

}


function loadPlan() {

    const plan =
        localStorage.getItem(
            "controleS_plan"
        ) || "free";

    const element =
        document.getElementById(
            "userPlan"
        );

    if (!element) {
        return;
    }

    if (plan === "premium") {

        element.textContent =
            "ControleS Premium ⭐";

    } else {

        element.textContent =
            "ControleS Grátis";

    }

}


/* =====================================================
   DATA ATUAL
===================================================== */

function loadCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }

    const date =
        new Date();

    element.textContent =
        date.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =====================================================
   MODAL
===================================================== */

function openModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    const dateInput =
        document.getElementById(
            "dateInput"
        );

    if (dateInput && !dateInput.value) {

        dateInput.value =
            today();

    }

}


function closeModal() {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );

}


document
    .getElementById(
        "openTransactionBtn"
    )
    ?.addEventListener(
        "click",
        openModal
    );


document
    .getElementById(
        "newTransactionButton"
    )
    ?.addEventListener(
        "click",
        openModal
    );


document
    .getElementById(
        "closeModal"
    )
    ?.addEventListener(
        "click",
        closeModal
    );


document
    .querySelector(
        ".modal-overlay"
    )
    ?.addEventListener(
        "click",
        closeModal
    );


/* =====================================================
   TIPO DE LANÇAMENTO
===================================================== */

document
    .querySelectorAll(
        ".type-option"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    currentType =
                        button.dataset.type;

                    document
                        .querySelectorAll(
                            ".type-option"
                        )
                        .forEach(
                            function(btn) {

                                btn.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


/* =====================================================
   SALVAR LANÇAMENTO
===================================================== */

form?.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const description =
            document
                .getElementById(
                    "descriptionInput"
                )
                ?.value
                .trim();

        const amount =
            Number(
                document
                    .getElementById(
                        "amountInput"
                    )
                    ?.value
            );

        const category =
            document
                .getElementById(
                    "transactionCategory"
                )
                ?.value;

        const date =
            document
                .getElementById(
                    "dateInput"
                )
                ?.value;

        if (
            !description ||
            !amount ||
            amount <= 0
        ) {

            return;

        }

        const transaction = {

            id:
                Date.now(),

            type:
                currentType,

            description:
                description,

            amount:
                amount,

            category:
                category || "Sem categoria",

            date:
                date || today()

        };


        transactions.unshift(
            transaction
        );


        saveData();


        form.reset();


        const dateInput =
            document.getElementById(
                "dateInput"
            );

        if (dateInput) {

            dateInput.value =
                today();

        }


        currentType =
            "income";


        document
            .querySelectorAll(
                ".type-option"
            )
            .forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );


        document
            .querySelector(
                '.type-option[data-type="income"]'
            )
            ?.classList.add(
                "active"
            );


        closeModal();


        renderAll();

    }
);


/* =====================================================
   CÁLCULOS
===================================================== */

function calculate() {

    let income = 0;

    let expense = 0;


    transactions.forEach(
        function(item) {

            const amount =
                Number(
                    item.amount || 0
                );


            if (
                item.type === "income"
            ) {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );


    return {

        income:
            income,

        expense:
            expense,

        balance:
            income - expense

    };

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const result =
        calculate();


    if (balanceValue) {

        balanceValue.textContent =
            money(
                result.balance
            );

    }


    if (incomeValue) {

        incomeValue.textContent =
            money(
                result.income
            );

    }


    if (expenseValue) {

        expenseValue.textContent =
            money(
                result.expense
            );

    }


    if (economyValue) {

        let percent = 0;


        if (result.income > 0) {

            percent =
                (
                    (
                        result.income -
                        result.expense
                    )
                    /
                    result.income
                ) * 100;

        }


        economyValue.textContent =
            percent.toFixed(0) + "%";

    }

}


/* =====================================================
   HTML DE TRANSAÇÃO
===================================================== */

function transactionHTML(item) {

    return `

        <div class="transaction">

            <div class="transaction-icon">

                ${item.type === "income"
                    ? "↗"
                    : "↘"}

            </div>


            <div class="transaction-info">

                <strong>
                    ${escapeHTML(
                        item.description
                    )}
                </strong>

                <small>

                    ${escapeHTML(
                        item.category ||
                        "Sem categoria"
                    )}

                    •

                    ${formatDate(
                        item.date
                    )}

                </small>

            </div>


            <div
                class="transaction-value
                ${item.type}"
            >

                ${item.type === "income"
                    ? "+"
                    : "-"}

                ${money(
                    item.amount
                )}

            </div>


            <button
                class="transaction-delete"
                onclick="deleteTransaction(${item.id})"
                title="Excluir"
            >
                ×
            </button>

        </div>

    `;

}


/* =====================================================
   SEGURANÇA HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   ÚLTIMAS TRANSAÇÕES
===================================================== */

function renderTransactions() {

    if (!recentTransactions) {
        return;
    }


    if (
        transactions.length === 0
    ) {

        recentTransactions.innerHTML = `

            <div class="empty-state">

                Nenhuma movimentação ainda.

                <br><br>

                Clique em
                <strong>
                    "+ Novo lançamento"
                </strong>
                para começar.

            </div>

        `;

        return;

    }


    recentTransactions.innerHTML =
        transactions
            .slice(0, 6)
            .map(
                transactionHTML
            )
            .join("");

}


/* =====================================================
   TODAS TRANSAÇÕES
===================================================== */

function renderAllTransactions(
    list
) {

    if (!allTransactions) {
        return;
    }


    if (list.length === 0) {

        allTransactions.innerHTML = `

            <div class="empty-state">

                Nenhuma movimentação encontrada.

            </div>

        `;

        return;

    }


    allTransactions.innerHTML =
        list
            .map(
                transactionHTML
            )
            .join("");

}


/* =====================================================
   EXCLUIR
===================================================== */

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Deseja excluir este lançamento?"
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveData();

    renderAll();

}


/* =====================================================
   CATEGORIAS
===================================================== */

function updateCategories() {

    if (!categoryFilter) {
        return;
    }


    const currentValue =
        categoryFilter.value;


    const categories = [];


    transactions.forEach(
        function(item) {

            if (
                item.category &&
                !categories.includes(
                    item.category
                )
            ) {

                categories.push(
                    item.category
                );

            }

        }
    );


    categories.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "pt-BR"
            )
    );


    categoryFilter.innerHTML = `

        <option value="all">
            Todas categorias
        </option>

    `;


    categories.forEach(
        function(category) {

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


    if (
        categories.includes(
            currentValue
        )
    ) {

        categoryFilter.value =
            currentValue;

    }

}


/* =====================================================
   FILTROS
===================================================== */

function filterTransactions() {

    let list =
        [...transactions];


    const search =
        searchInput
            ?.value
            ?.toLowerCase()
            .trim();


    if (search) {

        list =
            list.filter(
                function(item) {

                    return (

                        item.description
                            ?.toLowerCase()
                            .includes(
                                search
                            )

                        ||

                        item.category
                            ?.toLowerCase()
                            .includes(
                                search
                            )

                    );

                }
            );

    }


    if (
        typeFilter &&
        typeFilter.value !== "all"
    ) {

        list =
            list.filter(
                function(item) {

                    return (
                        item.type ===
                        typeFilter.value
                    );

                }
            );

    }


    if (
        categoryFilter &&
        categoryFilter.value !== "all"
    ) {

        list =
            list.filter(
                function(item) {

                    return (
                        item.category ===
                        categoryFilter.value
                    );

                }
            );

    }


    renderAllTransactions(
        list
    );

}


searchInput?.addEventListener(
    "input",
    filterTransactions
);


typeFilter?.addEventListener(
    "change",
    filterTransactions
);


categoryFilter?.addEventListener(
    "change",
    filterTransactions
);


/* =====================================================
   CATEGORIA — LISTA
===================================================== */

function renderCategoryList() {

    if (!categoryList) {
        return;
    }


    const categories = {};


    transactions.forEach(
        function(item) {

            if (
                item.type !== "expense"
            ) {
                return;
            }


            const category =
                item.category ||
                "Sem categoria";


            categories[category] =
                (
                    categories[category] ||
                    0
                )
                +
                Number(
                    item.amount || 0
                );

        }
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

                Ainda não existem
                despesas cadastradas.

            </div>

        `;

        return;

    }


    categoryList.innerHTML =
        entries
            .map(
                function([
                    category,
                    value
                ]) {

                    return `

                        <div
                            class="category-summary-item"
                        >

                            <div
                                class="category-summary-left"
                            >

                                <span
                                    class="category-dot"
                                ></span>

                                <strong>
                                    ${escapeHTML(
                                        category
                                    )}
                                </strong>

                            </div>

                            <span>
                                ${money(value)}
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   GRÁFICO PRINCIPAL
===================================================== */

function createChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const result =
        calculate();


    if (chart) {

        chart.destroy();

        chart = null;

    }


    chart =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data: {

                    labels: [
                        "Receitas",
                        "Despesas"
                    ],

                    datasets: [

                        {

                            data: [

                                result.income,

                                result.expense

                            ],

                            backgroundColor: [

                                "#2f6b50",

                                "#f28c28"

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "70%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                padding:
                                    20

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        return (
                                            context.label
                                            +
                                            ": "
                                            +
                                            money(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   GRÁFICO DE CATEGORIAS
===================================================== */

function getExpenseCategories() {

    const categories = {};


    transactions.forEach(
        function(item) {

            if (
                item.type !== "expense"
            ) {
                return;
            }


            const category =
                item.category ||
                "Sem categoria";


            categories[category] =
                (
                    categories[category] ||
                    0
                )
                +
                Number(
                    item.amount || 0
                );

        }
    );


    return categories;

}


function createCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const categories =
        getExpenseCategories();


    const labels =
        Object.keys(
            categories
        );


    const values =
        Object.values(
            categories
        );


    if (categoryChart) {

        categoryChart.destroy();

        categoryChart = null;

    }


    if (!labels.length) {
        return;
    }


    categoryChart =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            data:
                                values,

                            backgroundColor: [

                                "#2f6b50",
                                "#f28c28",
                                "#12372a",
                                "#d96f12",
                                "#6b8f71",
                                "#f5b971",
                                "#3f7d5b",
                                "#c65d0b",
                                "#4d9b73",
                                "#e9a24d"

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

                    cutout:
                        "64%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                padding:
                                    15

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw
                                                ||
                                                0
                                            );

                                        const total =
                                            values.reduce(
                                                (
                                                    a,
                                                    b
                                                ) =>
                                                    a + b,
                                                0
                                            );

                                        const percent =
                                            total
                                            >
                                            0
                                                ?
                                                (
                                                    value
                                                    /
                                                    total
                                                )
                                                *
                                                100
                                                :
                                                0;

                                        return (
                                            context.label
                                            +
                                            ": "
                                            +
                                            money(
                                                value
                                            )
                                            +
                                            " ("
                                            +
                                            percent.toFixed(
                                                1
                                            )
                                            +
                                            "%)"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   RELATÓRIO
===================================================== */

function createReportChart() {

    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const categories =
        getExpenseCategories();


    const labels =
        Object.keys(
            categories
        );


    const values =
        Object.values(
            categories
        );


    if (reportCategoryChart) {

        reportCategoryChart.destroy();

        reportCategoryChart = null;

    }


    if (!labels.length) {
        return;
    }


    reportCategoryChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Despesas",

                            data:
                                values,

                            backgroundColor:
                                "#f28c28",

                            borderRadius:
                                8

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

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        return (
                                            " "
                                            +
                                            money(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function(
                                        value
                                    ) {

                                        return money(
                                            value
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   RESUMO DO RELATÓRIO
===================================================== */

function createReportSummary() {

    const reportsSection =
        document.getElementById(
            "reports"
        );


    if (!reportsSection) {
        return;
    }


    let summary =
        document.getElementById(
            "controleSReportSummary"
        );


    if (!summary) {

        summary =
            document.createElement(
                "div"
            );

        summary.id =
            "controleSReportSummary";

        summary.className =
            "stats-grid";

        reportsSection.insertBefore(
            summary,
            reportsSection.children[1]
        );

    }


    const result =
        calculate();


    let economyPercent = 0;


    if (result.income > 0) {

        economyPercent =
            (
                (
                    result.income -
                    result.expense
                )
                /
                result.income
            ) * 100;

    }


    summary.innerHTML = `

        <div class="stat-card income">

            <div class="stat-top">

                <div class="stat-icon">
                    ↗
                </div>

                <span class="stat-label">
                    Total de receitas
                </span>

            </div>

            <strong>
                ${money(result.income)}
            </strong>

        </div>


        <div class="stat-card expense">

            <div class="stat-top">

                <div class="stat-icon">
                    ↘
                </div>

                <span class="stat-label">
                    Total de despesas
                </span>

            </div>

            <strong>
                ${money(result.expense)}
            </strong>

        </div>


        <div class="stat-card balance">

            <div class="stat-top">

                <div class="stat-icon">
                    💰
                </div>

                <span class="stat-label">
                    Saldo
                </span>

            </div>

            <strong>
                ${money(result.balance)}
            </strong>

        </div>


        <div class="stat-card economy">

            <div class="stat-top">

                <div class="stat-icon">
                    🎯
                </div>

                <span class="stat-label">
                    Economia
                </span>

            </div>

            <strong>
                ${economyPercent.toFixed(0)}%
            </strong>

        </div>

    `;

}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function navigateToSection(
    target
) {

    document
        .querySelectorAll(
            ".section"
        )
        .forEach(
            function(section) {

                section.classList.add(
                    "hidden"
                );

            }
        );


    const section =
        document.getElementById(
            target
        );


    if (!section) {
        return;
    }


    section.classList.remove(
        "hidden"
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    const activeButton =
        document.querySelector(
            `[data-section="${target}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard:
            "Dashboard",

        transactions:
            "Lançamentos",

        categories:
            "Categorias",

        reports:
            "Relatórios",

        premium:
            "Premium"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[target] ||
            "ControleS";

    }


    if (target === "categories") {

        setTimeout(
            function() {

                createCategoryChart();

            },
            100
        );

    }


    if (target === "reports") {

        createReportSummary();

        setTimeout(
            function() {

                createReportChart();

            },
            100
        );

    }


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   BOTÕES DE NAVEGAÇÃO
===================================================== */

document
    .querySelectorAll(
        "[data-section]"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    navigateToSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


/* =====================================================
   MOBILE MENU
===================================================== */

document
    .getElementById(
        "mobileMenuBtn"
    )
    ?.addEventListener(
        "click",
        function() {

            sidebar?.classList.toggle(
                "mobile-open"
            );

        }
    );


/* =====================================================
   TEMA
===================================================== */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


function loadTheme() {

    const dark =
        localStorage.getItem(
            "controleS_theme"
        ) === "true";


    if (dark) {

        document.body.classList.add(
            "dark"
        );

    }

}


themeBtn?.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        localStorage.setItem(
            "controleS_theme",
            document.body.classList.contains(
                "dark"
            )
        );

    }
);


/* =====================================================
   PREMIUM
===================================================== */

document
    .getElementById(
        "subscribePremiumBtn"
    )
    ?.addEventListener(
        "click",
        function() {

            localStorage.setItem(
                "controleS_plan",
                "premium"
            );

            loadPlan();

            alert(
                "Premium ativado neste protótipo! ⭐"
            );

        }
    );


/* =====================================================
   EXPORTAR DADOS
===================================================== */

document
    .getElementById(
        "exportDataBtn"
    )
    ?.addEventListener(
        "click",
        function() {

            const data = {

                app:
                    "ControleS",

                exportedAt:
                    new Date()
                        .toISOString(),

                transactions:
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

document
    .getElementById(
        "logoutBtn"
    )
    ?.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Deseja sair da sua conta?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "controleS_user"
            );

            localStorage.removeItem(
                "controleS_email"
            );


            location.reload();

        }
    );


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

function renderAll() {

    updateDashboard();

    renderTransactions();

    updateCategories();

    filterTransactions();

    renderCategoryList();

    createChart();

    createReportSummary();

    loadUser();

    loadPlan();

}


function startApp() {

    loadData();

    loadUser();

    loadPlan();

    loadTheme();

    loadCurrentDate();

    renderAll();

}


window.addEventListener(
    "load",
    function() {

        console.log(
            "ControleS APP iniciado."
        );

        checkLogin();

        startApp();

    }
);

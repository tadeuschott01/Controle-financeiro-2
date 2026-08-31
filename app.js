/* =====================================================
   CONTROLES APP
   ControleS — Sistema Financeiro
===================================================== */

/* =====================================================
   ESTADO
===================================================== */

let transactions = [];
let currentType = "income";

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;


/* =====================================================
   ELEMENTOS
===================================================== */

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginForm = document.getElementById("loginForm");

const modal = document.getElementById("transactionModal");
const form = document.getElementById("transactionForm");

const balanceValue = document.getElementById("balanceValue");
const incomeValue = document.getElementById("incomeValue");
const expenseValue = document.getElementById("expenseValue");
const economyValue = document.getElementById("economyValue");

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
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function today() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(date) {
    if (!date) return "";

    const parts = String(date).split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   LOGIN
===================================================== */

function checkLogin() {

    const user = localStorage.getItem("controleS_user");

    if (user) {
        showApp();
        loadUser();
        loadPlan();
    } else {
        showLogin();
    }
}


function showLogin() {

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showApp() {

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }
}


if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const nameInput =
            document.getElementById("loginName");

        const emailInput =
            document.getElementById("loginEmail");

        const passwordInput =
            document.getElementById("loginPassword");


        const name =
            nameInput ? nameInput.value.trim() : "";

        const email =
            emailInput ? emailInput.value.trim() : "";

        const password =
            passwordInput ? passwordInput.value.trim() : "";


        if (!name || !email || !password) {
            alert("Preencha todos os campos.");
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
        loadPlan();
        renderAll();

    });

}


/* =====================================================
   DADOS
===================================================== */

function saveData() {

    localStorage.setItem(
        "controleS_transactions",
        JSON.stringify(transactions)
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

        const parsed = JSON.parse(data);

        transactions =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Erro ao carregar lançamentos:",
            error
        );

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
        name.textContent = user;
    }


    if (avatar) {
        avatar.textContent =
            user.charAt(0).toUpperCase();
    }


    if (welcome) {
        welcome.textContent = user;
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


    if (!element) return;


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


    if (!element) return;


    const date = new Date();


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


function showSection(sectionName) {

    sections.forEach(function(section) {

        section.classList.add("hidden");

    });


    const target =
        document.getElementById(
            sectionName
        );


    if (target) {
        target.classList.remove("hidden");
    }


    navItems.forEach(function(item) {

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
            "ControleS";

    }


    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }


    if (sectionName === "dashboard") {
        updateDashboardChart();
    }


    if (sectionName === "categories") {
        updateCategoryChart();
        renderCategoryList();
    }


    if (sectionName === "reports") {
        updateReportChart();
    }


    if (sectionName === "transactions") {
        filterTransactions();
    }

}


navItems.forEach(function(item) {

    item.addEventListener("click", function() {

        showSection(
            item.dataset.section
        );

    });

});


document
    .querySelectorAll("[data-section]")
    .forEach(function(item) {

        if (item.classList.contains("nav-item")) {
            return;
        }


        item.addEventListener(
            "click",
            function() {

                const section =
                    item.dataset.section;

                if (section) {
                    showSection(section);
                }

            }
        );

    });


/* =====================================================
   MENU MOBILE
===================================================== */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );


if (mobileMenuBtn && sidebar) {

    mobileMenuBtn.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );

}


/* =====================================================
   MODAL
===================================================== */

function openModal() {

    if (!modal) return;


    modal.classList.remove("hidden");


    const dateInput =
        document.getElementById(
            "dateInput"
        );


    if (dateInput && !dateInput.value) {
        dateInput.value = today();
    }

}


function closeModal() {

    if (!modal) return;

    modal.classList.add("hidden");

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


const closeModalBtn =
    document.getElementById(
        "closeModal"
    );


if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

}


const modalOverlay =
    document.querySelector(
        ".modal-overlay"
    );


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeModal
    );

}


/* =====================================================
   TIPO DE LANÇAMENTO
===================================================== */

const typeOptions =
    document.querySelectorAll(
        ".type-option"
    );


typeOptions.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            currentType =
                button.dataset.type;


            typeOptions.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );

        }
    );

});


/* =====================================================
   SALVAR LANÇAMENTO
===================================================== */

if (form) {

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const descriptionInput =
                document.getElementById(
                    "descriptionInput"
                );

            const amountInput =
                document.getElementById(
                    "amountInput"
                );

            const categoryInput =
                document.getElementById(
                    "transactionCategory"
                );

            const dateInput =
                document.getElementById(
                    "dateInput"
                );


            const description =
                descriptionInput
                    ? descriptionInput.value.trim()
                    : "";


            const amount =
                amountInput
                    ? Number(amountInput.value)
                    : 0;


            const category =
                categoryInput
                    ? categoryInput.value
                    : "Outros";


            const date =
                dateInput
                    ? dateInput.value
                    : today();


            if (!description) {

                alert(
                    "Digite uma descrição."
                );

                return;

            }


            if (!amount || amount <= 0) {

                alert(
                    "Digite um valor válido."
                );

                return;

            }


            const transaction = {

                id: Date.now(),

                type: currentType,

                description: description,

                amount: amount,

                category:
                    category || "Outros",

                date:
                    date || today()

            };


            transactions.unshift(
                transaction
            );


            saveData();


            form.reset();


            if (dateInput) {
                dateInput.value = today();
            }


            currentType = "income";


            typeOptions.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            const incomeButton =
                document.querySelector(
                    '.type-option[data-type="income"]'
                );


            if (incomeButton) {

                incomeButton.classList.add(
                    "active"
                );

            }


            closeModal();

            renderAll();

        }
    );

}


/* =====================================================
   CÁLCULOS
===================================================== */

function calculate() {

    let income = 0;
    let expense = 0;


    transactions.forEach(
        function(item) {

            const amount =
                Number(item.amount || 0);


            if (item.type === "income") {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );


    return {

        income: income,

        expense: expense,

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
            money(result.balance);

    }


    if (incomeValue) {

        incomeValue.textContent =
            money(result.income);

    }


    if (expenseValue) {

        expenseValue.textContent =
            money(result.expense);

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
            `${percent.toFixed(0)}%`;

    }

}


/* =====================================================
   HTML TRANSAÇÃO
===================================================== */

function transactionHTML(item) {

    const type =
        item.type === "income"
            ? "income"
            : "expense";


    const icon =
        type === "income"
            ? "↗"
            : "↘";


    const sign =
        type === "income"
            ? "+"
            : "-";


    return `

        <div class="transaction">

            <div class="transaction-icon">
                ${icon}
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


            <div class="transaction-value ${type}">

                ${sign}${money(
                    item.amount
                )}

            </div>


            <button
                class="transaction-delete"
                data-delete-id="${item.id}"
                title="Excluir"
            >
                ×
            </button>

        </div>

    `;

}


/* =====================================================
   EXCLUIR TRANSAÇÃO
===================================================== */

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Deseja excluir este lançamento?"
        );


    if (!confirmed) return;


    transactions =
        transactions.filter(
            function(item) {

                return String(item.id) !== String(id);

            }
        );


    saveData();

    renderAll();

}


/* =====================================================
   BOTÕES EXCLUIR
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-delete-id]"
            );


        if (!button) return;


        const id =
            button.dataset.deleteId;


        deleteTransaction(id);

    }
);


/* =====================================================
   TRANSAÇÕES RECENTES
===================================================== */

function renderTransactions() {

    if (!recentTransactions) return;


    if (transactions.length === 0) {

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
            .map(transactionHTML)
            .join("");

}


/* =====================================================
   TODAS TRANSAÇÕES
===================================================== */

function renderAllTransactions(list) {

    if (!allTransactions) return;


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
            .map(transactionHTML)
            .join("");

}


/* =====================================================
   CATEGORIAS DO FILTRO
===================================================== */

function updateCategories() {

    if (!categoryFilter) return;


    const currentValue =
        categoryFilter.value;


    const categories = [];


    transactions.forEach(
        function(item) {

            const category =
                item.category;


            if (
                category &&
                !categories.includes(category)
            ) {

                categories.push(category);

            }

        }
    );


    categories.sort(
        function(a, b) {

            return a.localeCompare(
                b,
                "pt-BR"
            );

        }
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


            option.value = category;

            option.textContent = category;


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
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    if (search) {

        list =
            list.filter(
                function(item) {

                    const description =
                        String(
                            item.description || ""
                        ).toLowerCase();


                    const category =
                        String(
                            item.category || ""
                        ).toLowerCase();


                    return (
                        description.includes(search) ||
                        category.includes(search)
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


    renderAllTransactions(list);

}


/* =====================================================
   EVENTOS FILTROS
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterTransactions
    );

}


if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        filterTransactions
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterTransactions
    );

}


/* =====================================================
   CATEGORIAS — RESUMO
===================================================== */

function renderCategoryList() {

    if (!categoryList) return;


    const categories = {};


    transactions.forEach(
        function(item) {

            if (item.type !== "expense") {
                return;
            }


            const category =
                item.category ||
                "Sem categoria";


            categories[category] =
                (
                    categories[category] || 0
                )
                +
                Number(
                    item.amount || 0
                );

        }
    );


    const entries =
        Object.entries(categories)
            .sort(
                function(a, b) {

                    return b[1] - a[1];

                }
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
                function([category, value]) {

                    return `

                        <div class="category-summary-item">

                            <div class="category-summary-left">

                                <span class="category-dot"></span>

                                <strong>
                                    ${escapeHTML(category)}
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
   CHART.JS — GRÁFICO FINANCEIRO
===================================================== */

function updateDashboardChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );


    if (!canvas) return;


    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js não foi carregado."
        );

        return;

    }


    const result =
        calculate();


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
                        "Despesas",
                        "Saldo"
                    ],

                    datasets: [
                        {
                            label:
                                "Valor",

                            data: [
                                result.income,
                                result.expense,
                                result.balance
                            ],

                            borderWidth: 0,

                            borderRadius: 10
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
                                    function(value) {

                                        return money(value);

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   DADOS POR CATEGORIA
===================================================== */

function getCategoryData() {

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
                    categories[category] || 0
                )
                +
                Number(
                    item.amount || 0
                );

        }
    );


    return Object.entries(
        categories
    )
    .sort(
        function(a, b) {

            return b[1] - a[1];

        }
    );

}


/* =====================================================
   GRÁFICO DE CATEGORIAS
===================================================== */

function updateCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas) return;


    if (
        typeof Chart === "undefined"
    ) {
        return;
    }


    const entries =
        getCategoryData();


    if (categoryChart) {

        categoryChart.destroy();

    }


    if (!entries.length) {

        return;

    }


    categoryChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        entries.map(
                            function(item) {
                                return item[0];
                            }
                        ),

                    datasets: [

                        {

                            data:
                                entries.map(
                                    function(item) {
                                        return item[1];
                                    }
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

                            position: "bottom"

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " " +
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
   GRÁFICO DE RELATÓRIOS
===================================================== */

function updateReportChart() {

    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );


    if (!canvas) return;


    if (
        typeof Chart === "undefined"
    ) {
        return;
    }


    const entries =
        getCategoryData();


    if (reportCategoryChart) {

        reportCategoryChart.destroy();

    }


    if (!entries.length) {
        return;
    }


    reportCategoryChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        entries.map(
                            function(item) {
                                return item[0];
                            }
                        ),

                    datasets: [

                        {

                            data:
                                entries.map(
                                    function(item) {
                                        return item[1];
                                    }
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

                            position: "bottom"

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " " +
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
   TEMA ESCURO
===================================================== */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


function loadTheme() {

    const theme =
        localStorage.getItem(
            "controleS_theme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    } else {

        document.body.classList.remove(
            "dark"
        );

    }


    updateThemeButton();

}


function updateThemeButton() {

    if (!themeBtn) return;


    const dark =
        document.body.classList.contains(
            "dark"
        );


    themeBtn.innerHTML = dark
        ? `
            <span>☀️</span>
            <span>Tema claro</span>
          `
        : `
            <span>🌙</span>
            <span>Tema escuro</span>
          `;

}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );


            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "controleS_theme",
                isDark
                    ? "dark"
                    : "light"
            );


            updateThemeButton();

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
        function() {

            const confirmed =
                confirm(
                    "Deseja realmente sair do ControleS?"
                );


            if (!confirmed) return;


            localStorage.removeItem(
                "controleS_user"
            );

            localStorage.removeItem(
                "controleS_email"
            );


            showLogin();

        }
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
        function() {

            const data = {

                usuario:
                    localStorage.getItem(
                        "controleS_user"
                    ),

                email:
                    localStorage.getItem(
                        "controleS_email"
                    ),

                lancamentos:
                    transactions,

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
   PREMIUM
===================================================== */

const subscribePremiumBtn =
    document.getElementById(
        "subscribePremiumBtn"
    );


if (subscribePremiumBtn) {

    subscribePremiumBtn.addEventListener(
        "click",
        function() {

            alert(
                "O ControleS Premium estará disponível em breve! ⭐"
            );

        }
    );

}


/* =====================================================
   RENDER GERAL
===================================================== */

function renderAll() {

    updateDashboard();

    renderTransactions();

    updateCategories();

    filterTransactions();

    renderCategoryList();

    loadUser();

    loadPlan();

    loadCurrentDate();

    updateDashboardChart();

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

function init() {

    loadData();

    loadTheme();

    checkLogin();

    renderAll();

}


/* =====================================================
   INICIAR APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);

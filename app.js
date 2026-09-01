/* =====================================================
   CONTROLES — APP.JS
===================================================== */

"use strict";


/* =====================================================
   DADOS
===================================================== */

const STORAGE = {
    user: "controles_user",
    transactions: "controles_transactions",
    goals: "controles_goals",
    budgets: "controles_budgets",
    premium: "controles_premium",
    dark: "controles_dark"
};

let transactions = JSON.parse(
    localStorage.getItem(STORAGE.transactions) || "[]"
);

let goals = JSON.parse(
    localStorage.getItem(STORAGE.goals) || "[]"
);

let budgets = JSON.parse(
    localStorage.getItem(STORAGE.budgets) || "[]"
);

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;

let currentTransactionType = "income";


/* =====================================================
   ELEMENTOS
===================================================== */

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const app = document.getElementById("app");

const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const userName = document.getElementById("userName");
const welcomeName = document.getElementById("welcomeName");
const userAvatar = document.getElementById("userAvatar");
const userPlan = document.getElementById("userPlan");

const pageTitle = document.getElementById("pageTitle");
const currentDate = document.getElementById("currentDate");

const transactionModal =
    document.getElementById("transactionModal");

const goalModal =
    document.getElementById("goalModal");

const budgetModal =
    document.getElementById("budgetModal");


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


function saveData() {

    localStorage.setItem(
        STORAGE.transactions,
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        STORAGE.goals,
        JSON.stringify(goals)
    );

    localStorage.setItem(
        STORAGE.budgets,
        JSON.stringify(budgets)
    );

}


function today() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =====================================================
   LOGIN
===================================================== */

function loadUser() {

    const savedUser = localStorage.getItem(STORAGE.user);

    if (!savedUser) {

        loginScreen.classList.remove("hidden");
        app.classList.add("hidden");

        return;

    }

    const user = JSON.parse(savedUser);

    showApp(user);

}


function showApp(user) {

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

    const name =
        user.name ||
        "Usuário";

    userName.textContent = name;
    welcomeName.textContent = name;

    userAvatar.textContent =
        name.charAt(0).toUpperCase();

    userPlan.textContent =
        localStorage.getItem(STORAGE.premium) === "true"
            ? "ControleS Premium"
            : "ControleS Grátis";

    renderAll();

}


loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = loginName.value.trim();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!name || !email || !password) {

        alert("Preencha todos os campos.");

        return;

    }

    const user = {
        name,
        email
    };

    localStorage.setItem(
        STORAGE.user,
        JSON.stringify(user)
    );

    showApp(user);

});


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener("click", function() {

        localStorage.removeItem(STORAGE.user);

        app.classList.add("hidden");
        loginScreen.classList.remove("hidden");

        loginForm.reset();

    });


/* =====================================================
   NAVEGAÇÃO
===================================================== */

const sectionTitles = {

    dashboard: "Dashboard",
    transactions: "Lançamentos",
    categories: "Categorias",
    reports: "Relatórios",
    premium: "Premium"

};


function openSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.add("hidden");

        });


    const section =
        document.getElementById(sectionName);

    if (section) {

        section.classList.remove("hidden");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


    pageTitle.textContent =
        sectionTitles[sectionName] || "ControleS";


    document
        .getElementById("sidebar")
        .classList.remove("mobile-open");


    if (sectionName === "premium") {

        renderPremium();

    }

}


document.addEventListener("click", function(event) {

    const button =
        event.target.closest("[data-section]");

    if (!button) return;

    openSection(button.dataset.section);

});


/* =====================================================
   MOBILE MENU
===================================================== */

document
    .getElementById("mobileMenuBtn")
    .addEventListener("click", function() {

        document
            .getElementById("sidebar")
            .classList.toggle("mobile-open");

    });


/* =====================================================
   DATA
===================================================== */

function renderDate() {

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


/* =====================================================
   RESUMO
===================================================== */

function calculateTotals() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        const value =
            Number(transaction.amount) || 0;

        if (transaction.type === "income") {

            income += value;

        } else {

            expense += value;

        }

    });

    return {
        income,
        expense,
        balance: income - expense
    };

}


function renderSummary() {

    const totals =
        calculateTotals();

    const economy =
        totals.income > 0
            ? ((totals.income - totals.expense)
                / totals.income) * 100
            : 0;


    document.getElementById(
        "balanceValue"
    ).textContent = money(totals.balance);


    document.getElementById(
        "incomeValue"
    ).textContent = money(totals.income);


    document.getElementById(
        "expenseValue"
    ).textContent = money(totals.expense);


    document.getElementById(
        "economyValue"
    ).textContent =
        `${Math.max(0, economy).toFixed(1)}%`;


    document.getElementById(
        "premiumEconomyValue"
    ).textContent =
        `${Math.max(0, economy).toFixed(1)}%`;

}


/* =====================================================
   TRANSAÇÕES
===================================================== */

function openTransactionModal() {

    transactionModal.classList.remove("hidden");

    document.getElementById(
        "dateInput"
    ).value = today();

}


function closeTransactionModal() {

    transactionModal.classList.add("hidden");

}


document
    .getElementById("openTransactionBtn")
    .addEventListener(
        "click",
        openTransactionModal
    );


document
    .getElementById("newTransactionButton")
    .addEventListener(
        "click",
        openTransactionModal
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeTransactionModal
    );


transactionModal
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeTransactionModal
    );


document
    .querySelectorAll(".type-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".type-option")
                    .forEach(item => {

                        item.classList.remove("active");

                    });

                this.classList.add("active");

                currentTransactionType =
                    this.dataset.type;

            }
        );

    });


document
    .getElementById("transactionForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const description =
            document
                .getElementById("descriptionInput")
                .value
                .trim();

        const amount =
            Number(
                document
                    .getElementById("amountInput")
                    .value
            );

        const date =
            document
                .getElementById("dateInput")
                .value;

        const category =
            document
                .getElementById("transactionCategory")
                .value;

        const frequency =
            document
                .getElementById("frequencyInput")
                .value;


        if (!description || !amount || !date) {

            alert("Preencha os dados do lançamento.");

            return;

        }


        transactions.unshift({

            id: Date.now(),

            description,

            amount,

            date,

            category,

            frequency,

            type: currentTransactionType

        });


        saveData();

        this.reset();

        currentTransactionType = "income";

        document
            .querySelectorAll(".type-option")
            .forEach((button, index) => {

                button.classList.toggle(
                    "active",
                    index === 0
                );

            });


        closeTransactionModal();

        renderAll();

    });


/* =====================================================
   LISTA DE TRANSAÇÕES
===================================================== */

function transactionHTML(transaction) {

    const symbol =
        transaction.type === "income"
            ? "↗"
            : "↘";


    const sign =
        transaction.type === "income"
            ? "+"
            : "-";


    return `

        <div class="transaction">

            <div class="transaction-icon">
                ${symbol}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(transaction.description)}
                </strong>

                <small>
                    ${escapeHTML(transaction.category)}
                    •
                    ${transaction.date}
                </small>

            </div>

            <div
                class="transaction-value ${transaction.type}"
            >
                ${sign} ${money(transaction.amount)}
            </div>

            <button
                class="transaction-delete"
                data-delete="${transaction.id}"
                type="button"
            >
                ×
            </button>

        </div>

    `;

}


function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!transactions.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento cadastrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        transactions
            .slice(0, 5)
            .map(transactionHTML)
            .join("");

}


function renderAllTransactions() {

    const container =
        document.getElementById(
            "allTransactions"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    const type =
        document
            .getElementById("typeFilter")
            .value;


    const category =
        document
            .getElementById("categoryFilter")
            .value;


    const filtered =
        transactions.filter(transaction => {

            const matchesSearch =
                transaction.description
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

        });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered.map(transactionHTML).join("");

}


document.addEventListener("click", function(event) {

    const button =
        event.target.closest("[data-delete]");

    if (!button) return;


    const id =
        Number(button.dataset.delete);


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveData();

    renderAll();

});


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderAllTransactions
    );


document
    .getElementById("typeFilter")
    .addEventListener(
        "change",
        renderAllTransactions
    );


document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        renderAllTransactions
    );


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


function updateCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    const current =
        select.value;


    select.innerHTML =
        `<option value="all">Todas categorias</option>`;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);

    });


    select.value = current || "all";

}


function categoryTotals() {

    const totals = {};

    transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(transaction => {

            const category =
                transaction.category;

            totals[category] =
                (totals[category] || 0) +
                Number(transaction.amount);

        });


    return totals;

}


function renderCategoryList() {

    const container =
        document.getElementById(
            "categoryList"
        );


    const totals =
        categoryTotals();


    const entries =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1]);


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                Ainda não existem despesas cadastradas.
            </div>
        `;

        return;

    }


    const total =
        entries.reduce(
            (sum, item) => sum + item[1],
            0
        );


    container.innerHTML =
        entries.map(([category, value]) => {

            const percentage =
                total > 0
                    ? (value / total) * 100
                    : 0;


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
                        (${percentage.toFixed(1)}%)
                    </span>

                </div>

            `;

        }).join("");

}


/* =====================================================
   GRÁFICOS
===================================================== */

function renderCharts() {

    const totals =
        calculateTotals();


    if (typeof Chart === "undefined") {

        return;

    }


    if (financeChart) {

        financeChart.destroy();

    }


    financeChart =
        new Chart(
            document.getElementById(
                "financeChart"
            ),
            {

                type: "bar",

                data: {

                    labels: [
                        "Receitas",
                        "Despesas"
                    ],

                    datasets: [{

                        label: "Valor",

                        data: [
                            totals.income,
                            totals.expense
                        ],

                        borderRadius: 10

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    }

                }

            }
        );


    const categoryData =
        categoryTotals();


    const labels =
        Object.keys(categoryData);


    const values =
        Object.values(categoryData);


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            document.getElementById(
                "categoryChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [{

                        data: values,

                        borderWidth: 2

                    }]

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


    if (reportCategoryChart) {

        reportCategoryChart.destroy();

    }


    reportCategoryChart =
        new Chart(
            document.getElementById(
                "reportCategoryChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [{

                        data: values,

                        borderWidth: 2

                    }]

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

function renderReportAnalysis() {

    const container =
        document.getElementById(
            "reportAnalysis"
        );


    const totals =
        calculateTotals();


    const economy =
        totals.income > 0
            ? ((totals.income - totals.expense)
                / totals.income) * 100
            : 0;


    container.innerHTML = `

        <p>
            <strong>Receitas:</strong>
            ${money(totals.income)}
        </p>

        <p>
            <strong>Despesas:</strong>
            ${money(totals.expense)}
        </p>

        <p>
            <strong>Saldo:</strong>
            ${money(totals.balance)}
        </p>

        <p>
            <strong>Economia:</strong>
            ${Math.max(0, economy).toFixed(1)}%
        </p>

    `;

}


/* =====================================================
   SAÚDE FINANCEIRA
===================================================== */

function renderFinancialHealth() {

    const result =
        document.getElementById(
            "healthResult"
        );


    const totals =
        calculateTotals();


    if (totals.income === 0) {

        result.innerHTML =
            "🟡 <strong>Atenção:</strong> cadastre suas receitas e despesas para calcular sua saúde financeira.";

        return;

    }


    const percentage =
        ((totals.income - totals.expense)
            / totals.income) * 100;


    if (percentage < 0) {

        result.innerHTML =
            "🔴 <strong>Saúde financeira crítica:</strong> suas despesas estão maiores que suas receitas.";

    } else if (percentage < 20) {

        result.innerHTML =
            "🟡 <strong>Saúde financeira em atenção:</strong> você está economizando pouco. Vale revisar seus gastos.";

    } else {

        result.innerHTML =
            "🟢 <strong>Saúde financeira saudável:</strong> suas receitas estão permitindo uma boa margem de economia.";

    }

}


/* =====================================================
   PREMIUM
===================================================== */

function renderPremium() {

    const totals =
        calculateTotals();


    const text =
        document.getElementById(
            "premiumPerformanceText"
        );


    if (!transactions.length) {

        text.textContent =
            "Cadastre seus lançamentos para acompanhar seu desempenho.";

    } else if (totals.balance >= 0) {

        text.textContent =
            "Seu saldo está positivo. Continue acompanhando seus gastos para manter o equilíbrio.";

    } else {

        text.textContent =
            "Suas despesas estão acima das receitas. É importante revisar seus gastos.";

    }


    renderFinancialHealth();
    renderGoals();
    renderBudgets();
    renderSmartAlerts();
    renderMonthlyComparison();
    renderPremiumAnalysis();

}


/* =====================================================
   METAS
===================================================== */

document
    .getElementById("newGoalBtn")
    .addEventListener(
        "click",
        function() {

            goalModal.classList.remove("hidden");

        }
    );


document
    .getElementById("closeGoalModal")
    .addEventListener(
        "click",
        function() {

            goalModal.classList.add("hidden");

        }
    );


document
    .getElementById("goalForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("goalName")
                .value
                .trim();


        const target =
            Number(
                document
                    .getElementById("goalTarget")
                    .value
            );


        const saved =
            Number(
                document
                    .getElementById("goalSaved")
                    .value
            ) || 0;


        goals.push({

            id: Date.now(),

            name,

            target,

            saved

        });


        saveData();

        this.reset();

        goalModal.classList.add("hidden");

        renderGoals();

    });


function renderGoals() {

    const container =
        document.getElementById(
            "goalsList"
        );


    if (!goals.length) {

        container.innerHTML = `
            <div class="empty-state">
                Você ainda não criou nenhuma meta.
            </div>
        `;

        return;

    }


    container.innerHTML =
        goals.map(goal => {

            const percentage =
                Math.min(
                    100,
                    goal.target > 0
                        ? (goal.saved / goal.target) * 100
                        : 0
                );


            return `

                <div class="category-summary-item">

                    <div>

                        <strong>
                            ${escapeHTML(goal.name)}
                        </strong>

                        <small>
                            ${money(goal.saved)}
                            de
                            ${money(goal.target)}
                        </small>

                    </div>

                    <strong>
                        ${percentage.toFixed(0)}%
                    </strong>

                </div>

            `;

        }).join("");

}


/* =====================================================
   ORÇAMENTO
===================================================== */

document
    .getElementById("newBudgetBtn")
    .addEventListener(
        "click",
        function() {

            budgetModal.classList.remove("hidden");

        }
    );


document
    .getElementById("closeBudgetModal")
    .addEventListener(
        "click",
        function() {

            budgetModal.classList.add("hidden");

        }
    );


document
    .getElementById("budgetForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const category =
            document
                .getElementById("budgetCategory")
                .value;


        const limit =
            Number(
                document
                    .getElementById("budgetLimit")
                    .value
            );


        budgets =
            budgets.filter(
                budget =>
                    budget.category !== category
            );


        budgets.push({

            category,

            limit

        });


        saveData();

        this.reset();

        budgetModal.classList.add("hidden");

        renderBudgets();

    });


function renderBudgets() {

    const container =
        document.getElementById(
            "budgetsList"
        );


    if (!budgets.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum orçamento definido.
            </div>
        `;

        return;

    }


    const expenses =
        categoryTotals();


    container.innerHTML =
        budgets.map(budget => {

            const spent =
                expenses[budget.category] || 0;


            const percentage =
                budget.limit > 0
                    ? (spent / budget.limit) * 100
                    : 0;


            return `

                <div class="category-summary-item">

                    <div>

                        <strong>
                            ${escapeHTML(budget.category)}
                        </strong>

                        <small>
                            ${money(spent)}
                            de
                            ${money(budget.limit)}
                        </small>

                    </div>

                    <strong>
                        ${percentage.toFixed(0)}%
                    </strong>

                </div>

            `;

        }).join("");

}


/* =====================================================
   ALERTAS
===================================================== */

function renderSmartAlerts() {

    const container =
        document.getElementById(
            "smartAlerts"
        );


    const totals =
        calculateTotals();


    const alerts = [];


    if (totals.expense > totals.income &&
        totals.income > 0) {

        alerts.push(
            "🔴 Suas despesas ultrapassaram suas receitas."
        );

    }


    budgets.forEach(budget => {

        const spent =
            categoryTotals()[budget.category] || 0;


        if (spent > budget.limit) {

            alerts.push(
                `🔴 O orçamento de ${budget.category} foi ultrapassado.`
            );

        } else if (spent >= budget.limit * .8) {

            alerts.push(
                `🟡 Você já utilizou 80% do orçamento de ${budget.category}.`
            );

        }

    });


    if (!alerts.length) {

        container.innerHTML = `
            <div class="empty-state">
                🟢 Nenhum alerta importante no momento.
            </div>
        `;

        return;

    }


    container.innerHTML =
        alerts.map(alert => `

            <div class="category-summary-item">
                <strong>${alert}</strong>
            </div>

        `).join("");

}


/* =====================================================
   COMPARAÇÃO
===================================================== */

function renderMonthlyComparison() {

    const container =
        document.getElementById(
            "monthlyComparison"
        );


    const totals =
        calculateTotals();


    container.innerHTML = `

        <p>
            Neste momento você possui
            <strong>${transactions.length}</strong>
            lançamento(s) cadastrado(s).
        </p>

        <p>
            Seu saldo atual é
            <strong>${money(totals.balance)}</strong>.
        </p>

    `;

}


/* =====================================================
   ANÁLISE PREMIUM
===================================================== */

function renderPremiumAnalysis() {

    const container =
        document.getElementById(
            "premiumAnalysis"
        );


    const totals =
        calculateTotals();


    if (!transactions.length) {

        container.innerHTML = `
            Cadastre seus lançamentos para receber uma análise financeira.
        `;

        return;

    }


    const percentage =
        totals.income > 0
            ? ((totals.income - totals.expense)
                / totals.income) * 100
            : 0;


    let message;


    if (percentage < 0) {

        message =
            "Seu principal ponto de atenção é reduzir despesas ou aumentar suas receitas.";

    } else if (percentage < 20) {

        message =
            "Sua situação está equilibrada, mas existe pouco espaço para imprevistos. Tente aumentar sua margem de economia.";

    } else {

        message =
            "Sua margem de economia está positiva. Continue controlando as despesas e aproveite para construir suas metas.";

    }


    container.innerHTML = `

        <p>
            ${message}
        </p>

        <p>
            <strong>Saldo:</strong>
            ${money(totals.balance)}
        </p>

    `;

}


/* =====================================================
   SIMULADOR
===================================================== */

document
    .getElementById("simulateBtn")
    .addEventListener(
        "click",
        function() {

            const amount =
                Number(
                    document
                        .getElementById(
                            "simulationAmount"
                        )
                        .value
                );


            const result =
                document.getElementById(
                    "simulationResult"
                );


            if (!amount || amount <= 0) {

                result.textContent =
                    "Digite um valor para simular.";

                return;

            }


            const balance =
                calculateTotals().balance;


            const newBalance =
                balance - amount;


            result.textContent =
                `Seu saldo passaria de ${money(balance)} para ${money(newBalance)}.`;

        }
    );


/* =====================================================
   PREMIUM
===================================================== */

document
    .getElementById("subscribePremiumBtn")
    .addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Ativar o ControleS Premium neste dispositivo?"
                );


            if (!confirmed) return;


            localStorage.setItem(
                STORAGE.premium,
                "true"
            );


            userPlan.textContent =
                "ControleS Premium";


            alert(
                "Premium ativado com sucesso!"
            );


            renderPremium();

        }
    );


/* =====================================================
   TEMA
===================================================== */

function loadTheme() {

    const dark =
        localStorage.getItem(
            STORAGE.dark
        ) === "true";


    if (dark) {

        document.body.classList.add("dark");

    }

}


document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );


            localStorage.setItem(
                STORAGE.dark,
                document.body.classList.contains("dark")
            );

        }
    );


/* =====================================================
   EXPORTAR
===================================================== */

document
    .getElementById("exportDataBtn")
    .addEventListener(
        "click",
        function() {

            const data = {

                user:
                    JSON.parse(
                        localStorage.getItem(
                            STORAGE.user
                        ) || "null"
                    ),

                transactions,

                goals,

                budgets,

                premium:
                    localStorage.getItem(
                        STORAGE.premium
                    ) === "true"

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
                        type: "application/json"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "controles-backup.json";


            link.click();


            URL.revokeObjectURL(url);

        }
    );


/* =====================================================
   RENDER GERAL
===================================================== */

function renderAll() {

    renderDate();

    renderSummary();

    updateCategoryFilter();

    renderRecentTransactions();

    renderAllTransactions();

    renderCategoryList();

    renderReportAnalysis();

    renderCharts();

    renderPremium();

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTheme();

        loadUser();

    }
);

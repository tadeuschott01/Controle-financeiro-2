/* =====================================================
   CONTROLES - JAVASCRIPT
   Sistema financeiro
===================================================== */


/* ================= ESTADO ================= */

let transactions = [];

let currentType = "income";

let chart = null;

let categoryChart = null;


/* ================= ELEMENTOS ================= */

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


/* ================= UTILIDADES ================= */

function money(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* ================= DADOS ================= */

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

    if (data) {

        try {

            transactions = JSON.parse(data);

        } catch (error) {

            transactions = [];

        }

    }

}


/* ================= MODAL ================= */

function openModal() {

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeModal() {

    if (modal) {
        modal.classList.add("hidden");
    }

}


document
.getElementById("openTransactionBtn")
?.addEventListener(
    "click",
    function() {

        console.log("CLICOU NO LANÇAMENTO");

        openModal();

    }
);


document
.getElementById("closeModal")
?.addEventListener(
    "click",
    closeModal
);


document
.querySelector(".modal-overlay")
?.addEventListener(
    "click",
    closeModal
);


/* ================= TIPO DE LANÇAMENTO ================= */

document
.querySelectorAll(".type-option")
.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            currentType =
            button.dataset.type;

            document
            .querySelectorAll(".type-option")
            .forEach(function(btn) {

                btn.classList.remove("active");

            });

            button.classList.add("active");

        }
    );

});


/* ================= SALVAR LANÇAMENTO ================= */

form?.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();

        const description =
        document
        .getElementById("descriptionInput")
        ?.value
        .trim();

        const amount =
        Number(
            document
            .getElementById("amountInput")
            ?.value
        );

        const category =
        document
        .getElementById("transactionCategory")
        ?.value;

        const date =
        document
        .getElementById("dateInput")
        ?.value;

        /*
           Não usamos mais alert().
           Apenas interrompemos se faltar informação.
        */

        if (!description || !amount) {

            return;

        }

        const transaction = {

            id: Date.now(),

            type: currentType,

            description: description,

            amount: amount,

            category: category,

            date: date

        };

        transactions.unshift(transaction);

        saveData();

        form.reset();

        const dateInput =
        document.getElementById("dateInput");

        if (dateInput) {

            dateInput.value =
            new Date()
            .toISOString()
            .split("T")[0];

        }

        closeModal();

        renderAll();

    }
);


/* ================= CÁLCULOS ================= */

function calculate() {

    let income = 0;

    let expense = 0;

    transactions.forEach(function(item) {

        if (item.type === "income") {

            income += Number(item.amount || 0);

        } else {

            expense += Number(item.amount || 0);

        }

    });

    return {

        income: income,

        expense: expense,

        balance: income - expense

    };

}


/* ================= ATUALIZAR DASHBOARD ================= */

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
                (result.income - result.expense)
                /
                result.income
            ) * 100;

        }

        economyValue.textContent =
        percent.toFixed(0) + "%";

    }

}


/* ================= HTML DE TRANSAÇÃO ================= */

function transactionHTML(item) {

    return `

        <div class="transaction">

            <div class="transaction-icon">

                ${item.type === "income" ? "↗" : "↘"}

            </div>

            <div class="transaction-info">

                <strong>
                    ${item.description}
                </strong>

                <small>
                    ${item.category || "Sem categoria"}
                </small>

            </div>

            <div class="transaction-value ${item.type}">

                ${item.type === "income" ? "+" : "-"}

                ${money(item.amount)}

            </div>

            <button
                class="transaction-delete"
                onclick="deleteTransaction(${item.id})"
            >

                ×

            </button>

        </div>

    `;

}


/* ================= ÚLTIMAS TRANSAÇÕES ================= */

function renderTransactions() {

    if (!recentTransactions) {
        return;
    }

    if (transactions.length === 0) {

        recentTransactions.innerHTML = `

            <div class="empty-state">

                Nenhuma movimentação ainda.

            </div>

        `;

        return;

    }

    recentTransactions.innerHTML =
    transactions
    .slice(0, 10)
    .map(transactionHTML)
    .join("");

}


/* ================= TODAS AS TRANSAÇÕES ================= */

function renderAllTransactions(list) {

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
    .map(transactionHTML)
    .join("");

}


/* ================= EXCLUIR ================= */

function deleteTransaction(id) {

    transactions =
    transactions.filter(function(item) {

        return item.id !== id;

    });

    saveData();

    renderAll();

}


/* ================= CATEGORIAS ================= */

function updateCategories() {

    if (!categoryFilter) {
        return;
    }

    const currentValue =
    categoryFilter.value;

    let categories = [];

    transactions.forEach(function(item) {

        if (
            item.category &&
            !categories.includes(item.category)
        ) {

            categories.push(item.category);

        }

    });

    categories.sort();

    categoryFilter.innerHTML = `

        <option value="all">
            Todas categorias
        </option>

    `;

    categories.forEach(function(category) {

        categoryFilter.innerHTML += `

            <option value="${category}">
                ${category}
            </option>

        `;

    });

    if (
        categories.includes(currentValue)
    ) {

        categoryFilter.value =
        currentValue;

    }

}


/* ================= FILTROS ================= */

function filterTransactions() {

    let list =
    [...transactions];

    const search =
    searchInput?.value
    ?.toLowerCase()
    .trim();

    if (search) {

        list =
        list.filter(function(item) {

            return (
                item.description
                ?.toLowerCase()
                .includes(search)
            );

        });

    }

    if (
        typeFilter &&
        typeFilter.value !== "all"
    ) {

        list =
        list.filter(function(item) {

            return (
                item.type ===
                typeFilter.value
            );

        });

    }

    if (
        categoryFilter &&
        categoryFilter.value !== "all"
    ) {

        list =
        list.filter(function(item) {

            return (
                item.category ===
                categoryFilter.value
            );

        });

    }

    renderAllTransactions(list);

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


/* ================= TEMA ================= */

const themeBtn =
document.getElementById("themeBtn");

themeBtn?.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");

        localStorage.setItem(
            "controleS_theme",
            document.body.classList.contains("dark")
        );

    }
);


if (
    localStorage.getItem(
        "controleS_theme"
    ) === "true"
) {

    document.body.classList.add("dark");

}


/* =====================================================
   NAVEGAÇÃO PRINCIPAL
===================================================== */

function navigateToSection(target) {

    console.log(
        "Navegando para:",
        target
    );

    document
    .querySelectorAll(".section")
    .forEach(function(section) {

        section.classList.add("hidden");

    });


    const section =
    document.getElementById(target);

    if (section) {

        section.classList.remove("hidden");

    } else {

        console.error(
            "Seção não encontrada:",
            target
        );

        return;

    }


    document
    .querySelectorAll("[data-section]")
    .forEach(function(btn) {

        btn.classList.remove("active");

    });


    const activeButton =
    document.querySelector(
        `[data-section="${target}"]`
    );

    if (activeButton) {

        activeButton.classList.add("active");

    }


    const pageTitle =
    document.getElementById("pageTitle");

    if (pageTitle) {

        const titles = {

            dashboard: "Dashboard",

            transactions: "Lançamentos",

            categories: "Categorias",

            reports: "Relatórios",

            premium: "Premium"

        };

        pageTitle.textContent =
        titles[target] || "ControleS";

    }


    /*
       Quando entrar em Relatórios,
       recria o gráfico depois que
       a seção estiver visível.
    */

    if (target === "reports") {

        setTimeout(function() {

            createReport();

        }, 50);

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ================= BOTÕES DO MENU ================= */

document
.querySelectorAll("[data-section]")
.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            navigateToSection(
                button.dataset.section
            );

        }
    );

});


/* =====================================================
   BOTÃO CONHECER PREMIUM
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const button =
        event.target.closest(
            "#goPremiumBtn"
        );

        if (!button) {
            return;
        }

        console.log(
            "CONHECER PREMIUM CLICADO"
        );

        navigateToSection("premium");

    }
);


/* =====================================================
   BOTÃO ASSINAR PREMIUM
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const button =
        event.target.closest(
            "#subscribePremiumBtn"
        );

        if (!button) {
            return;
        }

        console.log(
            "BOTÃO ASSINAR PREMIUM CLICADO"
        );

        /*
           Sem alert.
           A assinatura será implementada
           em uma etapa futura.
        */

    }
);


/* ================= USUÁRIO ================= */

function loadUser() {

    const user =
    localStorage.getItem(
        "controleS_user"
    )
    ||
    "Felipe";

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


/* ================= PLANO ================= */

function loadPlan() {

    const plan =
    localStorage.getItem(
        "controleS_plan"
    )
    ||
    "free";

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
   GRÁFICO DO DASHBOARD
===================================================== */

function createChart() {

    const canvas =
    document.getElementById(
        "financeChart"
    );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js não foi carregado."
        );

        return;

    }

    const result =
    calculate();

    if (chart) {

        chart.destroy();

    }

    chart =
    new Chart(
        canvas,
        {

            type: "doughnut",

            data: {

                labels: [

                    "Receitas",

                    "Despesas"

                ],

                datasets: [{

                    data: [

                        result.income,

                        result.expense

                    ],

                    backgroundColor: [

                        "#2f6b50",

                        "#f28c28"

                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


/* =====================================================
   RELATÓRIOS
===================================================== */


/* ================= RESUMO DO RELATÓRIO ================= */

function createReportSummary() {

    const reportsSection =
    document.getElementById("reports");

    if (!reportsSection) {
        return;
    }

    /*
       Evita criar o resumo várias vezes.
    */

    let summary =
    document.getElementById(
        "controleSReportSummary"
    );

    if (!summary) {

        summary =
        document.createElement("div");

        summary.id =
        "controleSReportSummary";

        summary.style.display =
        "grid";

        summary.style.gridTemplateColumns =
        "repeat(auto-fit, minmax(180px, 1fr))";

        summary.style.gap =
        "15px";

        summary.style.marginBottom =
        "25px";

        /*
           Coloca o resumo no começo
           da tela de relatórios.
        */

        reportsSection.prepend(summary);

    }


    const result =
    calculate();


    let economyPercent = 0;

    if (result.income > 0) {

        economyPercent =
        (
            (result.income - result.expense)
            /
            result.income
        ) * 100;

    }


    summary.innerHTML = `

        <div style="
            padding:18px;
            border-radius:14px;
            background:#f5f5f5;
        ">

            <small>Total de receitas</small>

            <h3 style="margin:6px 0;">
                ${money(result.income)}
            </h3>

        </div>


        <div style="
            padding:18px;
            border-radius:14px;
            background:#f5f5f5;
        ">

            <small>Total de despesas</small>

            <h3 style="margin:6px 0;">
                ${money(result.expense)}
            </h3>

        </div>


        <div style="
            padding:18px;
            border-radius:14px;
            background:#f5f5f5;
        ">

            <small>Saldo</small>

            <h3 style="margin:6px 0;">
                ${money(result.balance)}
            </h3>

        </div>


        <div style="
            padding:18px;
            border-radius:14px;
            background:#f5f5f5;
        ">

            <small>Economia</small>

            <h3 style="margin:6px 0;">
                ${economyPercent.toFixed(0)}%
            </h3>

        </div>

    `;

}


/* ================= GRÁFICO DE CATEGORIAS ================= */

function createCategoryChart() {

    const canvas =
    document.getElementById(
        "categoryChart"
    );

    if (!canvas) {

        console.log(
            "Canvas categoryChart não encontrado."
        );

        return;

    }

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js não foi carregado."
        );

        return;

    }


    /*
       Soma somente as DESPESAS
       por categoria.
    */

    const categories = {};


    transactions.forEach(function(item) {

        if (
            item.type !== "expense"
        ) {

            return;

        }


        const category =
        item.category
        ||
        "Sem categoria";


        if (!categories[category]) {

            categories[category] = 0;

        }


        categories[category] +=
        Number(item.amount || 0);

    });


    const labels =
    Object.keys(categories);


    const values =
    Object.values(categories);


    if (categoryChart) {

        categoryChart.destroy();

        categoryChart = null;

    }


    /*
       Se não existem despesas,
       mostra o canvas vazio sem erro.
    */

    if (labels.length === 0) {

        return;

    }


    categoryChart =
    new Chart(
        canvas,
        {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor: [

                        "#2f6b50",

                        "#f28c28",

                        "#12372a",

                        "#d96f12",

                        "#6b8f71",

                        "#f5b971",

                        "#3f7d5b",

                        "#c65d0b"

                    ]

                }]

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

                            label: function(context) {

                                const value =
                                Number(
                                    context.raw || 0
                                );

                                const total =
                                values.reduce(
                                    function(a, b) {
                                        return a + b;
                                    },
                                    0
                                );

                                const percent =
                                total > 0
                                ?
                                (
                                    value / total
                                ) * 100
                                :
                                0;

                                return (
                                    context.label
                                    +
                                    ": "
                                    +
                                    money(value)
                                    +
                                    " ("
                                    +
                                    percent.toFixed(1)
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


/* ================= RELATÓRIO COMPLETO ================= */

function createReport() {

    createReportSummary();

    createCategoryChart();

}


/* ================= RENDERIZAÇÃO ================= */

function renderAll() {

    updateDashboard();

    renderTransactions();

    updateCategories();

    filterTransactions();

    createChart();

    createReport();

}


/* ================= INICIALIZAÇÃO ================= */

function startApp() {

    loadData();

    loadUser();

    loadPlan();

    renderAll();

}


/* ================= INICIAR ================= */

window.addEventListener(
    "load",
    function() {

        console.log(
            "ControleS app.js carregado"
        );

        startApp();

    }
);


/* ================= LOGOUT ================= */

document
.getElementById("logoutBtn")
?.addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "controleS_user"
        );

        location.reload();

    }
);

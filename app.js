/* =====================================================
   CONTROLES - JAVASCRIPT
   Sistema financeiro
===================================================== */


/* ================= ESTADO ================= */

let transactions = [];

let currentType = "income";

let chart = null;


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

        if (!description || !amount) {

            alert(
                "Preencha os campos obrigatórios."
            );

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
                    ${item.category}
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

    /* Esconde todas as seções */

    document
    .querySelectorAll(".section")
    .forEach(function(section) {

        section.classList.add("hidden");

    });


    /* Mostra a seção escolhida */

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


    /* Atualiza menu */

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


    /* Atualiza título */

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


    /* Volta para o topo */

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

        alert(
            "A assinatura Premium será configurada na próxima etapa."
        );

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


/* ================= GRÁFICO ================= */

function createChart() {

    const canvas =
    document.getElementById(
        "financeChart"
    );

    if (!canvas) {
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


/* ================= RENDERIZAÇÃO ================= */

function renderAll() {

    updateDashboard();

    renderTransactions();

    updateCategories();

    filterTransactions();

    createChart();

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

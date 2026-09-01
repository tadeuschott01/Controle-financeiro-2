/* =========================================================
   CONTROLES — APP.JS
   Supabase + Login + Dashboard + Premium
========================================================= */

const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
const SUPABASE_KEY = "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

const SUPABASE_CDN =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

let supabaseClient = null;
let currentUser = null;

let transactions = [];
let goals = [];
let budgets = [];
let subscription = null;

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;

let selectedTransactionType = "income";

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await loadSupabase();

    setupEvents();

    setCurrentDate();

    setDefaultDate();

    await checkSession();

});


/* =========================================================
   CARREGAR SUPABASE
========================================================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (window.supabase) {
            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src = SUPABASE_CDN;

        script.onload = () => {

            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

            resolve();

        };

        script.onerror = () => {
            console.error("Não foi possível carregar o Supabase.");
            reject(new Error("Supabase não carregou."));
        };

        document.head.appendChild(script);

    });

}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }


    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }


    const themeBtn = document.getElementById("themeBtn");

    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }


    const exportBtn = document.getElementById("exportDataBtn");

    if (exportBtn) {
        exportBtn.addEventListener("click", exportData);
    }


    const mobileMenuBtn = document.getElementById("mobileMenuBtn");

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }


    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            showSection(section);

        });

    });


    document.querySelectorAll("[data-section]").forEach(button => {

        if (
            !button.classList.contains("nav-item") &&
            button.dataset.section
        ) {

            button.addEventListener("click", () => {

                showSection(button.dataset.section);

            });

        }

    });


    const openTransactionBtn =
        document.getElementById("openTransactionBtn");

    const newTransactionButton =
        document.getElementById("newTransactionButton");

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


    const closeModal =
        document.getElementById("closeModal");

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeTransactionModal
        );
    }


    document.querySelectorAll(".modal-overlay").forEach(overlay => {

        overlay.addEventListener("click", () => {

            const modal = overlay.closest(".modal");

            if (modal) {
                modal.classList.add("hidden");
            }

        });

    });


    document.querySelectorAll(".type-option").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".type-option")
                .forEach(item => item.classList.remove("active"));

            button.classList.add("active");

            selectedTransactionType =
                button.dataset.type || "income";

        });

    });


    const transactionForm =
        document.getElementById("transactionForm");

    if (transactionForm) {
        transactionForm.addEventListener(
            "submit",
            saveTransaction
        );
    }


    const searchInput =
        document.getElementById("searchInput");

    const typeFilter =
        document.getElementById("typeFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            renderTransactions
        );
    }

    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            renderTransactions
        );
    }

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    const subscribePremiumBtn =
        document.getElementById("subscribePremiumBtn");

    if (subscribePremiumBtn) {

        subscribePremiumBtn.addEventListener(
            "click",
            activatePremium
        );

    }


    const newGoalBtn =
        document.getElementById("newGoalBtn");

    if (newGoalBtn) {

        newGoalBtn.addEventListener(
            "click",
            openGoalModal
        );

    }


    const closeGoalModal =
        document.getElementById("closeGoalModal");

    if (closeGoalModal) {

        closeGoalModal.addEventListener(
            "click",
            () => {
                document
                    .getElementById("goalModal")
                    .classList.add("hidden");
            }
        );

    }


    const goalForm =
        document.getElementById("goalForm");

    if (goalForm) {
        goalForm.addEventListener(
            "submit",
            saveGoal
        );
    }


    const newBudgetBtn =
        document.getElementById("newBudgetBtn");

    if (newBudgetBtn) {

        newBudgetBtn.addEventListener(
            "click",
            openBudgetModal
        );

    }


    const closeBudgetModal =
        document.getElementById("closeBudgetModal");

    if (closeBudgetModal) {

        closeBudgetModal.addEventListener(
            "click",
            () => {
                document
                    .getElementById("budgetModal")
                    .classList.add("hidden");
            }
        );

    }


    const budgetForm =
        document.getElementById("budgetForm");

    if (budgetForm) {

        budgetForm.addEventListener(
            "submit",
            saveBudget
        );

    }


    const simulateBtn =
        document.getElementById("simulateBtn");

    if (simulateBtn) {

        simulateBtn.addEventListener(
            "click",
            simulateExpense
        );

    }


    /* Fecha modal com ESC */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            document
                .querySelectorAll(".modal")
                .forEach(modal => {

                    modal.classList.add("hidden");

                });

        }

    });

}


/* =========================================================
   LOGIN / SESSÃO
========================================================= */

async function checkSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(error);
            showLogin();
            return;
        }

        currentUser = data.session
            ? data.session.user
            : null;

        if (currentUser) {

            await enterApp();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(error);

        showLogin();

    }


    supabaseClient.auth.onAuthStateChange(
        async (_event, session) => {

            currentUser = session
                ? session.user
                : null;

        }
    );

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    const name =
        document.getElementById("loginName").value.trim();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (!email || !password || !name) {

        alert("Preencha nome, e-mail e senha.");

        return;

    }


    const button =
        document.querySelector("#loginForm button");

    if (button) {

        button.disabled = true;

        button.textContent = "Entrando...";

    }


    try {

        /*
         Primeiro tenta entrar.
        */

        let {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


        /*
         Se o usuário ainda não existir,
         cria a conta.
        */

        if (error) {

            const signUpResult =
                await supabaseClient.auth.signUp({

                    email,
                    password,

                    options: {
                        data: {
                            full_name: name
                        }
                    }

                });


            if (signUpResult.error) {

                throw signUpResult.error;

            }


            /*
             Se o Supabase estiver exigindo confirmação
             de e-mail, ainda não haverá sessão.
            */

            if (!signUpResult.data.session) {

                alert(
                    "Cadastro criado! Verifique seu e-mail para confirmar a conta e depois entre novamente."
                );

                return;

            }


            data = signUpResult.data;

        }


        currentUser = data.user;


        if (!currentUser) {

            throw new Error(
                "Não foi possível identificar o usuário."
            );

        }


        await createProfileIfNeeded(name);

        await enterApp();


    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível entrar: " +
            (error.message || "erro desconhecido")
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "Entrar no ControleS";

        }

    }

}


/* =========================================================
   PROFILE
========================================================= */

async function createProfileIfNeeded(name) {

    if (!currentUser) return;


    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {

        console.warn(
            "Erro consultando profile:",
            error
        );

        return;

    }


    if (!data) {

        const {
            error: insertError
        } = await supabaseClient
            .from("profiles")
            .insert({

                id: currentUser.id,

                full_name:
                    name ||
                    currentUser.user_metadata?.full_name ||
                    "Usuário",

                account_type: "personal",

                company_name: null

            });


        if (insertError) {

            console.warn(
                "Não foi possível criar profile:",
                insertError
            );

        }

    }

}


/* =========================================================
   ENTRAR NO APP
========================================================= */

async function enterApp() {

    if (!currentUser) return;


    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");


    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }


    await loadUserData();

    showSection("dashboard");

}


/* =========================================================
   MOSTRAR LOGIN
========================================================= */

function showLogin() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");


    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    if (!supabaseClient) return;


    const confirmed =
        confirm("Deseja realmente sair?");

    if (!confirmed) return;


    const {
        error
    } = await supabaseClient.auth.signOut();


    if (error) {

        alert(
            "Erro ao sair: " +
            error.message
        );

        return;

    }


    currentUser = null;

    transactions = [];
    goals = [];
    budgets = [];
    subscription = null;


    showLogin();

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function loadUserData() {

    if (!currentUser) return;


    await createProfileIfNeeded(
        currentUser.user_metadata?.full_name ||
        "Usuário"
    );


    await Promise.all([

        loadTransactions(),

        loadGoals(),

        loadBudgets(),

        loadSubscription()

    ]);


    updateUserInterface();

    updateDashboard();

    renderTransactions();

    updateCategoryFilter();

    renderCategories();

    renderReports();

    renderGoals();

    renderBudgets();

    renderAlerts();

    renderMonthlyComparison();

    renderPremiumAnalysis();

}


/* =========================================================
   TRANSAÇÕES
========================================================= */

async function loadTransactions() {

    const {
        data,
        error
    } = await supabaseClient
        .from("transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("date", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro carregando transações:",
            error
        );

        transactions = [];

        return;

    }


    transactions = (data || []).map(normalizeTransaction);

}


/* =========================================================
   NORMALIZAR TRANSAÇÃO
========================================================= */

function normalizeTransaction(item) {

    return {

        id: item.id,

        user_id: item.user_id,

        type:
            item.type ||
            item.tipo ||
            "expense",

        description:
            item.description ||
            item.descricao ||
            "Lançamento",

        amount:
            Number(
                item.amount ??
                item.valor ??
                0
            ),

        category:
            item.category ||
            item.categoria ||
            "Outros",

        date:
            item.date ||
            item.data ||
            item.data_iso ||
            new Date().toISOString().slice(0, 10),

        area:
            item.area || "",

        note:
            item.note || ""

    };

}


/* =========================================================
   SALVAR TRANSAÇÃO
========================================================= */

async function saveTransaction(event) {

    event.preventDefault();


    if (!currentUser) {

        alert("Faça login primeiro.");

        return;

    }


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

        alert("Preencha todos os campos obrigatórios.");

        return;

    }


    const button =
        document.querySelector(
            "#transactionForm .save-transaction"
        );


    if (button) {

        button.disabled = true;

        button.textContent = "Salvando...";

    }


    try {

        const {
            error
        } = await supabaseClient
            .from("transactions")
            .insert({

                user_id: currentUser.id,

                type: selectedTransactionType,

                description,

                amount,

                category,

                date,

                area: "",

                note: frequency !== "once"
                    ? `Frequência: ${frequency}`
                    : ""

            });


        if (error) {

            throw error;

        }


        closeTransactionModal();


        document
            .getElementById("transactionForm")
            .reset();


        selectedTransactionType = "income";


        document
            .querySelectorAll(".type-option")
            .forEach((item, index) => {

                item.classList.toggle(
                    "active",
                    index === 0
                );

            });


        await loadUserData();


        alert("Lançamento salvo com sucesso!");


    } catch (error) {

        console.error(error);

        alert(
            "Erro ao salvar lançamento: " +
            error.message
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Salvar lançamento";

        }

    }

}


/* =========================================================
   EXCLUIR TRANSAÇÃO
========================================================= */

async function deleteTransaction(id) {

    if (!currentUser) return;


    const confirmed =
        confirm("Excluir este lançamento?");


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);


    if (error) {

        alert(
            "Erro ao excluir: " +
            error.message
        );

        return;

    }


    await loadUserData();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const income =
        transactions
            .filter(t => t.type === "income")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    const expense =
        transactions
            .filter(t => t.type === "expense")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    const balance =
        income - expense;


    const economy =
        income > 0
            ? ((balance / income) * 100)
            : 0;


    setText(
        "balanceValue",
        formatCurrency(balance)
    );


    setText(
        "incomeValue",
        formatCurrency(income)
    );


    setText(
        "expenseValue",
        formatCurrency(expense)
    );


    setText(
        "economyValue",
        `${Math.max(0, economy).toFixed(1)}%`
    );


    setText(
        "premiumEconomyValue",
        `${Math.max(0, economy).toFixed(1)}%`
    );


    renderRecentTransactions();

    updateFinanceChart();

}


/* =========================================================
   TRANSAÇÕES RECENTES
========================================================= */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!container) return;


    const list =
        transactions.slice(0, 5);


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento cadastrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        list.map(transactionHTML).join("");

}


/* =========================================================
   TODAS TRANSAÇÕES
========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "allTransactions"
        );


    if (!container) return;


    const search =
        (
            document.getElementById("searchInput")
                ?.value || ""
        )
            .toLowerCase()
            .trim();


    const type =
        document.getElementById("typeFilter")
            ?.value || "all";


    const category =
        document.getElementById("categoryFilter")
            ?.value || "all";


    const filtered =
        transactions.filter(item => {

            const matchesSearch =
                !search ||
                item.description
                    .toLowerCase()
                    .includes(search) ||
                item.category
                    .toLowerCase()
                    .includes(search);


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


/* =========================================================
   HTML TRANSAÇÃO
========================================================= */

function transactionHTML(item) {

    const income =
        item.type === "income";


    const sign =
        income ? "+" : "-";


    const icon =
        income ? "↗" : "↘";


    return `

        <div class="transaction">

            <div class="transaction-icon">
                ${icon}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(item.description)}
                </strong>

                <small>
                    ${escapeHTML(item.category)}
                    •
                    ${formatDate(item.date)}
                </small>

            </div>

            <div class="transaction-value ${
                income ? "income" : "expense"
            }">

                ${sign}
                ${formatCurrency(item.amount)}

            </div>

            <button
                class="transaction-delete"
                type="button"
                onclick="deleteTransaction('${item.id}')"
                title="Excluir"
            >
                ×
            </button>

        </div>

    `;

}


/* =========================================================
   CATEGORIAS
========================================================= */

function updateCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    if (!select) return;


    const current =
        select.value;


    const categories =
        [...new Set(
            transactions
                .map(t => t.category)
                .filter(Boolean)
        )]
            .sort();


    select.innerHTML = `
        <option value="all">
            Todas categorias
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });


    if (
        categories.includes(current)
    ) {

        select.value = current;

    }

}


/* =========================================================
   RENDER CATEGORIAS
========================================================= */

function renderCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );


    if (!container) return;


    const expenses =
        transactions.filter(
            t => t.type === "expense"
        );


    const totals = {};


    expenses.forEach(item => {

        if (!totals[item.category]) {
            totals[item.category] = 0;
        }

        totals[item.category] += item.amount;

    });


    const entries =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1]);


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                Ainda não existem despesas para analisar.
            </div>
        `;

        updateCategoryChart({});

        return;

    }


    const total =
        entries.reduce(
            (sum, [, value]) => sum + value,
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
                        ${formatCurrency(value)}
                        ·
                        ${percentage.toFixed(1)}%
                    </span>

                </div>

            `;

        }).join("");


    updateCategoryChart(totals);

}


/* =========================================================
   GRÁFICO FINANCEIRO
========================================================= */

function updateFinanceChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );


    if (!canvas || !window.Chart) return;


    if (financeChart) {
        financeChart.destroy();
    }


    const income =
        transactions
            .filter(t => t.type === "income")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    const expense =
        transactions
            .filter(t => t.type === "expense")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    financeChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: [
                    "Receitas",
                    "Despesas"
                ],

                datasets: [{

                    label: "Valor",

                    data: [
                        income,
                        expense
                    ]

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

        });

}


/* =========================================================
   GRÁFICO CATEGORIAS
========================================================= */

function updateCategoryChart(totals) {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas || !window.Chart) return;


    if (categoryChart) {
        categoryChart.destroy();
    }


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    if (!labels.length) return;


    categoryChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels,

                datasets: [{

                    data: values

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

        });

}


/* =========================================================
   RELATÓRIOS
========================================================= */

function renderReports() {

    const analysis =
        document.getElementById(
            "reportAnalysis"
        );


    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );


    if (!analysis && !canvas) return;


    const income =
        transactions
            .filter(t => t.type === "income")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    const expense =
        transactions
            .filter(t => t.type === "expense")
            .reduce(
                (sum, t) => sum + t.amount,
                0
            );


    const balance =
        income - expense;


    const economy =
        income > 0
            ? (balance / income) * 100
            : 0;


    if (analysis) {

        analysis.innerHTML = `

            <div class="category-summary-item">
                <strong>Total de receitas</strong>
                <span>${formatCurrency(income)}</span>
            </div>

            <div class="category-summary-item">
                <strong>Total de despesas</strong>
                <span>${formatCurrency(expense)}</span>
            </div>

            <div class="category-summary-item">
                <strong>Saldo</strong>
                <span>${formatCurrency(balance)}</span>
            </div>

            <div class="category-summary-item">
                <strong>Economia</strong>
                <span>${Math.max(0, economy).toFixed(1)}%</span>
            </div>

        `;

    }


    if (canvas && window.Chart) {

        if (reportCategoryChart) {
            reportCategoryChart.destroy();
        }


        const totals = {};


        transactions
            .filter(t => t.type === "expense")
            .forEach(t => {

                totals[t.category] =
                    (totals[t.category] || 0)
                    + t.amount;

            });


        const labels =
            Object.keys(totals);


        const values =
            Object.values(totals);


        if (labels.length) {

            reportCategoryChart =
                new Chart(canvas, {

                    type: "doughnut",

                    data: {

                        labels,

                        datasets: [{

                            data: values

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

                });

        }

    }

}


/* =========================================================
   METAS
========================================================= */

async function loadGoals() {

    const {
        data,
        error
    } = await supabaseClient
        .from("goals")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro carregando metas:",
            error
        );

        goals = [];

        return;

    }


    goals = data || [];

}


/* =========================================================
   ABRIR META
========================================================= */

function openGoalModal() {

    const modal =
        document.getElementById("goalModal");


    if (modal) {
        modal.classList.remove("hidden");
    }

}


/* =========================================================
   SALVAR META
========================================================= */

async function saveGoal(event) {

    event.preventDefault();


    if (!currentUser) return;


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


    if (!name || !target) {

        alert("Preencha os dados da meta.");

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("goals")
        .insert({

            user_id: currentUser.id,

            name,

            target,

            saved

        });


    if (error) {

        alert(
            "Erro ao criar meta: " +
            error.message
        );

        return;

    }


    document
        .getElementById("goalForm")
        .reset();


    document
        .getElementById("goalModal")
        .classList.add("hidden");


    await loadUserData();

}


/* =========================================================
   RENDER METAS
========================================================= */

function renderGoals() {

    const container =
        document.getElementById(
            "goalsList"
        );


    if (!container) return;


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

            const target =
                Number(goal.target || 0);


            const saved =
                Number(goal.saved || 0);


            const percentage =
                target > 0
                    ? Math.min(
                        100,
                        (saved / target) * 100
                    )
                    : 0;


            return `

                <div class="category-summary-item">

                    <div>

                        <strong>
                            ${escapeHTML(goal.name)}
                        </strong>

                        <small>
                            ${formatCurrency(saved)}
                            de
                            ${formatCurrency(target)}
                        </small>

                    </div>

                    <span>
                        ${percentage.toFixed(0)}%
                    </span>

                </div>

            `;

        }).join("");

}


/* =========================================================
   ORÇAMENTOS
========================================================= */

async function loadBudgets() {

    const {
        data,
        error
    } = await supabaseClient
        .from("budgets")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Erro carregando orçamentos:",
            error
        );

        budgets = [];

        return;

    }


    budgets = data || [];

}


/* =========================================================
   ABRIR ORÇAMENTO
========================================================= */

function openBudgetModal() {

    const modal =
        document.getElementById(
            "budgetModal"
        );


    if (modal) {

        modal.classList.remove("hidden");

    }

}


/* =========================================================
   SALVAR ORÇAMENTO
========================================================= */

async function saveBudget(event) {

    event.preventDefault();


    if (!currentUser) return;


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


    if (!limit) {

        alert("Informe o limite mensal.");

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("budgets")
        .upsert({

            user_id: currentUser.id,

            category,

            limit_amount: limit

        }, {

            onConflict: "user_id,category"

        });


    if (error) {

        /*
         Se ainda não houver constraint
         UNIQUE, tenta inserir normalmente.
        */

        const result =
            await supabaseClient
                .from("budgets")
                .insert({

                    user_id: currentUser.id,

                    category,

                    limit_amount: limit

                });


        if (result.error) {

            alert(
                "Erro ao salvar orçamento: " +
                result.error.message
            );

            return;

        }

    }


    document
        .getElementById("budgetForm")
        .reset();


    document
        .getElementById("budgetModal")
        .classList.add("hidden");


    await loadUserData();

}


/* =========================================================
   RENDER ORÇAMENTOS
========================================================= */

function renderBudgets() {

    const container =
        document.getElementById(
            "budgetsList"
        );


    if (!container) return;


    if (!budgets.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum orçamento definido.
            </div>
        `;

        return;

    }


    container.innerHTML =
        budgets.map(budget => {

            const spent =
                transactions
                    .filter(t =>
                        t.type === "expense" &&
                        t.category === budget.category
                    )
                    .reduce(
                        (sum, t) =>
                            sum + t.amount,
                        0
                    );


            const limit =
                Number(
                    budget.limit_amount || 0
                );


            const percentage =
                limit > 0
                    ? (spent / limit) * 100
                    : 0;


            return `

                <div class="category-summary-item">

                    <div>

                        <strong>
                            ${escapeHTML(budget.category)}
                        </strong>

                        <small>
                            ${formatCurrency(spent)}
                            /
                            ${formatCurrency(limit)}
                        </small>

                    </div>

                    <span>
                        ${percentage.toFixed(0)}%
                    </span>

                </div>

            `;

        }).join("");

}


/* =========================================================
   SUB

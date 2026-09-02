const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
const SUPABASE_KEY = "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

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
let enteringApp = false;


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    setupEvents();
    setCurrentDate();
    setDefaultDate();
    loadTheme();
    initializeSupabase();
    checkSession();
});


function initializeSupabase() {
    try {
        if (
            typeof window.supabase === "undefined" ||
            !window.supabase.createClient
        ) {
            console.error("Supabase não foi carregado.");
            return;
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        console.log("✅ Supabase inicializado.");
    } catch (error) {
        console.error(
            "Erro inicializando Supabase:",
            error
        );
    }
}


/* =====================================================
   EVENTOS
===================================================== */

function setupEvents() {
    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }


    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener(
            "submit",
            handleRegister
        );
    }


    const transactionForm =
        document.getElementById(
            "transactionForm"
        );

    if (transactionForm) {
        transactionForm.addEventListener(
            "submit",
            saveTransaction
        );
    }


    const logoutButton =
        document.getElementById("logoutBtn");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    document
        .querySelectorAll(".password-toggle")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    const target =
                        button.dataset.target;

                    if (target) {
                        togglePassword(
                            target,
                            button
                        );
                    }
                }
            );
        });


    document
        .querySelectorAll("[data-theme-toggle]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                toggleTheme
            );
        });
}


/* =====================================================
   SENHA
===================================================== */

function togglePassword(
    inputId,
    button
) {
    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    if (input.type === "password") {
        input.type = "text";

        if (button) {
            button.textContent = "◎";
            button.setAttribute(
                "aria-label",
                "Ocultar senha"
            );
        }
    } else {
        input.type = "password";

        if (button) {
            button.textContent = "◉";
            button.setAttribute(
                "aria-label",
                "Mostrar senha"
            );
        }
    }
}


/* =====================================================
   LOGIN / CADASTRO
===================================================== */

function showLogin() {
    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.classList.remove(
            "hidden"
        );
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showRegister() {
    const loginView =
        document.getElementById(
            "loginView"
        );

    const registerView =
        document.getElementById(
            "registerView"
        );

    if (loginView) {
        loginView.classList.add("hidden");
    }

    if (registerView) {
        registerView.classList.remove(
            "hidden"
        );
    }
}


function showLoginForm() {
    const loginView =
        document.getElementById(
            "loginView"
        );

    const registerView =
        document.getElementById(
            "registerView"
        );

    if (registerView) {
        registerView.classList.add("hidden");
    }

    if (loginView) {
        loginView.classList.remove(
            "hidden"
        );
    }
}


/* =====================================================
   SESSÃO
===================================================== */

async function checkSession() {
    if (!supabaseClient) {
        showLogin();
        return;
    }

    try {
        const result =
            await supabaseClient.auth.getSession();

        if (result.error) {
            console.error(
                "Erro verificando sessão:",
                result.error
            );

            currentUser = null;
            showLogin();
            return;
        }

        currentUser =
            result.data?.session?.user ||
            null;

        if (currentUser) {
            console.log(
                "👤 Sessão encontrada:",
                currentUser.email
            );

            await enterApp();
        } else {
            showLogin();
        }

        supabaseClient.auth.onAuthStateChange(
            async function (
                event,
                session
            ) {
                currentUser =
                    session?.user ||
                    null;

                console.log(
                    "🔐 Evento de autenticação:",
                    event
                );

                if (
                    event ===
                    "SIGNED_OUT"
                ) {
                    currentUser = null;

                    transactions = [];
                    goals = [];
                    budgets = [];
                    subscription = null;

                    showLogin();
                }
            }
        );
    } catch (error) {
        console.error(
            "Erro verificando sessão:",
            error
        );

        currentUser = null;
        showLogin();
    }
}


async function handleLogin(event) {
    if (event) {
        event.preventDefault();
    }

    if (!supabaseClient) {
        alert(
            "Supabase ainda não foi inicializado."
        );
        return;
    }

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase();

    const password =
        passwordInput?.value || "";

    if (!email || !password) {
        alert(
            "Preencha seu e-mail e sua senha."
        );
        return;
    }

    try {
        const result =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });

        if (result.error) {
            console.error(
                "Erro no login:",
                result.error
            );

            alert(
                "Não foi possível entrar.\n\n" +
                result.error.message
            );

            return;
        }

        currentUser =
            result.data?.user ||
            null;

        if (!currentUser) {
            alert(
                "Não foi possível identificar o usuário."
            );
            return;
        }

        await createProfileIfNeeded();

        await enterApp();
    } catch (error) {
        console.error(
            "Erro no login:",
            error
        );

        alert(
            "Ocorreu um erro ao entrar."
        );
    }
}


async function handleRegister(event) {
    if (event) {
        event.preventDefault();
    }

    if (!supabaseClient) {
        alert(
            "Supabase ainda não foi inicializado."
        );
        return;
    }

    const nameInput =
        document.getElementById(
            "registerName"
        );

    const emailInput =
        document.getElementById(
            "registerEmail"
        );

    const passwordInput =
        document.getElementById(
            "registerPassword"
        );

    const confirmPasswordInput =
        document.getElementById(
            "registerPasswordConfirm"
        );

    const name =
        nameInput?.value?.trim() || "";

    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase() || "";

    const password =
        passwordInput?.value || "";

    const confirmPassword =
        confirmPasswordInput?.value ||
        "";

    if (!name) {
        alert(
            "Digite seu nome."
        );
        return;
    }

    if (!email) {
        alert(
            "Digite seu e-mail."
        );
        return;
    }

    if (!password) {
        alert(
            "Digite uma senha."
        );
        return;
    }

    if (password.length < 6) {
        alert(
            "A senha precisa ter pelo menos 6 caracteres."
        );
        return;
    }

    if (
        confirmPassword &&
        password !== confirmPassword
    ) {
        alert(
            "As senhas não são iguais."
        );
        return;
    }

    try {
        const result =
            await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name:
                            name
                    }
                }
            });

        if (result.error) {
            console.error(
                "Erro no cadastro:",
                result.error
            );

            alert(
                "Não foi possível criar sua conta.\n\n" +
                result.error.message
            );

            return;
        }

        currentUser =
            result.data?.user ||
            null;

        if (!result.data?.session) {
            alert(
                "🎉 Conta criada com sucesso!\n\n" +
                "Enviamos um e-mail de confirmação para você.\n\n" +
                "Confirme seu e-mail e depois volte ao ControleS para entrar."
            );

            return;
        }

        if (!currentUser) {
            throw new Error(
                "Conta criada, mas não foi possível iniciar a sessão."
            );
        }

        await createProfileIfNeeded(
            name
        );

        await enterApp();
    } catch (error) {
        console.error(
            "Erro no cadastro:",
            error
        );

        alert(
            "Ocorreu um erro ao criar sua conta."
        );
    }
}


/* =====================================================
   PERFIL
===================================================== */

async function createProfileIfNeeded(
    name = ""
) {
    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }

    try {
        const result =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();

        if (result.error) {
            console.error(
                "Erro buscando perfil:",
                result.error
            );
            return;
        }

        if (!result.data) {
            const profile =
                await supabaseClient
                    .from("profiles")
                    .insert({
                        id:
                            currentUser.id,
                        full_name:
                            name ||
                            currentUser.user_metadata
                                ?.full_name ||
                            "",
                        email:
                            currentUser.email ||
                            ""
                    });

            if (profile.error) {
                console.error(
                    "Erro criando perfil:",
                    profile.error
                );
            }
        }
    } catch (error) {
        console.error(
            "Erro no perfil:",
            error
        );
    }
}


/* =====================================================
   ENTRAR NO APP
===================================================== */

async function enterApp() {
    if (!currentUser) {
        return;
    }

    if (enteringApp) {
        return;
    }

    enteringApp = true;

    try {
        const loginScreen =
            document.getElementById(
                "loginScreen"
            );

        const app =
            document.getElementById(
                "app"
            );

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

        await loadUserData();

        showSection(
            "dashboard"
        );
    } catch (error) {
        console.error(
            "Erro entrando no app:",
            error
        );

        showSection(
            "dashboard"
        );
    } finally {
        enteringApp = false;
    }
}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {
    try {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
    } catch (error) {
        console.error(
            "Erro fazendo logout:",
            error
        );
    }

    currentUser = null;

    transactions = [];
    goals = [];
    budgets = [];
    subscription = null;

    showLogin();
}
/* =====================================================
   CARREGAMENTO DOS DADOS DO USUÁRIO
===================================================== */

async function loadUserData() {
    if (!supabaseClient || !currentUser) {
        return;
    }

    try {
        await createProfileIfNeeded();

        await Promise.all([
            loadTransactions(),
            loadGoals(),
            loadBudgets(),
            loadSubscription()
        ]);

        updateDashboard();
        updateTransactionsList();
        updateGoalsList();
        updateBudgetUI();
        updateReports();
        updateProfileUI();
        updatePremiumUI();
    } catch (error) {
        console.error(
            "Erro carregando dados:",
            error
        );
    }
}


/* =====================================================
   TRANSAÇÕES
===================================================== */

async function loadTransactions() {
    if (
        !supabaseClient ||
        !currentUser
    ) {
        transactions = [];
        return;
    }

    try {
        const result =
            await supabaseClient
                .from("transactions")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "date",
                    {
                        ascending: false
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (result.error) {
            console.error(
                "Erro carregando lançamentos:",
                result.error
            );

            transactions = [];
            return;
        }

        transactions =
            result.data || [];
    } catch (error) {
        console.error(
            "Erro carregando transações:",
            error
        );

        transactions = [];
    }
}


async function saveTransaction(event) {
    if (event) {
        event.preventDefault();
    }

    if (
        !supabaseClient ||
        !currentUser
    ) {
        alert(
            "Você precisa estar logado para salvar um lançamento."
        );
        return;
    }

    const descriptionInput =
        document.getElementById(
            "transactionDescription"
        );

    const amountInput =
        document.getElementById(
            "transactionAmount"
        );

    const categoryInput =
        document.getElementById(
            "transactionCategory"
        );

    const dateInput =
        document.getElementById(
            "transactionDate"
        );

    const description =
        descriptionInput?.value
            ?.trim() || "";

    const amountValue =
        amountInput?.value || "";

    const category =
        categoryInput?.value
            ?.trim() || "";

    const date =
        dateInput?.value ||
        new Date()
            .toISOString()
            .slice(0, 10);

    const amount =
        parseFloat(
            String(amountValue)
                .replace(",", ".")
        );

    if (!description) {
        alert(
            "Digite uma descrição para o lançamento."
        );
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert(
            "Digite um valor válido."
        );
        return;
    }

    try {
        /*
         * IMPORTANTE:
         * A tabela transactions do Supabase possui:
         *
         * user_id
         * description
         * amount
         * type
         * category
         * date
         *
         * Não enviar "area" ou "note",
         * pois essas colunas não existem
         * no banco atual.
         */

        const result =
            await supabaseClient
                .from("transactions")
                .insert({
                    user_id:
                        currentUser.id,
                    type:
                        selectedTransactionType,
                    description:
                        description,
                    amount:
                        amount,
                    category:
                        category,
                    date:
                        date
                });

        if (result.error) {
            console.error(
                "Erro salvando lançamento:",
                result.error
            );

            alert(
                "Não foi possível salvar o lançamento.\n\n" +
                result.error.message
            );

            return;
        }

        if (descriptionInput) {
            descriptionInput.value =
                "";
        }

        if (amountInput) {
            amountInput.value =
                "";
        }

        if (categoryInput) {
            categoryInput.value =
                "";
        }

        setDefaultDate();

        selectedTransactionType =
            "income";

        updateTransactionTypeButtons();

        closeModal(
            "transactionModal"
        );

        await loadUserData();

        alert(
            "✅ Lançamento salvo com sucesso!"
        );
    } catch (error) {
        console.error(
            "Erro salvando lançamento:",
            error
        );

        alert(
            "Ocorreu um erro ao salvar o lançamento.\n\n" +
            error.message
        );
    }
}


/* =====================================================
   TIPO DE TRANSAÇÃO
===================================================== */

function selectTransactionType(
    type
) {
    if (
        type !== "income" &&
        type !== "expense"
    ) {
        return;
    }

    selectedTransactionType =
        type;

    updateTransactionTypeButtons();
}


function updateTransactionTypeButtons() {
    const incomeButton =
        document.getElementById(
            "incomeTypeBtn"
        );

    const expenseButton =
        document.getElementById(
            "expenseTypeBtn"
        );

    if (incomeButton) {
        incomeButton.classList.toggle(
            "active",
            selectedTransactionType ===
                "income"
        );
    }

    if (expenseButton) {
        expenseButton.classList.toggle(
            "active",
            selectedTransactionType ===
                "expense"
        );
    }
}


/* =====================================================
   EXCLUSÃO DE TRANSAÇÃO
===================================================== */

async function deleteTransaction(
    id
) {
    if (
        !supabaseClient ||
        !currentUser ||
        !id
    ) {
        return;
    }

    const confirmed =
        window.confirm(
            "Deseja realmente excluir este lançamento?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const result =
            await supabaseClient
                .from("transactions")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (result.error) {
            console.error(
                "Erro excluindo lançamento:",
                result.error
            );

            alert(
                "Não foi possível excluir o lançamento.\n\n" +
                result.error.message
            );

            return;
        }

        await loadUserData();

        alert(
            "Lançamento excluído."
        );
    } catch (error) {
        console.error(
            "Erro excluindo transação:",
            error
        );

        alert(
            "Ocorreu um erro ao excluir o lançamento."
        );
    }
}


/* =====================================================
   EDIÇÃO DE TRANSAÇÃO
===================================================== */

async function editTransaction(
    id
) {
    const transaction =
        transactions.find(
            function (item) {
                return item.id === id;
            }
        );

    if (!transaction) {
        return;
    }

    const descriptionInput =
        document.getElementById(
            "transactionDescription"
        );

    const amountInput =
        document.getElementById(
            "transactionAmount"
        );

    const categoryInput =
        document.getElementById(
            "transactionCategory"
        );

    const dateInput =
        document.getElementById(
            "transactionDate"
        );

    if (descriptionInput) {
        descriptionInput.value =
            transaction.description ||
            "";
    }

    if (amountInput) {
        amountInput.value =
            transaction.amount || "";
    }

    if (categoryInput) {
        categoryInput.value =
            transaction.category ||
            "";
    }

    if (dateInput) {
        dateInput.value =
            transaction.date ||
            "";
    }

    selectedTransactionType =
        transaction.type ||
        "income";

    updateTransactionTypeButtons();

    openModal(
        "transactionModal"
    );

    const form =
        document.getElementById(
            "transactionForm"
        );

    if (form) {
        form.dataset.editingId =
            id;
    }
}


/* =====================================================
   ATUALIZAÇÃO DA LISTA
===================================================== */

function updateTransactionsList() {
    const container =
        document.getElementById(
            "transactionsList"
        );

    if (!container) {
        return;
    }

    if (!transactions.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <h3>Nenhum lançamento</h3>
                <p>
                    Comece adicionando sua primeira
                    receita ou despesa.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        transactions
            .map(function (transaction) {
                const isIncome =
                    transaction.type ===
                    "income";

                const amount =
                    formatCurrency(
                        transaction.amount
                    );

                const date =
                    formatDate(
                        transaction.date
                    );

                return `
                    <div class="transaction-item">
                        <div class="transaction-icon ${
                            isIncome
                                ? "income"
                                : "expense"
                        }">
                            ${
                                isIncome
                                    ? "↗"
                                    : "↘"
                            }
                        </div>

                        <div class="transaction-info">
                            <strong>
                                ${escapeHtml(
                                    transaction.description ||
                                        "Sem descrição"
                                )}
                            </strong>

                            <span>
                                ${
                                    escapeHtml(
                                        transaction.category ||
                                            "Sem categoria"
                                    )
                                }
                                •
                                ${date}
                            </span>
                        </div>

                        <div class="transaction-value ${
                            isIncome
                                ? "income"
                                : "expense"
                        }">
                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            } ${amount}
                        </div>

                        <div class="transaction-actions">
                            <button
                                type="button"
                                onclick="editTransaction('${transaction.id}')"
                                title="Editar"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                onclick="deleteTransaction('${transaction.id}')"
                                title="Excluir"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {
    const income =
        transactions
            .filter(function (item) {
                return (
                    item.type ===
                    "income"
                );
            })
            .reduce(
                function (
                    total,
                    item
                ) {
                    return (
                        total +
                        Number(
                            item.amount ||
                                0
                        )
                    );
                },
                0
            );

    const expense =
        transactions
            .filter(function (item) {
                return (
                    item.type ===
                    "expense"
                );
            })
            .reduce(
                function (
                    total,
                    item
                ) {
                    return (
                        total +
                        Number(
                            item.amount ||
                                0
                        )
                    );
                },
                0
            );

    const balance =
        income - expense;

    setText(
        "totalIncome",
        formatCurrency(income)
    );

    setText(
        "totalExpense",
        formatCurrency(expense)
    );

    setText(
        "totalBalance",
        formatCurrency(balance)
    );

    setText(
        "dashboardIncome",
        formatCurrency(income)
    );

    setText(
        "dashboardExpense",
        formatCurrency(expense)
    );

    setText(
        "dashboardBalance",
        formatCurrency(balance)
    );

    renderFinanceChart(
        income,
        expense
    );

    renderCategoryChart();
}


/* =====================================================
   GRÁFICO FINANCEIRO
===================================================== */

function renderFinanceChart(
    income,
    expense
) {
    const canvas =
        document.getElementById(
            "financeChart"
        );

    if (
        !canvas ||
        typeof Chart ===
            "undefined"
    ) {
        return;
    }

    if (financeChart) {
        financeChart.destroy();
    }

    financeChart =
        new Chart(
            canvas,
            {
                type: "doughnut",
                data: {
                    labels: [
                        "Receitas",
                        "Despesas"
                    ],
                    datasets: [
                        {
                            data: [
                                income,
                                expense
                            ]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio:
                        false,
                    plugins: {
                        legend: {
                            position:
                                "bottom"
                        }
                    }
                }
            }
        );
}


/* =====================================================
   GRÁFICO POR CATEGORIA
===================================================== */

function renderCategoryChart() {
    const canvas =
        document.getElementById(
            "categoryChart"
        );

    if (
        !canvas ||
        typeof Chart ===
            "undefined"
    ) {
        return;
    }

    const categoryTotals = {};

    transactions
        .filter(function (item) {
            return (
                item.type ===
                "expense"
            );
        })
        .forEach(function (item) {
            const category =
                item.category ||
                "Outros";

            categoryTotals[
                category
            ] =
                (
                    categoryTotals[
                        category
                    ] || 0
                ) +
                Number(
                    item.amount ||
                        0
                );
        });

    const labels =
        Object.keys(
            categoryTotals
        );

    const values =
        labels.map(
            function (label) {
                return categoryTotals[
                    label
                ];
            }
        );

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart =
        new Chart(
            canvas,
            {
                type: "pie",
                data: {
                    labels:
                        labels.length
                            ? labels
                            : [
                                  "Sem dados"
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
                    maintainAspectRatio:
                        false,
                    plugins: {
                        legend: {
                            position:
                                "bottom"
                        }
                    }
                }
            }
        );
}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function showSection(
    sectionName
) {
    document
        .querySelectorAll(
            ".app-section"
        )
        .forEach(function (section) {
            section.classList.add(
                "hidden"
            );
        });

    const target =
        document.getElementById(
            sectionName
        );

    if (target) {
        target.classList.remove(
            "hidden"
        );
    }

    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.section ===
                    sectionName
            );
        });

    if (
        sectionName ===
        "dashboard"
    ) {
        updateDashboard();
    }

    if (
        sectionName ===
        "transactions"
    ) {
        updateTransactionsList();
    }

    if (
        sectionName ===
        "reports"
    ) {
        updateReports();
    }

    if (
        sectionName ===
        "goals"
    ) {
        updateGoalsList();
    }
}


/* =====================================================
   MODAIS
===================================================== */

function openModal(
    modalId
) {
    const modal =
        document.getElementById(
            modalId
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "active"
    );
}


function closeModal(
    modalId
) {
    const modal =
        document.getElementById(
            modalId
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    modal.classList.add(
        "hidden"
    );
}


function closeAllModals() {
    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(function (modal) {
            modal.classList.remove(
                "active"
            );

            modal.classList.add(
                "hidden"
            );
        });
}


/* =====================================================
   DATAS
===================================================== */

function setCurrentDate() {
    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }

    const now =
        new Date();

    element.textContent =
        now.toLocaleDateString(
            "pt-BR",
            {
                weekday:
                    "long",
                day:
                    "2-digit",
                month:
                    "long",
                year:
                    "numeric"
            }
        );
}


function setDefaultDate() {
    const input =
        document.getElementById(
            "transactionDate"
        );

    if (!input) {
        return;
    }

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    if (!input.value) {
        input.value =
            today;
    }
}


/* =====================================================
   FORMATAÇÃO
===================================================== */

function formatCurrency(
    value
) {
    const number =
        Number(value || 0);

    return number.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatDate(
    value
) {
    if (!value) {
        return "";
    }

    const parts =
        String(value)
            .split("-");

    if (
        parts.length === 3
    ) {
        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleDateString(
        "pt-BR"
    );
}


function setText(
    id,
    value
) {
    const element =
        document.getElementById(
            id
        );

    if (element) {
        element.textContent =
            value;
    }
}


function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
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
   TEMA
===================================================== */

function toggleTheme() {
    const html =
        document.documentElement;

    const current =
        html.getAttribute(
            "data-theme"
        );

    const next =
        current === "dark"
            ? "light"
            : "dark";

    html.setAttribute(
        "data-theme",
        next
    );

    localStorage.setItem(
        "controles-theme",
        next
    );
}


function loadTheme() {
    const saved =
        localStorage.getItem(
            "controles-theme"
        );

    if (saved) {
        document.documentElement
            .setAttribute(
                "data-theme",
                saved
            );
    }
}
/* =====================================================
   METAS
===================================================== */

async function loadGoals() {
    if (
        !supabaseClient ||
        !currentUser
    ) {
        goals = [];
        return;
    }

    try {
        const result =
            await supabaseClient
                .from("goals")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (result.error) {
            console.error(
                "Erro carregando metas:",
                result.error
            );

            goals = [];
            return;
        }

        goals =
            result.data || [];
    } catch (error) {
        console.error(
            "Erro carregando metas:",
            error
        );

        goals = [];
    }
}


async function saveGoal(event) {
    if (event) {
        event.preventDefault();
    }

    if (
        !supabaseClient ||
        !currentUser
    ) {
        alert(
            "Você precisa estar logado."
        );
        return;
    }

    const nameInput =
        document.getElementById(
            "goalName"
        );

    const targetInput =
        document.getElementById(
            "goalTarget"
        );

    const name =
        nameInput?.value?.trim() ||
        "";

    const target =
        parseFloat(
            String(
                targetInput?.value ||
                    ""
            ).replace(
                ",",
                "."
            )
        );

    if (!name) {
        alert(
            "Digite o nome da meta."
        );
        return;
    }

    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {
        alert(
            "Digite um valor válido para a meta."
        );
        return;
    }

    try {
        /*
         * CORREÇÃO:
         * A tabela goals utiliza:
         * target_amount
         * current_amount
         */

        const result =
            await supabaseClient
                .from("goals")
                .insert({
                    user_id:
                        currentUser.id,
                    name:
                        name,
                    target_amount:
                        target,
                    current_amount:
                        0
                });

        if (result.error) {
            console.error(
                "Erro salvando meta:",
                result.error
            );

            alert(
                "Não foi possível salvar a meta.\n\n" +
                result.error.message
            );

            return;
        }

        if (nameInput) {
            nameInput.value = "";
        }

        if (targetInput) {
            targetInput.value = "";
        }

        closeModal(
            "goalModal"
        );

        await loadUserData();

        alert(
            "✅ Meta criada com sucesso!"
        );
    } catch (error) {
        console.error(
            "Erro salvando meta:",
            error
        );

        alert(
            "Ocorreu um erro ao salvar a meta."
        );
    }
}


function updateGoalsList() {
    const container =
        document.getElementById(
            "goalsList"
        );

    if (!container) {
        return;
    }

    if (!goals.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <h3>Nenhuma meta cadastrada</h3>
                <p>
                    Crie uma meta para acompanhar
                    seu progresso financeiro.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        goals
            .map(function (goal) {
                const target =
                    Number(
                        goal.target_amount ||
                            0
                    );

                const current =
                    Number(
                        goal.current_amount ||
                            0
                    );

                const percentage =
                    target > 0
                        ? Math.min(
                              100,
                              (
                                  current /
                                  target
                              ) *
                                  100
                          )
                        : 0;

                return `
                    <div class="goal-card">
                        <div class="goal-header">
                            <strong>
                                ${escapeHtml(
                                    goal.name ||
                                        "Meta"
                                )}
                            </strong>

                            <span>
                                ${Math.round(
                                    percentage
                                )}%
                            </span>
                        </div>

                        <div class="goal-progress">
                            <div
                                class="goal-progress-bar"
                                style="width: ${percentage}%"
                            ></div>
                        </div>

                        <div class="goal-values">
                            <span>
                                ${formatCurrency(
                                    current
                                )}
                            </span>

                            <span>
                                ${formatCurrency(
                                    target
                                )}
                            </span>
                        </div>
                    </div>
                `;
            })
            .join("");
}


/* =====================================================
   EXCLUIR META
===================================================== */

async function deleteGoal(id) {
    if (
        !supabaseClient ||
        !currentUser ||
        !id
    ) {
        return;
    }

    if (
        !window.confirm(
            "Deseja excluir esta meta?"
        )
    ) {
        return;
    }

    try {
        const result =
            await supabaseClient
                .from("goals")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (result.error) {
            console.error(
                "Erro excluindo meta:",
                result.error
            );

            alert(
                "Não foi possível excluir a meta."
            );

            return;
        }

        await loadUserData();
    } catch (error) {
        console.error(
            "Erro excluindo meta:",
            error
        );
    }
}


/* =====================================================
   ORÇAMENTOS
===================================================== */

async function loadBudgets() {
    /*
     * A estrutura atual do banco não possui
     * uma tabela específica de budgets.
     *
     * Mantemos o estado vazio para que
     * o restante do aplicativo continue
     * funcionando normalmente.
     */

    budgets = [];
}


function updateBudgetUI() {
    const container =
        document.getElementById(
            "budgetList"
        );

    if (!container) {
        return;
    }

    if (!budgets.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>Nenhum orçamento</h3>
                <p>
                    Você ainda não possui
                    orçamentos cadastrados.
                </p>
            </div>
        `;

        return;
    }
}


/* =====================================================
   ASSINATURA / PREMIUM
===================================================== */

async function loadSubscription() {
    if (
        !supabaseClient ||
        !currentUser
    ) {
        subscription = null;
        return;
    }

    try {
        const result =
            await supabaseClient
                .from(
                    "subscriptions"
                )
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                )
                .limit(1)
                .maybeSingle();

        if (result.error) {
            console.error(
                "Erro carregando assinatura:",
                result.error
            );

            subscription = null;
            return;
        }

        subscription =
            result.data || null;
    } catch (error) {
        console.error(
            "Erro carregando assinatura:",
            error
        );

        subscription = null;
    }
}


function isPremium() {
    if (!subscription) {
        return false;
    }

    return (
        subscription.status ===
            "active" ||
        subscription.status ===
            "trialing"
    );
}


function updatePremiumUI() {
    const premium =
        isPremium();

    document
        .querySelectorAll(
            "[data-premium]"
        )
        .forEach(function (
            element
        ) {
            element.classList.toggle(
                "active",
                premium
            );
        });

    setText(
        "premiumStatus",
        premium
            ? "Premium ativo"
            : "Plano gratuito"
    );
}


async function activatePremium() {
    if (
        !supabaseClient ||
        !currentUser
    ) {
        alert(
            "Faça login primeiro."
        );
        return;
    }

    try {
        const now =
            new Date();

        const trialEnd =
            new Date(
                now.getTime() +
                    7 *
                        24 *
                        60 *
                        60 *
                        1000
            );

        const result =
            await supabaseClient
                .from(
                    "subscriptions"
                )
                .upsert(
                    {
                        user_id:
                            currentUser.id,
                        plan:
                            "premium",
                        status:
                            "active",
                        price:
                            0,
                        trial_end_at:
                            trialEnd.toISOString(),
                        current_period_end:
                            trialEnd.toISOString()
                    },
                    {
                        onConflict:
                            "user_id"
                    }
                );

        if (result.error) {
            console.error(
                "Erro ativando Premium:",
                result.error
            );

            alert(
                "Não foi possível ativar o Premium.\n\n" +
                result.error.message
            );

            return;
        }

        await loadSubscription();

        updatePremiumUI();

        alert(
            "🎉 Premium ativado com sucesso!"
        );
    } catch (error) {
        console.error(
            "Erro no Premium:",
            error
        );

        alert(
            "Ocorreu um erro ao ativar o Premium."
        );
    }
}


/* =====================================================
   RELATÓRIOS
===================================================== */

function updateReports() {
    const income =
        transactions
            .filter(function (item) {
                return (
                    item.type ===
                    "income"
                );
            })
            .reduce(
                function (
                    total,
                    item
                ) {
                    return (
                        total +
                        Number(
                            item.amount ||
                                0
                        )
                    );
                },
                0
            );

    const expense =
        transactions
            .filter(function (item) {
                return (
                    item.type ===
                    "expense"
                );
            })
            .reduce(
                function (
                    total,
                    item
                ) {
                    return (
                        total +
                        Number(
                            item.amount ||
                                0
                        )
                    );
                },
                0
            );

    const balance =
        income - expense;

    setText(
        "reportIncome",
        formatCurrency(income)
    );

    setText(
        "reportExpense",
        formatCurrency(expense)
    );

    setText(
        "reportBalance",
        formatCurrency(balance)
    );

    renderReportCategoryChart();
}


function renderReportCategoryChart() {
    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );

    if (
        !canvas ||
        typeof Chart ===
            "undefined"
    ) {
        return;
    }

    const totals = {};

    transactions
        .filter(function (item) {
            return (
                item.type ===
                "expense"
            );
        })
        .forEach(function (item) {
            const category =
                item.category ||
                "Outros";

            totals[category] =
                (
                    totals[category] ||
                    0
                ) +
                Number(
                    item.amount ||
                        0
                );
        });

    const labels =
        Object.keys(
            totals
        );

    const values =
        labels.map(
            function (label) {
                return totals[
                    label
                ];
            }
        );

    if (reportCategoryChart) {
        reportCategoryChart.destroy();
    }

    reportCategoryChart =
        new Chart(
            canvas,
            {
                type: "bar",
                data: {
                    labels:
                        labels.length
                            ? labels
                            : [
                                  "Sem dados"
                              ],
                    datasets: [
                        {
                            label:
                                "Despesas",
                            data:
                                values.length
                                    ? values
                                    : [0]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio:
                        false,
                    scales: {
                        y: {
                            beginAtZero:
                                true
                        }
                    }
                }
            }
        );
}


/* =====================================================
   PERFIL NA INTERFACE
===================================================== */

function updateProfileUI() {
    if (!currentUser) {
        return;
    }

    const name =
        currentUser.user_metadata
            ?.full_name ||
        currentUser.email ||
        "Usuário";

    document
        .querySelectorAll(
            "[data-user-name]"
        )
        .forEach(function (
            element
        ) {
            element.textContent =
                name;
        });

    document
        .querySelectorAll(
            "[data-user-email]"
        )
        .forEach(function (
            element
        ) {
            element.textContent =
                currentUser.email ||
                "";
        });
}


/* =====================================================
   EXPORTAR DADOS
===================================================== */

function exportData() {
    if (!currentUser) {
        alert(
            "Faça login para exportar seus dados."
        );
        return;
    }

    const data = {
        exported_at:
            new Date().toISOString(),

        user: {
            id:
                currentUser.id,
            email:
                currentUser.email
        },

        transactions:
            transactions,

        goals:
            goals,

        budgets:
            budgets,

        subscription:
            subscription
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
        "controles-backup-" +
        new Date()
            .toISOString()
            .slice(
                0,
                10
            ) +
        ".json";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );
}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {
    let container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) {
        container =
            document.createElement(
                "div"
            );

        container.id =
            "toastContainer";

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast toast-" +
        type;

    toast.textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(
        function () {
            toast.classList.add(
                "hide"
            );

            setTimeout(
                function () {
                    toast.remove();
                },
                300
            );
        },
        3000
    );
}

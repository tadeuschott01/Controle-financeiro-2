```javascript
/* =========================================================
   CONTROLES — APP.JS
   Supabase + Login + Cadastro + Dashboard + Premium
========================================================= */

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


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("ControleS iniciando...");

    try {

        await initializeSupabase();

        setupEvents();

        setCurrentDate();
        setDefaultDate();
        loadTheme();

        await checkSession();

        console.log("ControleS iniciado com sucesso.");

    } catch (error) {

        console.error(
            "Erro na inicialização:",
            error
        );

        showLogin();
    }
});


/* =========================================================
   SUPABASE
========================================================= */

async function initializeSupabase() {

    if (!window.supabase) {

        throw new Error(
            "Biblioteca do Supabase não foi carregada."
        );
    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    if (!supabaseClient) {

        throw new Error(
            "Não foi possível iniciar o Supabase."
        );
    }

    console.log("Supabase conectado.");
}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    console.log("Configurando eventos...");


    /* LOGIN */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

        console.log("Login conectado.");
    }


    /* CADASTRO */

    const registerBtn =
        document.getElementById("registerBtn");

    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            handleRegister
        );

        console.log("Cadastro conectado.");

    } else {

        console.warn(
            "Botão registerBtn não encontrado no HTML."
        );
    }


    /* LOGOUT */

    document.getElementById("logoutBtn")
        ?.addEventListener(
            "click",
            logout
        );


    /* TEMA */

    document.getElementById("themeBtn")
        ?.addEventListener(
            "click",
            toggleTheme
        );


    /* EXPORTAR */

    document.getElementById("exportDataBtn")
        ?.addEventListener(
            "click",
            exportData
        );


    /* MENU MOBILE */

    document.getElementById("mobileMenuBtn")
        ?.addEventListener(
            "click",
            toggleMobileMenu
        );


    /* NAVEGAÇÃO */

    document.querySelectorAll(".nav-item")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    showSection(
                        button.dataset.section
                    );
                }
            );
        });


    /* BOTÕES COM DATA-SECTION */

    document.querySelectorAll("[data-section]")
        .forEach(function (button) {

            if (
                !button.classList.contains("nav-item")
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        showSection(
                            button.dataset.section
                        );
                    }
                );
            }
        });


    /* NOVA TRANSAÇÃO */

    document.getElementById(
        "openTransactionBtn"
    )?.addEventListener(
        "click",
        openTransactionModal
    );


    document.getElementById(
        "newTransactionButton"
    )?.addEventListener(
        "click",
        openTransactionModal
    );


    document.getElementById(
        "closeModal"
    )?.addEventListener(
        "click",
        closeTransactionModal
    );


    /* MODAIS */

    document.querySelectorAll(
        ".modal-overlay"
    ).forEach(function (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                const modal =
                    overlay.closest(".modal");

                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            }
        );
    });


    /* TIPO DA TRANSAÇÃO */

    document.querySelectorAll(
        ".type-option"
    ).forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                document.querySelectorAll(
                    ".type-option"
                ).forEach(function (item) {

                    item.classList.remove(
                        "active"
                    );
                });

                button.classList.add(
                    "active"
                );

                selectedTransactionType =
                    button.dataset.type ||
                    "income";
            }
        );
    });


    /* TRANSAÇÃO */

    document.getElementById(
        "transactionForm"
    )?.addEventListener(
        "submit",
        saveTransaction
    );


    /* FILTROS */

    document.getElementById(
        "searchInput"
    )?.addEventListener(
        "input",
        renderTransactions
    );


    document.getElementById(
        "typeFilter"
    )?.addEventListener(
        "change",
        renderTransactions
    );


    document.getElementById(
        "categoryFilter"
    )?.addEventListener(
        "change",
        renderTransactions
    );


    /* PREMIUM */

    document.getElementById(
        "subscribePremiumBtn"
    )?.addEventListener(
        "click",
        activatePremium
    );


    /* METAS */

    document.getElementById(
        "newGoalBtn"
    )?.addEventListener(
        "click",
        openGoalModal
    );


    document.getElementById(
        "closeGoalModal"
    )?.addEventListener(
        "click",
        function () {

            document.getElementById(
                "goalModal"
            )?.classList.add(
                "hidden"
            );
        }
    );


    document.getElementById(
        "goalForm"
    )?.addEventListener(
        "submit",
        saveGoal
    );


    /* ORÇAMENTOS */

    document.getElementById(
        "newBudgetBtn"
    )?.addEventListener(
        "click",
        openBudgetModal
    );


    document.getElementById(
        "closeBudgetModal"
    )?.addEventListener(
        "click",
        function () {

            document.getElementById(
                "budgetModal"
            )?.classList.add(
                "hidden"
            );
        }
    );


    document.getElementById(
        "budgetForm"
    )?.addEventListener(
        "submit",
        saveBudget
    );


    /* SIMULADOR */

    document.getElementById(
        "simulateBtn"
    )?.addEventListener(
        "click",
        simulateExpense
    );


    /* ESC FECHA MODAIS */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                document.querySelectorAll(
                    ".modal"
                ).forEach(function (modal) {

                    modal.classList.add(
                        "hidden"
                    );
                });
            }
        }
    );
}


/* =========================================================
   SESSÃO
========================================================= */

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
                "Erro ao verificar sessão:",
                result.error
            );

            showLogin();

            return;
        }

        currentUser =
            result.data?.session?.user ||
            null;


        if (currentUser) {

            console.log(
                "Sessão encontrada:",
                currentUser.email
            );

            await enterApp();

        } else {

            showLogin();
        }


        supabaseClient.auth.onAuthStateChange(
            async function (event, session) {

                console.log(
                    "Auth:",
                    event
                );

                currentUser =
                    session?.user ||
                    null;


                if (
                    event === "SIGNED_OUT"
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


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    console.log("Botão Entrar acionado.");


    if (!supabaseClient) {

        alert(
            "O sistema ainda está carregando. Aguarde alguns segundos e tente novamente."
        );

        return;
    }


    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");


    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase();


    const password =
        passwordInput?.value || "";


    if (!email) {

        alert(
            "Digite seu e-mail."
        );

        emailInput?.focus();

        return;
    }


    if (!password) {

        alert(
            "Digite sua senha."
        );

        passwordInput?.focus();

        return;
    }


    if (password.length < 6) {

        alert(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;
    }


    const button =
        document.querySelector(
            "#loginForm button[type='submit']"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Entrando...";
    }


    try {

        const result =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password
            });


        if (result.error) {

            console.error(
                "Erro no login:",
                result.error
            );

            const message =
                (
                    result.error.message ||
                    ""
                ).toLowerCase();


            if (
                message.includes(
                    "invalid login credentials"
                )
            ) {

                throw new Error(
                    "E-mail ou senha incorretos."
                );
            }


            if (
                message.includes(
                    "email not confirmed"
                )
            ) {

                throw new Error(
                    "Seu e-mail ainda não foi confirmado. Confirme o e-mail recebido e tente novamente."
                );
            }


            throw result.error;
        }


        currentUser =
            result.data?.user ||
            null;


        if (!currentUser) {

            throw new Error(
                "Login realizado, mas o usuário não foi encontrado."
            );
        }


        console.log(
            "Login realizado:",
            currentUser.email
        );


        await createProfileIfNeeded(
            currentUser.user_metadata?.full_name ||
            "Usuário"
        );


        await enterApp();


    } catch (error) {

        console.error(
            "Erro no login:",
            error
        );

        alert(
            "Não foi possível entrar:\n\n" +
            (
                error.message ||
                "Erro desconhecido."
            )
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Entrar no ControleS";
        }
    }
}


/* =========================================================
   CADASTRO
========================================================= */

async function handleRegister(event) {

    if (event) {
        event.preventDefault();
    }


    console.log(
        "Botão Criar minha conta acionado."
    );


    if (!supabaseClient) {

        alert(
            "O sistema ainda está carregando. Aguarde alguns segundos e tente novamente."
        );

        return;
    }


    const nameInput =
        document.getElementById("loginName");

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");


    const name =
        nameInput?.value
            ?.trim();


    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase();


    const password =
        passwordInput?.value ||
        "";


    if (!name) {

        alert(
            "Digite seu nome."
        );

        nameInput?.focus();

        return;
    }


    if (!email) {

        alert(
            "Digite seu e-mail."
        );

        emailInput?.focus();

        return;
    }


    if (!password) {

        alert(
            "Digite uma senha."
        );

        passwordInput?.focus();

        return;
    }


    if (password.length < 6) {

        alert(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        passwordInput?.focus();

        return;
    }


    const button =
        document.getElementById(
            "registerBtn"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Criando conta...";
    }


    try {

        console.log(
            "Criando usuário no Supabase..."
        );


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

            const message =
                (
                    result.error.message ||
                    ""
                ).toLowerCase();


            if (
                message.includes(
                    "already registered"
                ) ||
                message.includes(
                    "user already registered"
                )
            ) {

                throw new Error(
                    "Esse e-mail já está cadastrado. Clique em Entrar e informe sua senha."
                );
            }


            throw result.error;
        }


        currentUser =
            result.data?.user ||
            null;


        /*
           CONFIRMAÇÃO DE E-MAIL ATIVADA
        */

        if (!result.data?.session) {

            alert(
                "🎉 Conta criada com sucesso!\n\n" +
                "Enviamos um e-mail de confirmação para você.\n\n" +
                "Confirme seu e-mail e depois volte ao ControleS para entrar."
            );

            return;
        }


        /*
           CONFIRMAÇÃO DESATIVADA
        */

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
            "Erro ao criar conta:",
            error
        );

        alert(
            "Não foi possível criar sua conta:\n\n" +
            (
                error.message ||
                "Erro desconhecido."
            )
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Criar minha conta";
        }
    }
}


/* =========================================================
   PROFILE
========================================================= */

async function createProfileIfNeeded(name) {

    if (!currentUser) {
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

            console.warn(
                "Erro consultando perfil:",
                result.error
            );

            return;
        }


        if (!result.data) {

            const insertResult =
                await supabaseClient
                    .from("profiles")
                    .insert({

                        id:
                            currentUser.id,

                        full_name:
                            name ||
                            currentUser.user_metadata?.full_name ||
                            "Usuário",

                        account_type:
                            "personal",

                        company_name:
                            null
                    });


            if (insertResult.error) {

                console.warn(
                    "Erro criando perfil:",
                    insertResult.error
                );
            }
        }

    } catch (error) {

        console.warn(
            "Erro no perfil:",
            error
        );
    }
}


/* =========================================================
   ENTRAR NO APP
========================================================= */

async function enterApp() {

    if (!currentUser) {
        return;
    }


    if (enteringApp) {
        return;
    }


    enteringApp = true;


    try {

        document.getElementById(
            "loginScreen"
        )?.classList.add(
            "hidden"
        );


        document.getElementById(
            "app"
        )?.classList.remove(
            "hidden"
        );


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


/* =========================================================
   MOSTRAR LOGIN
========================================================= */

function showLogin() {

    document.getElementById(
        "loginScreen"
    )?.classList.remove(
        "hidden"
    );


    document.getElementById(
        "app"
    )?.classList.add(
        "hidden"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    if (!supabaseClient) {
        return;
    }


    if (
        !confirm(
            "Deseja realmente sair?"
        )
    ) {
        return;
    }


    const result =
        await supabaseClient.auth.signOut();


    if (result.error) {

        alert(
            "Erro ao sair: " +
            result.error.message
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

    if (!currentUser) {
        return;
    }


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

    if (!currentUser) {
        return;
    }


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
            );


    if (result.error) {

        console.error(
            "Erro carregando transações:",
            result.error
        );

        transactions = [];

        return;
    }


    transactions =
        (result.data || [])
            .map(
                normalizeTransaction
            );
}


function normalizeTransaction(item) {

    return {

        id:
            item.id,

        user_id:
            item.user_id,

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
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                ),

        area:
            item.area ||
            "",

        note:
            item.note ||
            ""
    };
}


/* =========================================================
   SALVAR TRANSAÇÃO
========================================================= */

async function saveTransaction(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Faça login primeiro."
        );

        return;
    }


    const description =
        document.getElementById(
            "descriptionInput"
        )?.value.trim();


    const amount =
        Number(
            document.getElementById(
                "amountInput"
            )?.value
        );


    const date =
        document.getElementById(
            "dateInput"
        )?.value;


    const category =
        document.getElementById(
            "transactionCategory"
        )?.value ||
        "Outros";


    const frequency =
        document.getElementById(
            "frequencyInput"
        )?.value ||
        "once";


    if (
        !description ||
        !amount ||
        amount <= 0 ||
        !date
    ) {

        alert(
            "Preencha todos os campos obrigatórios."
        );

        return;
    }


    const button =
        document.querySelector(
            "#transactionForm .save-transaction"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Salvando...";
    }


    try {

        const result =
            await supabaseClient
                .from("transactions")
                .insert({

                    user_id:
                        currentUser.id,

                    type:
                        selectedTransactionType,

                    description,

                    amount,

                    category,

                    date,

                    area:
                        "",

                    note:
                        frequency !== "once"
                            ? `Frequência: ${frequency}`
                            : ""
                });


        if (result.error) {
            throw result.error;
        }


        document.getElementById(
            "transactionForm"
        )?.reset();


        selectedTransactionType =
            "income";


        document.querySelectorAll(
            ".type-option"
        ).forEach(
            function (item, index) {

                item.classList.toggle(
                    "active",
                    index === 0
                );
            }
        );


        closeTransactionModal();


        await loadUserData();


        alert(
            "Lançamento salvo com sucesso!"
        );


    } catch (error) {

        console.error(
            "Erro salvando lançamento:",
            error
        );

        alert(
            "Erro ao salvar lançamento:\n\n" +
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

    if (!currentUser) {
        return;
    }


    if (
        !confirm(
            "Excluir este lançamento?"
        )
    ) {
        return;
    }


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

        alert(
            "Erro ao excluir: " +
            result.error.message
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
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const balance =
        income - expense;


    const economy =
        income > 0
            ? (balance / income) * 100
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


    if (!container) {
        return;
    }


    const list =
        transactions.slice(
            0,
            5
        );


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento cadastrado.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(
                transactionHTML
            )
            .join("");
}


/* =========================================================
   TODAS AS TRANSAÇÕES
========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "allTransactions"
        );


    if (!container) {
        return;
    }


    const search =
        document.getElementById(
            "searchInput"
        )?.value
            ?.toLowerCase()
            .trim() ||
        "";


    const type =
        document.getElementById(
            "typeFilter"
        )?.value ||
        "all";


    const category =
        document.getElementById(
            "categoryFilter"
        )?.value ||
        "all";


    const filtered =
        transactions.filter(
            function (item) {

                const description =
                    String(
                        item.description ||
                        ""
                    ).toLowerCase();


                const itemCategory =
                    String(
                        item.category ||
                        ""
                    ).toLowerCase();


                return (

                    (
                        !search ||

                        description.includes(
                            search
                        ) ||

                        itemCategory.includes(
                            search
                        )
                    )

                    &&

                    (
                        type === "all" ||
                        item.type === type
                    )

                    &&

                    (
                        category === "all" ||
                        item.category === category
                    )
                );
            }
        );


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(
                transactionHTML
            )
            .join("");
}


/* =========================================================
   HTML TRANSAÇÃO
========================================================= */

function transactionHTML(item) {

    const income =
        item.type === "income";


    return `
        <div class="transaction">

            <div class="transaction-icon">
                ${income ? "↗" : "↘"}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(
                        item.description
                    )}
                </strong>

                <small>
                    ${escapeHTML(
                        item.category
                    )}
                    •
                    ${formatDate(
                        item.date
                    )}
                </small>

            </div>

            <div class="transaction-value ${
                income
                    ? "income"
                    : "expense"
            }">

                ${income ? "+" : "-"}

                ${formatCurrency(
                    item.amount
                )}

            </div>

            <button
                class="transaction-delete"
                type="button"
                onclick="deleteTransaction('${String(item.id).replace(/'/g, "\\'")}')"
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


    if (!select) {
        return;
    }


    const current =
        select.value;


    const categories =
        [
            ...new Set(
                transactions
                    .map(
                        function (t) {
                            return t.category;
                        }
                    )
                    .filter(Boolean)
            )
        ].sort();


    select.innerHTML = `
        <option value="all">
            Todas categorias
        </option>
    `;


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );
        }
    );


    if (
        categories.includes(
            current
        )
    ) {

        select.value =
            current;
    }
}


function renderCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );


    if (!container) {
        return;
    }


    const totals = {};


    transactions
        .filter(
            function (t) {
                return t.type === "expense";
            }
        )
        .forEach(
            function (item) {

                totals[item.category] =
                    (
                        totals[item.category] ||
                        0
                    ) +
                    item.amount;
            }
        );


    const entries =
        Object.entries(
            totals
        )
        .sort(
            function (a, b) {
                return b[1] - a[1];
            }
        );


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
            function (sum, entry) {
                return sum + entry[1];
            },
            0
        );


    container.innerHTML =
        entries
            .map(
                function (entry) {

                    const category =
                        entry[0];

                    const value =
                        entry[1];


                    const percentage =
                        total > 0
                            ? (value / total) * 100
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
                                ·
                                ${percentage.toFixed(
                                    1
                                )}%
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


/* =========================================================
   GRÁFICO FINANCEIRO
========================================================= */

function updateFinanceChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {
        return;
    }


    if (financeChart) {

        financeChart.destroy();

        financeChart = null;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    financeChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels: [
                        "Receitas",
                        "Despesas"
                    ],

                    datasets: [
                        {

                            label:
                                "Valor",

                            data: [
                                income,
                                expense
                            ]
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
                        }
                    }
                }
            }
        );
}


/* =========================================================
   GRÁFICO CATEGORIAS
========================================================= */

function updateCategoryChart(totals) {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {
        return;
    }


    if (categoryChart) {

        categoryChart.destroy();

        categoryChart = null;
    }


    const labels =
        Object.keys(
            totals
        );


    const values =
        Object.values(
            totals
        );


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

                    labels,

                    datasets: [
                        {

                            data:
                                values
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

                            position:
                                "bottom"
                        }
                    }
                }
            }
        );
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


    if (
        !analysis &&
        !canvas
    ) {
        return;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
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

                <strong>
                    Total de receitas
                </strong>

                <span>
                    ${formatCurrency(income)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Total de despesas
                </strong>

                <span>
                    ${formatCurrency(expense)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Saldo
                </strong>

                <span>
                    ${formatCurrency(balance)}
                </span>

            </div>

            <div class="category-summary-item">

                <strong>
                    Economia
                </strong>

                <span>
                    ${Math.max(
                        0,
                        economy
                    ).toFixed(1)}%
                </span>

            </div>
        `;
    }


    if (
        canvas &&
        window.Chart
    ) {

        if (reportCategoryChart) {

            reportCategoryChart.destroy();

            reportCategoryChart = null;
        }


        const totals = {};


        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .forEach(
                function (t) {

                    totals[t.category] =
                        (
                            totals[t.category] ||
                            0
                        ) +
                        t.amount;
                }
            );


        const labels =
            Object.keys(
                totals
            );


        const values =
            Object.values(
                totals
            );


        if (labels.length) {

            reportCategoryChart =
                new Chart(
                    canvas,
                    {

                        type:
                            "doughnut",

                        data: {

                            labels,

                            datasets: [
                                {

                                    data:
                                        values
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

                                    position:
                                        "bottom"
                                }
                            }
                        }
                    }
                );
        }
    }
}


/* =========================================================
   METAS
========================================================= */

async function loadGoals() {

    if (!currentUser) {
        return;
    }


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
}


function openGoalModal() {

    document.getElementById(
        "goalModal"
    )?.classList.remove(
        "hidden"
    );
}


async function saveGoal(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Faça login primeiro."
        );

        return;
    }


    const name =
        document.getElementById(
            "goalName"
        )?.value.trim();


    const target =
        Number(
            document.getElementById(
                "goalTarget"
            )?.value
        );


    const saved =
        Number(
            document.getElementById(
                "goalSaved"
            )?.value ||
            0
        );


    if (
        !name ||
        !target ||
        target <= 0
    ) {

        alert(
            "Preencha os dados da meta."
        );

        return;
    }


    const result =
        await supabaseClient
            .from("goals")
            .insert({

                user_id:
                    currentUser.id,

                name,

                target,

                saved
            });


    if (result.error) {

        alert(
            "Erro ao criar meta: " +
            result.error.message
        );

        return;
    }


    document.getElementById(
        "goalForm"
    )?.reset();


    document.getElementById(
        "goalModal"
    )?.classList.add(
        "hidden"
    );


    await loadUserData();
}


function renderGoals() {

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
                Você ainda não criou nenhuma meta.
            </div>
        `;

        return;
    }


    container.innerHTML =
        goals
            .map(
                function (goal) {

                    const target =
                        Number(
                            goal.target ||
                            0
                        );


                    const saved =
                        Number(
                            goal.saved ||
                            0
                        );


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
                                    ${escapeHTML(
                                        goal.name
                                    )}
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
                }
            )
            .join("");
}


/* =========================================================
   ORÇAMENTOS
========================================================= */

async function loadBudgets() {

    if (!currentUser) {
        return;
    }


    const result =
        await supabaseClient
            .from("budgets")
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
            "Erro carregando orçamentos:",
            result.error
        );

        budgets = [];

        return;
    }


    budgets =
        result.data || [];
}


function openBudgetModal() {

    document.getElementById(
        "budgetModal"
    )?.classList.remove(
        "hidden"
    );
}


async function saveBudget(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Faça login primeiro."
        );

        return;
    }


    const category =
        document.getElementById(
            "budgetCategory"
        )?.value;


    const limit =
        Number(
            document.getElementById(
                "budgetLimit"
            )?.value
        );


    if (
        !category ||
        !limit ||
        limit <= 0
    ) {

        alert(
            "Informe o limite mensal."
        );

        return;
    }


    const existing =
        budgets.find(
            function (b) {
                return b.category === category;
            }
        );


    let result;


    if (existing) {

        result =
            await supabaseClient
                .from("budgets")
                .update({

                    limit_amount:
                        limit
                })
                .eq(
                    "id",
                    existing.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );

    } else {

        result =
            await supabaseClient
                .from("budgets")
                .insert({

                    user_id:
                        currentUser.id,

                    category,

                    limit_amount:
                        limit
                });
    }


    if (result.error) {

        alert(
            "Erro ao salvar orçamento: " +
            result.error.message
        );

        return;
    }


    document.getElementById(
        "budgetForm"
    )?.reset();


    document.getElementById(
        "budgetModal"
    )?.classList.add(
        "hidden"
    );


    await loadUserData();
}


function renderBudgets() {

    const container =
        document.getElementById(
            "budgetsList"
        );


    if (!container) {
        return;
    }


    if (!budgets.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum orçamento definido.
            </div>
        `;

        return;
    }


    container.innerHTML =
        budgets
            .map(
                function (budget) {

                    const spent =
                        transactions
                            .filter(
                                function (t) {

                                    return (

                                        t.type === "expense" &&

                                        t.category ===
                                            budget.category
                                    );
                                }
                            )
                            .reduce(
                                function (sum, t) {

                                    return sum +
                                        t.amount;
                                },
                                0
                            );


                    const limit =
                        Number(
                            budget.limit_amount ||
                            0
                        );


                    const percentage =
                        limit > 0
                            ? (spent / limit) * 100
                            : 0;


                    return `
                        <div class="category-summary-item">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        budget.category
                                    )}
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
                }
            )
            .join("");
}


/* =========================================================
   PREMIUM
========================================================= */

async function loadSubscription() {

    if (!currentUser) {

        subscription = null;

        return;
    }


    const result =
        await supabaseClient
            .from("subscriptions")
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
            )
            .limit(1)
            .maybeSingle();


    if (result.error) {

        console.warn(
            "Erro carregando assinatura:",
            result.error
        );

        subscription = null;

        return;
    }


    subscription =
        result.data ||
        null;
}


/* =========================================================
   ATIVAR PREMIUM
========================================================= */

async function activatePremium() {

    if (!currentUser) {

        alert(
            "Faça login primeiro."
        );

        return;
    }


    if (
        subscription &&
        (
            subscription.status === "active" ||
            subscription.status === "trial"
        )
    ) {

        alert(
            "Seu Premium já está ativo."
        );

        return;
    }


    const button =
        document.getElementById(
            "subscribePremiumBtn"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Ativando Premium...";
    }


    try {

        const now =
            new Date();


        const end =
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
                .from("subscriptions")
                .insert({

                    user_id:
                        currentUser.id,

                    plan:
                        "trial",

                    status:
                        "trial",

                    trial_start_at:
                        now.toISOString(),

                    trial_end_at:
                        end.toISOString(),

                    current_period_start:
                        now.toISOString(),

                    current_period_end:
                        end.toISOString(),

                    price:
                        0
                });


        if (result.error) {
            throw result.error;
        }


        await loadSubscription();

        updateUserInterface();


        alert(
            "🎉 Premium ativado com sucesso!\n\n" +
            "Seu período de teste gratuito é de 7 dias."
        );


    } catch (error) {

        console.error(
            "Erro ao ativar Premium:",
            error
        );

        alert(
            "Erro ao ativar Premium:\n\n" +
            error.message
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Quero ser Premium ⭐";
        }
    }
}


/* =========================================================
   ALERTAS
========================================================= */

function renderAlerts() {

    const container =
        document.getElementById(
            "smartAlerts"
        );


    if (!container) {
        return;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    if (!transactions.length) {

        container.innerHTML = `
            <div class="empty-state">
                Cadastre lançamentos para receber alertas inteligentes.
            </div>
        `;

        return;
    }


    if (
        expense > income &&
        income > 0
    ) {

        container.innerHTML = `
            <div class="category-summary-item">

                <strong>
                    ⚠️ Atenção
                </strong>

                <span>
                    Suas despesas estão acima das receitas.
                </span>

            </div>
        `;

    } else if (
        income > 0 &&
        expense >= income * 0.8
    ) {

        container.innerHTML = `
            <div class="category-summary-item">

                <strong>
                    🔔 Cuidado
                </strong>

                <span>
                    Você já utilizou grande parte das suas receitas.
                </span>

            </div>
        `;

    } else {

        container.innerHTML = `
            <div class="category-summary-item">

                <strong>
                    ✅ Tudo certo
                </strong>

                <span>
                    Suas finanças estão dentro de um bom equilíbrio.
                </span>

            </div>
        `;
    }
}


/* =========================================================
   COMPARAÇÃO MENSAL
========================================================= */

function renderMonthlyComparison() {

    const container =
        document.getElementById(
            "monthlyComparison"
        );


    if (!container) {
        return;
    }


    const now =
        new Date();


    const month =
        now.getMonth();


    const year =
        now.getFullYear();


    const current =
        transactions.filter(
            function (t) {

                const d =
                    new Date(
                        t.date +
                        "T00:00:00"
                    );


                return (

                    d.getMonth() === month &&

                    d.getFullYear() === year
                );
            }
        );


    const income =
        current
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        current
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const balance =
        income - expense;


    container.innerHTML = `

        <div class="category-summary-item">

            <strong>
                Receitas no mês
            </strong>

            <span>
                ${formatCurrency(income)}
            </span>

        </div>

        <div class="category-summary-item">

            <strong>
                Despesas no mês
            </strong>

            <span>
                ${formatCurrency(expense)}
            </span>

        </div>

        <div class="category-summary-item">

            <strong>
                Resultado
            </strong>

            <span>
                ${formatCurrency(balance)}
            </span>

        </div>
    `;
}


/* =========================================================
   ANÁLISE PREMIUM
========================================================= */

function renderPremiumAnalysis() {

    const container =
        document.getElementById(
            "premiumAnalysis"
        );


    if (!container) {
        return;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    if (!transactions.length) {

        container.innerHTML = `
            <div class="empty-state">
                Adicione seus lançamentos para receber uma análise financeira.
            </div>
        `;

        return;
    }


    const balance =
        income - expense;


    let message;


    if (balance < 0) {

        message =
            "Suas despesas estão acima das receitas. O ideal é revisar os maiores gastos e reduzir despesas não essenciais.";

    } else if (
        income > 0 &&
        expense > income * 0.8
    ) {

        message =
            "Você está gastando uma parcela alta das suas receitas. Tente aumentar sua margem de economia.";

    } else {

        message =
            "Suas finanças apresentam um bom equilíbrio. Continue acompanhando seus gastos e fortalecendo sua reserva.";
    }


    container.innerHTML = `
        <div class="category-summary-item">

            <strong>
                💡 Análise
            </strong>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>
    `;
}


/* =========================================================
   SAÚDE FINANCEIRA
========================================================= */

function updateHealthStatus() {

    const container =
        document.getElementById(
            "healthResult"
        );


    if (!container) {
        return;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    if (!income && !expense) {

        container.innerHTML =
            "Cadastre lançamentos para calcular sua saúde financeira.";

        return;
    }


    const ratio =
        income > 0
            ? expense / income
            : 999;


    if (ratio > 1) {

        container.innerHTML =
            "🔴 Situação crítica: os gastos estão acima das receitas.";

    } else if (ratio > 0.8) {

        container.innerHTML =
            "🟡 Atenção: sua margem de economia está baixa.";

    } else {

        container.innerHTML =
            "🟢 Saudável: você possui uma boa margem de economia.";
    }
}


/* =========================================================
   SIMULADOR
========================================================= */

function simulateExpense() {

    const amount =
        Number(
            document.getElementById(
                "simulationAmount"
            )?.value
        );


    const result =
        document.getElementById(
            "simulationResult"
        );


    if (!result) {
        return;
    }


    if (
        !amount ||
        amount <= 0
    ) {

        result.textContent =
            "Digite um valor para simular.";

        return;
    }


    const income =
        transactions
            .filter(
                function (t) {
                    return t.type === "income";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const expense =
        transactions
            .filter(
                function (t) {
                    return t.type === "expense";
                }
            )
            .reduce(
                function (sum, t) {
                    return sum + t.amount;
                },
                0
            );


    const balance =
        income - expense;


    const newBalance =
        balance - amount;


    result.innerHTML = `

        <strong>
            Saldo atual:
        </strong>

        ${formatCurrency(balance)}

        <br><br>

        <strong>
            Após a nova despesa:
        </strong>

        ${formatCurrency(newBalance)}
    `;
}


/* =========================================================
   INTERFACE
========================================================= */

async function updateUserInterface() {

    if (!currentUser) {
        return;
    }


    let name =
        currentUser.user_metadata?.full_name ||
        "Usuário";


    try {

        const result =
            await supabaseClient
                .from("profiles")
                .select("full_name")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (result.data?.full_name) {

            name =
                result.data.full_name;
        }

    } catch (error) {

        console.warn(
            "Erro carregando nome:",
            error
        );
    }


    setText(
        "userName",
        name
    );


    setText(
        "welcomeName",
        name
    );


    const avatar =
        document.getElementById(
            "userAvatar"
        );


    if (avatar) {

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }


    const isPremium =
        subscription &&
        (
            subscription.status === "active" ||
            subscription.status === "trial"
        );


    setText(
        "userPlan",

        isPremium
            ? "ControleS Premium ⭐"
            : "ControleS Grátis"
    );


    updateHealthStatus();
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showSection(section) {

    document.querySelectorAll(
        ".section"
    ).forEach(
        function (item) {

            item.classList.add(
                "hidden"
            );
        }
    );


    const target =
        document.getElementById(
            section
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );
    }


    document.querySelectorAll(
        ".nav-item"
    ).forEach(
        function (item) {

            item.classList.toggle(
                "active",

                item.dataset.section ===
                    section
            );
        }
    );


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


    setText(
        "pageTitle",

        titles[section] ||
        "Dashboard"
    );


    document.getElementById(
        "sidebar"
    )?.classList.remove(
        "open"
    );


    if (
        section === "premium"
    ) {

        updateHealthStatus();
    }
}


function toggleMobileMenu() {

    document.getElementById(
        "sidebar"
    )?.classList.toggle(
        "open"
    );
}


/* =========================================================
   TEMA
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "controles_theme",

        dark
            ? "dark"
            : "light"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "controles_theme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );
    }
}


/* =========================================================
   MODAL TRANSAÇÃO
========================================================= */

function openTransactionModal() {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    setDefaultDate();
}


function closeTransactionModal() {

    document.getElementById(
        "transactionModal"
    )?.classList.add(
        "hidden"
    );
}


/* =========================================================
   DATA
========================================================= */

function setDefaultDate() {

    const input =
        document.getElementById(
            "dateInput"
        );


    if (
        !input ||
        input.value
    ) {
        return;
    }


    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    input.value =
        today;
}


function setCurrentDate() {

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


/* =========================================================
   EXPORTAR
========================================================= */

function exportData() {

    if (!transactions.length) {

        alert(
            "Não existem lançamentos para exportar."
        );

        return;
    }


    const data = {

        exported_at:
            new Date().toISOString(),

        user_id:
            currentUser?.id ||
            null,

        transactions,

        goals,

        budgets,

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


    link.href =
        url;


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


/* =========================================================
   UTILITÁRIOS
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


function formatCurrency(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "pt-BR",
        {

            style:
                "currency",

            currency:
                "BRL"
        }
    );
}


function formatDate(date) {

    if (!date) {
        return "";
    }


    const parts =
        String(date).split("-");


    if (
        parts.length === 3
    ) {

        return (
            `${parts[2]}/` +
            `${parts[1]}/` +
            `${parts[0]}`
        );
    }


    return date;
}


function escapeHTML(value) {

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
```

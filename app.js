/* ============================================================
   CONTROLES — APP.JS
   Versão integrada com:
   - app.html
   - app.css
   - Supabase
   - Login / Cadastro
   - Lançamentos
   - Categorias
   - Relatórios
   - Gráficos
   - Metas
   - Premium / Trial
   - Tema escuro
   - Menu mobile
============================================================ */


/* ============================================================
   CONFIGURAÇÃO SUPABASE
============================================================ */

const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
const SUPABASE_KEY = "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


let supabaseClient = null;

let currentUser = null;
let currentProfile = null;

let transactions = [];
let goals = [];
let budgets = [];
let subscription = null;

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;

let selectedTransactionType = "income";
let editingTransactionId = null;


/* ============================================================
   CATEGORIAS PADRÃO
============================================================ */

const DEFAULT_CATEGORIES = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Contas",
    "Salário",
    "Investimentos",
    "Outros"
];


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

    setupEvents();
    setCurrentDate();
    setDefaultDate();
    loadTheme();

    try {

        await initializeSupabase();
        await checkSession();

    } catch (error) {

        console.error("Erro ao inicializar o ControleS:", error);

        currentUser = null;
        showLogin();

    }

});


/* ============================================================
   SUPABASE
============================================================ */

async function initializeSupabase() {

    if (
        typeof window.supabase === "undefined" ||
        !window.supabase.createClient
    ) {
        throw new Error("Biblioteca do Supabase não carregada.");
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    if (!supabaseClient) {
        throw new Error("Não foi possível conectar ao Supabase.");
    }

    return supabaseClient;
}


/* ============================================================
   SESSÃO
============================================================ */

async function checkSession() {

    if (!supabaseClient) return;

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Erro ao verificar sessão:", error);
        showLogin();
        return;
    }

    if (data && data.session && data.session.user) {

        currentUser = data.session.user;

        await enterApp();

    } else {

        showLogin();

    }


    supabaseClient.auth.onAuthStateChange(
        async function (event, session) {

            if (session && session.user) {

                currentUser = session.user;

            } else if (event === "SIGNED_OUT") {

                currentUser = null;
                currentProfile = null;

                showLogin();

            }

        }
    );
}


/* ============================================================
   LOGIN
============================================================ */

function showLogin() {

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

    showLoginView();
}


function showLoginView() {

    const loginView = document.getElementById("loginView");
    const registerView = document.getElementById("registerView");

    if (loginView) {
        loginView.classList.remove("hidden");
    }

    if (registerView) {
        registerView.classList.add("hidden");
    }
}


function showRegister() {

    const loginView = document.getElementById("loginView");
    const registerView = document.getElementById("registerView");

    if (loginView) {
        loginView.classList.add("hidden");
    }

    if (registerView) {
        registerView.classList.remove("hidden");
    }

    const message = document.getElementById("registerMessage");

    if (message) {
        message.textContent = "";
        message.classList.add("hidden");
    }
}


function showLoginForm() {
    showLoginView();
}


/* ============================================================
   LOGIN — EVENTO
============================================================ */

async function handleLogin(event) {

    event.preventDefault();

    if (!supabaseClient) {
        showToast("Sistema ainda não está conectado.");
        return;
    }

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput
        ? emailInput.value.trim()
        : "";

    const password = passwordInput
        ? passwordInput.value
        : "";

    if (!email || !password) {

        showToast("Preencha seu e-mail e sua senha.");

        return;
    }


    const button = document.querySelector(
        "#loginForm button[type='submit']"
    );

    const originalText = button
        ? button.textContent
        : "";

    if (button) {
        button.disabled = true;
        button.textContent = "Entrando...";
    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        if (error) {

            console.error(error);

            const message = String(error.message || "").toLowerCase();

            if (
                message.includes("email not confirmed") ||
                message.includes("email_not_confirmed")
            ) {

                showToast(
                    "Confirme seu e-mail antes de entrar."
                );

            } else if (
                message.includes("invalid login credentials")
            ) {

                showToast(
                    "E-mail ou senha incorretos."
                );

            } else {

                showToast(
                    error.message || "Não foi possível entrar."
                );

            }

            return;
        }


        if (!data || !data.user) {

            showToast(
                "Não foi possível identificar sua conta."
            );

            return;
        }


        currentUser = data.user;

        await enterApp();

    } catch (error) {

        console.error(error);

        showToast(
            "Ocorreu um erro ao entrar na conta."
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = originalText;

        }

    }
}


/* ============================================================
   CADASTRO
============================================================ */

async function handleRegister(event) {

    event.preventDefault();

    if (!supabaseClient) {

        showRegisterMessage(
            "Sistema ainda não está conectado.",
            true
        );

        return;
    }


    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById(
        "registerPasswordConfirm"
    );

    const name = nameInput
        ? nameInput.value.trim()
        : "";

    const email = emailInput
        ? emailInput.value.trim()
        : "";

    const password = passwordInput
        ? passwordInput.value
        : "";

    const confirmation = confirmInput
        ? confirmInput.value
        : "";


    if (!name) {

        showRegisterMessage(
            "Digite seu nome completo.",
            true
        );

        return;
    }


    if (!email) {

        showRegisterMessage(
            "Digite um e-mail válido.",
            true
        );

        return;
    }


    if (password.length < 6) {

        showRegisterMessage(
            "A senha precisa ter pelo menos 6 caracteres.",
            true
        );

        return;
    }


    if (password !== confirmation) {

        showRegisterMessage(
            "As senhas não são iguais.",
            true
        );

        return;
    }


    const button = document.getElementById(
        "createAccountBtn"
    );

    const originalText = button
        ? button.textContent
        : "";

    if (button) {

        button.disabled = true;
        button.textContent = "Criando conta...";

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {
                data: {
                    full_name: name,
                    name: name
                }
            }

        });


        if (error) {

            console.error(error);

            showRegisterMessage(
                traduzirErroAuth(error.message),
                true
            );

            return;
        }


        if (!data || !data.user) {

            showRegisterMessage(
                "Não foi possível criar sua conta.",
                true
            );

            return;
        }


        currentUser = data.user;


        if (data.session) {

            await createProfileIfNeeded(name);

            showToast(
                "Conta criada com sucesso!"
            );

            await enterApp();

        } else {

            showRegisterMessage(
                "Conta criada! Verifique seu e-mail para confirmar a conta e depois faça login.",
                false
            );

        }

    } catch (error) {

        console.error(error);

        showRegisterMessage(
            "Ocorreu um erro ao criar sua conta.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = originalText;

        }

    }
}


function showRegisterMessage(message, isError) {

    const element = document.getElementById(
        "registerMessage"
    );

    if (!element) return;

    element.textContent = message;

    element.classList.remove("hidden");

    if (isError) {
        element.classList.add("error");
    } else {
        element.classList.remove("error");
    }
}


function traduzirErroAuth(message) {

    const text = String(message || "").toLowerCase();

    if (text.includes("already registered")) {
        return "Este e-mail já está cadastrado.";
    }

    if (text.includes("invalid email")) {
        return "Digite um e-mail válido.";
    }

    if (text.includes("password")) {
        return "A senha informada não atende aos requisitos.";
    }

    return message || "Não foi possível criar a conta.";
}


/* ============================================================
   PERFIL
============================================================ */

async function createProfileIfNeeded(nameOverride = "") {

    if (!currentUser || !supabaseClient) {
        return null;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Erro ao buscar perfil:",
                error
            );

            return null;
        }


        if (data) {

            currentProfile = data;

            return data;
        }


        const name =
            nameOverride ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            "";


        const {
            data: created,
            error: createError
        } = await supabaseClient
            .from("profiles")
            .insert({

                id: currentUser.id,

                full_name: name,

                email: currentUser.email || ""

            })
            .select()
            .single();


        if (createError) {

            console.error(
                "Erro ao criar perfil:",
                createError
            );

            return null;
        }


        currentProfile = created;

        return created;

    } catch (error) {

        console.error(
            "Erro no perfil:",
            error
        );

        return null;
    }
}


async function loadProfile() {

    if (!currentUser || !supabaseClient) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();


        if (error) {

            console.error(
                "Erro ao carregar perfil:",
                error
            );

        } else {

            currentProfile = data;

        }


        if (!currentProfile) {

            currentProfile =
                await createProfileIfNeeded();

        }


        updateProfileUI();

    } catch (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        updateProfileUI();

    }
}


function updateProfileUI() {

    if (!currentUser) return;


    const email = currentUser.email || "";


    const profileName =
        currentProfile?.full_name ||
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        "";


    let firstName = profileName
        .trim()
        .split(/\s+/)[0];


    if (!firstName) {

        firstName =
            email.split("@")[0] ||
            "Usuário";

    }


    const topbarName =
        document.getElementById(
            "topbarUserName"
        );

    const topbarEmail =
        document.getElementById(
            "topbarUserEmail"
        );

    const avatar =
        document.getElementById(
            "userAvatarLetter"
        );

    const welcome =
        document.getElementById(
            "welcomeMessage"
        );


    if (topbarName) {
        topbarName.textContent = firstName;
    }

    if (topbarEmail) {
        topbarEmail.textContent = email;
    }

    if (avatar) {
        avatar.textContent =
            firstName.charAt(0).toUpperCase();
    }

    if (welcome) {
        welcome.textContent =
            `Olá, ${firstName}!`;
    }

}


/* ============================================================
   ENTRAR NO APP
============================================================ */

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


/* ============================================================
   CARREGAMENTO GERAL
============================================================ */

async function loadUserData() {

    if (!currentUser) return;


    await loadProfile();

    await Promise.all([

        loadTransactions(),

        loadGoals(),

        loadBudgets(),

        loadSubscription()

    ]);


    updateDashboard();

    renderTransactions();

    renderCategories();

    renderGoals();

    updateReports();

    updatePremiumUI();

}


/* ============================================================
   TRANSAÇÕES
============================================================ */

async function loadTransactions() {

    if (!currentUser || !supabaseClient) return;


    try {

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
                "Erro ao carregar lançamentos:",
                error
            );

            transactions = [];

            return;
        }


        transactions = data || [];

    } catch (error) {

        console.error(error);

        transactions = [];

    }

}


/* ============================================================
   SALVAR TRANSAÇÃO
============================================================ */

async function handleTransactionSubmit(event) {

    event.preventDefault();


    if (!currentUser || !supabaseClient) {

        showToast(
            "Você precisa estar conectado."
        );

        return;
    }


    const description =
        document.getElementById(
            "transactionDescription"
        )?.value.trim() || "";


    const amount =
        parseFloat(
            document.getElementById(
                "transactionAmount"
            )?.value || 0
        );


    const type =
        document.getElementById(
            "transactionType"
        )?.value || selectedTransactionType;


    const category =
        document.getElementById(
            "transactionCategory"
        )?.value || "Outros";


    const date =
        document.getElementById(
            "transactionDate"
        )?.value || getTodayDate();


    if (!description) {

        showFormMessage(
            "transactionMessage",
            "Digite uma descrição.",
            true
        );

        return;
    }


    if (!amount || amount <= 0) {

        showFormMessage(
            "transactionMessage",
            "Digite um valor válido.",
            true
        );

        return;
    }


    const button =
        document.querySelector(
            "#transactionForm button[type='submit']"
        );


    const originalText =
        button?.textContent || "";


    if (button) {

        button.disabled = true;
        button.textContent = "Salvando...";

    }


    try {

        const payload = {

            user_id: currentUser.id,

            type: type,

            description: description,

            amount: amount,

            category: category,

            date: date

        };


        let result;


        if (editingTransactionId) {

            result = await supabaseClient
                .from("transactions")
                .update(payload)
                .eq("id", editingTransactionId)
                .eq("user_id", currentUser.id);

        } else {

            result = await supabaseClient
                .from("transactions")
                .insert(payload);

        }


        if (result.error) {

            console.error(result.error);

            showFormMessage(
                "transactionMessage",
                result.error.message ||
                "Não foi possível salvar.",
                true
            );

            return;
        }


        showToast(
            editingTransactionId
                ? "Lançamento atualizado!"
                : "Lançamento adicionado!"
        );


        closeModal("transactionModal");

        resetTransactionForm();


        await loadTransactions();

        updateDashboard();

        renderTransactions();

        updateReports();


    } catch (error) {

        console.error(error);

        showFormMessage(
            "transactionMessage",
            "Ocorreu um erro ao salvar o lançamento.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = originalText;

        }

    }

}


/* ============================================================
   ABRIR TRANSAÇÃO
============================================================ */

function openTransactionModal(type = "income") {

    editingTransactionId = null;

    selectedTransactionType = type;


    const modal =
        document.getElementById(
            "transactionModal"
        );


    const form =
        document.getElementById(
            "transactionForm"
        );


    if (form) {
        form.reset();
    }


    setDefaultDate();


    const typeInput =
        document.getElementById(
            "transactionType"
        );


    if (typeInput) {
        typeInput.value = type;
    }


    populateCategorySelect();


    clearFormMessage(
        "transactionMessage"
    );


    if (modal) {
        modal.classList.remove("hidden");
    }

}


function openEditTransaction(id) {

    const transaction =
        transactions.find(
            item => String(item.id) === String(id)
        );


    if (!transaction) return;


    editingTransactionId = transaction.id;


    const modal =
        document.getElementById(
            "transactionModal"
        );


    const description =
        document.getElementById(
            "transactionDescription"
        );

    const amount =
        document.getElementById(
            "transactionAmount"
        );

    const type =
        document.getElementById(
            "transactionType"
        );

    const category =
        document.getElementById(
            "transactionCategory"
        );

    const date =
        document.getElementById(
            "transactionDate"
        );


    if (description) {
        description.value =
            transaction.description || "";
    }

    if (amount) {
        amount.value =
            Number(transaction.amount || 0);
    }

    if (type) {
        type.value =
            transaction.type || "expense";
    }


    populateCategorySelect();


    if (category) {

        const exists =
            Array.from(
                category.options
            ).some(
                option =>
                    option.value ===
                    transaction.category
            );


        if (
            transaction.category &&
            !exists
        ) {

            const option =
                document.createElement("option");

            option.value =
                transaction.category;

            option.textContent =
                transaction.category;

            category.appendChild(option);

        }


        category.value =
            transaction.category || "Outros";
    }


    if (date) {
        date.value =
            transaction.date ||
            getTodayDate();
    }


    clearFormMessage(
        "transactionMessage"
    );


    if (modal) {
        modal.classList.remove("hidden");
    }

}


/* ============================================================
   EXCLUIR TRANSAÇÃO
============================================================ */

async function deleteTransaction(id) {

    if (!currentUser || !supabaseClient) return;


    const confirmed =
        window.confirm(
            "Deseja realmente excluir este lançamento?"
        );


    if (!confirmed) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", currentUser.id);


        if (error) {

            console.error(error);

            showToast(
                "Não foi possível excluir o lançamento."
            );

            return;
        }


        showToast(
            "Lançamento excluído."
        );


        await loadTransactions();

        updateDashboard();

        renderTransactions();

        updateReports();

    } catch (error) {

        console.error(error);

        showToast(
            "Ocorreu um erro ao excluir."
        );

    }

}


/* ============================================================
   RENDERIZAÇÃO DOS LANÇAMENTOS
============================================================ */

function renderTransactions() {

    const tbody =
        document.getElementById(
            "transactionsTableBody"
        );

    const empty =
        document.getElementById(
            "transactionsEmpty"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (!transactions.length) {

        if (empty) {
            empty.classList.remove("hidden");
        }

        return;

    }


    if (empty) {
        empty.classList.add("hidden");
    }


    transactions.forEach(function (transaction) {

        const tr =
            document.createElement("tr");


        const date =
            formatDate(transaction.date);


        const amount =
            formatCurrency(
                transaction.amount
            );


        const isIncome =
            transaction.type === "income";


        const typeLabel =
            isIncome
                ? "Entrada"
                : "Saída";


        const typeClass =
            isIncome
                ? "transaction-income"
                : "transaction-expense";


        tr.innerHTML = `

            <td>${escapeHtml(date)}</td>

            <td>
                ${escapeHtml(
                    transaction.description || "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    transaction.category || "Outros"
                )}
            </td>

            <td>
                <span class="${typeClass}">
                    ${typeLabel}
                </span>
            </td>

            <td>
                ${amount}
            </td>

            <td>

                <button
                    type="button"
                    class="text-btn"
                    onclick="openEditTransaction('${transaction.id}')"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="text-btn"
                    onclick="deleteTransaction('${transaction.id}')"
                >
                    Excluir
                </button>

            </td>
        `;


        tbody.appendChild(tr);

    });

}


/* ============================================================
   CATEGORIAS
============================================================ */

function getAllCategories() {

    const categories = [
        ...DEFAULT_CATEGORIES
    ];


    transactions.forEach(function (transaction) {

        if (
            transaction.category &&
            !categories.includes(
                transaction.category
            )
        ) {

            categories.push(
                transaction.category
            );

        }

    });


    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "controleS_categories"
                ) || "[]"
            );


        if (Array.isArray(saved)) {

            saved.forEach(function (category) {

                if (
                    category &&
                    !categories.includes(category)
                ) {

                    categories.push(category);

                }

            });

        }

    } catch (error) {

        console.warn(
            "Não foi possível ler categorias locais."
        );

    }


    return categories;
}


function populateCategorySelect() {

    const select =
        document.getElementById(
            "transactionCategory"
        );


    if (!select) return;


    const currentValue =
        select.value;


    const categories =
        getAllCategories();


    select.innerHTML = `

        <option value="">
            Selecione uma categoria
        </option>

    `;


    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });


    if (
        currentValue &&
        categories.includes(currentValue)
    ) {

        select.value = currentValue;

    }

}


function renderCategories() {

    const grid =
        document.getElementById(
            "categoriesGrid"
        );


    if (!grid) return;


    const categories =
        getAllCategories();


    const icons = {

        "Alimentação": "🍔",

        "Moradia": "🏠",

        "Transporte": "🚗",

        "Saúde": "❤️",

        "Educação": "📚",

        "Lazer": "🎮",

        "Compras": "🛍️",

        "Contas": "🧾",

        "Salário": "💰",

        "Investimentos": "📈",

        "Outros": "📦"

    };


    grid.innerHTML = "";


    categories.forEach(function (category) {

        const count =
            transactions.filter(
                transaction =>
                    transaction.category === category
            ).length;


        const card =
            document.createElement("div");


        card.className =
            "category-card";


        card.innerHTML = `

            <div class="category-card-icon">
                ${icons[category] || "📁"}
            </div>

            <strong>
                ${escapeHtml(category)}
            </strong>

            <span>
                ${count}
                ${count === 1
                    ? " lançamento"
                    : " lançamentos"}
            </span>

        `;


        grid.appendChild(card);

    });

}


/* ============================================================
   CRIAR CATEGORIA
============================================================ */

async function handleCategorySubmit(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "categoryName"
        );


    const name =
        input?.value.trim() || "";


    if (!name) {

        showFormMessage(
            "categoryMessage",
            "Digite o nome da categoria.",
            true
        );

        return;
    }


    const categories =
        getAllCategories();


    if (
        categories.some(
            category =>
                category.toLowerCase() ===
                name.toLowerCase()
        )
    ) {

        showFormMessage(
            "categoryMessage",
            "Essa categoria já existe.",
            true
        );

        return;
    }


    try {

        let saved = [];


        try {

            saved =
                JSON.parse(
                    localStorage.getItem(
                        "controleS_categories"
                    ) || "[]"
                );

        } catch (error) {

            saved = [];

        }


        if (!Array.isArray(saved)) {
            saved = [];
        }


        saved.push(name);


        localStorage.setItem(
            "controleS_categories",
            JSON.stringify(saved)
        );


        showToast(
            "Categoria criada!"
        );


        closeModal("categoryModal");


        if (input) {
            input.value = "";
        }


        renderCategories();

        populateCategorySelect();

    } catch (error) {

        console.error(error);

        showFormMessage(
            "categoryMessage",
            "Não foi possível criar a categoria.",
            true
        );

    }

}


/* ============================================================
   DASHBOARD
============================================================ */

function updateDashboard() {

    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            );


    const expense =
        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            );


    const balance =
        income - expense;


    const balanceElement =
        document.getElementById(
            "balanceValue"
        );

    const incomeElement =
        document.getElementById(
            "incomeValue"
        );

    const expenseElement =
        document.getElementById(
            "expenseValue"
        );


    if (balanceElement) {
        balanceElement.textContent =
            formatCurrency(balance);
    }

    if (incomeElement) {
        incomeElement.textContent =
            formatCurrency(income);
    }

    if (expenseElement) {
        expenseElement.textContent =
            formatCurrency(expense);
    }


    renderFinanceChart();

    renderRecentTransactions();

}


/* ============================================================
   LANÇAMENTOS RECENTES
============================================================ */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!container) return;


    container.innerHTML = "";


    const recent =
        transactions.slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">

                <span>🧾</span>

                <h3>
                    Nenhum lançamento
                </h3>

                <p>
                    Seus últimos movimentos aparecerão aqui.
                </p>

            </div>

        `;

        return;
    }


    recent.forEach(function (transaction) {

        const isIncome =
            transaction.type === "income";


        const item =
            document.createElement("div");


        item.className =
            "recent-item";


        item.innerHTML = `

            <div class="recent-info">

                <strong>
                    ${escapeHtml(
                        transaction.description || "Sem descrição"
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        transaction.category || "Outros"
                    )}
                    ·
                    ${formatDate(transaction.date)}
                </span>

            </div>

            <div class="recent-value ${
                isIncome
                    ? "transaction-income"
                    : "transaction-expense"
            }">

                ${isIncome ? "+" : "-"}
                ${formatCurrency(transaction.amount)}

            </div>

        `;


        container.appendChild(item);

    });

}


/* ============================================================
   GRÁFICO PRINCIPAL
============================================================ */

function renderFinanceChart() {

    const canvas =
        document.getElementById(
            "financeChart"
        );


    if (!canvas) return;


    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js não carregado."
        );

        return;
    }


    const monthlyData =
        getMonthlyData();


    if (financeChart) {

        financeChart.destroy();

        financeChart = null;

    }


    financeChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: monthlyData.labels,

                datasets: [

                    {
                        label: "Entradas",
                        data: monthlyData.income
                    },

                    {
                        label: "Saídas",
                        data: monthlyData.expense
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

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function (value) {

                                return formatCurrency(
                                    value
                                );

                            }

                        }

                    }

                }

            }

        });

}


/* ============================================================
   DADOS MENSAIS
============================================================ */

function getMonthlyData() {

    const labels = [];
    const income = [];
    const expense = [];

    const now =
        new Date();


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
            date.toLocaleDateString(
                "pt-BR",
                {
                    month: "short"
                }
            );


        const year =
            date.getFullYear();

        const monthNumber =
            date.getMonth();


        labels.push(
            month.charAt(0).toUpperCase() +
            month.slice(1)
        );


        let monthIncome = 0;
        let monthExpense = 0;


        transactions.forEach(function (transaction) {

            const transactionDate =
                parseDateSafe(
                    transaction.date
                );


            if (!transactionDate) return;


            if (
                transactionDate.getFullYear

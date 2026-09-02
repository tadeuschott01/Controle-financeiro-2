/* =========================================================
   CONTROLES
   APP.JS
========================================================= */

const SUPABASE_URL =
    "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


let currentUser = null;
let currentProfile = null;
let transactions = [];
let categories = [];
let goals = [];
let subscription = null;

let lastConfirmationEmail = "";


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupEvents();

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {

        currentUser = session.user;

        await loadUserData();

        showApp();

    } else {

        showLogin();

    }

});


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const registerBtn =
        document.getElementById("registerBtn");

    const backToLoginBtn =
        document.getElementById("backToLoginBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const premiumBtn =
        document.getElementById("premiumBtn");

    const themeToggle =
        document.getElementById("themeToggle");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }


    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            showRegister
        );

    }


    if (backToLoginBtn) {

        backToLoginBtn.addEventListener(
            "click",
            showLoginView
        );

    }


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    if (premiumBtn) {

        premiumBtn.addEventListener(
            "click",
            activatePremium
        );

    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            toggleTheme
        );

    }


    document
        .querySelectorAll(".password-toggle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;

                    const input =
                        document.getElementById(targetId);

                    if (!input) return;

                    if (
                        input.type === "password"
                    ) {

                        input.type = "text";

                        button.textContent = "🙈";

                    } else {

                        input.type = "password";

                        button.textContent = "👁";

                    }

                }
            );

        });


    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modalId =
                        button.dataset.close;

                    closeModal(modalId);

                }
            );

        });


    const addTransactionBtn =
        document.getElementById(
            "addTransactionBtn"
        );

    if (addTransactionBtn) {

        addTransactionBtn.addEventListener(
            "click",
            () => openModal("transactionModal")
        );

    }


    const addCategoryBtn =
        document.getElementById(
            "addCategoryBtn"
        );

    if (addCategoryBtn) {

        addCategoryBtn.addEventListener(
            "click",
            () => openModal("categoryModal")
        );

    }


    const addGoalBtn =
        document.getElementById(
            "addGoalBtn"
        );

    if (addGoalBtn) {

        addGoalBtn.addEventListener(
            "click",
            () => openModal("goalModal")
        );

    }


    const transactionForm =
        document.getElementById(
            "transactionForm"
        );

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            handleTransaction
        );

    }


    const categoryForm =
        document.getElementById(
            "categoryForm"
        );

    if (categoryForm) {

        categoryForm.addEventListener(
            "submit",
            handleCategory
        );

    }


    const goalForm =
        document.getElementById(
            "goalForm"
        );

    if (goalForm) {

        goalForm.addEventListener(
            "submit",
            handleGoal
        );

    }


    const exportBtn =
        document.getElementById(
            "exportDataBtn"
        );

    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            exportData
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (!email || !password) {

        alert("Preencha e-mail e senha.");

        return;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


        if (error) {

            if (
                error.message
                    .toLowerCase()
                    .includes("email not confirmed")
            ) {

                alert(
                    "Confirme seu e-mail antes de entrar."
                );

                return;

            }

            throw error;

        }


        currentUser = data.user;

        await loadUserData();

        showApp();

    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível entrar: " +
            error.message
        );

    }

}


/* =========================================================
   CADASTRO
========================================================= */

async function handleRegister(event) {

    event.preventDefault();

    clearRegisterMessage();


    const name =
        document.getElementById(
            "registerName"
        ).value.trim();

    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "registerPassword"
        ).value;

    const passwordConfirm =
        document.getElementById(
            "registerPasswordConfirm"
        ).value;


    if (!name) {

        showRegisterMessage(
            "Digite seu nome.",
            "error"
        );

        return;

    }


    if (!email) {

        showRegisterMessage(
            "Digite seu e-mail.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        showRegisterMessage(
            "A senha precisa ter pelo menos 6 caracteres.",
            "error"
        );

        return;

    }


    if (password !== passwordConfirm) {

        showRegisterMessage(
            "As senhas não são iguais.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "createAccountBtn"
        );

    if (button) {

        button.disabled = true;

        button.textContent =
            "Criando conta...";

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email,

            password,

            options: {

                data: {

                    full_name: name

                }

            }

        });


        if (error) {

            const message =
                error.message.toLowerCase();


            if (
                message.includes("already") ||
                message.includes("registered")
            ) {

                showRegisterMessage(
                    "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.",
                    "error"
                );

            } else if (
                message.includes("rate") ||
                message.includes("too many")
            ) {

                showRegisterMessage(
                    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
                    "error"
                );

            } else {

                throw error;

            }

            return;

        }


        lastConfirmationEmail = email;


        if (data.session) {

            currentUser =
                data.user;

            await createProfile(
                name
            );

            await loadUserData();

            showApp();

            return;

        }


        showRegisterMessage(
            `
            <strong>Conta criada com sucesso! 🎉</strong><br><br>
            Enviamos um e-mail de confirmação para
            <strong>${escapeHtml(email)}</strong>.<br>
            Confirme seu e-mail e depois volte para entrar.
            <br><br>
            <button
                type="button"
                class="btn btn-secondary"
                id="resendConfirmationBtn"
            >
                Reenviar e-mail
            </button>
            `,
            "success"
        );


        setTimeout(() => {

            const resendButton =
                document.getElementById(
                    "resendConfirmationBtn"
                );

            if (resendButton) {

                resendButton.addEventListener(
                    "click",
                    resendConfirmationEmail
                );

            }

        }, 0);


    } catch (error) {

        console.error(error);

        showRegisterMessage(
            "Erro ao criar conta: " +
            error.message,
            "error"
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
   REENVIAR CONFIRMAÇÃO
========================================================= */

async function resendConfirmationEmail() {

    if (!lastConfirmationEmail) {

        showRegisterMessage(
            "Digite seu e-mail novamente.",
            "error"
        );

        return;

    }


    try {

        const {
            error
        } = await supabaseClient.auth.resend({

            type: "signup",

            email: lastConfirmationEmail

        });


        if (error) {

            throw error;

        }


        showRegisterMessage(
            "E-mail de confirmação reenviado com sucesso! 📩",
            "success"
        );


    } catch (error) {

        console.error(error);

        showRegisterMessage(
            "Não foi possível reenviar agora: " +
            error.message,
            "error"
        );

    }

}


/* =========================================================
   TELAS DE AUTENTICAÇÃO
========================================================= */

function showLoginView() {

    const loginView =
        document.getElementById(
            "loginView"
        );

    const registerView =
        document.getElementById(
            "registerView"
        );


    if (loginView) {

        loginView.classList.remove(
            "hidden"
        );

    }


    if (registerView) {

        registerView.classList.add(
            "hidden"
        );

    }


    clearRegisterMessage();

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

        loginView.classList.add(
            "hidden"
        );

    }


    if (registerView) {

        registerView.classList.remove(
            "hidden"
        );

    }

}


function showRegisterMessage(
    message,
    type = "success"
) {

    const element =
        document.getElementById(
            "registerMessage"
        );

    if (!element) return;

    element.innerHTML = message;

    element.className =
        "auth-message " + type;

}


function clearRegisterMessage() {

    const element =
        document.getElementById(
            "registerMessage"
        );

    if (!element) return;

    element.innerHTML = "";

    element.className =
        "auth-message";

}


/* =========================================================
   PROFILE
========================================================= */

async function createProfile(name) {

    if (!currentUser) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("profiles")
            .upsert({

                id: currentUser.id,

                full_name: name,

                email: currentUser.email

            });


        if (error) {

            console.error(
                "Erro ao criar perfil:",
                error
            );

        }

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function loadUserData() {

    if (!currentUser) return;


    await loadProfile();

    await loadTransactions();

    await loadCategories();

    await loadGoals();

    await loadSubscription();

    updateUserInterface();

    renderTransactions();

    renderCategories();

    renderGoals();

}


/* =========================================================
   PERFIL
========================================================= */

async function loadProfile() {

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {

        console.error(error);

        return;

    }


    currentProfile = data;

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

        console.error(error);

        transactions = [];

        return;

    }


    transactions = data || [];

}


async function handleTransaction(event) {

    event.preventDefault();


    const description =
        document.getElementById(
            "transactionDescription"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );

    const type =
        document.getElementById(
            "transactionType"
        ).value;

    const category =
        document.getElementById(
            "transactionCategory"
        ).value;

    const date =
        document.getElementById(
            "transactionDate"
        ).value;


    if (!description || !amount || !date) {

        alert("Preencha todos os campos.");

        return;

    }


    try {

        const {
            error
        } = await supabaseClient
            .from("transactions")
            .insert({

                user_id: currentUser.id,

                description,

                amount,

                type,

                category,

                date

            });


        if (error) {

            throw error;

        }


        closeModal(
            "transactionModal"
        );


        document
            .getElementById(
                "transactionForm"
            )
            .reset();


        await loadTransactions();

        updateUserInterface();

        renderTransactions();


    } catch (error) {

        console.error(error);

        alert(
            "Erro ao salvar transação: " +
            error.message
        );

    }

}


/* =========================================================
   CATEGORIAS
========================================================= */

async function loadCategories() {

    const {
        data,
        error
    } = await supabaseClient
        .from("categories")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("name");


    if (error) {

        console.error(error);

        categories = [];

        return;

    }


    categories = data || [];

}


async function handleCategory(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "categoryName"
        ).value.trim();


    if (!name) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("categories")
            .insert({

                user_id: currentUser.id,

                name

            });


        if (error) {

            throw error;

        }


        closeModal(
            "categoryModal"
        );


        document
            .getElementById(
                "categoryForm"
            )
            .reset();


        await loadCategories();

        renderCategories();


    } catch (error) {

        console.error(error);

        alert(
            "Erro ao criar categoria: " +
            error.message
        );

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

        console.error(error);

        goals = [];

        return;

    }


    goals = data || [];

}


async function handleGoal(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "goalName"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "goalAmount"
            ).value
        );


    if (!name || !amount) {

        alert("Preencha os dados da meta.");

        return;

    }


    try {

        const {
            error
        } = await supabaseClient
            .from("goals")
            .insert({

                user_id: currentUser.id,

                name,

                target_amount: amount,

                current_amount: 0

            });


        if (error) {

            throw error;

        }


        closeModal(
            "goalModal"
        );


        document
            .getElementById(
                "goalForm"
            )
            .reset();


        await loadGoals();

        renderGoals();


    } catch (error) {

        console.error(error);

        alert(
            "Erro ao criar meta: " +
            error.message
        );

    }

}


/* =========================================================
   PREMIUM
========================================================= */

async function loadSubscription() {

    const {
        data,
        error
    } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", {
            ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Erro ao carregar Premium:",
            error
        );

        subscription = null;

        return;

    }


    subscription = data;

}


function isPremiumActive() {

    if (!subscription) {

        return false;

    }


    if (
        subscription.status !== "active" &&
        subscription.status !== "trial"
    ) {

        return false;

    }


    const expiration =
        subscription.current_period_end ||
        subscription.trial_end_at;


    if (!expiration) {

        return true;

    }


    return new Date(expiration) > new Date();

}


async function activatePremium() {

    if (!currentUser) {

        alert("Entre na sua conta primeiro.");

        return;

    }


    if (isPremiumActive()) {

        alert(
            "Seu Premium já está ativo! ⭐"
        );

        return;

    }


    const startDate =
        new Date();

    const endDate =
        new Date();

    endDate.setDate(
        endDate.getDate() + 7
    );


    try {

        let error = null;


        if (subscription) {

            const result =
                await supabaseClient
                    .from("subscriptions")
                    .update({

                        plan: "trial",

                        status: "trial",

                        price: 0,

                        trial_end_at:
                            endDate.toISOString(),

                        current_period_end:
                            endDate.toISOString(),

                        updated_at:
                            new Date().toISOString()

                    })
                    .eq(
                        "id",
                        subscription.id
                    );


            error = result.error;

        } else {

            const result =
                await supabaseClient
                    .from("subscriptions")
                    .insert({

                        user_id:
                            currentUser.id,

                        plan: "trial",

                        status: "trial",

                        price: 0,

                        trial_end_at:
                            endDate.toISOString(),

                        current_period_end:
                            endDate.toISOString(),

                        created_at:
                            startDate.toISOString(),

                        updated_at:
                            startDate.toISOString()

                    });


            error = result.error;

        }


        if (error) {

            throw error;

        }


        await loadSubscription();

        updateUserInterface();


        alert(
            "Premium ativado por 7 dias grátis! ⭐"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível ativar o Premium: " +
            error.message
        );

    }

}


function updatePremiumButton() {

    const button =
        document.getElementById(
            "premiumBtn"
        );

    if (!button) return;


    if (isPremiumActive()) {

        button.disabled = true;

        button.textContent =
            "Premium ativo ⭐";

    } else {

        button.disabled = false;

        button.textContent =
            "Ativar Premium grátis por 7 dias ⭐";

    }

}


/* =========================================================
   INTERFACE
========================================================= */

function updateUserInterface() {

    if (!currentUser) return;


    const welcome =
        document.getElementById(
            "welcomeMessage"
        );


    const name =
        currentProfile?.full_name ||
        currentUser.user_metadata?.full_name ||
        "Olá";


    if (welcome) {

        welcome.textContent =
            `Olá, ${name}!`;

    }


    const income =
        transactions
            .filter(t => t.type === "income")
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount || 0),
                0
            );


    const expenses =
        transactions
            .filter(t => t.type === "expense")
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount || 0),
                0
            );


    const balance =
        income - expenses;


    setText(
        "incomeValue",
        formatCurrency(income)
    );

    setText(
        "expenseValue",
        formatCurrency(expenses)
    );

    setText(
        "balanceValue",
        formatCurrency(balance)
    );


    const premiumTitle =
        document.getElementById(
            "premiumTitle"
        );


    if (premiumTitle) {

        if (isPremiumActive()) {

            premiumTitle.textContent =
                "ControleS Premium ⭐";

        } else {

            premiumTitle.textContent =
                "ControleS Premium";

        }

    }


    updatePremiumButton();

}


/* =========================================================
   RENDER TRANSAÇÕES
========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "transactionsList"
        );

    if (!container) return;


    if (!transactions.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Nenhuma transação cadastrada.
            </div>
            `;

        return;

    }


    container.innerHTML =
        transactions.map(transaction => {

            const amount =
                Number(
                    transaction.amount || 0
                );


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            return `
                <div class="transaction-item">

                    <div>
                        <strong>
                            ${escapeHtml(
                                transaction.description
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                transaction.category || "Sem categoria"
                            )}
                        </small>
                    </div>

                    <strong>
                        ${sign}
                        ${formatCurrency(amount)}
                    </strong>

                </div>
            `;

        }).join("");

}


/* =========================================================
   RENDER CATEGORIAS
========================================================= */

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesList"
        );

    if (!container) return;


    if (!categories.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Nenhuma categoria cadastrada.
            </div>
            `;

        updateCategorySelect();

        return;

    }


    container.innerHTML =
        categories.map(category => {

            return `
                <div class="category-item">
                    ${escapeHtml(category.name)}
                </div>
            `;

        }).join("");


    updateCategorySelect();

}


function updateCategorySelect() {

    const select =
        document.getElementById(
            "transactionCategory"
        );

    if (!select) return;


    select.innerHTML =
        `<option value="">
            Sem categoria
        </option>`;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.name;

        option.textContent =
            category.name;

        select.appendChild(option);

    });

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

        container.innerHTML =
            `
            <div class="empty-state">
                Nenhuma meta cadastrada.
            </div>
            `;

        return;

    }


    container.innerHTML =
        goals.map(goal => {

            const current =
                Number(
                    goal.current_amount || 0
                );

            const target =
                Number(
                    goal.target_amount || 0
                );


            const percentage =
                target > 0
                    ? Math.min(
                        100,
                        (current / target) * 100
                    )
                    : 0;


            return `
                <div class="goal-item">

                    <div>
                        <strong>
                            ${escapeHtml(goal.name)}
                        </strong>

                        <p>
                            ${formatCurrency(current)}
                            de
                            ${formatCurrency(target)}
                        </p>
                    </div>

                    <strong>
                        ${percentage.toFixed(0)}%
                    </strong>

                </div>
            `;

        }).join("");

}


/* =========================================================
   MODAIS
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

}


/* =========================================================
   TEMA
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "controles_theme",
        dark ? "dark" : "light"
    );

}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "controles_theme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

}


loadTheme();


/* =========================================================
   LOGIN / APP
========================================================= */

function showApp() {

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

}


function showLogin() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const app =
        document.getElementById(
            "app"
        );


    if (app) {

        app.classList.add(
            "hidden"
        );

    }


    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }


    showLoginView();

}


async function logout() {

    await supabaseClient.auth.signOut();

    currentUser = null;

    currentProfile = null;

    transactions = [];

    categories = [];

    goals = [];

    subscription = null;

    lastConfirmationEmail = "";

    showLogin();

}


/* =========================================================
   EXPORTAR
========================================================= */

function exportData() {

    const data = {

        transactions,

        categories,

        goals,

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
        "controles-dados.json";


    link.click();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value || 0)
    );

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

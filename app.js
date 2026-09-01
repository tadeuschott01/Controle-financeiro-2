/* =========================================================
   CONTROLES — APP.JS
   Supabase + Login + Lançamentos + Gráficos + Premium
   ========================================================= */

const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

/*
   COLE A SUA PUBLISHABLE KEY AQUI
   Não coloque Secret Key / service_role.
*/
const SUPABASE_KEY = "COLE_SUA_PUBLISHABLE_KEY_AQUI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CATEGORIES = [
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

let currentUser = null;
let currentProfile = null;
let transactions = [];
let goals = [];
let budgets = [];

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;

let selectedTransactionType = "income";

/* =========================================================
   ELEMENTOS
   ========================================================= */

const $ = id => document.getElementById(id);

const loginScreen = $("loginScreen");
const app = $("app");

const loginForm = $("loginForm");
const loginName = $("loginName");
const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");

const userName = $("userName");
const welcomeName = $("welcomeName");
const userAvatar = $("userAvatar");
const userPlan = $("userPlan");

const transactionModal = $("transactionModal");
const goalModal = $("goalModal");
const budgetModal = $("budgetModal");

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupNavigation();
    setupLogin();
    setupTransactions();
    setupModals();
    setupTheme();
    setupPremium();
    setupMobileMenu();
    setupFilters();

    setCurrentDate();
    setTodayDate();

    await checkSession();
});

/* =========================================================
   SESSÃO
   ========================================================= */

async function checkSession() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        showLogin();
        return;
    }

    if (data.session) {
        await loadUser(data.session.user);
    } else {
        showLogin();
    }

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (session?.user) {
                await loadUser(session.user);
            } else {
                currentUser = null;
                currentProfile = null;
                showLogin();
            }

        }
    );
}

/* =========================================================
   LOGIN / CADASTRO
   ========================================================= */

function setupLogin() {

    if (!loginForm) return;

    loginForm.addEventListener("submit", async event => {

        event.preventDefault();

        const name = loginName.value.trim();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!name || !email || !password) {
            alert("Preencha todos os campos.");
            return;
        }

        const button =
            loginForm.querySelector("button[type='submit']");

        button.disabled = true;
        button.textContent = "Entrando...";

        try {

            /*
             Primeiro tenta entrar.
            */

            let { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            /*
             Se não existir, tenta criar a conta.
            */

            if (error) {

                const signUp =
                    await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name
                            }
                        }
                    });

                if (signUp.error) {
                    throw signUp.error;
                }

                if (!signUp.data.session) {

                    alert(
                        "Conta criada! Se o Supabase estiver exigindo confirmação de e-mail, confirme seu e-mail e depois entre novamente."
                    );

                    return;
                }

                data = signUp.data;
            }

            if (data?.user) {
                await loadUser(data.user);
            }

        } catch (error) {

            console.error(error);

            alert(
                "Não foi possível entrar: " +
                (error.message || "erro desconhecido")
            );

        } finally {

            button.disabled = false;
            button.textContent = "Entrar no ControleS";

        }
    });
}

/* =========================================================
   CARREGAR USUÁRIO
   ========================================================= */

async function loadUser(user) {

    currentUser = user;

    let { data: profile } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

    if (!profile) {

        const name =
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Usuário";

        const result =
            await supabaseClient
                .from("profiles")
                .insert({
                    id: user.id,
                    name,
                    email: user.email,
                    plan: "free"
                })
                .select()
                .single();

        if (result.error) {
            console.error(result.error);
        } else {
            profile = result.data;
        }
    }

    currentProfile = profile || {
        name:
            user.user_metadata?.name ||
            "Usuário",
        email: user.email,
        plan: "free"
    };

    updateUserInterface();

    showApp();

    await loadAllData();

    renderEverything();
}

/* =========================================================
   INTERFACE DO USUÁRIO
   ========================================================= */

function updateUserInterface() {

    const name =
        currentProfile?.name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split("@")[0] ||
        "Usuário";

    const firstLetter =
        name.charAt(0).toUpperCase();

    if (userName)
        userName.textContent = name;

    if (welcomeName)
        welcomeName.textContent = name;

    if (userAvatar)
        userAvatar.textContent = firstLetter;

    if (userPlan) {

        const premium =
            currentProfile?.plan === "premium";

        userPlan.textContent =
            premium
                ? "ControleS Premium"
                : "ControleS Grátis";
    }
}

/* =========================================================
   MOSTRAR / ESCONDER APP
   ========================================================= */

function showLogin() {

    loginScreen?.classList.remove("hidden");
    app?.classList.add("hidden");
}

function showApp() {

    loginScreen?.classList.add("hidden");
    app?.classList.remove("hidden");
}

/* =========================================================
   LOGOUT
   ========================================================= */

$("logoutBtn")?.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

});

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function setupNavigation() {

    document.querySelectorAll("[data-section]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.section;

                if (!section) return;

                openSection(section);
            });

        });
}

function openSection(sectionId) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.add("hidden");
        });

    const target = $(sectionId);

    if (target) {
        target.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );

        });

    const titles = {
        dashboard: "Tela principal",
        transactions: "Lançamentos",
        categories: "Gastos por categoria",
        reports: "Relatórios",
        premium: "Premium"
    };

    const title = $("pageTitle");

    if (title) {
        title.textContent =
            titles[sectionId] || "ControleS";
    }

    $("sidebar")?.classList.remove("mobile-open");

    renderEverything();
}

/* =========================================================
   CARREGAR DADOS
   ========================================================= */

async function loadAllData() {

    if (!currentUser) return;

    await Promise.all([
        loadTransactions(),
        loadGoals(),
        loadBudgets()
    ]);
}

/* =========================================================
   TRANSAÇÕES
   ========================================================= */

async function loadTransactions() {

    const { data, error } =
        await supabaseClient
            .from("transactions")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("date", {
                ascending: false
            })
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.error(error);
        transactions = [];
        return;
    }

    transactions = data || [];
}

/* =========================================================
   CRIAR TRANSAÇÃO
   ========================================================= */

function setupTransactions() {

    $("openTransactionBtn")
        ?.addEventListener(
            "click",
            openTransactionModal
        );

    $("newTransactionButton")
        ?.addEventListener(
            "click",
            openTransactionModal
        );

    document.querySelectorAll(".type-option")
        .forEach(button => {

            button.addEventListener("click", () => {

                document.querySelectorAll(".type-option")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                selectedTransactionType =
                    button.dataset.type;
            });

        });

    $("transactionForm")
        ?.addEventListener(
            "submit",
            saveTransaction
        );
}

async function saveTransaction(event) {

    event.preventDefault();

    if (!currentUser) {
        alert("Faça login primeiro.");
        return;
    }

    const description =
        $("descriptionInput").value.trim();

    const amount =
        Number($("amountInput").value);

    const date =
        $("dateInput").value;

    const frequency =
        $("frequencyInput").value;

    const category =
        $("transactionCategory").value;

    if (!description || !amount || !date) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    const button =
        document.querySelector(
            "#transactionForm button[type='submit']"
        );

    if (button) {
        button.disabled = true;
        button.textContent = "Salvando...";
    }

    const { error } =
        await supabaseClient
            .from("transactions")
            .insert({
                user_id: currentUser.id,
                type: selectedTransactionType,
                description,
                amount,
                date,
                frequency,
                category
            });

    if (button) {
        button.disabled = false;
        button.textContent = "Salvar lançamento";
    }

    if (error) {

        console.error(error);

        alert(
            "Erro ao salvar lançamento: " +
            error.message
        );

        return;
    }

    closeTransactionModal();

    $("transactionForm").reset();

    selectedTransactionType = "income";

    document.querySelectorAll(".type-option")
        .forEach(btn =>
            btn.classList.remove("active")
        );

    document
        .querySelector(".type-option[data-type='income']")
        ?.classList.add("active");

    await loadTransactions();

    renderEverything();
}

/* =========================================================
   EXCLUIR TRANSAÇÃO
   ========================================================= */

async function deleteTransaction(id) {

    if (!confirm("Excluir este lançamento?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", currentUser.id);

    if (error) {

        alert(
            "Não foi possível excluir: " +
            error.message
        );

        return;
    }

    await loadTransactions();

    renderEverything();
}

/* =========================================================
   R

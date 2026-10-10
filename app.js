/* =========================================================
   CONTROLES 1.0 — APP.JS
   =========================================================
   Funcionalidades:
   - Login / Cadastro / Logout
   - Supabase
   - Tema claro / escuro
   - Dashboard
   - Lançamentos
   - A Receber
   - Categorias
   - Relatórios
   - Premium / Google Play (RevenueCat)
   - Metas
   - Cofrinho mensal
   - Resumo mensal
   - Ranking de gastos
   - Gráficos
   - Filtro por período
   - Menu mobile corrigido
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

let supabaseClient = null;


/* =========================================================
   GOOGLE PLAY / REVENUECAT
   =========================================================
   Preencha REVENUECAT_ANDROID_API_KEY depois de criar o app
   no RevenueCat. O entitlement deve se chamar "premium".
========================================================= */

const REVENUECAT_ANDROID_API_KEY = "COLE_AQUI_SUA_CHAVE_PUBLICA_ANDROID_REVENUECAT";
const REVENUECAT_ENTITLEMENT_ID = "premium";
let revenueCatConfigured = false;
let revenueCatPackage = null;


/* =========================================================
   ESTADO
   ========================================================= */

let currentUser = null;
let currentProfile = null;

let transactions = [];
let goals = [];
let budgets = [];

let subscription = null;
let customCategories = [];

let financeChart = null;
let categoryChart = null;

let selectedTransactionType = "expense";
let editingTransactionId = null;

let toastTimer = null;
let authInitialized = false;
let enteringApp = false;

let eventsBound = false;


/* =========================================================
   CATEGORIAS PADRÃO
   ========================================================= */

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


/* =========================================================
   TÍTULOS DAS SEÇÕES
   ========================================================= */

const SECTION_TITLES = {
    dashboard: "Dashboard",
    transactions: "Lançamentos",
    receivable: "A Receber",
    categories: "Categorias",
    reports: "Relatórios",
    whatsapp: "Assessor WhatsApp",
    "ai-report": "Relatório com IA",
    premium: "Premium"
};


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function valueOf(id) {
    const element = $(id);
    return element ? element.value : "";
}


function firstExisting(...ids) {
    for (const id of ids) {
        const element = $(id);
        if (element) return element;
    }

    return null;
}


function formatCurrency(value) {
    const number = Number(value) || 0;

    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function formatDateBR(dateString) {
    if (!dateString) return "";

    const date = String(dateString).split("T")[0];
    const parts = date.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function todayISO() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function changeDate(dateString, days) {
    const date = new Date(`${dateString}T00:00:00`);

    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getFirstDayOfCurrentMonth() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}-01`;
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TIPO DE TRANSAÇÃO
   ========================================================= */

function normalizeTransactionType(type) {
    const value = String(type || "")
        .toLowerCase()
        .trim();

    if (
        value === "income" ||
        value === "receita" ||
        value === "entrada" ||
        value === "credito" ||
        value === "crédito"
    ) {
        return "income";
    }

    return "expense";
}


function databaseTransactionType(type) {
    return normalizeTransactionType(type) === "income" ? "receita" : "despesa";
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "info") {
    const toast =
        $("toast") ||
        document.querySelector(".toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;

    toast.classList.remove(
        "success",
        "error",
        "warning",
        "info",
        "show"
    );

    toast.classList.add(type);
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupEvents();

    setCurrentDate();
    setDefaultDate();

    loadTheme();
    loadLocalCategories();

    initializePeriodFilter();
    setupPeriodEvents();

    initializeSupabase();

    await checkSession();
});


/* =========================================================
   SUPABASE
   ========================================================= */

function initializeSupabase() {

    if (
        typeof window.supabase === "undefined" ||
        !window.supabase.createClient
    ) {
        console.error("Supabase não foi carregado.");

        showToast(
            "Erro ao carregar o sistema.",
            "error"
        );

        return;
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (session?.user) {
                currentUser = session.user;

                if (
                    event === "SIGNED_IN" &&
                    !enteringApp
                ) {
                    await enterApp();
                }

            } else {

                currentUser = null;
                currentProfile = null;

                if (authInitialized) {
                    showWelcomeView();
                }
            }

            authInitialized = true;
        }
    );
}


/* =========================================================
   SESSÃO
   ========================================================= */

async function checkSession() {

    if (!supabaseClient) return;

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(error);
            showWelcomeView();
            return;
        }

        if (data?.session?.user) {

            currentUser = data.session.user;

            await enterApp();

        } else {

            showWelcomeView();
        }

    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        showWelcomeView();
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    if (!supabaseClient) {
        showToast(
            "Sistema de login indisponível.",
            "error"
        );

        return;
    }

    const email =
        valueOf("loginEmail").trim();

    const password =
        valueOf("loginPassword");

    if (!email || !password) {
        showToast(
            "Preencha e-mail e senha.",
            "warning"
        );

        return;
    }

    const button =
        firstExisting(
            "loginBtn",
            "submitLoginBtn"
        );

    if (button) {
        button.disabled = true;
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
            throw error;
        }

        currentUser = data.user;

        await enterApp();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Não foi possível entrar.",
            "error"
        );

    } finally {

        if (button) {
            button.disabled = false;
        }
    }
}


/* =========================================================
   CADASTRO
   ========================================================= */

async function handleRegister(event) {

    event.preventDefault();

    if (!supabaseClient) {
        showToast(
            "Sistema de cadastro indisponível.",
            "error"
        );

        return;
    }

    const name =
        valueOf("registerName").trim();

    const email =
        valueOf("registerEmail").trim();

    const password =
        valueOf("registerPassword");

    const passwordConfirm =
        valueOf("registerPasswordConfirm") ||
        valueOf("registerConfirmPassword");

    if (!name || !email || !password) {

        showToast(
            "Preencha todos os campos.",
            "warning"
        );

        return;
    }

    if (
        passwordConfirm &&
        password !== passwordConfirm
    ) {

        showToast(
            "As senhas não coincidem.",
            "warning"
        );

        return;
    }

    if (password.length < 6) {

        showToast(
            "A senha deve ter pelo menos 6 caracteres.",
            "warning"
        );

        return;
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
                    name
                }
            }
        });

        if (error) {
            throw error;
        }

        if (data?.user) {

            currentUser = data.user;

            await createProfileIfNeeded(name);

            showToast(
                "Cadastro realizado com sucesso!",
                "success"
            );

            if (data.session) {
                await enterApp();
            } else {
                showToast(
                    "Verifique seu e-mail para confirmar o cadastro.",
                    "info"
                );

                showLoginView();

                const loginEmailField =
                    $("loginEmail");

                if (loginEmailField) {
                    loginEmailField.value = email;
                }
            }
        }

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Não foi possível realizar o cadastro.",
            "error"
        );
    }
}


/* =========================================================
   PERFIL
   ========================================================= */

async function createProfileIfNeeded(name = "") {

    if (!supabaseClient || !currentUser) {
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
            console.warn(
                "Não foi possível consultar perfil:",
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
                    name:
                        name ||
                        currentUser.user_metadata?.name ||
                        currentUser.email?.split("@")[0]
                });

            if (insertError) {
                console.warn(
                    "Não foi possível criar perfil:",
                    insertError
                );
            }
        }

    } catch (error) {

        console.warn(
            "Erro ao criar perfil:",
            error
        );
    }
}


async function loadProfile() {

    if (!supabaseClient || !currentUser) {
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

        if (!error && data) {
            currentProfile = data;
        } else {

            currentProfile = {
                id: currentUser.id,
                name:
                    currentUser.user_metadata?.name ||
                    currentUser.email?.split("@")[0] ||
                    "Usuário"
            };

            await createProfileIfNeeded(
                currentProfile.name
            );
        }

        updateUserInterface();

    } catch (error) {

        console.warn(
            "Erro ao carregar perfil:",
            error
        );
    }
}


function updateUserInterface() {

    const name =
        currentProfile?.name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split("@")[0] ||
        "Usuário";

    const email =
        currentUser?.email || "";

    const elements = [
        "userName",
        "profileName",
        "dashboardUserName",
        "welcomeUserName"
    ];

    elements.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent = name;
        }
    });

    const emailElements = [
        "userEmail",
        "profileEmail"
    ];

    emailElements.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent = email;
        }
    });

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase();

    const avatar =
        firstExisting(
            "userAvatar",
            "profileAvatar"
        );

    if (avatar) {
        avatar.textContent = initials || "U";
    }
}


/* =========================================================
   ENTRAR NO APP
   ========================================================= */

async function enterApp() {

    if (enteringApp) return;

    enteringApp = true;

    try {

        closeMobileMenu();

        showAppView();

        await loadProfile();

        await Promise.all([
            loadTransactions(),
            loadGoals(),
            loadBudgets(),
            loadSubscription()
        ]);

        updateCategories();

        updateDashboard();

        renderTransactions();

        renderReceivables();

        updateReceivableDashboard();

        renderPremium();

        updatePeriodSummary();

        applyPremiumAccess();

    } catch (error) {

        console.error(
            "Erro ao carregar aplicativo:",
            error
        );

        showToast(
            "Alguns dados não puderam ser carregados.",
            "warning"
        );

    } finally {

        enteringApp = false;
    }
}


/* =========================================================
   VIEWS
   ========================================================= */

function showWelcomeView() {
    closeMobileMenu();
    const welcome = $("welcomeView");
    const login = firstExisting("loginView", "authView");
    const register = $("registerView");
    const app = firstExisting("appView", "mainApp");
    if (welcome) welcome.classList.remove("hidden");
    if (login) login.classList.add("hidden");
    if (register) register.classList.add("hidden");
    if (app) app.classList.add("hidden");
}

function showLoginView() {

    closeMobileMenu();
    const welcome = $("welcomeView");
    if (welcome) welcome.classList.add("hidden");

    const login =
        firstExisting(
            "loginView",
            "authView"
        );

    const register =
        $("registerView");

    const app =
        firstExisting(
            "appView",
            "mainApp"
        );

    if (login) {
        login.classList.remove("hidden");
        login.style.display = "";
    }

    if (register) {
        register.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showRegisterView() {

    closeMobileMenu();
    const welcome = $("welcomeView");
    if (welcome) welcome.classList.add("hidden");

    const login =
        firstExisting(
            "loginView",
            "authView"
        );

    const register =
        $("registerView");

    const app =
        firstExisting(
            "appView",
            "mainApp"
        );

    if (login) {
        login.classList.add("hidden");
    }

    if (register) {
        register.classList.remove("hidden");
        register.style.display = "";
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showAppView() {

    const welcome = $("welcomeView");
    if (welcome) welcome.classList.add("hidden");

    const login =
        firstExisting(
            "loginView",
            "authView"
        );

    const register =
        $("registerView");

    const app =
        firstExisting(
            "appView",
            "mainApp"
        );

    if (login) {
        login.classList.add("hidden");
    }

    if (register) {
        register.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
        app.style.display = "";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {

    closeMobileMenu();

    try {

        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    } finally {

        currentUser = null;
        currentProfile = null;

        transactions = [];
        goals = [];
        budgets = [];
        subscription = null;

        if (financeChart) {
            financeChart.destroy();
            financeChart = null;
        }

        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }

        showWelcomeView();

        showToast(
            "Você saiu da sua conta.",
            "success"
        );
    }
}


/* =========================================================
   TEMA
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("controles-theme");

    const theme =
        savedTheme === "dark"
            ? "dark"
            : "light";

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");

    updateThemeButton();
}


function toggleTheme() {

    const current =
        document.documentElement.getAttribute(
            "data-theme"
        ) || "light";

    const next =
        current === "dark"
            ? "light"
            : "dark";

    document.documentElement.setAttribute(
        "data-theme",
        next
    );

    document.body.classList.toggle("dark-mode", next === "dark");
    document.body.classList.toggle("dark", next === "dark");

    localStorage.setItem(
        "controles-theme",
        next
    );

    updateThemeButton();
}


function updateThemeButton() {

    const button =
        firstExisting(
            "themeBtn",
            "themeToggle"
        );

    if (!button) return;

    const theme =
        document.documentElement.getAttribute(
            "data-theme"
        );

    const icon =
        button.querySelector(
            ".theme-icon"
        );

    if (icon) {
        icon.textContent =
            theme === "dark"
                ? "☀"
                : "☾";
    }
}


/* =========================================================
   MOSTRAR / OCULTAR SENHA
   ========================================================= */

function togglePasswordVisibility(button) {

    const targetId =
        button.dataset.passwordToggle;

    const input =
        targetId ? $(targetId) : null;

    if (!input) return;

    const isHidden =
        input.type === "password";

    input.type =
        isHidden ? "text" : "password";

    button.setAttribute(
        "aria-pressed",
        isHidden ? "true" : "false"
    );

    button.setAttribute(
        "aria-label",
        isHidden ? "Ocultar senha" : "Mostrar senha"
    );

    button.textContent =
        isHidden ? "○" : "◉";
}


/* =========================================================
   DATA
   ========================================================= */

function setCurrentDate() {

    const element =
        firstExisting(
            "currentDate",
            "todayDate"
        );

    if (!element) return;

    const date = new Date();

    element.textContent =
        date.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}


function setDefaultDate() {

    const input =
        firstExisting(
            "transactionDate",
            "date"
        );

    if (
        input &&
        !input.value
    ) {
        input.value = todayISO();
    }
}


/* =========================================================
   MENU MOBILE — CORRIGIDO
   ========================================================= */

function getMobileOverlay() {

    let overlay = $("mobileOverlay");

    if (!overlay) {

        overlay =
            document.querySelector(
                ".mobile-overlay"
            );
    }

    return overlay;
}


function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "")
        || window.matchMedia?.("(pointer: coarse)")?.matches === true;
}

function isMobileViewport() {
    return window.innerWidth <= 720 || isMobileDevice();
}

// Alguns celulares podem estar com “Site para computador” ativado.
// Nesse caso o navegador informa uma largura de desktop, mas ainda é um celular.
// Marcamos o documento para o CSS manter o layout mobile correto.
function applyDeviceLayout() {
    document.documentElement.toggleAttribute("data-mobile-device", isMobileDevice());
}

applyDeviceLayout();


function openMobileMenu() {

    const sidebar =
        $("sidebar");

    const button =
        $("mobileMenuBtn");

    const overlay =
        getMobileOverlay();

    if (!sidebar || !isMobileViewport()) {
        return;
    }

    sidebar.classList.add(
        "mobile-open"
    );

    if (overlay) {

        overlay.classList.remove(
            "hidden"
        );

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    document.body.classList.add(
        "menu-open"
    );

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}


function closeMobileMenu() {

    const sidebar =
        $("sidebar");

    const button =
        $("mobileMenuBtn");

    const overlay =
        getMobileOverlay();

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }

    if (overlay) {

        overlay.classList.add(
            "hidden"
        );

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    document.body.classList.remove(
        "menu-open"
    );

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


function toggleMobileMenu() {

    const sidebar =
        $("sidebar");

    if (!sidebar) return;

    if (
        sidebar.classList.contains(
            "mobile-open"
        )
    ) {

        closeMobileMenu();

    } else {

        openMobileMenu();
    }
}


/* =========================================================
   SEÇÕES
   ========================================================= */

function showSection(sectionName) {

    if (!sectionName) return;

    const sections =
        document.querySelectorAll(
            ".content-section"
        );

    sections.forEach(section => {

        const isActive =
            section.id === sectionName ||
            section.id === `${sectionName}Section`;

        section.classList.toggle(
            "active",
            isActive
        );

        section.classList.toggle(
            "hidden",
            !isActive
        );
    });


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );
    });


    const title =
        firstExisting(
            "sectionTitle",
            "pageTitle",
            "mainTitle"
        );

    if (title) {

        title.textContent =
            SECTION_TITLES[sectionName] ||
            title.textContent;
    }


    closeMobileMenu();


    switch (sectionName) {

        case "dashboard":
            updateDashboard();
            break;

        case "transactions":
            renderTransactions();
            break;

        case "receivable":
            renderReceivables();
            break;

        case "categories":
            updateCategories();
            break;

        case "reports":
            renderReports();
            break;

        case "premium":
            renderPremium();
            break;
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   TRANSAÇÕES — CARREGAR
   ========================================================= */

async function loadTransactions() {

    if (!supabaseClient || !currentUser) {
        return;
    }

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
            throw error;
        }

        transactions =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Erro ao carregar transações:",
            error
        );

        transactions = [];
    }
}


/* =========================================================
   TRANSAÇÕES — CAMPOS
   ========================================================= */

function getTransactionAmount(transaction) {

    return Number(
        transaction.amount ??
        transaction.valor ??
        transaction.value ??
        0
    ) || 0;
}


function getTransactionDate(transaction) {

    return (
        transaction.date ||
        transaction.data ||
        transaction.created_at?.split("T")[0] ||
        ""
    );
}


function getTransactionDescription(transaction) {

    return (
        transaction.description ||
        transaction.descricao ||
        transaction.title ||
        transaction.nome ||
        "Lançamento"
    );
}


function getTransactionCategory(transaction) {

    return (
        transaction.category ||
        transaction.categoria ||
        "Outros"
    );
}


/* =========================================================
   TRANSAÇÃO RECEBIDA
   ========================================================= */

function isIncomeReceived(
    transaction,
    referenceDate = todayISO()
) {

    const type =
        normalizeTransactionType(
            transaction.type ||
            transaction.tipo ||
            transaction.transaction_type
        );

    if (type !== "income") {
        return false;
    }

    const date =
        getTransactionDate(transaction);

    if (!date) return true;

    return date <= referenceDate;
}


function isFutureReceivable(transaction) {

    const type =
        normalizeTransactionType(
            transaction.type ||
            transaction.tipo ||
            transaction.transaction_type
        );

    if (type !== "income") {
        return false;
    }

    const date =
        getTransactionDate(transaction);

    if (!date) return false;

    return date > todayISO();
}


/* =========================================================
   A RECEBER
   ========================================================= */

function getReceivableTransactions() {

    return transactions.filter(
        transaction =>
            isFutureReceivable(transaction)
    );
}


function getReceivableSummary() {

    const receivables =
        getReceivableTransactions();

    const total =
        receivables.reduce(
            (sum, transaction) =>
                sum +
                getTransactionAmount(transaction),
            0
        );

    const dates =
        receivables
            .map(getTransactionDate)
            .filter(Boolean)
            .sort();

    return {
        total,
        count: receivables.length,
        nextDate: dates[0] || null
    };
}


function renderReceivables() {

    const list =
        firstExisting(
            "receivableList",
            "receivablesList"
        );

    const empty =
        firstExisting(
            "receivableEmpty",
            "receivablesEmpty"
        );

    if (!list) return;

    const receivables =
        getReceivableTransactions();

    if (!receivables.length) {

        list.innerHTML = "";

        if (empty) {
            empty.classList.remove("hidden");
        }

        return;
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    list.innerHTML =
        receivables
            .map(transaction => {

                const amount =
                    getTransactionAmount(
                        transaction
                    );

                return `
                    <div class="transaction-item receivable-item">
                        <div>
                            <strong>
                                ${escapeHTML(
                                    getTransactionDescription(transaction)
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    getTransactionCategory(transaction)
                                )}
                                •
                                ${formatDateBR(
                                    getTransactionDate(transaction)
                                )}
                            </small>
                        </div>

                        <div>
                            <strong class="income-value">
                                + ${formatCurrency(amount)}
                            </strong>
                        </div>

                        <button
                            type="button"
                            class="btn btn-small mark-received-btn"
                            data-receivable-id="${transaction.id}"
                        >
                            Recebido
                        </button>
                    </div>
                `;
            })
            .join("");
}


function updateReceivableDashboard() {

    const summary =
        getReceivableSummary();

    const total =
        firstExisting(
            "receivableTotal",
            "dashboardReceivableTotal"
        );

    const nextDate =
        firstExisting(
            "receivableNextDate",
            "dashboardReceivableNextDate"
        );

    const count =
        firstExisting(
            "receivableCount",
            "dashboardReceivableCount"
        );

    if (total) {
        total.textContent =
            formatCurrency(summary.total);
    }

    if (nextDate) {

        nextDate.textContent =
            summary.nextDate
                ? formatDateBR(summary.nextDate)
                : "Nenhum";
    }

    if (count) {
        count.textContent =
            summary.count;
    }
}


function openNewReceivable() {

    openTransactionModal("income");

    const date =
        firstExisting(
            "transactionDate",
            "date"
        );

    if (date) {
        date.value = "";
    }

    const received =
        firstExisting(
            "transactionReceived",
            "received",
            "isReceived"
        );

    if (received) {
        received.checked = false;
    }
}


async function markTransactionAsReceived(id) {

    if (!supabaseClient || !currentUser) {
        return;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from("transactions")
            .update({
                date: todayISO()
            })
            .eq("id", id)
            .eq("user_id", currentUser.id);

        if (error) {
            throw error;
        }

        showToast(
            "Receita marcada como recebida.",
            "success"
        );

        await loadTransactions();

        updateDashboard();
        renderTransactions();
        renderReceivables();
        updateReceivableDashboard();
        updatePeriodSummary();

    } catch (error) {

        console.error(error);

        showToast(
            "Não foi possível marcar como recebida.",
            "error"
        );
    }
}


/* =========================================================
   TRANSAÇÕES — MODAL
   ========================================================= */

function openTransactionModal(type = "expense", transaction = null) {

    const modal =
        firstExisting(
            "transactionModal",
            "launchModal"
        );

    if (!modal) return;

    editingTransactionId =
        transaction?.id || null;

    selectedTransactionType =
        normalizeTransactionType(type);

    const title =
        firstExisting(
            "transactionModalTitle",
            "modalTitle"
        );

    if (title) {

        title.textContent =
            editingTransactionId
                ? "Editar lançamento"
                : selectedTransactionType === "income"
                    ? "Nova receita"
                    : "Nova despesa";
    }


    setTransactionType(
        selectedTransactionType
    );


    const description =
        firstExisting(
            "transactionDescription",
            "description",
            "transactionName"
        );

    const amount =
        firstExisting(
            "transactionAmount",
            "amount",
            "value"
        );

    const date =
        firstExisting(
            "transactionDate",
            "date"
        );

    const category =
        firstExisting(
            "transactionCategory",
            "category"
        );

    const received =
        firstExisting(
            "transactionReceived",
            "received",
            "isReceived"
        );


    if (transaction) {

        if (description) {
            description.value =
                getTransactionDescription(
                    transaction
                );
        }

        if (amount) {
            amount.value =
                getTransactionAmount(
                    transaction
                );
        }

        if (date) {
            date.value =
                getTransactionDate(
                    transaction
                );
        }

        if (category) {
            category.value =
                getTransactionCategory(
                    transaction
                );
        }

        if (received) {

            received.checked =
                isIncomeReceived(
                    transaction
                );
        }

    } else {

        if (description) {
            description.value = "";
        }

        if (amount) {
            amount.value = "";
        }

        if (date) {
            date.value = todayISO();
        }

        if (category) {
            category.value =
                selectedTransactionType === "income"
                    ? "Salário"
                    : "Alimentação";
        }

        if (received) {

            received.checked =
                selectedTransactionType === "expense";
        }
    }


    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}


function closeTransactionModal() {

    const modal =
        firstExisting(
            "transactionModal",
            "launchModal"
        );

    if (modal) {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    editingTransactionId = null;
}


function setTransactionType(type) {

    selectedTransactionType =
        normalizeTransactionType(type);

    const buttons =
        document.querySelectorAll(
            "[data-transaction-type]"
        );

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            normalizeTransactionType(
                button.dataset.transactionType
            ) === selectedTransactionType
        );
    });

    const typeInput =
        firstExisting(
            "transactionType",
            "type"
        );

    if (typeInput) {
        typeInput.value =
            selectedTransactionType;
    }


    const receivedContainer =
        firstExisting(
            "receivedContainer",
            "transactionReceivedContainer"
        );

    if (receivedContainer) {

        receivedContainer.style.display =
            selectedTransactionType === "income"
                ? ""
                : "none";
    }
}


/* =========================================================
   SALVAR TRANSAÇÃO
   ========================================================= */

async function saveTransaction(event) {

    if (event) {
        event.preventDefault();
    }

    if (!supabaseClient || !currentUser) {
        showToast(
            "Faça login novamente.",
            "error"
        );

        return;
    }


    const description =
        valueOf(
            "transactionDescription"
        ).trim() ||
        valueOf("description").trim();


    const amountRaw =
        valueOf(
            "transactionAmount"
        ) ||
        valueOf("amount") ||
        valueOf("value");


    const amount =
        Number(
            String(amountRaw)
                .replace(/\./g, "")
                .replace(",", ".")
        );


    const date =
        valueOf(
            "transactionDate"
        ) ||
        valueOf("date");


    const category =
        valueOf(
            "transactionCategory"
        ) ||
        valueOf("category") ||
        "Outros";


    const receivedElement =
        firstExisting(
            "transactionReceived",
            "received",
            "isReceived"
        );


    if (!description) {

        showToast(
            "Informe uma descrição.",
            "warning"
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showToast(
            "Informe um valor válido.",
            "warning"
        );

        return;
    }


    if (!date) {

        showToast(
            "Informe a data.",
            "warning"
        );

        return;
    }


    const type =
        databaseTransactionType(
            selectedTransactionType
        );


    const received =
        type === "income"
            ? (
                receivedElement
                    ? receivedElement.checked
                    : date <= todayISO()
            )
            : true;


    /*
     * A tabela transactions do projeto não possui as colunas
     * received / is_received. O estado de recebido é calculado
     * pela data: receita com data futura = A Receber; receita
     * com data de hoje/passada = recebida.
     */
    const payload = {
        user_id: currentUser.id,
        description,
        amount,
        date,
        category,
        type
    };


    try {

        if (editingTransactionId) {

            const {
                error
            } = await supabaseClient
                .from("transactions")
                .update(payload)
                .eq(
                    "id",
                    editingTransactionId
                )
                .eq(
                    "user_id",
                    currentUser.id
                );

            if (error) {
                throw error;
            }

            showToast(
                "Lançamento atualizado.",
                "success"
            );

        } else {

            const {
                error
            } = await supabaseClient
                .from("transactions")
                .insert(payload);

            if (error) {
                throw error;
            }

            showToast(
                "Lançamento adicionado.",
                "success"
            );
        }


        closeTransactionModal();

        await loadTransactions();

        updateDashboard();

        renderTransactions();

        renderReceivables();

        updateReceivableDashboard();

        updatePeriodSummary();

        renderReports();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Não foi possível salvar o lançamento.",
            "error"
        );
    }
}


/* =========================================================
   EXCLUIR TRANSAÇÃO
   ========================================================= */

async function deleteTransaction(id) {

    if (!supabaseClient || !currentUser) {
        return;
    }

    if (
        !confirm(
            "Deseja realmente excluir este lançamento?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from("transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", currentUser.id);

        if (error) {
            throw error;
        }

        showToast(
            "Lançamento excluído.",
            "success"
        );

        await loadTransactions();

        updateDashboard();
        renderTransactions();
        renderReceivables();
        updateReceivableDashboard();
        updatePeriodSummary();
        renderReports();

    } catch (error) {

        console.error(error);

        showToast(
            "Não foi possível excluir.",
            "error"
        );
    }
}


/* =========================================================
   RENDER TRANSAÇÕES
   ========================================================= */

function getTransactionFilterState() {
    const search = valueOf("transactionSearch").toLowerCase().trim();
    const type = valueOf("transactionFilter") || valueOf("transactionTypeFilter") || "all";
    const category = valueOf("categoryFilter") || valueOf("transactionCategoryFilter") || "all";
    const from = valueOf("transactionDateFrom");
    const to = valueOf("transactionDateTo");
    return { search, type, category, from, to };
}

function getFilteredTransactions() {
    const f = getTransactionFilterState();
    return [...transactions].filter(transaction => {
        const description = getTransactionDescription(transaction);
        const category = getTransactionCategory(transaction);
        const date = getTransactionDate(transaction);
        const type = normalizeTransactionType(transaction.type || transaction.tipo || transaction.transaction_type);
        const haystack = `${description} ${category}`.toLowerCase();
        if (f.search && !haystack.includes(f.search)) return false;
        if (f.type && f.type !== "all" && type !== f.type) return false;
        if (f.category && f.category !== "all" && category !== f.category) return false;
        if (f.from && date < f.from) return false;
        if (f.to && date > f.to) return false;
        return true;
    });
}

function renderTransactions() {
    const list = firstExisting("transactionsList", "transactionList", "launchesList");
    const empty = $("transactionsEmpty");
    const countLabel = $("transactionsCountLabel");
    if (!list) return;

    const filtered = getFilteredTransactions();
    if (countLabel) countLabel.textContent = `${filtered.length} lançamento${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;
    if (empty) empty.classList.toggle("hidden", filtered.length > 0);

    if (!filtered.length) { list.innerHTML = ""; updateTransactionFilterSummary(0); return; }

    list.innerHTML = filtered.map(transaction => {
        const type = normalizeTransactionType(transaction.type || transaction.tipo || transaction.transaction_type);
        const amount = getTransactionAmount(transaction);
        const isIncome = type === "income";
        return `<article class="transaction-item" data-transaction-id="${escapeHTML(transaction.id)}">
            <div class="transaction-info"><strong>${escapeHTML(getTransactionDescription(transaction))}</strong><small>${escapeHTML(getTransactionCategory(transaction))} • ${formatDateBR(getTransactionDate(transaction))}</small></div>
            <strong class="${isIncome ? "income-value" : "expense-value"}">${isIncome ? "+" : "-"} ${formatCurrency(amount)}</strong>
            <div class="transaction-actions"><button type="button" class="edit-transaction-btn" data-edit-transaction="${escapeHTML(transaction.id)}" title="Editar">✎</button><button type="button" class="delete-transaction-btn" data-delete-transaction="${escapeHTML(transaction.id)}" title="Excluir">×</button></div>
        </article>`;
    }).join("");
    updateTransactionFilterSummary(filtered.length);
}

function updateTransactionFilterSummary(count) {
    const el = $("transactionFilterSummary");
    if (!el) return;
    const f = getTransactionFilterState();
    const active = [];
    if (f.search) active.push(`busca: “${f.search}”`);
    if (f.type !== "all") active.push(f.type === "income" ? "receitas" : "despesas");
    if (f.category !== "all") active.push(f.category);
    if (f.from || f.to) active.push(`${formatDateBR(f.from || f.to)}${f.from && f.to ? " até " + formatDateBR(f.to) : ""}`);
    el.textContent = active.length ? `Filtros ativos: ${active.join(" • ")} — ${count} resultado${count === 1 ? "" : "s"}.` : `Mostrando todos os lançamentos — ${count} resultado${count === 1 ? "" : "s"}.`;
}


/* =========================================================
   TOTAIS
   ========================================================= */

function getTotals() {

    let income = 0;
    let expense = 0;

    const today =
        todayISO();


    transactions.forEach(transaction => {

        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo ||
                transaction.transaction_type
            );


        const amount =
            getTransactionAmount(
                transaction
            );


        if (type === "income") {

            if (
                isIncomeReceived(
                    transaction,
                    today
                )
            ) {
                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    return {
        income,
        expense,
        balance: income - expense
    };
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totals =
        getTotals();


    const incomeElements = [
        "totalIncome",
        "dashboardIncome",
        "monthIncome",
        "monthlyIncome"
    ];


    incomeElements.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent =
                formatCurrency(
                    totals.income
                );
        }
    });


    const expenseElements = [
        "totalExpense",
        "dashboardExpense",
        "monthExpense",
        "monthlyExpense"
    ];


    expenseElements.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent =
                formatCurrency(
                    totals.expense
                );
        }
    });


    const balanceElements = [
        "totalBalance",
        "dashboardBalance",
        "monthBalance",
        "monthlyBalance"
    ];


    balanceElements.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent =
                formatCurrency(
                    totals.balance
                );
        }
    });


    updatePeriodSummary();

    updateReceivableDashboard();

    updateMonthlySummary();

    updateExpenseRanking();

    updatePiggyBank();
    updatePremiumDashboard();

    renderRecentTransactions();

    renderFinanceChart();
}


/* =========================================================
   LANÇAMENTOS RECENTES
   ========================================================= */

function renderRecentTransactions() {

    const list =
        firstExisting(
            "recentTransactions",
            "recentTransactionsList",
            "dashboardTransactions"
        );

    if (!list) return;


    const recent =
        [...transactions]
            .sort(
                (a, b) =>
                    getTransactionDate(b)
                        .localeCompare(
                            getTransactionDate(a)
                        )
            )
            .slice(0, 5);


    if (!recent.length) {

        list.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento recente.
            </div>
        `;

        return;
    }


    list.innerHTML =
        recent
            .map(transaction => {

                const type =
                    normalizeTransactionType(
                        transaction.type ||
                        transaction.tipo
                    );

                const amount =
                    getTransactionAmount(
                        transaction
                    );

                return `
                    <div class="recent-transaction">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getTransactionDescription(transaction)
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    getTransactionCategory(transaction)
                                )}
                                •
                                ${formatDateBR(
                                    getTransactionDate(transaction)
                                )}
                            </small>

                        </div>

                        <strong
                            class="${
                                type === "income"
                                    ? "income-value"
                                    : "expense-value"
                            }"
                        >
                            ${
                                type === "income"
                                    ? "+"
                                    : "-"
                            }
                            ${formatCurrency(amount)}
                        </strong>

                    </div>
                `;
            })
            .join("");
}


/* =========================================================
   PERÍODO FINANCEIRO — CORRIGIDO
   ========================================================= */

function getPeriodElements() {
    return {
        select: firstExisting("dashboardPeriod", "periodFilter") || document.querySelector("[data-period-filter]"),
        apply: firstExisting("applyPeriodBtn", "applyPeriod", "btnApplyPeriod") || document.querySelector("[data-apply-period]"),
        clear: firstExisting("clearPeriodBtn"),
        customFields: firstExisting("customPeriodFields", "periodCustomFields", "customDateRange"),
        start: firstExisting("periodStartDate", "periodStart", "customStartDate", "startDate") || document.querySelector("[data-period-start]"),
        end: firstExisting("periodEndDate", "periodEnd", "customEndDate", "endDate") || document.querySelector("[data-period-end]"),
        income: firstExisting("incomeValue", "periodIncome", "periodIncomeValue", "periodEarnedValue") || document.querySelector("[data-period-income]"),
        expense: firstExisting("expenseValue", "periodExpense", "periodExpenseValue", "periodSpentValue") || document.querySelector("[data-period-expense]"),
        balance: firstExisting("balanceValue", "periodBalance", "periodBalanceValue") || document.querySelector("[data-period-balance]"),
        label: firstExisting("activePeriodLabel", "periodLabel") || document.querySelector("[data-period-label]")
    };
}


/* =========================================================
   INICIALIZAR FILTRO
   ========================================================= */

function initializePeriodFilter() {

    const {
        select,
        customFields,
        start,
        end
    } = getPeriodElements();

    if (!select) return;

    /*
     * Se o HTML já tiver as opções,
     * preservamos o que existe.
     *
     * Se estiver vazio, criamos as opções
     * oficiais do ControleS.
     */

    if (select.options.length === 0) {

        select.innerHTML = `
            <option value="today">
                Hoje
            </option>

            <option value="yesterday">
                Ontem
            </option>

            <option value="7days">
                Últimos 7 dias
            </option>

            <option value="30days">
                Últimos 30 dias
            </option>

            <option value="month">
                Este mês
            </option>

            <option value="previousMonth">
                Mês anterior
            </option>

            <option value="all">
                Todo o período
            </option>

            <option value="custom">
                Personalizado
            </option>
        `;
    }

    /*
     * Caso o HTML já tenha opções antigas,
     * normalizamos os valores sem destruir
     * o texto visual existente.
     */

    const optionMap = {
        week: "7days",
        "1week": "7days",
        "7": "7days",

        month: "month",
        "1month": "30days",

        all: "all",
        everything: "all",

        custom: "custom"
    };

    Array.from(select.options).forEach(option => {

        const value =
            String(option.value || "")
                .trim()
                .toLowerCase();

        if (optionMap[value]) {
            option.value = optionMap[value];
        }
    });


    /*
     * Garante que as opções necessárias
     * existam mesmo que o HTML esteja com
     * uma versão antiga.
     */

    const requiredOptions = [
        ["today", "Hoje"],
        ["yesterday", "Ontem"],
        ["7days", "Últimos 7 dias"],
        ["30days", "Últimos 30 dias"],
        ["month", "Este mês"],
        ["previousMonth", "Mês anterior"],
        ["all", "Todo o período"],
        ["custom", "Personalizado"]
    ];


    requiredOptions.forEach(([value, text]) => {

        const exists =
            Array.from(select.options)
                .some(option =>
                    option.value === value
                );

        if (!exists) {

            select.add(
                new Option(text, value)
            );
        }
    });


    /*
     * Período inicial:
     * Hoje
     */

    if (!select.value) {
        select.value = "today";
    }


    /*
     * Datas personalizadas começam escondidas.
     */

    if (customFields) {

        const isCustom =
            select.value === "custom";

        customFields.classList.toggle(
            "hidden",
            !isCustom
        );

        customFields.style.display =
            isCustom
                ? "flex"
                : "none";
    }


    /*
     * Limites dos campos de data.
     */

    if (start) {
        start.max = todayISO();
    }

    if (end) {
        end.max = todayISO();
    }
}


/* =========================================================
   MOSTRAR / ESCONDER PERSONALIZADO
   ========================================================= */

function toggleCustomPeriodFields() {

    const {
        select,
        customFields
    } = getPeriodElements();

    if (!select || !customFields) {
        return;
    }

    const isCustom =
        select.value === "custom";

    customFields.classList.toggle(
        "hidden",
        !isCustom
    );

    customFields.style.display =
        isCustom
            ? "flex"
            : "none";
}


/* =========================================================
   PRIMEIRO DIA DO MÊS
   ========================================================= */

function getFirstDayOfMonth(year, month) {

    const date =
        new Date(
            year,
            month,
            1
        );

    const y =
        date.getFullYear();

    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${y}-${m}-01`;
}


/* =========================================================
   ÚLTIMO DIA DO MÊS
   ========================================================= */

function getLastDayOfMonth(year, month) {

    const date =
        new Date(
            year,
            month + 1,
            0
        );

    const y =
        date.getFullYear();

    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const d =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


/* =========================================================
   PERÍODO SELECIONADO
   ========================================================= */

function getSelectedPeriod() {
    const { select, start, end } = getPeriodElements();
    if (!select || !select.value) return null;
    const today = todayISO();
    switch (select.value) {
        case "today": return { start: today, end: today, label: "Hoje" };
        case "yesterday": { const d=changeDate(today,-1); return { start:d,end:d,label:"Ontem" }; }
        case "7": return { start:changeDate(today,-6), end:today, label:"Últimos 7 dias" };
        case "30": return { start:changeDate(today,-29), end:today, label:"Últimos 30 dias" };
        case "week": return { start:changeDate(today,-6), end:today, label:"Última semana" };
        case "month": return { start:getFirstDayOfCurrentMonth(), end:today, label:"Este mês" };
        case "previous-month": { const first=new Date(new Date().getFullYear(),new Date().getMonth()-1,1); const last=new Date(new Date().getFullYear(),new Date().getMonth(),0); const f=`${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,"0")}-01`; const l=`${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}`; return {start:f,end:l,label:"Mês anterior"}; }
        case "all": return { start:null, end:null, label:"Todo o período" };
        case "custom": { let a=start?.value||"", b=end?.value||""; if(!a&&!b) return null; if(!a)a=b; if(!b)b=a; if(a>b)[a,b]=[b,a]; return {start:a,end:b,label:`${formatDateBR(a)} até ${formatDateBR(b)}`}; }
        default: return null;
    }
}


/* =========================================================
   TRANSAÇÃO DENTRO DO PERÍODO
   ========================================================= */

function transactionIsInPeriod(
    transaction,
    period
) {

    if (!period) {
        return false;
    }

    const date =
        String(
            getTransactionDate(
                transaction
            ) || ""
        ).split("T")[0];


    if (!date) {
        return false;
    }


    /*
     * Todo o período.
     */

    if (
        !period.start &&
        !period.end
    ) {
        return true;
    }


    if (
        period.start &&
        date < period.start
    ) {
        return false;
    }


    if (
        period.end &&
        date > period.end
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   CALCULAR RESUMO DO PERÍODO
   ========================================================= */

function calculatePeriodSummary(period) {

    let income = 0;
    let expense = 0;


    if (!Array.isArray(transactions)) {

        return {
            income: 0,
            expense: 0,
            balance: 0
        };
    }


    transactions.forEach(transaction => {

        if (
            !transactionIsInPeriod(
                transaction,
                period
            )
        ) {
            return;
        }


        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo ||
                transaction.transaction_type
            );


        const amount =
            getTransactionAmount(
                transaction
            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return;
        }


        if (type === "income") {

            /*
             * Receita futura não entra
             * como dinheiro recebido.
             */

            if (
                isIncomeReceived(
                    transaction
                )
            ) {
                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    return {

        income,

        expense,

        balance:
            income - expense
    };
}


/* =========================================================
   ATUALIZAR CARDS DO PERÍODO
   ========================================================= */

function updatePeriodSummary() {

    const elements =
        getPeriodElements();

    const period =
        getSelectedPeriod();


    /*
     * Se ainda não houver período,
     * limpamos os cards.
     */

    if (!period) {

        if (elements.income) {
            elements.income.textContent =
                formatCurrency(0);
        }

        if (elements.expense) {
            elements.expense.textContent =
                formatCurrency(0);
        }

        if (elements.balance) {
            elements.balance.textContent =
                formatCurrency(0);
        }

        if (elements.label) {
            elements.label.textContent =
                "Escolha um período";
        }

        return;
    }


    const summary =
        calculatePeriodSummary(
            period
        );


    if (elements.income) {

        elements.income.textContent =
            formatCurrency(
                summary.income
            );
    }


    if (elements.expense) {

        elements.expense.textContent =
            formatCurrency(
                summary.expense
            );
    }


    if (elements.balance) {

        elements.balance.textContent =
            formatCurrency(
                summary.balance
            );
    }


    if (elements.label) {

        elements.label.textContent =
            period.label;
    }
}


/* =========================================================
   APLICAR PERÍODO
   ========================================================= */

function applySelectedPeriod() {

    const {
        select,
        start,
        end
    } = getPeriodElements();


    if (!select || !select.value) {

        showToast(
            "Escolha um período primeiro.",
            "warning"
        );

        return;
    }


    /*
     * Validação do personalizado.
     */

    if (
        select.value === "custom"
    ) {

        if (
            !start?.value &&
            !end?.value
        ) {

            showToast(
                "Escolha pelo menos uma data.",
                "warning"
            );

            return;
        }


        if (
            start?.value &&
            end?.value &&
            start.value > end.value
        ) {

            showToast(
                "A data inicial não pode ser maior que a final.",
                "warning"
            );

            return;
        }
    }


    updatePeriodSummary();


    /*
     * Atualiza também os relatórios
     * e dashboard caso estejam presentes.
     */

    updateDashboard();

    renderTransactions();

    renderReports();


    showToast(
        `Período "${getSelectedPeriod()?.label || ""}" aplicado.`,
        "success"
    );
}


/* =========================================================
   EVENTOS DO PERÍODO
   ========================================================= */

function setupPeriodEvents() {

    const elements =
        getPeriodElements();

    if (elements.clear && elements.clear.dataset.periodBound !== "true") {
        elements.clear.dataset.periodBound = "true";
        elements.clear.addEventListener("click", event => {
            event.preventDefault();
            if (elements.select) elements.select.value = "30";
            if (elements.start) elements.start.value = "";
            if (elements.end) elements.end.value = "";
            toggleCustomPeriodFields();
            updatePeriodSummary();
            showToast("Filtro de período limpo.", "success");
        });
    }


    if (elements.select) {

        /*
         * Evita listeners duplicados caso
         * essa função seja chamada novamente.
         */

        if (
            elements.select.dataset.periodBound !==
            "true"
        ) {

            elements.select.dataset.periodBound =
                "true";


            elements.select.addEventListener(
                "change",
                () => {

                    toggleCustomPeriodFields();

                    /*
                     * Para os períodos prontos,
                     * atualizamos imediatamente.
                     *
                     * Personalizado espera o botão
                     * Aplicar.
                     */

                    if (
                        elements.select.value !==
                        "custom"
                    ) {
                        updatePeriodSummary();
                    }
                }
            );
        }
    }


    if (elements.apply) {

        if (
            elements.apply.dataset.periodBound !==
            "true"
        ) {

            elements.apply.dataset.periodBound =
                "true";


            elements.apply.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    applySelectedPeriod();
                }
            );
        }
    }


    /*
     * Atualiza ao alterar as datas personalizadas.
     */

    [elements.start, elements.end]
        .filter(Boolean)
        .forEach(input => {

            if (
                input.dataset.periodDateBound ===
                "true"
            ) {
                return;
            }

            input.dataset.periodDateBound =
                "true";


            input.addEventListener(
                "change",
                () => {

                    if (
                        elements.select?.value ===
                        "custom"
                    ) {
                        updatePeriodSummary();
                    }
                }
            );
        });
}


/* =========================================================
   INICIALIZA FILTRO
   ========================================================= */

function initializePeriodFilter() {

    const {
        select,
        customFields,
        start,
        end
    } = getPeriodElements();


    if (!select) return;


    /*
     * Só preenche se o select estiver vazio.
     * Assim não destrói o design/opções que já
     * existem no HTML.
     */

    if (select.options.length === 0) {

        select.innerHTML = `
            <option value="">
                Escolher período
            </option>

            <option value="week">
                1 semana
            </option>

            <option value="month">
                1 mês
            </option>

            <option value="custom">
                Personalizado
            </option>

            <option value="all">
                Tudo
            </option>
        `;
    }


    if (customFields) {

        customFields.classList.add(
            "hidden"
        );

        customFields.style.display =
            "none";
    }


    if (start) {
        start.max = todayISO();
    }

    if (end) {
        end.max = todayISO();
    }
}


/* =========================================================
   MOSTRAR DATAS PERSONALIZADAS
   ========================================================= */

function toggleCustomPeriodFields() {

    const {
        select,
        customFields
    } = getPeriodElements();


    if (!select || !customFields) {
        return;
    }


    const isCustom =
        select.value === "custom";


    customFields.classList.toggle(
        "hidden",
        !isCustom
    );


    customFields.style.display =
        isCustom
            ? "flex"
            : "none";
}


/* =========================================================
   PERÍODO SELECIONADO
   ========================================================= */

function getSelectedPeriod() {
    const { select, start, end } = getPeriodElements();
    if (!select || !select.value) return null;
    const today = todayISO();
    switch (select.value) {
        case "today": return { start: today, end: today, label: "Hoje" };
        case "yesterday": { const d=changeDate(today,-1); return { start:d,end:d,label:"Ontem" }; }
        case "7": return { start:changeDate(today,-6), end:today, label:"Últimos 7 dias" };
        case "30": return { start:changeDate(today,-29), end:today, label:"Últimos 30 dias" };
        case "week": return { start:changeDate(today,-6), end:today, label:"Última semana" };
        case "month": return { start:getFirstDayOfCurrentMonth(), end:today, label:"Este mês" };
        case "previous-month": { const first=new Date(new Date().getFullYear(),new Date().getMonth()-1,1); const last=new Date(new Date().getFullYear(),new Date().getMonth(),0); const f=`${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,"0")}-01`; const l=`${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}`; return {start:f,end:l,label:"Mês anterior"}; }
        case "all": return { start:null, end:null, label:"Todo o período" };
        case "custom": { let a=start?.value||"", b=end?.value||""; if(!a&&!b) return null; if(!a)a=b; if(!b)b=a; if(a>b)[a,b]=[b,a]; return {start:a,end:b,label:`${formatDateBR(a)} até ${formatDateBR(b)}`}; }
        default: return null;
    }
}


/* =========================================================
   TRANSAÇÃO DENTRO DO PERÍODO
   ========================================================= */

function transactionIsInPeriod(
    transaction,
    period
) {

    if (!period) {
        return false;
    }


    const date =
        getTransactionDate(
            transaction
        );


    if (!date) {
        return false;
    }


    if (
        period.start &&
        date < period.start
    ) {
        return false;
    }


    if (
        period.end &&
        date > period.end
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   CALCULAR PERÍODO
   ========================================================= */

function calculatePeriodSummary(period) {

    let income = 0;
    let expense = 0;


    if (!Array.isArray(transactions)) {

        return {
            income: 0,
            expense: 0,
            balance: 0
        };
    }


    transactions.forEach(transaction => {

        if (
            !transactionIsInPeriod(
                transaction,
                period
            )
        ) {
            return;
        }


        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo ||
                transaction.transaction_type
            );


        const amount =
            getTransactionAmount(
                transaction
            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return;
        }


        if (type === "income") {

            /*
             * Receita futura não é considerada
             * dinheiro ganho.
             */

            if (
                isIncomeReceived(
                    transaction
                )
            ) {

                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    return {

        income,

        expense,

        balance:
            income - expense
    };
}


/* =========================================================
   ATUALIZAR CARDS DO PERÍODO
   ========================================================= */

function updatePeriodSummary() {

    const elements =
        getPeriodElements();


    const period =
        getSelectedPeriod();


    if (!period) {
        return;
    }


    const summary =
        calculatePeriodSummary(
            period
        );


    if (elements.income) {

        elements.income.textContent =
            formatCurrency(
                summary.income
            );
    }


    if (elements.expense) {

        elements.expense.textContent =
            formatCurrency(
                summary.expense
            );
    }


    if (elements.balance) {

        elements.balance.textContent =
            formatCurrency(
                summary.balance
            );
    }


    if (elements.label) {

        elements.label.textContent =
            period.label;
    }
}


/* =========================================================
   APLICAR PERÍODO
   ========================================================= */

function applySelectedPeriod() {

    const {
        select,
        start,
        end
    } = getPeriodElements();


    if (!select || !select.value) {

        showToast(
            "Escolha um período primeiro.",
            "warning"
        );

        return;
    }


    if (
        select.value === "custom"
    ) {

        if (
            !start?.value &&
            !end?.value
        ) {

            showToast(
                "Escolha a data inicial e a data final.",
                "warning"
            );

            return;
        }


        if (
            start?.value &&
            end?.value &&
            start.value > end.value
        ) {

            showToast(
                "A data inicial não pode ser maior que a final.",
                "warning"
            );

            return;
        }
    }


    updatePeriodSummary();


    showToast(
        "Período aplicado com sucesso.",
        "success"
    );
}


/* =========================================================
   EVENTOS DO PERÍODO
   ========================================================= */

function setupPeriodEvents() {

    const elements =
        getPeriodElements();


    if (elements.select) {

        elements.select.addEventListener(
            "change",
            () => {

                toggleCustomPeriodFields();

                /*
                 * Não aplica automaticamente.
                 * O usuário escolhe e aperta
                 * Aplicar período.
                 */
            }
        );
    }


    if (elements.apply) {

        elements.apply.addEventListener(
            "click",
            applySelectedPeriod
        );
    }
}


/* =========================================================
   RESUMO MENSAL
   ========================================================= */

function updateMonthlySummary() {

    const month =
        new Date().getMonth();

    const year =
        new Date().getFullYear();


    let income = 0;
    let expense = 0;


    transactions.forEach(transaction => {

        const dateString =
            getTransactionDate(
                transaction
            );

        if (!dateString) return;


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        if (
            date.getMonth() !== month ||
            date.getFullYear() !== year
        ) {
            return;
        }


        const amount =
            getTransactionAmount(
                transaction
            );


        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        if (type === "income") {

            if (
                isIncomeReceived(
                    transaction
                )
            ) {
                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    const balance =
        income - expense;


    const incomeElement =
        firstExisting(
            "monthlyIncomeSummary",
            "summaryIncome",
            "monthIncomeSummary"
        );

    const expenseElement =
        firstExisting(
            "monthlyExpenseSummary",
            "summaryExpense",
            "monthExpenseSummary"
        );

    const balanceElement =
        firstExisting(
            "monthlyBalanceSummary",
            "summaryBalance",
            "monthBalanceSummary"
        );


    if (incomeElement) {
        incomeElement.textContent =
            formatCurrency(income);
    }


    if (expenseElement) {
        expenseElement.textContent =
            formatCurrency(expense);
    }


    if (balanceElement) {
        balanceElement.textContent =
            formatCurrency(balance);
    }
}


/* =========================================================
   RANKING DE GASTOS
   ========================================================= */

function updateExpenseRanking() {

    const container =
        firstExisting(
            "expenseRanking",
            "rankingExpenses",
            "expenseRankingList"
        );


    if (!container) return;


    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    const ranking = {};


    transactions.forEach(transaction => {

        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        if (type !== "expense") {
            return;
        }


        const dateString =
            getTransactionDate(
                transaction
            );


        if (!dateString) return;


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        if (
            date.getMonth() !== currentMonth ||
            date.getFullYear() !== currentYear
        ) {
            return;
        }


        const category =
            getTransactionCategory(
                transaction
            );


        const amount =
            getTransactionAmount(
                transaction
            );


        ranking[category] =
            (ranking[category] || 0) +
            amount;
    });


    const items =
        Object.entries(ranking)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 5);


    const total =
        items.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );


    if (!items.length) {

        container.innerHTML =
            "<p>Nenhum gasto neste mês.</p>";

        return;
    }


    container.innerHTML =
        items
            .map(
                ([category, amount], index) => {

                    const percentage =
                        total > 0
                            ? (
                                amount /
                                total *
                                100
                            )
                            : 0;


                    return `
                        <div class="ranking-item">

                            <div class="ranking-position">
                                ${index + 1}
                            </div>

                            <div class="ranking-info">

                                <strong>
                                    ${escapeHTML(category)}
                                </strong>

                                <span>
                                    ${formatCurrency(amount)}
                                </span>

                                <small>
                                    ${percentage.toFixed(1)}%
                                </small>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   RESUMO / COFRINHO / RANKING NO DASHBOARD
   ========================================================= */

function updatePremiumDashboard() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let income = 0;
    let expense = 0;
    const ranking = {};

    transactions.forEach(transaction => {
        const dateString = getTransactionDate(transaction);
        if (!dateString) return;

        const date = new Date(`${dateString}T00:00:00`);
        if (date.getMonth() !== month || date.getFullYear() !== year) return;

        const amount = getTransactionAmount(transaction);
        if (!Number.isFinite(amount) || amount <= 0) return;

        const type = normalizeTransactionType(
            transaction.type || transaction.tipo || transaction.transaction_type
        );

        if (type === "income") {
            if (isIncomeReceived(transaction)) income += amount;
        } else {
            expense += amount;
            const category = getTransactionCategory(transaction);
            ranking[category] = (ranking[category] || 0) + amount;
        }
    });

    const balance = income - expense;

    const savings = firstExisting("monthlySavingsValue", "piggyBankAmount", "cofrinhoAmount");
    if (savings) savings.textContent = formatCurrency(Math.max(0, balance));

    const savingsText = $("monthlySavingsText");
    if (savingsText) {
        savingsText.textContent = balance >= 0
            ? "Quanto sobrou no mês"
            : "Despesas acima das receitas";
    }

    const incomeEl = $("monthlyIncomeValue");
    const expenseEl = $("monthlyExpenseValue");
    const balanceEl = $("monthlyBalanceValue");
    if (incomeEl) incomeEl.textContent = formatCurrency(income);
    if (expenseEl) expenseEl.textContent = formatCurrency(expense);
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);

    const entries = Object.entries(ranking).sort((a,b) => b[1] - a[1]).slice(0, 5);

    const topCategory = $("topCategoryValue");
    const topCategoryText = $("topCategoryText");
    if (topCategory) topCategory.textContent = entries.length ? formatCurrency(entries[0][1]) : "—";
    if (topCategoryText) topCategoryText.textContent = entries.length ? entries[0][0] : "Nenhuma despesa registrada";

    const rankingEl = $("expenseRanking");
    if (rankingEl) {
        rankingEl.innerHTML = entries.length
            ? entries.map(([category, amount], index) => {
                const percent = expense > 0 ? (amount / expense) * 100 : 0;
                return `<div class="expense-ranking-item">
                    <div class="expense-ranking-main">
                        <strong>${index + 1}. ${escapeHTML(category)}</strong>
                        <span>${formatCurrency(amount)}</span>
                    </div>
                    <div class="expense-ranking-bar"><span style="width:${Math.min(100, percent)}%"></span></div>
                    <small>${percent.toFixed(1)}% das despesas</small>
                </div>`;
            }).join("")
            : `<div class="empty-state">Nenhum gasto registrado neste mês.</div>`;
    }
}


/* =========================================================
   COFRINHO
   ========================================================= */

function updatePiggyBank() {

    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    let income = 0;
    let expense = 0;


    transactions.forEach(transaction => {

        const dateString =
            getTransactionDate(
                transaction
            );


        if (!dateString) return;


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        if (
            date.getMonth() !== currentMonth ||
            date.getFullYear() !== currentYear
        ) {
            return;
        }


        const amount =
            getTransactionAmount(
                transaction
            );


        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        if (type === "income") {

            if (
                isIncomeReceived(
                    transaction
                )
            ) {
                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    const saved =
        income - expense;


    const element =
        firstExisting(
            "piggyBankAmount",
            "cofrinhoAmount",
            "monthlyPiggyBank"
        );


    if (element) {

        element.textContent =
            formatCurrency(
                Math.max(0, saved)
            );
    }
}


/* =========================================================
   GRÁFICO FINANCEIRO
   ========================================================= */

function renderFinanceChart() {

    const canvas =
        firstExisting(
            "financeChart",
            "financialChart"
        );


    if (!canvas) return;


    if (
        typeof Chart === "undefined"
    ) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    if (financeChart) {

        financeChart.destroy();

        financeChart = null;
    }


    const labels = [];
    const incomes = [];
    const expenses = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            changeDate(
                todayISO(),
                -i
            );


        labels.push(
            formatDateBR(date)
        );


        let income = 0;
        let expense = 0;


        transactions.forEach(transaction => {

            if (
                getTransactionDate(
                    transaction
                ) !== date
            ) {
                return;
            }


            const amount =
                getTransactionAmount(
                    transaction
                );


            const type =
                normalizeTransactionType(
                    transaction.type ||
                    transaction.tipo
                );


            if (type === "income") {

                if (
                    isIncomeReceived(
                        transaction
                    )
                ) {
                    income += amount;
                }

            } else {

                expense += amount;
            }
        });


        incomes.push(income);
        expenses.push(expense);
    }


    financeChart =
        new Chart(
            ctx,
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label: "Receitas",
                            data: incomes
                        },
                        {
                            label: "Despesas",
                            data: expenses
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
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


/* =========================================================
   GRÁFICO DE CATEGORIAS
   ========================================================= */

function renderCategoryChart() {

    const canvas =
        firstExisting(
            "categoryChart",
            "categoriesChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    if (categoryChart) {

        categoryChart.destroy();

        categoryChart = null;
    }


    const categories = {};


    transactions.forEach(transaction => {

        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        if (type !== "expense") {
            return;
        }


        const category =
            getTransactionCategory(
                transaction
            );


        const amount =
            getTransactionAmount(
                transaction
            );


        categories[category] =
            (categories[category] || 0) +
            amount;
    });


    const labels =
        Object.keys(categories);


    const values =
        Object.values(categories);


    categoryChart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "doughnut",

                data: {
                    labels,

                    datasets: [
                        {
                            data: values
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function loadLocalCategories() {

    try {

        const saved =
            localStorage.getItem(
                "controles-categories"
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (
                Array.isArray(parsed)
            ) {
                customCategories =
                    parsed;
            }
        }

    } catch (error) {

        customCategories = [];
    }
}


function saveLocalCategories() {

    localStorage.setItem(
        "controles-categories",
        JSON.stringify(
            customCategories
        )
    );
}


function getAllCategories() {

    return [
        ...new Set([
            ...DEFAULT_CATEGORIES,
            ...customCategories
        ])
    ];
}


function updateCategories() {
    const categories = getAllCategories();
    const select = firstExisting("transactionCategory", "category");
    if (select) {
        const current = select.value;
        select.innerHTML = categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
        if (categories.includes(current)) select.value = current;
    }
    const filter = firstExisting("categoryFilter", "transactionCategoryFilter");
    if (filter) {
        const current = filter.value;
        filter.innerHTML = `<option value="all">Todas as categorias</option>` + categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
        if (categories.includes(current)) filter.value = current;
    }
    const list = firstExisting("categoriesGrid", "categoriesList", "categoryList");
    if (!list) return;
    list.innerHTML = categories.map(category => `<article class="category-item"><span>◈</span><strong>${escapeHTML(category)}</strong>${DEFAULT_CATEGORIES.includes(category) ? "" : `<button type="button" class="delete-category-btn" data-delete-category="${escapeHTML(category)}">×</button>`}</article>`).join("");
}


function saveCategory(event) {

    if (event) {
        event.preventDefault();
    }


    const input =
        firstExisting(
            "newCategory",
            "categoryName"
        );


    if (!input) return;


    const name =
        input.value.trim();


    if (!name) {

        showToast(
            "Digite o nome da categoria.",
            "warning"
        );

        return;
    }


    const exists =
        getAllCategories()
            .some(
                category =>
                    category.toLowerCase() ===
                    name.toLowerCase()
            );


    if (exists) {

        showToast(
            "Essa categoria já existe.",
            "warning"
        );

        return;
    }


    customCategories.push(name);

    saveLocalCategories();

    updateCategories();


    input.value = "";


    closeModal(
        "categoryModal"
    );


    showToast(
        "Categoria adicionada.",
        "success"
    );
}


function deleteCategory(name) {

    if (
        !confirm(
            `Excluir a categoria "${name}"?`
        )
    ) {
        return;
    }


    customCategories =
        customCategories.filter(
            category =>
                category !== name
        );


    saveLocalCategories();

    updateCategories();


    showToast(
        "Categoria excluída.",
        "success"
    );
}


async function saveGoal(event) {
    if (event) event.preventDefault();
    if (!supabaseClient || !currentUser) { showToast("Faça login novamente.", "error"); return; }
    const name = valueOf("goalName").trim();
    const target = Number(valueOf("goalTarget"));
    const current = Number(valueOf("goalCurrent")) || 0;
    const deadline = valueOf("goalDeadline") || null;
    if (!name || !Number.isFinite(target) || target <= 0 || current < 0) { showToast("Preencha os dados da meta corretamente.", "warning"); return; }
    try {
        const { error } = await supabaseClient.from("goals").insert({ user_id: currentUser.id, name, target_amount: target, current_amount: current, deadline });
        if (error) throw error;
        showToast("Meta criada com sucesso.", "success");
        $("goalForm")?.reset();
        closeModal("goalModal");
        await loadGoals();
        renderGoals();
    } catch (error) { console.error(error); showToast(error.message || "Não foi possível criar a meta.", "error"); }
}


/* =========================================================
   RELATÓRIOS
   ========================================================= */

function renderReports() {
    applyPremiumAccess();

    const period = getSelectedPeriod();
    const summary = period ? calculatePeriodSummary(period) : getTotals();

    const reportPeriod = $("reportPeriodText");
    if (reportPeriod && period) reportPeriod.textContent = period.label;

    ["reportIncomeCard", "reportIncome"].forEach(id => {
        const el = $(id);
        if (el) el.textContent = formatCurrency(summary.income);
    });
    ["reportExpenseCard", "reportExpense"].forEach(id => {
        const el = $(id);
        if (el) el.textContent = formatCurrency(summary.expense);
    });
    ["reportBalanceCard", "reportBalance"].forEach(id => {
        const el = $(id);
        if (el) el.textContent = formatCurrency(summary.balance);
    });

    updateMonthlySummary();
    updateExpenseRanking();
    renderCategoryChart();
    renderMonthlyComparison();
    renderAutomaticAnalysis();
}


function getMonthlyTotals(year, month) {

    let income = 0;
    let expense = 0;


    transactions.forEach(transaction => {

        const dateString =
            getTransactionDate(
                transaction
            );


        if (!dateString) return;


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month
        ) {
            return;
        }


        const amount =
            getTransactionAmount(
                transaction
            );


        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        if (type === "income") {

            if (
                isIncomeReceived(
                    transaction
                )
            ) {
                income += amount;
            }

        } else {

            expense += amount;
        }
    });


    return {
        income,
        expense,
        balance: income - expense
    };
}


function renderMonthlyComparison() {

    const container =
        firstExisting(
            "monthlyComparison",
            "comparisonChart"
        );


    if (!container) return;


    const now =
        new Date();


    const current =
        getMonthlyTotals(
            now.getFullYear(),
            now.getMonth()
        );


    const previousDate =
        new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );


    const previous =
        getMonthlyTotals(
            previousDate.getFullYear(),
            previousDate.getMonth()
        );


    container.innerHTML = `
        <div class="comparison-item">

            <strong>
                Este mês
            </strong>

            <span>
                Receitas:
                ${formatCurrency(current.income)}
            </span>

            <span>
                Despesas:
                ${formatCurrency(current.expense)}
            </span>

            <span>
                Saldo:
                ${formatCurrency(current.balance)}
            </span>

        </div>


        <div class="comparison-item">

            <strong>
                Mês anterior
            </strong>

            <span>
                Receitas:
                ${formatCurrency(previous.income)}
            </span>

            <span>
                Despesas:
                ${formatCurrency(previous.expense)}
            </span>

            <span>
                Saldo:
                ${formatCurrency(previous.balance)}
            </span>

        </div>
    `;
}


/* =========================================================
   ANÁLISE AUTOMÁTICA
   ========================================================= */

function renderAutomaticAnalysis() {

    const element =
        firstExisting(
            "automaticAnalysis",
            "financialAnalysis",
            "analysisText"
        );


    if (!element) return;


    const totals =
        getTotals();


    let message = "";


    if (
        totals.income === 0 &&
        totals.expense === 0
    ) {

        message =
            "Ainda não existem dados suficientes para gerar uma análise.";

    } else if (
        totals.balance < 0
    ) {

        message =
            "Suas despesas estão maiores que suas receitas. Vale a pena revisar os principais gastos.";

    } else if (
        totals.expense >
        totals.income * 0.8
    ) {

        message =
            "Seu saldo está positivo, mas grande parte da sua renda já está comprometida com despesas.";

    } else {

        message =
            "Sua situação financeira está positiva. Continue acompanhando seus gastos e mantendo uma reserva.";
    }


    element.textContent =
        message;
}


/* =========================================================
   PREMIUM
   ========================================================= */

async function getRevenueCatPlugin() {
    return window.Capacitor?.Plugins?.Purchases || null;
}


function revenueCatReadyForRealPurchases() {
    return (
        REVENUECAT_ANDROID_API_KEY &&
        !REVENUECAT_ANDROID_API_KEY.includes("COLE_AQUI")
    );
}


async function configureRevenueCat() {
    if (revenueCatConfigured) return true;
    if (!currentUser || !revenueCatReadyForRealPurchases()) return false;

    const Purchases = await getRevenueCatPlugin();
    if (!Purchases) {
        console.warn("Plugin RevenueCat não disponível.");
        return false;
    }

    try {
        await Purchases.configure({
            apiKey: REVENUECAT_ANDROID_API_KEY,
            appUserID: currentUser.id
        });
        revenueCatConfigured = true;
        return true;
    } catch (error) {
        console.error("Erro ao configurar RevenueCat:", error);
        return false;
    }
}


function setSubscriptionFromCustomerInfo(customerInfo) {
    const entitlement =
        customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];

    if (entitlement) {
        subscription = {
            status: "active",
            plan: "premium",
            expires_at: entitlement.expirationDate || null,
            source: "google_play"
        };
    } else {
        subscription = null;
    }
}


async function loadSubscription() {
    // A tabela antiga do Supabase não libera mais o Premium.
    // O acesso passa a depender do entitlement confirmado pela loja.
    subscription = null;

    if (!currentUser) return;

    if (!(await configureRevenueCat())) {
        renderPremium();
        return;
    }

    try {
        const Purchases = await getRevenueCatPlugin();
        const result = await Purchases.getCustomerInfo();
        const customerInfo = result?.customerInfo || result;
        setSubscriptionFromCustomerInfo(customerInfo);

        const offerings = await Purchases.getOfferings();
        const current = offerings?.current;
        revenueCatPackage =
            current?.monthly ||
            current?.availablePackages?.[0] ||
            null;
    } catch (error) {
        console.warn("Erro ao consultar assinatura na Google Play:", error);
        subscription = null;
    }
}


const PREMIUM_ADMIN_EMAIL = "controlesfinanceirossuport@gmail.com";

function isPremiumActive() {
    const email = String(currentUser?.email || "").trim().toLowerCase();
    if (email === PREMIUM_ADMIN_EMAIL) return true;

    const status = String(subscription?.status || "").trim().toLowerCase();
    if (!["active", "trial", "premium"].includes(status)) return false;

    if (subscription?.expires_at) {
        return new Date(subscription.expires_at) > new Date();
    }
    return true;
}


function renderPremium() {
    const status = firstExisting(
        "premiumStatusText",
        "premiumStatus",
        "subscriptionStatus"
    );

    if (status) {
        if (isPremiumActive()) {
            status.textContent = "Premium ativo pela Google Play";
        } else if (!revenueCatReadyForRealPurchases()) {
            status.textContent = "Assinatura será ativada após configurar a Play Store";
        } else {
            status.textContent = "Plano gratuito";
        }
    }

    const buyButton = $("activatePremiumBtn");
    if (buyButton) {
        buyButton.textContent = isPremiumActive()
            ? "Premium ativo"
            : "Assinar Premium — R$ 29,99/mês";
        buyButton.disabled = isPremiumActive();
    }
}


async function purchasePremium() {
    if (!currentUser) {
        showToast("Faça login novamente.", "warning");
        return;
    }

    if (!revenueCatReadyForRealPurchases()) {
        showToast(
            "A assinatura ainda precisa ser conectada à Google Play.",
            "warning"
        );
        return;
    }

    try {
        if (!(await configureRevenueCat())) {
            throw new Error("RevenueCat não configurado");
        }

        const Purchases = await getRevenueCatPlugin();
        if (!revenueCatPackage) {
            const offerings = await Purchases.getOfferings();
            revenueCatPackage =
                offerings?.current?.monthly ||
                offerings?.current?.availablePackages?.[0] ||
                null;
        }

        if (!revenueCatPackage) {
            showToast("Plano mensal ainda não disponível na loja.", "warning");
            return;
        }

        const result = await Purchases.purchasePackage({
            aPackage: revenueCatPackage
        });

        setSubscriptionFromCustomerInfo(result?.customerInfo);
        renderPremium();
        applyPremiumAccess();

        if (isPremiumActive()) {
            showToast("Premium ativado com sucesso!", "success");
        }
    } catch (error) {
        if (error?.userCancelled) return;
        console.error("Erro na compra Premium:", error);
        showToast("Não foi possível concluir a assinatura.", "error");
    }
}


async function restorePremiumPurchases() {
    if (!revenueCatReadyForRealPurchases()) {
        showToast("A Google Play ainda não foi configurada.", "warning");
        return;
    }

    try {
        if (!(await configureRevenueCat())) {
            throw new Error("RevenueCat não configurado");
        }

        const Purchases = await getRevenueCatPlugin();
        const result = await Purchases.restorePurchases();
        const customerInfo = result?.customerInfo || result;
        setSubscriptionFromCustomerInfo(customerInfo);
        renderPremium();
        applyPremiumAccess();

        showToast(
            isPremiumActive()
                ? "Compra restaurada. Premium ativo!"
                : "Nenhuma assinatura Premium ativa foi encontrada.",
            isPremiumActive() ? "success" : "warning"
        );
    } catch (error) {
        console.error("Erro ao restaurar compras:", error);
        showToast("Não foi possível restaurar as compras.", "error");
    }
}


/* =========================================================
   METAS
   ========================================================= */

async function loadGoals() {

    if (!supabaseClient || !currentUser) {
        return;
    }


    try {

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
            console.warn(error);
            goals = [];
            return;
        }


        goals =
            Array.isArray(data)
                ? data
                : [];

        renderGoals();

    } catch (error) {

        console.warn(
            "Erro ao carregar metas:",
            error
        );
    }
}


function renderGoals() {

    const list =
        firstExisting(
            "goalsList",
            "goalList"
        );


    if (!list) return;


    if (!goals.length) {

        list.innerHTML = `
            <div class="empty-state">
                Nenhuma meta cadastrada.
            </div>
        `;

        return;
    }


    list.innerHTML =
        goals
            .map(goal => {

                const target =
                    Number(
                        goal.target_amount ??
                        goal.valor_meta ??
                        0
                    );


                const current =
                    Number(
                        goal.current_amount ??
                        goal.valor_atual ??
                        0
                    );


                const percentage =
                    target > 0
                        ? Math.min(
                            100,
                            current /
                            target *
                            100
                        )
                        : 0;


                return `
                    <div class="goal-item">

                        <strong>
                            ${escapeHTML(
                                goal.name ||
                                goal.nome ||
                                "Meta"
                            )}
                        </strong>

                        <div class="goal-progress">
                            <div
                                class="goal-progress-bar"
                                style="width:${percentage}%"
                            ></div>
                        </div>

                        <small>
                            ${formatCurrency(current)}
                            de
                            ${formatCurrency(target)}
                        </small>

                    </div>
                `;
            })
            .join("");
}


/* =========================================================
   ORÇAMENTOS
   ========================================================= */

async function loadBudgets() {

    if (!supabaseClient || !currentUser) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("budgets")
            .select("*")
            .eq("user_id", currentUser.id);


        if (error) {

            console.warn(
                "Não foi possível carregar orçamentos:",
                error
            );

            budgets = [];

            return;
        }


        budgets =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.warn(
            "Erro nos orçamentos:",
            error
        );
    }
}


/* =========================================================
   MODAIS
   ========================================================= */

function openModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );
}


function closeModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );
}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    /*
     * Evita que setupEvents seja executado
     * duas vezes e crie listeners duplicados.
     */

    if (eventsBound) {
        return;
    }

    eventsBound = true;


    /* -----------------------------------------
       LOGIN
       ----------------------------------------- */

    const loginForm =
        firstExisting(
            "loginForm"
        );

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }


    /* -----------------------------------------
       CADASTRO
       ----------------------------------------- */

    const registerForm =
        firstExisting(
            "registerForm"
        );

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );
    }


    /* -----------------------------------------
       TROCA LOGIN <-> CADASTRO
       ----------------------------------------- */

    const registerBtn =
        $("registerBtn");

    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showRegisterView();
            }
        );
    }


    const backToLoginBtn =
        $("backToLoginBtn");

    if (backToLoginBtn) {

        backToLoginBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showLoginView();
            }
        );
    }


    /* -----------------------------------------
       MOSTRAR / OCULTAR SENHA
       ----------------------------------------- */

    const passwordToggles =
        document.querySelectorAll(
            "[data-password-toggle]"
        );

    passwordToggles.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                togglePasswordVisibility(button);
            }
        );
    });


    /* -----------------------------------------
       LOGOUT
       ----------------------------------------- */

    const logoutBtn =
        firstExisting(
            "logoutBtn"
        );

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                handleLogout();
            }
        );
    }


    /* -----------------------------------------
       TEMA
       ----------------------------------------- */

    const themeBtn =
        firstExisting(
            "themeBtn",
            "themeToggle"
        );

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            toggleTheme
        );
    }


    /* -----------------------------------------
       MENU MOBILE
       ----------------------------------------- */

    const mobileMenuBtn =
        $("mobileMenuBtn");


    if (mobileMenuBtn) {

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            "false"
        );


        mobileMenuBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                toggleMobileMenu();
            }
        );
    }


    /* -----------------------------------------
       OVERLAY
       ----------------------------------------- */

    const overlay =
        getMobileOverlay();


    if (overlay) {

        overlay.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeMobileMenu();
            }
        );
    }


    /* -----------------------------------------
       EVENTO GLOBAL DE CLIQUES
       ----------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const target =
                event.target;


            if (
                !target ||
                typeof target.closest !==
                "function"
            ) {
                return;
            }


            /* ------------------------------
               NAVEGAÇÃO
               ------------------------------ */

            const nav =
                target.closest(
                    ".nav-item[data-section]"
                );


            if (
                nav &&
                !target.closest(".modal")
            ) {

                event.preventDefault();

                const section =
                    nav.dataset.section;

                if (section) {
                    showSection(section);
                }

                return;
            }


            /* ------------------------------
               BOTÕES GENÉRICOS DATA-SECTION
               ------------------------------ */

            const sectionButton =
                target.closest(
                    "button[data-section]"
                );


            if (
                sectionButton &&
                !target.closest(".modal")
            ) {

                event.preventDefault();

                showSection(
                    sectionButton.dataset.section
                );

                return;
            }


            /* ------------------------------
               FECHAR MENU AO CLICAR FORA
               ------------------------------ */

            const sidebar =
                $("sidebar");


            if (
                isMobileViewport() &&
                sidebar &&
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                const clickedInsideSidebar =
                    target.closest(
                        "#sidebar"
                    );


                const clickedButton =
                    target.closest(
                        "#mobileMenuBtn"
                    );


                const clickedOverlay =
                    target.closest(
                        "#mobileOverlay,.mobile-overlay"
                    );


                if (
                    !clickedInsideSidebar &&
                    !clickedButton &&
                    !clickedOverlay
                ) {

                    closeMobileMenu();
                }
            }


            /* ------------------------------
               EDITAR
               ------------------------------ */

            const editButton =
                target.closest(
                    "[data-edit-transaction]"
                );


            if (editButton) {

                const id =
                    editButton.dataset
                        .editTransaction;


                const transaction =
                    transactions.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (transaction) {

                    openTransactionModal(
                        transaction.type,
                        transaction
                    );
                }

                return;
            }


            /* ------------------------------
               EXCLUIR
               ------------------------------ */

            const deleteButton =
                target.closest(
                    "[data-delete-transaction]"
                );


            if (deleteButton) {

                deleteTransaction(
                    deleteButton.dataset
                        .deleteTransaction
                );

                return;
            }


            /* ------------------------------
               RECEBIDO
               ------------------------------ */

            const receivedButton =
                target.closest(
                    "[data-receivable-id]"
                );


            if (receivedButton) {

                markTransactionAsReceived(
                    receivedButton.dataset
                        .receivableId
                );

                return;
            }


            /* ------------------------------
               EXCLUIR CATEGORIA
               ------------------------------ */

            const deleteCategoryButton =
                target.closest(
                    "[data-delete-category]"
                );


            if (deleteCategoryButton) {

                deleteCategory(
                    deleteCategoryButton.dataset
                        .deleteCategory
                );

                return;
            }
        }
    );


    /* -----------------------------------------
       TIPO DA TRANSAÇÃO
       ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-transaction-type]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    setTransactionType(
                        button.dataset
                            .transactionType
                    );
                }
            );
        });


    /* -----------------------------------------
       FORM TRANSAÇÃO
       ----------------------------------------- */

    const transactionForm =
        firstExisting(
            "transactionForm",
            "launchForm"
        );


    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            saveTransaction
        );
    }


    /* -----------------------------------------
       BOTÕES NOVO LANÇAMENTO
       ----------------------------------------- */

    const newTransactionButtons =
        document.querySelectorAll(
            "#newTransactionBtn," +
            "#newLaunchBtn," +
            "#addTransactionBtn," +
            "#addTransactionBtn2," +
            "[data-new-transaction]"
        );


    newTransactionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openTransactionModal(
                        "expense"
                    );
                }
            );
        }
    );


    /* -----------------------------------------
       NOVA RECEITA
       ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-new-income]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openTransactionModal(
                        "income"
                    );
                }
            );
        });


    /* -----------------------------------------
       NOVA DESPESA
       ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-new-expense]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openTransactionModal(
                        "expense"
                    );
                }
            );
        });


    /* -----------------------------------------
       NOVO A RECEBER
       ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-new-receivable]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openNewReceivable();
                }
            );
        });


    /* -----------------------------------------
       CATEGORIA
       ----------------------------------------- */

    const categoryForm =
        firstExisting(
            "categoryForm"
        );


    if (categoryForm) {

        categoryForm.addEventListener(
            "submit",
            saveCategory
        );
    }


    /* -----------------------------------------
       PESQUISA
       ----------------------------------------- */

    const searchInput =
        firstExisting(
            "transactionSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderTransactions
        );
    }


    /* -----------------------------------------
       FILTRO TIPO
       ----------------------------------------- */

    const typeFilter =
        firstExisting(
            "transactionTypeFilter",
            "transactionFilter"
        );


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    /* -----------------------------------------
       FILTRO CATEGORIA
       ----------------------------------------- */

    const categoryFilter =
        firstExisting(
            "transactionCategoryFilter",
            "categoryFilter"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    /* -----------------------------------------
       BOTÕES DO DASHBOARD / AÇÕES
       ----------------------------------------- */
    ["addTransactionBtn", "addTransactionBtn2"].forEach(id => {
        const button = $(id);
        if (button && !button.dataset.bound) { button.dataset.bound = "true"; button.addEventListener("click", e => { e.preventDefault(); openTransactionModal("expense"); }); }
    });
    ["addCategoryBtn", "addCategoryBtn2"].forEach(id => {
        const button = $(id);
        if (button && !button.dataset.bound) { button.dataset.bound = "true"; button.addEventListener("click", e => { e.preventDefault(); openModal("categoryModal"); }); }
    });
    const goalButton = $("addGoalBtn");
    if (goalButton && !goalButton.dataset.bound) { goalButton.dataset.bound = "true"; goalButton.addEventListener("click", e => { e.preventDefault(); openModal("goalModal"); }); }
    const receivableButton = $("addReceivableBtn");
    if (receivableButton && !receivableButton.dataset.bound) { receivableButton.dataset.bound = "true"; receivableButton.addEventListener("click", e => { e.preventDefault(); openNewReceivable(); }); }
    const goalForm = $("goalForm");
    if (goalForm && !goalForm.dataset.bound) { goalForm.dataset.bound = "true"; goalForm.addEventListener("submit", saveGoal); }
    const confirmPremium = $("confirmPremiumBtn");
    if (confirmPremium && !confirmPremium.dataset.bound) { confirmPremium.dataset.bound = "true"; confirmPremium.addEventListener("click", purchasePremium); }
    const clearFilters = $("clearTransactionFiltersBtn");
    if (clearFilters && !clearFilters.dataset.bound) { clearFilters.dataset.bound = "true"; clearFilters.addEventListener("click", () => { ["transactionSearch","transactionFilter","categoryFilter","transactionDateFrom","transactionDateTo"].forEach(id => { const el=$(id); if(el) el.value = id === "transactionFilter" || id === "categoryFilter" ? "all" : ""; }); renderTransactions(); }); }
    ["transactionFilter","categoryFilter","transactionDateFrom","transactionDateTo"].forEach(id => { const el=$(id); if(el && !el.dataset.bound){ el.dataset.bound="true"; el.addEventListener("change", renderTransactions); }});

    /* -----------------------------------------
       FECHAR MODAIS
       ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const modalId = button.dataset.closeModal;

                    if (modalId) {
                        closeModal(modalId);
                    } else {
                        const modal = button.closest(".modal");
                        if (modal) {
                            modal.classList.add("hidden");
                            modal.setAttribute("aria-hidden", "true");
                        }

                        if (modal?.id === "transactionModal") {
                            editingTransactionId = null;
                        }
                    }
                }
            );
        });


    /* -----------------------------------------
       ESC
       ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            const sidebar =
                $("sidebar");


            if (
                sidebar &&
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMobileMenu();

                return;
            }


            document
                .querySelectorAll(
                    ".modal:not(.hidden)"
                )
                .forEach(modal => {

                    modal.classList.add(
                        "hidden"
                    );
                });
        }
    );


    /* -----------------------------------------
       RESIZE
       ----------------------------------------- */

    window.addEventListener(
        "resize",
        () => {

            applyDeviceLayout();

            if (!isMobileViewport()) {
                closeMobileMenu();
            }
        }
    );


    /*
     * Começa sempre com o menu fechado.
     */

    closeMobileMenu();
}


/* =========================================================
   BOTÃO DE MOSTRAR/ESCONDER SENHA
   ========================================================= */

function setupPasswordToggles() {

    document
        .querySelectorAll(
            "[data-toggle-password]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset
                            .togglePassword;


                    const input =
                        $(targetId);


                    if (!input) return;


                    input.type =
                        input.type === "password"
                            ? "text"
                            : "password";
                }
            );
        });
}


/* =========================================================
   ABRIR MODAIS PELO ID
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const openButton =
            target.closest(
                "[data-open-modal]"
            );


        if (openButton) {

            event.preventDefault();

            openModal(
                openButton.dataset
                    .openModal
            );

            return;
        }


        const closeButton =
            target.closest(
                "[data-close]"
            );


        if (closeButton) {

            event.preventDefault();

            closeModal(
                closeButton.dataset.close
            );
        }
    }
);


/* =========================================================
   FECHAR MODAL CLICANDO NO FUNDO
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            target &&
            target.classList &&
            target.classList.contains(
                "modal"
            )
        ) {

            target.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================================================
   BOTÃO ADICIONAR RECEITA / DESPESA
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const incomeButton =
            target.closest(
                "#addIncomeBtn,[data-add-income]"
            );


        if (incomeButton) {

            event.preventDefault();

            openTransactionModal(
                "income"
            );

            return;
        }


        const expenseButton =
            target.closest(
                "#addExpenseBtn,[data-add-expense]"
            );


        if (expenseButton) {

            event.preventDefault();

            openTransactionModal(
                "expense"
            );
        }
    }
);


/* =========================================================
   BOTÃO NOVA CATEGORIA
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const button =
            target.closest(
                "#newCategoryBtn,[data-new-category]"
            );


        if (button) {

            event.preventDefault();

            openModal(
                "categoryModal"
            );
        }
    }
);


/* =========================================================
   BOTÃO NOVA META
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const button =
            target.closest(
                "#newGoalBtn,[data-new-goal]"
            );


        if (button) {

            event.preventDefault();

            openModal(
                "goalModal"
            );
        }
    }
);


/* =========================================================
   PREMIUM
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const buyButton =
            target.closest(
                "#activatePremiumBtn," +
                "#confirmPremiumBtn," +
                "[data-purchase-premium]"
            );

        if (buyButton) {
            event.preventDefault();
            purchasePremium();
            return;
        }

        const restoreButton =
            target.closest(
                "#restorePurchasesBtn," +
                "[data-restore-purchases]"
            );

        if (restoreButton) {
            event.preventDefault();
            restorePremiumPurchases();
        }
    }
);


/* =========================================================
   EXPORTAR DADOS
   ========================================================= */

function exportTransactionsCSV() {

    if (!transactions.length) {

        showToast(
            "Não existem lançamentos para exportar.",
            "warning"
        );

        return;
    }


    const rows = [
        [
            "Data",
            "Descrição",
            "Categoria",
            "Tipo",
            "Valor"
        ]
    ];


    transactions.forEach(transaction => {

        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.tipo
            );


        rows.push([
            getTransactionDate(transaction),

            getTransactionDescription(
                transaction
            ),

            getTransactionCategory(
                transaction
            ),

            type === "income"
                ? "Receita"
                : "Despesa",

            getTransactionAmount(
                transaction
            )
        ]);
    });


    const csv =
        rows
            .map(row =>
                row
                    .map(value =>
                        `"${String(value)
                            .replace(/"/g, '""')}"`
                    )
                    .join(";")
            )
            .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
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
        "controles-lancamentos.csv";


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
   EXPORTAR
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !==
            "function"
        ) {
            return;
        }


        const button =
            target.closest(
                "#exportTransactionsBtn," +
                "[data-export-transactions]"
            );


        if (button) {

            event.preventDefault();

            exportTransactionsCSV();
        }
    }
);




/* =========================================================
   CONTROLES — ACESSO PREMIUM
   GRÁTIS:
   - Início
   - Lançamentos
   - A Receber

   PREMIUM:
   - Categorias
   - Relatórios
   - Assessor WhatsApp
   - Relatório com IA
   ========================================================= */


function openPremiumAccess() {

    closeMobileMenu();

    showToast(
        "🔒 Este recurso faz parte do ControleS Premium.",
        "warning"
    );

    showSection("premium");
}


function applyPremiumAccess() {

    const premium =
        isPremiumActive();


    document.body.classList.toggle(
        "free-plan",
        !premium
    );

    document.body.classList.toggle(
        "premium-plan",
        premium
    );


    /* =====================================================
       MENUS PREMIUM
       ===================================================== */

    const blockedSections = [
        "categories",
        "reports",
        "whatsapp",
        "ai-report"
    ];


    document
        .querySelectorAll(
            ".nav-item[data-section]"
        )
        .forEach(button => {

            const section =
                button.dataset.section;

            const locked =
                !premium &&
                blockedSections.includes(
                    section
                );


            button.classList.toggle(
                "premium-locked",
                locked
            );


            if (locked) {

                button.setAttribute(
                    "data-premium-locked",
                    "true"
                );

            } else {

                button.removeAttribute(
                    "data-premium-locked"
                );
            }
        });


    /* =====================================================
       AÇÕES PREMIUM
       ===================================================== */

    [
        "addCategoryBtn",
        "addCategoryBtn2"
    ].forEach(id => {

        const button = $(id);

        if (!button) return;


        button.classList.toggle(
            "premium-locked",
            !premium
        );


        button.classList.toggle(
            "premium-content-hidden",
            !premium
        );


        if (!premium) {

            button.setAttribute(
                "data-premium-locked",
                "true"
            );

        } else {

            button.removeAttribute(
                "data-premium-locked"
            );
        }
    });


    /* =====================================================
       CONTEÚDO PREMIUM DO DASHBOARD
       ===================================================== */

    const premiumContent = [
        "#receivableDashboardCard",
        "#premiumDashboardContent"
    ];


    premiumContent.forEach(selector => {

        document
            .querySelectorAll(selector)
            .forEach(element => {

                element.classList.toggle(
                    "premium-content-hidden",
                    !premium
                );
            });
    });


    // Relatórios: exibe conteúdo e oculta o aviso apenas com Premium ativo.
    const reportGate = $("premiumReportContent");
    const reportBody = $("normalReportContent");
    const reportIntro = $("primeReportsIntro");
    if (reportGate) reportGate.hidden = premium;
    if (reportBody) reportBody.hidden = !premium;
    if (reportIntro) reportIntro.hidden = !premium;

    // Cadeados visuais não devem aparecer para assinantes Premium.
    document.querySelectorAll(".nav-item .nav-lock").forEach(lock => {
        lock.hidden = premium;
        lock.style.display = premium ? "none" : "";
    });

    /* No plano grátis, o resumo e os últimos lançamentos continuam visíveis.
       Apenas o gráfico avançado fica reservado ao Premium. */
    const financeCanvas = $("financeChart");
    const financePanel = financeCanvas ? financeCanvas.closest("article.panel") : null;

    if (financePanel) {
        financePanel.classList.toggle("premium-content-hidden", !premium);
    }

    const summaryGrid = document.querySelector("#dashboardSection > .summary-grid");
    if (summaryGrid) {
        summaryGrid.classList.remove("premium-content-hidden");
    }

    const recentList = $("recentTransactions");
    const recentPanel = recentList ? recentList.closest("article.panel") : null;
    if (recentPanel) {
        recentPanel.classList.remove("premium-content-hidden");
    }


    /* Lançamentos e A Receber continuam disponíveis no plano grátis. */
    [
        "addTransactionBtn",
        "addTransactionBtn2",
        "addReceivableBtn"
    ].forEach(id => {
        const button = $(id);
        if (!button) return;
        button.classList.remove("premium-content-hidden", "premium-locked");
        button.removeAttribute("data-premium-locked");
    });


    /* =====================================================
       RECEITA E DESPESA SEMPRE LIVRES
       ===================================================== */

    const quickActions =
        document.querySelector(
            ".quick-actions"
        );


    if (quickActions) {

        quickActions.classList.remove(
            "premium-content-hidden"
        );

        quickActions.style.display =
            "grid";
    }


    document
        .querySelectorAll(
            '.quick-action[data-action="add-income"],' +
            '.quick-action[data-action="add-expense"]'
        )
        .forEach(button => {

            button.classList.remove(
                "premium-content-hidden",
                "premium-locked"
            );

            button.removeAttribute(
                "data-premium-locked"
            );

            button.style.display = "";
            button.style.opacity = "1";
        });
}


/* =========================================================
   BLOQUEIO DOS CLIQUES PREMIUM
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
         * Premium ativo:
         * sistema funciona normalmente.
         */

        if (isPremiumActive()) {
            return;
        }


        const target =
            event.target;


        if (
            !target ||
            typeof target.closest !== "function"
        ) {
            return;
        }


        /* =================================================
           RECEITA / DESPESA — GRÁTIS
           ================================================= */

        const freeAction =
            target.closest(
                '.quick-action[data-action="add-income"],' +
                '.quick-action[data-action="add-expense"],' +
                '#addIncomeBtn,' +
                '#addExpenseBtn,' +
                '[data-add-income],' +
                '[data-add-expense]'
            );


        if (freeAction) {

            event.preventDefault();

            /*
             * Impede os listeners antigos
             * de executarem novamente o clique.
             */
            event.stopPropagation();
            event.stopImmediatePropagation();


            const isIncome =
                freeAction.matches(
                    '.quick-action[data-action="add-income"],' +
                    '#addIncomeBtn,' +
                    '[data-add-income]'
                );


            openTransactionModal(
                isIncome
                    ? "income"
                    : "expense"
            );


            return;
        }


        /* =================================================
           PREMIUM CONTINUA ACESSÍVEL
           ================================================= */

        const premiumPage =
            target.closest(
                '[data-section="premium"]'
            );


        if (premiumPage) {
            return;
        }


        /* =================================================
           LANÇAMENTOS E A RECEBER — SEMPRE GRÁTIS
           ================================================= */

        const freeSection =
            target.closest(
                '[data-section="transactions"],' +
                '[data-section="receivable"]'
            );

        if (freeSection) {
            return;
        }


        const freeFinancialAction =
            target.closest(
                '#addTransactionBtn,' +
                '#addTransactionBtn2,' +
                '#addReceivableBtn,' +
                '[data-edit-transaction],' +
                '[data-delete-transaction],' +
                '[data-edit-receivable],' +
                '[data-delete-receivable],' +
                '[data-mark-received],' +
                '[data-receivable-action]'
            );

        if (freeFinancialAction) {
            return;
        }


        /* =================================================
           SEÇÕES BLOQUEADAS
           ================================================= */

        const blockedSection =
            target.closest(
                '[data-section="categories"],' +
                '[data-section="reports"],' +
                '[data-section="whatsapp"],' +
                '[data-section="ai-report"]'
            );


        /* =================================================
           AÇÕES BLOQUEADAS
           ================================================= */

        const blockedAction =
            target.closest(
                '[data-premium-locked="true"],' +
                '#addCategoryBtn,' +
                '#addCategoryBtn2,' +
                '[data-delete-category],' +
                '#exportTransactionsBtn,' +
                '[data-export-transactions]'
            );


        if (
            blockedSection ||
            blockedAction
        ) {

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            openPremiumAccess();

            return;
        }

    },
    true
);


/* =========================================================
   ESTILO PREMIUM
   ========================================================= */

(function createPremiumAccessStyles() {

    if (
        document.getElementById(
            "controlesPremiumAccessStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "controlesPremiumAccessStyles";


    style.textContent = `

        .premium-content-hidden {
            display: none !important;
        }


        .premium-locked {
            position: relative;
            opacity: .68;
        }


        /* O cadeado visual já existe no HTML.
           Não adicionamos outro via CSS para evitar cadeado duplicado. */
        .free-plan
        .nav-item.premium-locked::after {
            content: none;
        }


        .free-plan .quick-actions {
            display: grid !important;
            grid-template-columns:
                repeat(2, minmax(0, 1fr));
        }


        .free-plan
        .quick-action[data-action="add-income"],

        .free-plan
        .quick-action[data-action="add-expense"] {

            display: flex !important;
            opacity: 1 !important;
            visibility: visible !important;
        }


        @media screen and (max-width: 400px) {

            .free-plan .quick-actions {

                grid-template-columns:
                    1fr;
            }
        }
    `;


    document.head.appendChild(
        style
    );

})();


/* =========================================================
   ATUALIZAR ACESSO AO VOLTAR PARA A TELA
   ========================================================= */

window.addEventListener(
    "focus",
    () => {

        if (currentUser) {

            applyPremiumAccess();
        }
    }
);

/* =========================================================
   FIM DO APP.JS
   ========================================================= */

/* =========================================================
   CONTROLES — RELATÓRIO INTELIGENTE / WHATSAPP — PATCH 6.0
   ========================================================= */

function getAIReportPeriod() {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    return { start, end: todayISO(), label: now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) };
}

function buildAIReportData() {
    const period = getAIReportPeriod();
    const current = calculatePeriodSummary(period);
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    const previous = getMonthlyTotals(previousDate.getFullYear(), previousDate.getMonth());
    const ranking = {};

    transactions.forEach(transaction => {
        if (!transactionIsInPeriod(transaction, period)) return;
        const type = normalizeTransactionType(transaction.type || transaction.tipo || transaction.transaction_type);
        if (type !== "expense") return;
        const category = getTransactionCategory(transaction);
        ranking[category] = (ranking[category] || 0) + getTransactionAmount(transaction);
    });

    const categories = Object.entries(ranking).sort((a,b) => b[1] - a[1]);
    const receivable = getReceivableSummary();
    return { period, current, previous, categories, receivable };
}

function renderAIReport(showMessage = false) {
    const data = buildAIReportData();
    const { period, current, previous, categories, receivable } = data;
    const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };

    setText("aiPeriodLabel", period.label.charAt(0).toUpperCase() + period.label.slice(1));
    setText("aiIncomeValue", formatCurrency(current.income));
    setText("aiExpenseValue", formatCurrency(current.expense));
    setText("aiBalanceValue", formatCurrency(current.balance));
    setText("aiReceivableValue", formatCurrency(receivable.total));

    const expenseDelta = previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : null;
    if (expenseDelta === null) setText("aiExpenseTrend", "Sem base no mês anterior");
    else if (expenseDelta > 0) setText("aiExpenseTrend", `↑ ${Math.abs(expenseDelta).toFixed(1)}% vs. mês anterior`);
    else if (expenseDelta < 0) setText("aiExpenseTrend", `↓ ${Math.abs(expenseDelta).toFixed(1)}% vs. mês anterior`);
    else setText("aiExpenseTrend", "Mesmo nível do mês anterior");

    const headline = current.income === 0 && current.expense === 0
        ? "Adicione lançamentos para começar"
        : current.balance >= 0
            ? "Seu mês está com saldo positivo"
            : "Seus gastos superaram suas receitas";
    setText("aiHeadline", headline);

    const bars = $("aiCategoryBars");
    if (bars) {
        if (!categories.length) {
            bars.innerHTML = '<div class="ai-empty-mini">Adicione despesas para visualizar.</div>';
        } else {
            const max = categories[0][1] || 1;
            bars.innerHTML = categories.slice(0,5).map(([name, value]) => `
                <div class="ai-category-row">
                    <div><strong>${escapeHTML(name)}</strong><span>${formatCurrency(value)}</span></div>
                    <div class="ai-category-track"><i style="width:${Math.max(5, (value/max)*100)}%"></i></div>
                </div>`).join("");
        }
    }

    const insights = [];
    if (categories.length) insights.push(["01", `${categories[0][0]} lidera seus gastos`, `${formatCurrency(categories[0][1])} gastos nessa categoria neste mês.`]);
    if (expenseDelta !== null) insights.push(["02", expenseDelta <= 0 ? "Seus gastos diminuíram" : "Seus gastos aumentaram", `${Math.abs(expenseDelta).toFixed(1)}% em relação ao mês anterior.`]);
    if (receivable.total > 0) insights.push(["03", "Você tem valores a receber", `${formatCurrency(receivable.total)} previstos em ${receivable.count} lançamento(s).`]);
    if (!insights.length && (current.income || current.expense)) insights.push(["01", "Acompanhamento iniciado", "Continue registrando movimentações para enriquecer sua análise."]);

    const list = $("aiInsightsList");
    if (list) {
        list.innerHTML = insights.length ? insights.map(([n,t,d], idx) => `
            <div class="ai-insight-pro ${idx === 1 && expenseDelta <= 0 ? "positive" : ""}">
                <i>${n}</i><div><b>${escapeHTML(t)}</b><small>${escapeHTML(d)}</small></div>
            </div>`).join("") : '<div class="ai-insight-pro"><i>01</i><div><b>Sem dados suficientes</b><small>Adicione lançamentos para gerar uma análise personalizada.</small></div></div>';
    }

    let score = null;
    if (current.income > 0 || current.expense > 0) {
        const ratio = current.income > 0 ? current.expense / current.income : 2;
        score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, ratio - .5) * 80)));
    }
    setText("aiHealthScore", score === null ? "—" : `${score}/100`);
    setText("aiHealthText", score === null ? "O índice aparecerá quando houver dados financeiros no período." : score >= 75 ? "Boa margem entre receitas e despesas no período." : score >= 50 ? "Atenção ao peso das despesas sobre sua renda." : "As despesas estão pressionando bastante o seu orçamento.");
    setText("aiReportBadge", "ATUALIZADO AGORA");

    if (showMessage) showToast("Análise atualizada com seus lançamentos.", "success");
}

function updateWhatsAppPreview() {
    const totals = getMonthlyTotals(new Date().getFullYear(), new Date().getMonth());
    const ranking = {};
    transactions.forEach(t => {
        const d = getTransactionDate(t); if (!d) return;
        const dt = new Date(`${d}T00:00:00`); const now = new Date();
        if (dt.getMonth() !== now.getMonth() || dt.getFullYear() !== now.getFullYear()) return;
        if (normalizeTransactionType(t.type || t.tipo) !== "expense") return;
        const c = getTransactionCategory(t); ranking[c] = (ranking[c] || 0) + getTransactionAmount(t);
    });
    const top = Object.entries(ranking).sort((a,b)=>b[1]-a[1])[0];
    const expense = $("waPreviewExpense"); if (expense) expense.textContent = formatCurrency(totals.expense);
    const cat = $("waPreviewCategory"); if (cat) cat.textContent = top ? `${top[0]} é sua maior categoria no mês.` : "Cadastre lançamentos para ver sua maior categoria.";
}

(function bindSmartFeatureButtons(){
    document.addEventListener("click", event => {
        const ai = event.target.closest?.("#generateAIReportBtn");
        if (ai) { event.preventDefault(); if (!isPremiumActive()) return openPremiumAccess(); renderAIReport(true); return; }
        const wa = event.target.closest?.("#whatsappPrimaryBtn");
        if (wa) { event.preventDefault(); if (!isPremiumActive()) return openPremiumAccess(); updateWhatsAppPreview(); showToast("A interface está pronta. Falta conectar a API oficial do WhatsApp.", "info"); }
    });
})();

const _showSectionControleS = showSection;
showSection = function(sectionName) {
    _showSectionControleS(sectionName);
    if (sectionName === "ai-report" && isPremiumActive()) renderAIReport(false);
    if (sectionName === "whatsapp" && isPremiumActive()) updateWhatsAppPreview();
};


/* =========================================================
   CONTROLES — NAVEGAÇÃO MOBILE DA DEMO / PERFIL
   ========================================================= */
(function setupDemoMobileNavigation(){
  function syncBottomNav(section){
    document.querySelectorAll('[data-bottom-section]').forEach(btn=>btn.classList.toggle('active',btn.dataset.bottomSection===section));
  }
  document.addEventListener('click', async function(event){
    const bottom=event.target.closest?.('[data-bottom-section]');
    if(bottom){event.preventDefault();const section=bottom.dataset.bottomSection;showSection(section);syncBottomNav(section);return;}
    if(event.target.closest?.('#mobileAddButton')){event.preventDefault();openTransactionModal('expense');return;}
    if(event.target.closest?.('#profileThemeBtn')){event.preventDefault();toggleTheme();return;}
    if(event.target.closest?.('#profileClearTransactionsBtn')){event.preventDefault();openClearTransactionsModal();return;}
    if(event.target.closest?.('#profileLogoutBtn')){event.preventDefault();await handleLogout();return;}
  });
  const originalShowSection=window.showSection;
  if(typeof originalShowSection==='function'){
    window.showSection=function(sectionName){originalShowSection(sectionName);syncBottomNav(sectionName);};
  }
})();

/* Saudação mobile com o nome real da conta */
(function enhanceMobileGreeting(){
  const original=window.updateUserInterface;
  if(typeof original!=='function') return;
  window.updateUserInterface=function(){
    original();
    const name=currentProfile?.name||currentUser?.user_metadata?.name||currentUser?.email?.split('@')[0]||'Usuário';
    const first=String(name).trim().split(/\s+/)[0];
    const welcome=document.getElementById('welcomeMessage');
    if(welcome) welcome.textContent=`Olá, ${first} 👋`;
  };
})();


/* =========================================================
   CONTROLES — PATCH MOBILE 7.0
   Boas-vindas, limpeza por período e navegação
   ========================================================= */
(function setupMobileV7(){
    document.addEventListener("click", async (event) => {
        if (event.target.closest?.("#welcomeLoginBtn")) { event.preventDefault(); showLoginView(); return; }
        if (event.target.closest?.("#welcomeRegisterBtn")) { event.preventDefault(); showRegisterView(); return; }
        if (event.target.closest?.("#clearTransactionsBtn")) { event.preventDefault(); openClearTransactionsModal(); return; }
        const clearButton = event.target.closest?.("[data-clear-transactions]");
        if (clearButton) { event.preventDefault(); await clearTransactionsByPeriod(clearButton.dataset.clearTransactions); }
    });
})();

function openClearTransactionsModal(){
    const modal = $("clearTransactionsModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function closeClearTransactionsModal(){
    const modal = $("clearTransactionsModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

function requestDeleteConfirmation(message){
    return new Promise(resolve => {
        const modal = $("confirmDeleteModal");
        const text = $("confirmDeleteText");
        const cancel = $("cancelDeleteBtn");
        const confirmBtn = $("confirmDeleteBtn");
        if (!modal || !cancel || !confirmBtn) { resolve(false); return; }
        if (text) text.textContent = message;
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        const finish = value => {
            modal.classList.add("hidden");
            modal.setAttribute("aria-hidden", "true");
            cancel.onclick = null; confirmBtn.onclick = null;
            resolve(value);
        };
        cancel.onclick = () => finish(false);
        confirmBtn.onclick = () => finish(true);
    });
}

async function clearTransactionsByPeriod(period){
    if (!supabaseClient || !currentUser) return;
    const today = todayISO();
    const startOfWeek = (() => { const d = new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })();
    const monthStart = today.slice(0,7) + "-01";
    const labels = { today:"de hoje", week:"dos últimos 7 dias", month:"deste mês", all:"de todo o período" };
    const confirmed = await requestDeleteConfirmation(`Excluir os lançamentos ${labels[period] || "selecionados"}? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    try {
        let query = supabaseClient.from("transactions").delete().eq("user_id", currentUser.id);
        if (period === "today") query = query.eq("date", today);
        else if (period === "week") query = query.gte("date", startOfWeek).lte("date", today);
        else if (period === "month") query = query.gte("date", monthStart).lte("date", today);
        else if (period !== "all") return;
        const { error } = await query;
        if (error) throw error;
        closeClearTransactionsModal();
        await loadTransactions();
        updateDashboard(); renderTransactions(); renderReceivables(); updateReceivableDashboard(); updatePeriodSummary(); renderReports();
        showToast("Lançamentos excluídos com sucesso.", "success");
    } catch (error) {
        console.error(error);
        showToast(error.message || "Não foi possível excluir os lançamentos.", "error");
    }
}

/* =========================================================
   CONTROLES MOBILE 10 — CORREÇÕES DE AÇÕES RÁPIDAS E MODAIS
   ========================================================= */
(function controlesMobile10Fixes(){
  function openCleanModal(id){
    const modal=document.getElementById(id); if(!modal)return;
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    const card=modal.querySelector('.modal-card'); if(card) card.scrollTop=0;
  }
  function prepareCategory(){
    const form=document.getElementById('categoryForm'); if(form) form.reset();
    const msg=document.getElementById('categoryMessage'); if(msg) msg.textContent='';
    openCleanModal('categoryModal');
    setTimeout(()=>document.getElementById('categoryName')?.focus({preventScroll:true}),120);
  }
  function prepareGoal(){
    const form=document.getElementById('goalForm'); if(form) form.reset();
    const msg=document.getElementById('goalMessage'); if(msg) msg.textContent='';
    openCleanModal('goalModal');
    setTimeout(()=>document.getElementById('goalName')?.focus({preventScroll:true}),120);
  }
  document.addEventListener('click',function(e){
    const el=e.target.closest?.('button,a'); if(!el)return;
    const action=el.dataset.action;
    if(action==='add-income'){e.preventDefault();e.stopPropagation();openTransactionModal('income');return;}
    if(action==='add-expense'){e.preventDefault();e.stopPropagation();openTransactionModal('expense');return;}
    if(el.id==='addCategoryBtn'||el.id==='addCategoryBtn2'||el.matches('[data-new-category]')){e.preventDefault();e.stopPropagation();prepareCategory();return;}
    if(el.id==='addGoalBtn'||el.id==='newGoalBtn'||el.matches('[data-new-goal]')){e.preventDefault();e.stopPropagation();prepareGoal();return;}
  },true);
  document.addEventListener('click',function(e){
    const typeBtn=e.target.closest?.('[data-transaction-type]'); if(!typeBtn)return;
    const type=typeBtn.dataset.transactionType; setTransactionType(type);
    const title=document.getElementById('transactionModalTitle');
    if(title&&!editingTransactionId) title.textContent=normalizeTransactionType(type)==='income'?'Nova receita':'Nova despesa';
  });
})();


/* CONTROLES MOBILE 11 — CTAs de demonstração Premium */
document.addEventListener('click', function(e){
  const btn=e.target.closest?.('[data-premium-preview]');
  if(!btn) return;
  e.preventDefault();
  const activate=document.getElementById('activatePremiumBtn');
  if(activate){ activate.click(); return; }
  const modal=document.getElementById('premiumModal');
  if(modal){ modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); }
});


/* =========================================================
   CONTROLES MOBILE 12 — INTERAÇÕES DA HOME E LOGIN
   ========================================================= */
(function(){
  const $m12=id=>document.getElementById(id);
  const filter=$m12('dashboardPeriodFilter');
  const quick=$m12('periodQuickBtn');
  const quickLabel=$m12('periodQuickLabel');
  const activeLabel=$m12('activePeriodLabel');
  function syncPeriodLabel(){
    if(!quickLabel) return;
    const select=$m12('dashboardPeriod');
    const txt=select && select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : 'Últimos 30 dias';
    quickLabel.textContent=txt;
  }
  function setFilter(open){
    if(!filter||!quick) return;
    filter.classList.toggle('period-sheet-collapsed',!open);
    quick.setAttribute('aria-expanded',String(open));
  }
  quick?.addEventListener('click',()=>setFilter(filter?.classList.contains('period-sheet-collapsed')));
  $m12('applyPeriodBtn')?.addEventListener('click',()=>{syncPeriodLabel();setTimeout(()=>setFilter(false),120);});
  $m12('clearPeriodBtn')?.addEventListener('click',()=>{setTimeout(()=>{syncPeriodLabel();setFilter(false)},120);});
  $m12('dashboardPeriod')?.addEventListener('change',syncPeriodLabel);
  syncPeriodLabel();

  // Insight abre a análise; o bloqueio Premium existente continua valendo.
  $m12('homeInsightBtn')?.addEventListener('click',()=>{
    const nav=document.querySelector('[data-section="ai-report"]');
    if(nav) nav.click();
  });

  // Atualiza o texto do insight com os valores já calculados na Home.
  function moneyText(id){return ($m12(id)?.textContent||'R$ 0,00').trim()}
  function updateInsight(){
    const title=$m12('homeInsightTitle'), text=$m12('homeInsightText');
    if(!title||!text) return;
    const income=moneyText('incomeValue'), expense=moneyText('expenseValue');
    title.textContent='Resumo do período';
    text.textContent=`Você recebeu ${income} e gastou ${expense}. Toque para ver a análise inteligente.`;
  }
  ['incomeValue','expenseValue'].forEach(id=>{const el=$m12(id);if(el)new MutationObserver(updateInsight).observe(el,{childList:true,subtree:true,characterData:true})});
  updateInsight();

  // Feedback moderno do olho da senha, preservando o listener original.
  document.querySelectorAll('[data-password-toggle]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const input=$m12(btn.getAttribute('data-password-toggle'));
      setTimeout(()=>{
        const visible=input?.type==='text';
        btn.setAttribute('aria-pressed',String(visible));
        btn.setAttribute('aria-label',visible?'Ocultar senha':'Mostrar senha');
      },0);
    });
  });
})();

/* =========================================================
   CONTROLES MOBILE 15.1 — CADEADO PREMIUM NOS ATALHOS
   ========================================================= */
(function controlesPremiumShortcutLock(){
  function syncPremiumShortcutLocks(){
    const premium = typeof isPremiumActive === 'function' && isPremiumActive();
    document.querySelectorAll('[data-premium-home="true"]').forEach(btn=>{
      btn.classList.toggle('premium-locked', !premium);
      if(!premium) btn.setAttribute('data-premium-locked','true');
      else btn.removeAttribute('data-premium-locked');
      const lock=btn.querySelector('.premium-diamond');
      if(lock){
        lock.setAttribute('aria-label', premium ? 'Premium desbloqueado' : 'Recurso Premium bloqueado');
        lock.title=premium ? 'Premium desbloqueado' : 'Recurso Premium';
      }
    });
    document.querySelectorAll('.nav-lock').forEach(lock=>{
      lock.setAttribute('aria-label', premium ? 'Premium desbloqueado' : 'Recurso Premium bloqueado');
      lock.title=premium ? 'Premium desbloqueado' : 'Recurso Premium';
    });
  }
  document.addEventListener('click',function(e){
    const shortcut=e.target.closest?.('[data-premium-home="true"]');
    if(!shortcut) return;
    const premium=typeof isPremiumActive === 'function' && isPremiumActive();
    if(!premium){
      e.preventDefault();e.stopImmediatePropagation();
      if(typeof openPremiumAccess === 'function') openPremiumAccess();
    }
  },true);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(syncPremiumShortcutLocks,100));
  window.addEventListener('load',()=>setTimeout(syncPremiumShortcutLocks,250));
  const oldApply=window.applyPremiumAccess;
  if(typeof oldApply==='function'){
    window.applyPremiumAccess=function(){const r=oldApply.apply(this,arguments);syncPremiumShortcutLocks();return r;};
  }
})();


/* =========================================================
   CONTROLES — NAVEGAÇÃO DE SEGURANÇA
   Garante ação nos botões declarativos sem duplicar eventos.
   ========================================================= */
document.addEventListener("click", function controlesNavigationFallback(event){
  const button = event.target.closest("button[data-section]");
  if (!button) return;

  const section = button.dataset.section;
  if (!section) return;

  /* Os listeners principais continuam tendo prioridade.
     Este fallback só atua quando a navegação declarativa existe. */
  if (button.dataset.premiumLocked === "true" && typeof isPremiumActive === "function" && !isPremiumActive()){
    if (typeof openPremiumAccess === "function") openPremiumAccess();
    return;
  }

  if (typeof showSection === "function"){
    showSection(section);
  }
});


/* =========================================================
   CONTROLES — APARÊNCIA + WHATSAPP FLUTUANTE
   ========================================================= */
(function(){
  const STORAGE_KEY = "controles_theme_preference";
  const root = document.documentElement;
  const systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function savedTheme(){
    return localStorage.getItem(STORAGE_KEY) || "dark";
  }

  function effectiveTheme(choice){
    if(choice === "system"){
      return systemDark && systemDark.matches ? "dark" : "light";
    }
    return choice === "light" ? "light" : "dark";
  }

  function applyTheme(choice, save){
    const valid = ["light","dark","system"].includes(choice) ? choice : "dark";
    root.dataset.controlesTheme = effectiveTheme(valid);
    root.dataset.controlesThemeChoice = valid;
    if(save) localStorage.setItem(STORAGE_KEY, valid);

    document.querySelectorAll("[data-theme-choice]").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.themeChoice === valid);
    });
  }

  applyTheme(savedTheme(), false);

  if(systemDark){
    const onSystemChange = () => {
      if(savedTheme() === "system") applyTheme("system", false);
    };
    if(systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
    else if(systemDark.addListener) systemDark.addListener(onSystemChange);
  }

  function appearanceTrigger(){
    return Array.from(document.querySelectorAll("button, a, [role='button']")).find(el=>{
      const txt = (el.textContent || "").trim().toLowerCase();
      return txt.includes("aparência") || txt.includes("aparencia");
    });
  }

  function openAppearance(){
    const modal = document.getElementById("appearanceModal");
    if(!modal) return;
    applyTheme(savedTheme(), false);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  }

  function closeAppearance(){
    const modal = document.getElementById("appearanceModal");
    if(!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  document.addEventListener("click", function(e){
    const trigger = e.target.closest("button, a, [role='button']");
    const appTrigger = appearanceTrigger();

    if(trigger && appTrigger && trigger === appTrigger){
      e.preventDefault();
      e.stopPropagation();
      openAppearance();
      return;
    }

    if(e.target.closest("#appearanceClose") || e.target.closest("[data-close-appearance='true']")){
      closeAppearance();
      return;
    }

    const themeButton = e.target.closest("[data-theme-choice]");
    if(themeButton){
      applyTheme(themeButton.dataset.themeChoice, true);
      setTimeout(closeAppearance, 160);
      return;
    }

    const whatsappButton = e.target.closest("#whatsappFloatingButton");
    if(whatsappButton){
      e.preventDefault();

      /* Por enquanto abre a área interna do Assessor WhatsApp.
         Quando o número/API definitivo estiver pronto, substitua este bloco
         pelo redirecionamento da integração oficial. */
      if(typeof showSection === "function"){
        showSection("whatsapp");
        return;
      }

      const internalWhatsapp = document.querySelector('[data-section="whatsapp"]');
      if(internalWhatsapp) internalWhatsapp.click();
    }
  }, true);
})();


/* =========================================================
   CONTROLES — ESTADO PREMIUM DA BOLHA WHATSAPP
   ========================================================= */
(function(){
  function ctUserIsPremium(){
    try{
      if(typeof isPremiumActive === "function") return !!isPremiumActive();
    }catch(e){}

    /* Fallback visual: procura estados já usados pelo próprio app. */
    const body = document.body;
    if(body && (body.classList.contains("premium-user") || body.dataset.premium === "true")){
      return true;
    }
    return false;
  }

  function syncWhatsappFloatingLock(){
    const btn=document.getElementById("whatsappFloatingButton");
    if(!btn) return;
    const premium=ctUserIsPremium();
    btn.classList.toggle("ct-free-locked",!premium);
    btn.setAttribute("aria-label", premium ? "Abrir Assessor WhatsApp" : "Assessor WhatsApp — recurso Premium");
  }

  document.addEventListener("DOMContentLoaded",syncWhatsappFloatingLock);
  window.addEventListener("load",syncWhatsappFloatingLock);

  /* Atualiza também após mudanças de tela/login/assinatura. */
  document.addEventListener("click",function(){
    setTimeout(syncWhatsappFloatingLock,120);
  });

  /* Usuário grátis: clicar na bolha respeita o gate Premium existente. */
  document.addEventListener("click",function(e){
    const btn=e.target.closest("#whatsappFloatingButton");
    if(!btn || ctUserIsPremium()) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if(typeof openPremiumAccess === "function"){
      openPremiumAccess();
      return;
    }

    const premiumButton=document.querySelector('[data-section="premium"]');
    if(premiumButton) premiumButton.click();
  },true);
})();


/* CONTROLES — WhatsApp flutuante sem cadeado visual */
(function(){
  function cleanWhatsappBubble(){
    const btn=document.getElementById("whatsappFloatingButton");
    if(!btn) return;
    btn.classList.remove("ct-free-locked");
    const lock=btn.querySelector(".ct-whatsapp-lock");
    if(lock) lock.remove();
    btn.setAttribute("aria-label","Abrir Assessor WhatsApp");
  }
  document.addEventListener("DOMContentLoaded",cleanWhatsappBubble);
  window.addEventListener("load",cleanWhatsappBubble);
  setTimeout(cleanWhatsappBubble,250);
})();
c


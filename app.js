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
   - Premium / teste
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
    return normalizeTransactionType(type);
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
                    showLoginView();
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
            showLoginView();
            return;
        }

        if (data?.session?.user) {

            currentUser = data.session.user;

            await enterApp();

        } else {

            showLoginView();
        }

    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        showLoginView();
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

function showLoginView() {

    closeMobileMenu();

    const login =
        firstExisting(
            "loginView",
            "authView"
        );

    const app =
        firstExisting(
            "appView",
            "mainApp"
        );

    if (login) {
        login.classList.remove("hidden");
        login.style.display = "";
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showAppView() {

    const login =
        firstExisting(
            "loginView",
            "authView"
        );

    const app =
        firstExisting(
            "appView",
            "mainApp"
        );

    if (login) {
        login.classList.add("hidden");
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

        showLoginView();

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

    document.body.classList.toggle(
        "dark-mode",
        theme === "dark"
    );

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

    document.body.classList.toggle(
        "dark-mode",
        next === "dark"
    );

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


function isMobileViewport() {

    return window.innerWidth <= 720;
}


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

    if (
        transaction.received === true ||
        transaction.is_received === true ||
        transaction.status === "received" ||
        transaction.status === "recebido"
    ) {
        return true;
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

    if (
        transaction.received === true ||
        transaction.is_received === true ||
        transaction.status === "received" ||
        transaction.status === "recebido"
    ) {
        return false;
    }

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
                received: true,
                is_received: true,
                status: "received"
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
}


function closeTransactionModal() {

    const modal =
        firstExisting(
            "transactionModal",
            "launchModal"
        );

    if (modal) {
        modal.classList.add("hidden");
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


    const payload = {
        user_id: currentUser.id,
        description,
        amount,
        date,
        category,
        type,
        received,
        is_received: received,
        status:
            type === "income"
                ? (
                    received
                        ? "received"
                        : "pending"
                )
                : "paid"
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

function renderTransactions() {

    const list =
        firstExisting(
            "transactionsList",
            "transactionList",
            "launchesList"
        );

    if (!list) return;


    const search =
        valueOf(
            "transactionSearch"
        ).toLowerCase().trim();


    const filterType =
        valueOf(
            "transactionTypeFilter"
        );


    const filterCategory =
        valueOf(
            "transactionCategoryFilter"
        );


    let filtered =
        [...transactions];


    if (search) {

        filtered =
            filtered.filter(transaction => {

                const text =
                    `${getTransactionDescription(transaction)}
                    ${getTransactionCategory(transaction)}`
                        .toLowerCase();

                return text.includes(search);
            });
    }


    if (filterType) {

        filtered =
            filtered.filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type ||
                        transaction.tipo
                    ) === filterType
            );
    }


    if (filterCategory) {

        filtered =
            filtered.filter(
                transaction =>
                    getTransactionCategory(
                        transaction
                    ) === filterCategory
            );
    }


    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty-state">
                <p>Nenhum lançamento encontrado.</p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        filtered
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

                const isIncome =
                    type === "income";


                return `
                    <div
                        class="transaction-item"
                        data-transaction-id="${escapeHTML(transaction.id)}"
                    >

                        <div class="transaction-info">

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
                                isIncome
                                    ? "income-value"
                                    : "expense-value"
                            }"
                        >
                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            }
                            ${formatCurrency(amount)}
                        </strong>


                        <div class="transaction-actions">

                            <button
                                type="button"
                                class="edit-transaction-btn"
                                data-edit-transaction="${escapeHTML(transaction.id)}"
                                title="Editar"
                            >
                                ✎
                            </button>

                            <button
                                type="button"
                                class="delete-transaction-btn"
                                data-delete-transaction="${escapeHTML(transaction.id)}"
                                title="Excluir"
                            >
                                ×
                            </button>

                        </div>

                    </div>
                `;
            })
            .join("");
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
   PERÍODO FINANCEIRO
   ========================================================= */

function getPeriodElements() {

    return {

        select:
            firstExisting(
                "periodFilter"
            ) ||
            document.querySelector(
                "[data-period-filter]"
            ),


        apply:
            firstExisting(
                "applyPeriodBtn",
                "applyPeriod",
                "btnApplyPeriod"
            ) ||
            document.querySelector(
                "[data-apply-period]"
            ),


        customFields:
            firstExisting(
                "customPeriodFields",
                "periodCustomFields",
                "customDateRange"
            ),


        start:
            firstExisting(
                "periodStart",
                "customStartDate",
                "startDate"
            ) ||
            document.querySelector(
                "[data-period-start]"
            ),


        end:
            firstExisting(
                "periodEnd",
                "customEndDate",
                "endDate"
            ) ||
            document.querySelector(
                "[data-period-end]"
            ),


        income:
            firstExisting(
                "periodIncome",
                "periodIncomeValue",
                "periodEarnedValue"
            ) ||
            document.querySelector(
                "[data-period-income]"
            ),


        expense:
            firstExisting(
                "periodExpense",
                "periodExpenseValue",
                "periodSpentValue"
            ) ||
            document.querySelector(
                "[data-period-expense]"
            ),


        balance:
            firstExisting(
                "periodBalance",
                "periodBalanceValue"
            ) ||
            document.querySelector(
                "[data-period-balance]"
            ),


        label:
            firstExisting(
                "periodLabel"
            ) ||
            document.querySelector(
                "[data-period-label]"
            )
    };
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

    const {
        select,
        start,
        end
    } = getPeriodElements();


    if (!select || !select.value) {
        return null;
    }


    const today =
        todayISO();


    switch (select.value) {


        case "week":

            return {
                start: changeDate(
                    today,
                    -6
                ),
                end: today,
                label: "Última semana"
            };


        case "month":

            return {
                start:
                    getFirstDayOfCurrentMonth(),
                end: today,
                label: "Este mês"
            };


        case "all":

            return {
                start: null,
                end: null,
                label: "Todo o período"
            };


        case "custom": {

            let startDate =
                start?.value || "";

            let endDate =
                end?.value || "";


            if (
                !startDate &&
                !endDate
            ) {
                return null;
            }


            if (!startDate) {
                startDate = endDate;
            }


            if (!endDate) {
                endDate = startDate;
            }


            if (startDate > endDate) {

                const temp =
                    startDate;

                startDate =
                    endDate;

                endDate =
                    temp;
            }


            return {

                start: startDate,

                end: endDate,

                label:
                    `${formatDateBR(startDate)}
                    até
                    ${formatDateBR(endDate)}`
            };
        }


        default:
            return null;
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

    const categories =
        getAllCategories();


    const select =
        firstExisting(
            "transactionCategory",
            "category"
        );


    if (select) {

        const current =
            select.value;


        select.innerHTML =
            categories
                .map(
                    category =>
                        `<option value="${escapeHTML(category)}">
                            ${escapeHTML(category)}
                        </option>`
                )
                .join("");


        if (
            categories.includes(current)
        ) {
            select.value = current;
        }
    }


    const list =
        firstExisting(
            "categoriesList",
            "categoryList"
        );


    if (!list) return;


    list.innerHTML =
        categories
            .map(
                category => `
                    <div class="category-item">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        ${
                            DEFAULT_CATEGORIES.includes(category)
                                ? ""
                                : `
                                    <button
                                        type="button"
                                        class="delete-category-btn"
                                        data-delete-category="${escapeHTML(category)}"
                                    >
                                        ×
                                    </button>
                                `
                        }

                    </div>
                `
            )
            .join("");
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


/* =========================================================
   RELATÓRIOS
   ========================================================= */

function renderReports() {

    updateMonthlySummary();

    updateExpenseRanking();

    renderCategoryChart();
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

async function loadSubscription() {

    if (!supabaseClient || !currentUser) {
        return;
    }


    try {

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


        if (!error) {
            subscription = data;
        }

    } catch (error) {

        console.warn(
            "Erro ao carregar assinatura:",
            error
        );
    }
}


function isPremiumActive() {

    if (!subscription) {
        return false;
    }


    if (
        subscription.status === "active" ||
        subscription.status === "trialing"
    ) {

        if (
            subscription.expires_at
        ) {

            return new Date(
                subscription.expires_at
            ) > new Date();
        }

        return true;
    }


    return false;
}


function renderPremium() {

    const status =
        firstExisting(
            "premiumStatus",
            "subscriptionStatus"
        );


    if (!status) return;


    if (isPremiumActive()) {

        status.textContent =
            subscription?.status === "trialing"
                ? "Teste Premium ativo"
                : "Premium ativo";

    } else {

        status.textContent =
            "Plano gratuito";
    }
}


async function activatePremiumTrial() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const expires =
        new Date();


    expires.setDate(
        expires.getDate() + 7
    );


    try {

        const payload = {

            user_id:
                currentUser.id,

            status:
                "trialing",

            plan:
                "premium",

            started_at:
                new Date().toISOString(),

            expires_at:
                expires.toISOString()
        };


        const {
            error
        } = await supabaseClient
            .from("subscriptions")
            .insert(payload);


        if (error) {
            throw error;
        }


        await loadSubscription();

        renderPremium();


        showToast(
            "Teste Premium ativado por 7 dias!",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Não foi possível ativar o Premium.",
            "error"
        );
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
            "transactionTypeFilter"
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
            "transactionCategoryFilter"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


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

                    closeModal(
                        button.dataset
                            .closeModal
                    );
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


        const button =
            target.closest(
                "#activateTrialBtn," +
                "[data-activate-trial]"
            );


        if (button) {

            event.preventDefault();

            activatePremiumTrial();
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
   FIM DO APP.JS
   ========================================================= */

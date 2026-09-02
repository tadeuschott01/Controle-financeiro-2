/* =========================================================
   CONTROLES — APP.JS
   ========================================================= */

const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


/* =========================================================
   SUPABASE
   ========================================================= */

let supabaseClient = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
} else {
    console.error(
        "Supabase não foi carregado."
    );
}


/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let currentUser = null;
let currentProfile = null;

let transactions = [];
let categories = [];
let goals = [];

let currentSubscription = null;

let financeChart = null;
let categoryChart = null;

let toastTimer = null;


/* =========================================================
   ELEMENTOS
   ========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatCurrency(value) {

    const number = Number(value) || 0;

    return number.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(
        `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "pt-BR"
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getToday() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function normalizeName(name) {

    if (!name) {
        return "";
    }

    return String(name)
        .trim()
        .replace(/\s+/g, " ");
}


function getUserName() {

    return (
        normalizeName(
            currentProfile?.full_name
        ) ||
        normalizeName(
            currentUser?.user_metadata?.full_name
        ) ||
        "Usuário"
    );
}


function showToast(message) {

    const toast = $("toast");
    const toastMessage = $("toastMessage");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.add("hidden");

    }, 3500);
}


function setMessage(
    elementId,
    message,
    show = true
) {

    const element = $(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.toggle(
        "hidden",
        !show
    );
}


function clearMessage(elementId) {

    setMessage(
        elementId,
        "",
        false
    );
}


/* =========================================================
   SENHA
   ========================================================= */

function togglePassword(
    inputId,
    button
) {

    const input = $(inputId);

    if (!input || !button) {
        return;
    }

    const isHidden =
        input.type === "password";

    if (isHidden) {

        input.type = "text";

        button.textContent = "◎";

        button.setAttribute(
            "aria-label",
            "Ocultar senha"
        );

    } else {

        input.type = "password";

        button.textContent = "◉";

        button.setAttribute(
            "aria-label",
            "Mostrar senha"
        );
    }
}


/* =========================================================
   TELA DE LOGIN / CADASTRO
   ========================================================= */

function showRegister() {

    const loginView = $("loginView");
    const registerView = $("registerView");

    if (!loginView || !registerView) {
        return;
    }

    loginView.classList.add("hidden");

    registerView.classList.remove(
        "hidden"
    );

    clearMessage("registerMessage");

    const nameInput = $("registerName");

    if (nameInput) {
        nameInput.focus();
    }
}


function showLoginView() {

    const loginView = $("loginView");
    const registerView = $("registerView");

    if (!loginView || !registerView) {
        return;
    }

    registerView.classList.add("hidden");

    loginView.classList.remove(
        "hidden"
    );

    const email = localStorage.getItem(
        "lastConfirmationEmail"
    );

    const loginEmail = $("loginEmail");

    if (
        loginEmail &&
        email
    ) {
        loginEmail.value = email;
    }

    loginEmail?.focus();
}


function showApp() {

    $("loginScreen")?.classList.add(
        "hidden"
    );

    $("app")?.classList.remove(
        "hidden"
    );
}


function showLoginScreen() {

    $("app")?.classList.add(
        "hidden"
    );

    $("loginScreen")?.classList.remove(
        "hidden"
    );

    showLoginView();
}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    const loginForm = $("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }


    const registerForm = $("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );
    }


    $("registerBtn")?.addEventListener(
        "click",
        showRegister
    );


    $("backToLoginBtn")?.addEventListener(
        "click",
        showLoginView
    );


    $("logoutBtn")?.addEventListener(
        "click",
        handleLogout
    );


    $("themeBtn")?.addEventListener(
        "click",
        toggleTheme
    );


    $("premiumBtn")?.addEventListener(
        "click",
        () => {

            openModal(
                "premiumModal"
            );

        }
    );


    $("activatePremiumBtn")?.addEventListener(
        "click",
        () => {

            openModal(
                "premiumModal"
            );

        }
    );


    $("confirmPremiumBtn")?.addEventListener(
        "click",
        activatePremium
    );


    $("addTransactionBtn")?.addEventListener(
        "click",
        () => {

            openTransactionModal();

        }
    );


    $("addTransactionBtn2")?.addEventListener(
        "click",
        () => {

            openTransactionModal();

        }
    );


    $("addCategoryBtn")?.addEventListener(
        "click",
        () => {

            openModal(
                "categoryModal"
            );

        }
    );


    $("addCategoryBtn2")?.addEventListener(
        "click",
        () => {

            openModal(
                "categoryModal"
            );

        }
    );


    $("addGoalBtn")?.addEventListener(
        "click",
        () => {

            openModal(
                "goalModal"
            );

        }
    );


    $("transactionForm")?.addEventListener(
        "submit",
        handleTransaction
    );


    $("categoryForm")?.addEventListener(
        "submit",
        handleCategory
    );


    $("goalForm")?.addEventListener(
        "submit",
        handleGoal
    );


    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.closeModal
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                () => {

                    const modal =
                        overlay.closest(".modal");

                    if (modal) {
                        closeModal(
                            modal.id
                        );
                    }

                }
            );

        });


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.section;

                    showSection(
                        section
                    );

                    $("sidebar")
                        ?.classList
                        .remove(
                            "mobile-open"
                        );
                }
            );

        });


    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.sectionTarget
                    );

                }
            );

        });


    $("mobileMenuBtn")?.addEventListener(
        "click",
        () => {

            $("sidebar")
                ?.classList
                .toggle(
                    "mobile-open"
                );

        }
    );


    $("exportDataBtn")?.addEventListener(
        "click",
        exportData
    );


    document
        .querySelectorAll(
            ".password-toggle"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.target;

                    togglePassword(
                        target,
                        button
                    );

                }
            );

        });
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".app-section"
        );

    sections.forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });


    const target =
        $(`${sectionName}Section`);

    if (target) {

        target.classList.add(
            "active-section"
        );
    }


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                    sectionName
            );

        });


    if (sectionName === "reports") {

        renderReports();

        renderCategoryChart();
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    if (!supabaseClient) {

        showToast(
            "Supabase não foi carregado."
        );

        return;
    }


    const email =
        $("loginEmail")?.value
            .trim()
            .toLowerCase();

    const password =
        $("loginPassword")?.value || "";


    if (!email || !password) {

        showToast(
            "Preencha e-mail e senha."
        );

        return;
    }


    const button =
        event.submitter ||
        document.querySelector(
            "#loginForm button[type='submit']"
        );


    const originalText =
        button?.textContent;


    if (button) {

        button.disabled = true;

        button.textContent =
            "Entrando...";
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            console.error(
                "Erro no login:",
                error
            );

            showToast(
                getAuthErrorMessage(
                    error
                )
            );

            return;
        }


        if (!data?.user) {

            showToast(
                "Não foi possível entrar na conta."
            );

            return;
        }


        currentUser = data.user;


        if (
            !currentUser.email_confirmed_at
        ) {

            showToast(
                "Confirme seu e-mail antes de entrar."
            );

            await supabaseClient.auth.signOut();

            return;
        }


        await loadProfile();

        await loadAllData();

        showApp();

        updateUserInterface();

        showSection(
            "dashboard"
        );

        showToast(
            "Login realizado com sucesso!"
        );

    } catch (error) {

        console.error(
            "Erro inesperado no login:",
            error
        );

        showToast(
            "Ocorreu um erro ao entrar."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText ||
                "Entrar no ControleS";
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
            "Supabase não foi carregado."
        );

        return;
    }


    const name =
        normalizeName(
            $("registerName")?.value
        );

    const email =
        $("registerEmail")?.value
            .trim()
            .toLowerCase();

    const password =
        $("registerPassword")?.value ||
        "";

    const passwordConfirm =
        $("registerPasswordConfirm")?.value ||
        "";


    clearMessage(
        "registerMessage"
    );


    if (!name) {

        setMessage(
            "registerMessage",
            "Digite seu nome.",
            true
        );

        return;
    }


    if (!email) {

        setMessage(
            "registerMessage",
            "Digite um e-mail válido.",
            true
        );

        return;
    }


    if (password.length < 6) {

        setMessage(
            "registerMessage",
            "A senha precisa ter pelo menos 6 caracteres.",
            true
        );

        return;
    }


    if (password !== passwordConfirm) {

        setMessage(
            "registerMessage",
            "As senhas não são iguais.",
            true
        );

        return;
    }


    const button =
        event.submitter ||
        $("createAccountBtn");


    const originalText =
        button?.textContent;


    if (button) {

        button.disabled = true;

        button.textContent =
            "Criando conta...";
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email,

                password,

                options: {
                    data: {
                        full_name: name
                    }
                }

            });


        if (error) {

            console.error(
                "Erro no cadastro:",
                error
            );


            const message =
                getAuthErrorMessage(
                    error
                );


            if (
                message
                    .toLowerCase()
                    .includes("rate")
            ) {

                setMessage(
                    "registerMessage",
                    "Muitos cadastros ou e-mails enviados recentemente. Aguarde um pouco e tente novamente.",
                    true
                );

            } else {

                setMessage(
                    "registerMessage",
                    message,
                    true
                );
            }


            return;
        }


        localStorage.setItem(
            "lastConfirmationEmail",
            email
        );


        /*
         * Quando a confirmação de e-mail está
         * ativada, normalmente o Supabase
         * não cria uma sessão imediatamente.
         */

        if (
            data?.session &&
            data?.user
        ) {

            currentUser =
                data.user;


            await createProfile(
                name
            );

            await loadProfile();

            await loadAllData();

            showApp();

            updateUserInterface();

            showToast(
                "Conta criada com sucesso!"
            );

        } else {

            setMessage(
                "registerMessage",
                `Conta criada! Enviamos um e-mail de confirmação para ${email}. Confirme seu e-mail e depois volte para entrar.`,
                true
            );


            showToast(
                "E-mail de confirmação enviado!"
            );
        }

    } catch (error) {

        console.error(
            "Erro inesperado no cadastro:",
            error
        );

        setMessage(
            "registerMessage",
            "Não foi possível criar a conta agora. Tente novamente.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText ||
                "Criar minha conta";
        }
    }
}


/* =========================================================
   MENSAGENS DO SUPABASE
   ========================================================= */

function getAuthErrorMessage(error) {

    const raw =
        String(
            error?.message ||
            error ||
            ""
        );

    const text =
        raw.toLowerCase();


    if (
        text.includes(
            "invalid login credentials"
        )
    ) {

        return "E-mail ou senha incorretos.";
    }


    if (
        text.includes(
            "email not confirmed"
        )
    ) {

        return "Confirme seu e-mail antes de entrar.";
    }


    if (
        text.includes(
            "user already registered"
        ) ||
        text.includes(
            "already registered"
        )
    ) {

        return "Este e-mail já está cadastrado.";
    }


    if (
        text.includes(
            "password should be at least"
        )
    ) {

        return "A senha precisa ter pelo menos 6 caracteres.";
    }


    if (
        text.includes(
            "rate limit"
        ) ||
        text.includes(
            "too many requests"
        )
    ) {

        return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }


    if (
        text.includes(
            "email provider"
        )
    ) {

        return "Não foi possível enviar o e-mail de confirmação.";
    }


    return raw ||
        "Ocorreu um erro. Tente novamente.";
}


/* =========================================================
   PERFIL
   ========================================================= */

async function createProfile(name) {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const fullName =
        normalizeName(name) ||
        normalizeName(
            currentUser.user_metadata?.full_name
        ) ||
        "Usuário";


    const {
        error
    } =
        await supabaseClient
            .from("profiles")
            .upsert(
                {
                    id: currentUser.id,

                    full_name: fullName,

                    email:
                        currentUser.email || null,

                    updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict: "id"
                }
            );


    if (error) {

        console.error(
            "Erro ao criar perfil:",
            error
        );
    }
}


async function loadProfile() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        currentProfile = null;

        return;
    }


    if (!data) {

        await createProfile(
            currentUser.user_metadata?.full_name ||
            "Usuário"
        );


        const retry =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (!retry.error) {

            currentProfile =
                retry.data || null;
        }

        return;
    }


    currentProfile = data;
}


/* =========================================================
   INTERFACE DO USUÁRIO
   ========================================================= */

function updateUserInterface() {

    if (!currentUser) {
        return;
    }


    const name =
        getUserName();


    const email =
        currentUser.email ||
        currentProfile?.email ||
        "";


    const welcome =
        $("welcomeMessage");

    if (welcome) {

        welcome.textContent =
            `Olá, ${name}!`;
    }


    const topbarName =
        $("topbarUserName");

    if (topbarName) {

        topbarName.textContent =
            name;
    }


    const topbarEmail =
        $("topbarUserEmail");

    if (topbarEmail) {

        topbarEmail.textContent =
            email;
    }


    const avatar =
        $("userAvatarLetter");

    if (avatar) {

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase() ||
            "U";
    }
}


/* =========================================================
   CARREGAMENTO GERAL
   ========================================================= */

async function loadAllData() {

    if (!currentUser) {
        return;
    }


    await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadGoals(),
        loadSubscription()
    ]);


    updateDashboard();

    renderTransactions();

    renderCategories();

    populateCategorySelect();

    renderReports();

    renderCategoryChart();

    renderFinanceChart();
}


/* =========================================================
   TRANSAÇÕES
   ========================================================= */

async function loadTransactions() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
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


    if (error) {

        console.error(
            "Erro ao carregar transações:",
            error
        );

        transactions = [];

        return;
    }


    transactions =
        Array.isArray(data)
            ? data
            : [];
}


function openTransactionModal() {

    const form =
        $("transactionForm");

    if (form) {
        form.reset();
    }


    const dateInput =
        $("transactionDate");

    if (dateInput) {

        dateInput.value =
            getToday();
    }


    const typeInput =
        $("transactionType");

    if (typeInput) {

        typeInput.value =
            "expense";
    }


    populateCategorySelect();

    clearMessage(
        "transactionMessage"
    );


    openModal(
        "transactionModal"
    );
}


async function handleTransaction(event) {

    event.preventDefault();


    if (
        !supabaseClient ||
        !currentUser
    ) {

        setMessage(
            "transactionMessage",
            "Você precisa estar conectado para salvar um lançamento.",
            true
        );

        return;
    }


    const description =
        $("transactionDescription")
            ?.value
            .trim();


    const amount =
        Number(
            $("transactionAmount")
                ?.value
        );


    const type =
        $("transactionType")
            ?.value;


    const category =
        $("transactionCategory")
            ?.value
            .trim() ||
        null;


    const date =
        $("transactionDate")
            ?.value;


    if (!description) {

        setMessage(
            "transactionMessage",
            "Digite uma descrição.",
            true
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        setMessage(
            "transactionMessage",
            "Digite um valor maior que zero.",
            true
        );

        return;
    }


    if (
        type !== "income" &&
        type !== "expense"
    ) {

        setMessage(
            "transactionMessage",
            "Selecione o tipo da movimentação.",
            true
        );

        return;
    }


    if (!date) {

        setMessage(
            "transactionMessage",
            "Informe a data.",
            true
        );

        return;
    }


    const button =
        event.submitter;


    const originalText =
        button?.textContent;


    if (button) {

        button.disabled = true;

        button.textContent =
            "Salvando...";
    }


    clearMessage(
        "transactionMessage"
    );


    try {

        const payload = {

            user_id:
                currentUser.id,

            description,

            amount:
                Number(
                    amount.toFixed(2)
                ),

            type,

            category,

            date
        };


        console.log(
            "Salvando transação:",
            payload
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("transactions")
                .insert(payload)
                .select()
                .single();


        if (error) {

            console.error(
                "Erro completo ao salvar transação:",
                error
            );


            setMessage(
                "transactionMessage",
                `Não foi possível salvar: ${error.message || "erro desconhecido"}`,
                true
            );

            return;
        }


        if (data) {

            transactions.unshift(
                data
            );
        }


        closeModal(
            "transactionModal"
        );


        updateDashboard();

        renderTransactions();

        renderFinanceChart();

        renderReports();

        renderCategoryChart();


        showToast(
            "Lançamento salvo com sucesso!"
        );


    } catch (error) {

        console.error(
            "Erro inesperado ao salvar transação:",
            error
        );


        setMessage(
            "transactionMessage",
            "Ocorreu um erro ao salvar o lançamento.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText ||
                "Salvar lançamento";
        }
    }
}


/* =========================================================
   RENDERIZAÇÃO DAS TRANSAÇÕES
   ========================================================= */

function renderTransactions() {

    const tbody =
        $("transactionsTableBody");

    const empty =
        $("transactionsEmpty");

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !transactions ||
        transactions.length === 0
    ) {

        if (empty) {
            empty.classList.remove(
                "hidden"
            );
        }

        renderRecentTransactions();

        return;
    }


    if (empty) {

        empty.classList.add(
            "hidden"
        );
    }


    transactions.forEach(transaction => {

        const row =
            document.createElement("tr");


        const isIncome =
            transaction.type ===
            "income";


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    formatDate(
                        transaction.date
                    )
                )}
            </td>

            <td>
                <strong>
                    ${escapeHTML(
                        transaction.description
                    )}
                </strong>
            </td>

            <td>
                ${escapeHTML(
                    transaction.category ||
                    "Sem categoria"
                )}
            </td>

            <td>
                <span class="${
                    isIncome
                        ? "transaction-income"
                        : "transaction-expense"
                }">
                    ${
                        isIncome
                            ? "Entrada"
                            : "Saída"
                    }
                </span>
            </td>

            <td>
                <span class="${
                    isIncome
                        ? "transaction-income"
                        : "transaction-expense"
                }">
                    ${
                        isIncome
                            ? "+"
                            : "-"
                    }
                    ${formatCurrency(
                        transaction.amount
                    )}
                </span>
            </td>
        `;


        tbody.appendChild(row);

    });


    renderRecentTransactions();
}


function renderRecentTransactions() {

    const container =
        $("recentTransactions");

    if (!container) {
        return;
    }


    if (
        !transactions ||
        transactions.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento ainda.
            </div>
        `;

        return;
    }


    const recent =
        transactions
            .slice()
            .sort((a, b) => {

                const dateA =
                    new Date(
                        `${a.date}T00:00:00`
                    ).getTime();

                const dateB =
                    new Date(
                        `${b.date}T00:00:00`
                    ).getTime();

                return dateB - dateA;
            })
            .slice(0, 5);


    container.innerHTML =
        recent
            .map(transaction => {

                const isIncome =
                    transaction.type ===
                    "income";


                return `

                    <div class="recent-item">

                        <div class="recent-info">

                            <strong>
                                ${escapeHTML(
                                    transaction.description
                                )}
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        transaction.category ||
                                        "Sem categoria"
                                    )
                                }
                                ·
                                ${
                                    formatDate(
                                        transaction.date
                                    )
                                }
                            </span>

                        </div>


                        <div class="
                            recent-value
                            ${
                                isIncome
                                    ? "transaction-income"
                                    : "transaction-expense"
                            }
                        ">

                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            }

                            ${formatCurrency(
                                transaction.amount
                            )}

                        </div>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function calculateTotals() {

    let income = 0;

    let expense = 0;


    transactions.forEach(transaction => {

        const amount =
            Number(
                transaction.amount
            ) || 0;


        if (
            transaction.type ===
            "income"
        ) {

            income += amount;

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


function updateDashboard() {

    const totals =
        calculateTotals();


    const balance =
        $("balanceValue");

    if (balance) {

        balance.textContent =
            formatCurrency(
                totals.balance
            );
    }


    const income =
        $("incomeValue");

    if (income) {

        income.textContent =
            formatCurrency(
                totals.income
            );
    }


    const expense =
        $("expenseValue");

    if (expense) {

        expense.textContent =
            formatCurrency(
                totals.expense
            );
    }


    const reportIncome =
        $("reportIncome");

    if (reportIncome) {

        reportIncome.textContent =
            formatCurrency(
                totals.income
            );
    }


    const reportExpense =
        $("reportExpense");

    if (reportExpense) {

        reportExpense.textContent =
            formatCurrency(
                totals.expense
            );
    }


    const reportBalance =
        $("reportBalance");

    if (reportBalance) {

        reportBalance.textContent =
            formatCurrency(
                totals.balance
            );
    }
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

async function loadCategories() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar categorias:",
            error
        );

        categories = [];

        return;
    }


    categories =
        Array.isArray(data)
            ? data
            : [];
}


async function handleCategory(event) {

    event.preventDefault();


    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const name =
        $("categoryName")
            ?.value
            .trim();


    if (!name) {

        setMessage(
            "categoryMessage",
            "Digite o nome da categoria.",
            true
        );

        return;
    }


    const button =
        event.submitter;


    const originalText =
        button?.textContent;


    if (button) {

        button.disabled = true;

        button.textContent =
            "Criando...";
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("categories")
                .insert({

                    user_id:
                        currentUser.id,

                    name

                })
                .select()
                .single();


        if (error) {

            console.error(
                "Erro ao criar categoria:",
                error
            );


            setMessage(
                "categoryMessage",
                error.message ||
                    "Não foi possível criar a categoria.",
                true
            );

            return;
        }


        if (data) {

            categories.push(
                data
            );

            categories.sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "pt-BR"
                    )
            );
        }


        $("categoryForm")?.reset();

        closeModal(
            "categoryModal"
        );

        renderCategories();

        populateCategorySelect();

        showToast(
            "Categoria criada com sucesso!"
        );


    } catch (error) {

        console.error(
            error
        );


        setMessage(
            "categoryMessage",
            "Ocorreu um erro ao criar a categoria.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText ||
                "Criar categoria";
        }
    }
}


function renderCategories() {

    const grid =
        $("categoriesGrid");

    if (!grid) {
        return;
    }


    if (
        !categories ||
        categories.length === 0
    ) {

        grid.innerHTML = `
            <div class="content-card">
                <div class="empty-state">
                    Nenhuma categoria criada ainda.
                </div>
            </div>
        `;

        return;
    }


    grid.innerHTML =
        categories
            .map((category, index) => {

                const firstLetter =
                    category.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                    "#";


                return `

                    <div class="category-card">

                        <div class="category-card-icon">
                            ${escapeHTML(
                                firstLetter
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                category.name
                            )}
                        </h3>

                        <p>
                            Categoria ${
                                index + 1
                            }
                        </p>

                    </div>

                `;

            })
            .join("");
}


function populateCategorySelect() {

    const select =
        $("transactionCategory");

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Sem categoria
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category.name;


        option.textContent =
            category.name;


        select.appendChild(
            option
        );

    });


    if (
        currentValue &&
        categories.some(
            category =>
                category.name ===
                currentValue
        )
    ) {

        select.value =
            currentValue;
    }
}


/* =========================================================
   METAS
   ========================================================= */

async function loadGoals() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
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


    if (error) {

        console.error(
            "Erro ao carregar metas:",
            error
        );

        goals = [];

        return;
    }


    goals =
        Array.isArray(data)
            ? data
            : [];
}


async function handleGoal(event) {

    event.preventDefault();


    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const name =
        $("goalName")
            ?.value
            .trim();


    const amount =
        Number(
            $("goalAmount")
                ?.value
        );


    if (!name) {

        setMessage(
            "goalMessage",
            "Digite o nome da meta.",
            true
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        setMessage(
            "goalMessage",
            "Digite um valor maior que zero.",
            true
        );

        return;
    }


    const button =
        event.submitter;


    const originalText =
        button?.textContent;


    if (button) {

        button.disabled = true;

        button.textContent =
            "Criando...";
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("goals")
                .insert({

                    user_id:
                        currentUser.id,

                    name,

                    target_amount:
                        Number(
                            amount.toFixed(2)
                        ),

                    current_amount:
                        0

                })
                .select()
                .single();


        if (error) {

            console.error(
                "Erro ao criar meta:",
                error
            );


            setMessage(
                "goalMessage",
                error.message ||
                    "Não foi possível criar a meta.",
                true
            );

            return;
        }


        if (data) {

            goals.unshift(
                data
            );
        }


        $("goalForm")?.reset();

        closeModal(
            "goalModal"
        );


        showToast(
            "Meta criada com sucesso!"
        );


    } catch (error) {

        console.error(
            error
        );


        setMessage(
            "goalMessage",
            "Ocorreu um erro ao criar a meta.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText ||
                "Criar meta";
        }
    }
}


/* =========================================================
   PREMIUM
   ========================================================= */

async function loadSubscription() {

    if (
        !supabaseClient ||
        !currentUser
    ) {
        return;
    }


    const {
        data,
        error
    } =
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


    if (error) {

        console.error(
            "Erro ao carregar Premium:",
            error
        );

        currentSubscription = null;

        return;
    }


    currentSubscription =
        data || null;


    updatePremiumInterface();
}


async function activatePremium() {

    if (
        !supabaseClient ||
        !currentUser
    ) {

        showToast(
            "Entre na sua conta primeiro."
        );

        return;
    }


    const button =
        $("confirmPremiumBtn");


    if (button) {

        button.disabled = true;

        button.textContent =
            "Ativando...";
    }


    clearMessage(
        "premiumMessage"
    );


    try {

        const trialEnd =
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("subscriptions")
                .insert({

                    user_id:
                        currentUser.id,

                    plan:
                        "premium",

                    status:
                        "trialing",

                    price:
                        0,

                    trial_end_at:
                        trialEnd.toISOString(),

                    current_period_end:
                        trialEnd.toISOString()

                })
                .select()
                .single();


        if (error) {

            /*
             * Se já existir uma assinatura,
             * tentamos atualizar a existente.
             */

            console.error(
                "Erro ao inserir Premium:",
                error
            );


            if (
                currentSubscription?.id
            ) {

                const update =
                    await supabaseClient
                        .from("subscriptions")
                        .update({

                            plan:
                                "premium",

                            status:
                                "trialing",

                            price:
                                0,

                            trial_end_at:
                                trialEnd.toISOString(),

                            current_period_end:
                                trialEnd.toISOString(),

                            updated_at:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            currentSubscription.id
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        )
                        .select()
                        .single();


                if (update.error) {

                    throw update.error;
                }


                currentSubscription =
                    update.data;

            } else {

                throw error;
            }

        } else {

            currentSubscription =
                data;
        }


        closeModal(
            "premiumModal"
        );


        updatePremiumInterface();


        showToast(
            "Premium ativado por 7 dias!"
        );


    } catch (error) {

        console.error(
            "Erro ao ativar Premium:",
            error
        );


        setMessage(
            "premiumMessage",
            error.message ||
                "Não foi possível ativar o Premium.",
            true
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Ativar Premium";
        }
    }
}


function isPremiumActive() {

    if (!currentSubscription) {
        return false;
    }


    const status =
        String(
            currentSubscription.status ||
            ""
        ).toLowerCase();


    if (
        status !== "active" &&
        status !== "trialing"
    ) {
        return false;
    }


    const endDate =
        currentSubscription.current_period_end ||
        currentSubscription.trial_end_at;


    if (!endDate) {
        return true;
    }


    return (
        new Date(endDate).getTime() >
        Date.now()
    );
}


function updatePremiumInterface() {

    const buttons =
        document.querySelectorAll(
            ".premium-top-btn"
        );


    const active =
        isPremiumActive();


    buttons.forEach(button => {

        button.textContent =
            active
                ? "⭐ Premium ativo"
                : "⭐ Premium";

    });


    const activateButton =
        $("activatePremiumBtn");


    if (activateButton) {

        activateButton.textContent =
            active
                ? "Premium ativo"
                : "Ativar Premium";
    }
}


/* =========================================================
   GRÁFICO FINANCEIRO
========================================================= */

function renderFinanceChart() {

    const canvas =
        $("financeChart");

    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js não carregado."
        );

        return;
    }


    const context =
        canvas.getContext("2d");


    if (financeChart) {

        financeChart.destroy();

        financeChart = null;
    }


    const grouped = {};


    transactions.forEach(transaction => {

        const date =
            transaction.date;


        if (!grouped[date]) {

            grouped[date] = {
                income: 0,
                expense: 0
            };
        }


        const amount =
            Number(
                transaction.amount
            ) || 0;


        if (
            transaction.type ===
            "income"
        ) {

            grouped[date].income +=
                amount;

        } else {

            grouped[date].expense +=
                amount;
        }
    });


    let dates =
        Object.keys(grouped)
            .sort();


    /*
     * Se não houver movimentações,
     * mostramos os últimos 7 dias.
     */

    if (dates.length === 0) {

        const now =
            new Date();


        dates = [];


        for (
            let i = 6;
            i >= 0;
            i--
        ) {

            const date =
                new Date(now);


            date.setDate(
                now.getDate() - i
            );


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            dates.push(
                `${year}-${month}-${day}`
            );
        }
    }


    /*
     * Mantemos no máximo os últimos
     * 14 pontos para o gráfico.
     */

    dates =
        dates.slice(-14);


    const labels =
        dates.map(
            date =>
                formatDate(date)
        );


    const incomeData =
        dates.map(
            date =>
                Number(
                    grouped[date]?.income ||
                    0
                )
        );


    const expenseData =
        dates.map(
            date =>
                Number(
                    grouped[date]?.expense ||
                    0
                )
        );


    financeChart =
        new Chart(
            context,
            {

                type:
                    "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Entradas",

                            data:
                                incomeData,

                            tension:
                                0.35,

                            borderWidth:
                                2,

                            pointRadius:
                                3
                        },

                        {
                            label:
                                "Saídas",

                            data:
                                expenseData,

                            tension:
                                0.35,

                            borderWidth:
                                2,

                            pointRadius:
                                3
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                boxWidth:
                                    7

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return `${
                                            context.dataset.label
                                        }: ${
                                            formatCurrency(
                                                context.parsed.y
                                            )
                                        }`;

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    value =>
                                        formatCurrency(
                                            value
                                        )

                            }

                        }

                    }

                }

            }
        );
}


/* =========================================================
   GRÁFICO POR CATEGORIA
========================================================= */

function renderCategoryChart() {

    const canvas =
        $("categoryChart");

    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const totals = {};


    transactions
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )
        .forEach(transaction => {

            const category =
                transaction.category ||
                "Sem categoria";


            totals[category] =
                (
                    totals[category] ||
                    0
                ) +
                (
                    Number(
                        transaction.amount
                    ) || 0
                );

        });


    const labels =
        Object.keys(
            totals
        );


    const data =
        labels.map(
            label =>
                totals[label]
        );


    if (categoryChart) {

        categoryChart.destroy();

        categoryChart = null;
    }


    if (labels.length === 0) {

        return;
    }


    categoryChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type:
                    "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            data
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
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                boxWidth:
                                    8

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return `${
                                            context.label
                                        }: ${
                                            formatCurrency(
                                                context.raw
                                            )
                                        }`;

                                    }

                            }

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

    const totals =
        calculateTotals();


    if ($("reportIncome")) {

        $("reportIncome")
            .textContent =
            formatCurrency(
                totals.income
            );
    }


    if ($("reportExpense")) {

        $("reportExpense")
            .textContent =
            formatCurrency(
                totals.expense
            );
    }


    if ($("reportBalance")) {

        $("reportBalance")
            .textContent =
            formatCurrency(
                totals.balance
            );
    }
}


/* =========================================================
   MODAIS
========================================================= */

function openModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


function closeModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const anyOpenModal =
        document.querySelector(
            ".modal:not(.hidden)"
        );


    if (!anyOpenModal) {

        document.body.style.overflow =
            "";
    }
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
        "controlesTheme",
        dark
            ? "dark"
            : "light"
    );


    updateThemeButton(
        dark
    );
}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "controlesTheme"
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

        updateThemeButton(
            true
        );

    } else {

        updateThemeButton(
            false
        );
    }
}


function updateThemeButton(
    dark
) {

    const button =
        $("themeBtn");

    if (!button) {
        return;
    }


    button.innerHTML =
        dark
            ? "<span>☀</span><span>Modo claro</span>"
            : "<span>☾</span><span>Modo escuro</span>";
}


/* =========================================================
   EXPORTAÇÃO
========================================================= */

function exportData() {

    if (!currentUser) {

        showToast(
            "Entre na sua conta para exportar."
        );

        return;
    }


    const payload = {

        exported_at:
            new Date().toISOString(),

        user: {

            id:
                currentUser.id,

            email:
                currentUser.email,

            name:
                getUserName()

        },

        transactions,

        categories,

        goals,

        subscription:
            currentSubscription

    };


    const json =
        JSON.stringify(
            payload,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
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
        `controles-backup-${getToday()}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Backup exportado com sucesso!"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

    if (!supabaseClient) {
        return;
    }


    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    }


    currentUser = null;

    currentProfile = null;

    transactions = [];

    categories = [];

    goals = [];

    currentSubscription = null;


    showLoginScreen();


    showToast(
        "Você saiu da conta."
    );
}


/* =========================================================
   SESSÃO
========================================================= */

async function checkSession() {

    if (!supabaseClient) {

        showLoginScreen();

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Erro ao verificar sessão:",
                error
            );

            showLoginScreen();

            return;
        }


        const session =
            data?.session;


        if (
            session?.user
        ) {

            currentUser =
                session.user;


            await loadProfile();

            await loadAllData();

            showApp();

            updateUserInterface();

            showSection(
                "dashboard"
            );

        } else {

            showLoginScreen();
        }


    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        showLoginScreen();
    }
}


/* =========================================================
   ALTERAÇÃO DE ESTADO DA AUTENTICAÇÃO
========================================================= */

function setupAuthListener() {

    if (!supabaseClient) {
        return;
    }


    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            console.log(
                "Auth:",
                event
            );


            if (
                event ===
                "SIGNED_IN"
            ) {

                if (
                    session?.user
                ) {

                    currentUser =
                        session.user;


                    /*
                     * Pequeno atraso para evitar
                     * problemas de concorrência
                     * durante o callback.
                     */

                    setTimeout(
                        async () => {

                            await loadProfile();

                            await loadAllData();

                            showApp();

                            updateUserInterface();

                        },
                        0
                    );
                }
            }


            if (
                event ===
                "SIGNED_OUT"
            ) {

                currentUser = null;

                currentProfile = null;

                transactions = [];

                categories = [];

                goals = [];

                currentSubscription = null;

                showLoginScreen();
            }

        }
    );
}


/* =========================================================
   TECLADO / ESC
========================================================= */

function setupKeyboardEvents() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            const modal =
                document.querySelector(
                    ".modal:not(.hidden)"
                );


            if (modal) {

                closeModal(
                    modal.id
                );
            }
        }
    );
}


/* =========================================================
   DATA PADRÃO
========================================================= */

function setupDefaultValues() {

    const dateInput =
        $("transactionDate");

    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            getToday();
    }
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "ControleS iniciando..."
        );


        setupEvents();

        setupKeyboardEvents();

        setupAuthListener();

        loadTheme();

        setupDefaultValues();


        await checkSession();


        console.log(
            "ControleS carregado."
        );
    }
);

/* =========================================================
   CONTROLES — APP.JS
   Supabase + Auth + Dashboard + Premium
   ========================================================= */

const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
const SUPABASE_KEY = "COLE_AQUI_SUA_SB_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =========================================================
   ESTADO
   ========================================================= */

let currentUser = null;
let currentProfile = null;
let transactions = [];
let goals = [];
let budgets = [];
let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;
let transactionType = "income";

/* =========================================================
   ELEMENTOS
   ========================================================= */

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

const loginForm = document.getElementById("loginForm");
const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const userName = document.getElementById("userName");
const welcomeName = document.getElementById("welcomeName");
const userAvatar = document.getElementById("userAvatar");
const userPlan = document.getElementById("userPlan");

const pageTitle = document.getElementById("pageTitle");
const currentDate = document.getElementById("currentDate");

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    configurarEventos();
    configurarDataAtual();
    configurarDataLancamento();

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session && session.user) {
        currentUser = session.user;
        await carregarAplicacao();
    } else {
        mostrarLogin();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {

        if (session && session.user) {
            currentUser = session.user;

            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION"
            ) {
                await carregarAplicacao();
            }

        } else if (event === "SIGNED_OUT") {

            currentUser = null;
            currentProfile = null;

            mostrarLogin();
        }
    });
});

/* =========================================================
   LOGIN / CADASTRO
   ========================================================= */

function configurarEventos() {

    loginForm?.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nome = loginName.value.trim();
        const email = loginEmail.value.trim();
        const senha = loginPassword.value;

        if (!email || !senha) {
            alert("Digite seu e-mail e senha.");
            return;
        }

        const submitButton =
            loginForm.querySelector("button[type='submit']");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Entrando...";
        }

        try {

            /*
             * Primeiro tenta LOGIN.
             */

            const loginResult =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password: senha
                });

            if (!loginResult.error) {

                currentUser = loginResult.data.user;

                await carregarAplicacao();

                return;
            }

            /*
             * Se o usuário não existir, tenta CADASTRO.
             */

            if (!nome) {

                alert(
                    "Usuário não encontrado.\n\n" +
                    "Para criar uma conta, preencha também o campo Nome."
                );

                return;
            }

            const signupResult =
                await supabaseClient.auth.signUp({
                    email,
                    password: senha,
                    options: {
                        data: {
                            full_name: nome
                        }
                    }
                });

            if (signupResult.error) {
                throw signupResult.error;
            }

            if (!signupResult.data.session) {

                alert(
                    "Cadastro realizado!\n\n" +
                    "Verifique seu e-mail para confirmar a conta " +
                    "e depois entre novamente."
                );

                return;
            }

            currentUser = signupResult.data.user;

            await criarOuAtualizarProfile(nome);

            await carregarAplicacao();

        } catch (error) {

            console.error("Erro de autenticação:", error);

            alert(
                "Não foi possível entrar.\n\n" +
                (error.message || "Erro desconhecido.")
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Entrar no ControleS";
            }
        }
    });

    /* Navegação */

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            mostrarSecao(section);

            document
                .getElementById("sidebar")
                ?.classList.remove("mobile-open");
        });
    });

    document.querySelectorAll("[data-section]").forEach(button => {

        if (button.classList.contains("nav-item")) return;

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            if (section) {
                mostrarSecao(section);
            }
        });
    });

    /* Menu mobile */

    document
        .getElementById("mobileMenuBtn")
        ?.addEventListener("click", () => {

            document
                .getElementById("sidebar")
                ?.classList.toggle("mobile-open");
        });

    /* Tema */

    document
        .getElementById("themeBtn")
        ?.addEventListener("click", alternarTema);

    /* Logout */

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", async () => {

            await supabaseClient.auth.signOut();

            currentUser = null;

            mostrarLogin();
        });

    /* Novo lançamento */

    document
        .getElementById("openTransactionBtn")
        ?.addEventListener("click", abrirModalLancamento);

    document
        .getElementById("newTransactionButton")
        ?.addEventListener("click", abrirModalLancamento);

    document
        .getElementById("closeModal")
        ?.addEventListener("click", fecharModalLancamento);

    /* Tipo */

    document.querySelectorAll(".type-option").forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".type-option")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            transactionType = button.dataset.type;
        });
    });

    /* Form lançamento */

    document
        .getElementById("transactionForm")
        ?.addEventListener("submit", salvarLancamento);

    /* Filtros */

    document
        .getElementById("searchInput")
        ?.addEventListener("input", renderTransactions);

    document
        .getElementById("typeFilter")
        ?.addEventListener("change", renderTransactions);

    document
        .getElementById("categoryFilter")
        ?.addEventListener("change", renderTransactions);

    /* Premium */

    document
        .getElementById("newGoalBtn")
        ?.addEventListener("click", abrirModalMeta);

    document
        .getElementById("closeGoalModal")
        ?.addEventListener("click", fecharModalMeta);

    document
        .getElementById("goalForm")
        ?.addEventListener("submit", salvarMeta);

    document
        .getElementById("newBudgetBtn")
        ?.addEventListener("click", abrirModalOrcamento);

    document
        .getElementById("closeBudgetModal")
        ?.addEventListener("click", fecharModalOrcamento);

    document
        .getElementById("budgetForm")
        ?.addEventListener("submit", salvarOrcamento);

    document
        .getElementById("simulateBtn")
        ?.addEventListener("click", simularDespesa);

    document
        .getElementById("subscribePremiumBtn")
        ?.addEventListener("click", ativarPremium);

    document
        .getElementById("exportDataBtn")
        ?.addEventListener("click", exportarDados);

    /* Fechar modal clicando no fundo */

    document.querySelectorAll(".modal-overlay").forEach(overlay => {

        overlay.addEventListener("click", () => {

            overlay.parentElement.classList.add("hidden");

        });
    });
}

/* =========================================================
   TELA DE LOGIN
   ========================================================= */

function mostrarLogin() {

    loginScreen?.classList.remove("hidden");
    app?.classList.add("hidden");
}

async function carregarAplicacao() {

    if (!currentUser) return;

    try {

        await criarOuAtualizarProfile(
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            "Usuário"
        );

        await carregarProfile();
        await carregarTransactions();
        await carregarGoals();
        await carregarBudgets();

        loginScreen?.classList.add("hidden");
        app?.classList.remove("hidden");

        atualizarUsuario();
        atualizarTudo();

        mostrarSecao("dashboard");

    } catch (error) {

        console.error(error);

        alert(
            "Sua conta entrou, mas houve um problema ao carregar seus dados.\n\n" +
            error.message
        );
    }
}

/* =========================================================
   PROFILE
   ========================================================= */

async function criarOuAtualizarProfile(nome) {

    if (!currentUser) return;

    const { error } = await supabaseClient
        .from("profiles")
        .upsert(
            {
                id: currentUser.id,
                full_name: nome || "Usuário",
                account_type: "personal"
            },
            {
                onConflict: "id"
            }
        );

    if (error) {
        console.warn("Profile:", error.message);
    }
}

async function carregarProfile() {

    if (!currentUser) return;

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.warn("Erro profile:", error.message);
        return;
    }

    currentProfile = data;
}

function atualizarUsuario() {

    const nome =
        currentProfile?.full_name ||
        currentUser?.user_metadata?.full_name ||
        currentUser?.email?.split("@")[0] ||
        "Usuário";

    if (userName) userName.textContent = nome;
    if (welcomeName) welcomeName.textContent = nome;

    if (userAvatar) {
        userAvatar.textContent =
            nome.charAt(0).toUpperCase();
    }

    verificarPremium();
}

/* =========================================================
   TRANSAÇÕES
   ========================================================= */

async function carregarTransactions() {

    if (!currentUser) return;

    const { data, error } = await supabaseClient
        .from("transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Transactions:", error);
        throw error;
    }

    transactions = data || [];
}

function normalizarTransaction(item) {

    return {
        id: item.id,

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

        area: item.area || "",
        note: item.note || ""
    };
}

async function salvarLancamento(event) {

    event.preventDefault();

    if (!currentUser) {
        alert("Faça login primeiro.");
        return;
    }

    const description =
        document.getElementById("descriptionInput").value.trim();

    const amount =
        Number(document.getElementById("amountInput").value);

    const date =
        document.getElementById("dateInput").value;

    const category =
        document.getElementById("transactionCategory").value;

    if (!description || !amount || !date) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const payload = {

        user_id: currentUser.id,

        type: transactionType,

        description,

        amount,

        category,

        date,

        area: "",

        note: ""
    };

    const { error } = await supabaseClient
        .from("transactions")
        .insert(payload);

    if (error) {

        console.error(error);

        alert(
            "Erro ao salvar lançamento:\n\n" +
            error.message
        );

        return;
    }

    fecharModalLancamento();

    document.getElementById("transactionForm").reset();

    transactionType = "income";

    document
        .querySelectorAll(".type-option")
        .forEach((button, index) => {

            button.classList.toggle(
                "active",
                index === 0
            );
        });

    await carregarTransactions();

    atualizarTudo();

    alert("Lançamento salvo com sucesso! ✅");
}

async function excluirLancamento(id) {

    if (!confirm("Deseja excluir este lançamento?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);

    if (error) {

        alert(
            "Erro ao excluir:\n\n" +
            error.message
        );

        return;
    }

    await carregarTransactions();

    atualizarTudo();
}

function renderTransactions() {

    const container =
        document.getElementById("allTransactions");

    const recent =
        document.getElementById("recentTransactions");

    const search =
        (
            document.getElementById("searchInput")?.value ||
            ""
        ).toLowerCase();

    const type =
        document.getElementById("typeFilter")?.value ||
        "all";

    const category =
        document.getElementById("categoryFilter")?.value ||
        "all";

    const lista =
        transactions
            .map(normalizarTransaction)
            .filter(item => {

                const texto =
                    (
                        item.description +
                        " " +
                        item.category
                    ).toLowerCase();

                const matchSearch =
                    !search ||
                    texto.includes(search);

                const matchType =
                    type === "all" ||
                    item.type === type;

                const matchCategory =
                    category === "all" ||
                    item.category === category;

                return (
                    matchSearch &&
                    matchType &&
                    matchCategory
                );
            });

    if (container) {

        container.innerHTML =
            lista.length
                ? lista.map(transactionHTML).join("")
                : `<div class="empty-state">
                    Nenhum lançamento encontrado.
                   </div>`;
    }

    if (recent) {

        const ultimos =
            transactions
                .map(normalizarTransaction)
                .slice(0, 5);

        recent.innerHTML =
            ultimos.length
                ? ultimos.map(transactionHTML).join("")
                : `<div class="empty-state">
                    Nenhum lançamento cadastrado.
                   </div>`;
    }

    atualizarFiltroCategorias();
}

function transactionHTML(item) {

    const valor =
        formatMoney(item.amount);

    const sinal =
        item.type === "income"
            ? "+"
            : "-";

    const classe =
        item.type === "income"
            ? "income"
            : "expense";

    return `
        <div class="transaction">

            <div class="transaction-icon">
                ${item.type === "income" ? "↗" : "↘"}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(item.description)}
                </strong>

                <small>
                    ${escapeHTML(item.category)}
                    • ${formatDate(item.date)}
                </small>

            </div>

            <div class="transaction-value ${classe}">
                ${sinal} ${valor}
            </div>

            <button
                class="transaction-delete"
                onclick="excluirLancamento('${item.id}')"
                title="Excluir"
            >
                ×
            </button>

        </div>
    `;
}

function atualizarFiltroCategorias() {

    const select =
        document.getElementById("categoryFilter");

    if (!select) return;

    const atual = select.value;

    const categorias = [
        ...new Set(
            transactions
                .map(normalizarTransaction)
                .map(item => item.category)
        )
    ].sort();

    select.innerHTML =
        `<option value="all">Todas categorias</option>` +
        categorias
            .map(
                categoria =>
                    `<option value="${escapeHTML(categoria)}">
                        ${escapeHTML(categoria)}
                     </option>`
            )
            .join("");

    select.value =
        categorias.includes(atual)
            ? atual
            : "all";
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function atualizarDashboard() {

    const lista =
        transactions.map(normalizarTransaction);

    let receitas = 0;
    let despesas = 0;

    lista.forEach(item => {

        if (item.type === "income") {
            receitas += item.amount;
        } else {
            despesas += item.amount;
        }
    });

    const saldo =
        receitas - despesas;

    const economia =
        receitas > 0
            ? ((saldo / receitas) * 100)
            : 0;

    setText(
        "balanceValue",
        formatMoney(saldo)
    );

    setText(
        "incomeValue",
        formatMoney(receitas)
    );

    setText(
        "expenseValue",
        formatMoney(despesas)
    );

    setText(
        "economyValue",
        `${Math.max(0, economia).toFixed(1)}%`
    );

    setText(
        "premiumEconomyValue",
        `${Math.max(0, economia).toFixed(1)}%`
    );

    atualizarGraficoFinanceiro(receitas, despesas);
}

function atualizarGraficoFinanceiro(receitas, despesas) {

    const canvas =
        document.getElementById("financeChart");

    if (!canvas || !window.Chart) return;

    if (financeChart) {
        financeChart.destroy();
    }

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
                        receitas,
                        despesas
                    ],
                    borderRadius: 10
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
}

/* =========================================================
   CATEGORIAS
   ========================================================= */

function atualizarCategorias() {

    const despesas =
        transactions
            .map(normalizarTransaction)
            .filter(item => item.type === "expense");

    const mapa = {};

    despesas.forEach(item => {

        mapa[item.category] =
            (mapa[item.category] || 0) +
            item.amount;
    });

    const categorias =
        Object.entries(mapa)
            .sort((a, b) => b[1] - a[1]);

    const list =
        document.getElementById("categoryList");

    if (list) {

        list.innerHTML =
            categorias.length
                ? categorias.map(([categoria, valor]) => {

                    return `
                        <div class="category-summary-item">

                            <div class="category-summary-left">
                                <span class="category-dot"></span>

                                <strong>
                                    ${escapeHTML(categoria)}
                                </strong>
                            </div>

                            <span>
                                ${formatMoney(valor)}
                            </span>

                        </div>
                    `;

                }).join("")
                : `<div class="empty-state">
                    Ainda não existem despesas.
                   </div>`;
    }

    atualizarGraficoCategorias(
        categorias,
        "categoryChart"
    );

    atualizarGraficoCategorias(
        categorias,
        "reportCategoryChart"
    );

    atualizarAnaliseRelatorio(categorias);
}

function atualizarGraficoCategorias(categorias, canvasId) {

    const canvas =
        document.getElementById(canvasId);

    if (!canvas || !window.Chart) return;

    if (canvasId === "categoryChart" && categoryChart) {
        categoryChart.destroy();
    }

    if (
        canvasId === "reportCategoryChart" &&
        reportCategoryChart
    ) {
        reportCategoryChart.destroy();
    }

    const chart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels:
                    categorias.map(item => item[0]),

                datasets: [{

                    data:
                        categorias.map(item => item[1]),

                    borderWidth: 2
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

    if (canvasId === "categoryChart") {
        categoryChart = chart;
    } else {
        reportCategoryChart = chart;
    }
}

function atualizarAnaliseRelatorio(categorias) {

    const container =
        document.getElementById("reportAnalysis");

    if (!container) return;

    if (!categorias.length) {

        container.innerHTML =
            `<div class="empty-state">
                Cadastre despesas para gerar sua análise.
             </div>`;

        return;
    }

    const total =
        categorias.reduce(
            (sum, item) => sum + item[1],
            0
        );

    const maior =
        categorias[0];

    const percentual =
        total > 0
            ? (maior[1] / total) * 100
            : 0;

    container.innerHTML = `
        <p>
            Sua maior categoria de gastos é
            <strong>${escapeHTML(maior[0])}</strong>,
            representando
            <strong>${percentual.toFixed(1)}%</strong>
            das suas despesas.
        </p>

        <p style="margin-top:10px;">
            Total de despesas:
            <strong>${formatMoney(total)}</strong>
        </p>
    `;
}

/* =========================================================
   METAS
   ========================================================= */

async function carregarGoals() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("goals")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.warn("Goals:", error.message);
        goals = [];
        return;
    }

    goals = data || [];
}

function abrirModalMeta() {

    document
        .getElementById("goalModal")
        ?.classList.remove("hidden");
}

function fecharModalMeta() {

    document
        .getElementById("goalModal")
        ?.classList.add("hidden");
}

async function salvarMeta(event) {

    event.preventDefault();

    const name =
        document.getElementById("goalName").value.trim();

    const target =
        Number(document.getElementById("goalTarget").value);

    const saved =
        Number(document.getElementById("goalSaved").value || 0);

    if (!name || target <= 0) {
        alert("Preencha os dados da meta.");
        return;
    }

    const { error } =
        await supabaseClient
            .from("goals")
            .insert({
                user_id: currentUser.id,
                name,
                target,
                saved
            });

    if (error) {

        alert(
            "Erro ao criar meta:\n\n" +
            error.message
        );

        return;
    }

    fecharModalMeta();

    document
        .getElementById("goalForm")
        .reset();

    await carregarGoals();

    renderGoals();
}

function renderGoals() {

    const container =
        document.getElementById("goalsList");

    if (!container) return;

    if (!goals.length) {

        container.innerHTML =
            `<div class="empty-state">
                Você ainda não criou nenhuma meta.
             </div>`;

        return;
    }

    container.innerHTML =
        goals.map(goal => {

            const target =
                Number(goal.target || 0);

            const saved =
                Number(goal.saved || 0);

            const percentual =
                target > 0
                    ? Math.min(
                        100,
                        (saved / target) * 100
                    )
                    : 0;

            return `
                <div class="forecast-card">

                    <strong>
                        ${escapeHTML(goal.name)}
                    </strong>

                    <small>
                        ${formatMoney(saved)}
                        de
                        ${formatMoney(target)}
                    </small>

                    <div style="
                        height:8px;
                        background:var(--border);
                        border-radius:10px;
                        margin-top:12px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${percentual}%;
                            height:100%;
                            background:var(--orange);
                        "></div>
                    </div>

                    <small>
                        ${percentual.toFixed(0)}% concluído
                    </small>

                </div>
            `;

        }).join("");
}

/* =========================================================
   ORÇAMENTOS
   ========================================================= */

async function carregarBudgets() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("budgets")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.warn("Budgets:", error.message);
        budgets = [];
        return;
    }

    budgets = data || [];
}

function abrirModalOrcamento() {

    document
        .getElementById("budgetModal")
        ?.classList.remove("hidden");
}

function fecharModalOrcamento() {

    document
        .getElementById("budgetModal")
        ?.classList.add("hidden");
}

async function salvarOrcamento(event) {

    event.preventDefault();

    const category =
        document.getElementById("budgetCategory").value;

    const limit =
        Number(
            document.getElementById("budgetLimit").value
        );

    if (!category || limit <= 0) {

        alert("Informe um limite válido.");

        return;
    }

    const { error } =
        await supabaseClient
            .from("budgets")
            .upsert(
                {
                    user_id: currentUser.id,
                    category,
                    limit_amount: limit
                },
                {
                    onConflict: "user_id,category"
                }
            );

    if (error) {

        /*
         * Caso a tabela não tenha UNIQUE em
         * user_id + category, fazemos insert.
         */

        const fallback =
            await supabaseClient
                .from("budgets")
                .insert({
                    user_id: currentUser.id,
                    category,
                    limit_amount: limit
                });

        if (fallback.error) {

            alert(
                "Erro ao salvar orçamento:\n\n" +
                fallback.error.message
            );

            return;
        }
    }

    fecharModalOrcamento();

    document
        .getElementById("budgetForm")
        .reset();

    await carregarBudgets();

    renderBudgets();
}

function renderBudgets() {

    const container =
        document.getElementById("budgetsList");

    if (!container) return;

    if (!budgets.length) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum orçamento definido.
             </div>`;

        return;
    }

    const despesas =
        transactions
            .map(normalizarTransaction)
            .filter(item => item.type === "expense");

    container.innerHTML =
        budgets.map(budget => {

            const gasto =
                despesas
                    .filter(
                        item =>
                            item.category === budget.category
                    )
                    .reduce(
                        (sum, item) =>
                            sum + item.amount,
                        0
                    );

            const limite =
                Number(budget.limit_amount || 0);

            const percentual =
                limite > 0
                    ? (gasto / limite) * 100
                    : 0;

            return `
                <div class="forecast-card">

                    <strong>
                        ${escapeHTML(budget.category)}
                    </strong>

                    <small>
                        ${formatMoney(gasto)}
                        /
                        ${formatMoney(limite)}
                    </small>

                    <div style="
                        height:8px;
                        background:var(--border);
                        border-radius:10px;
                        margin-top:12px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${Math.min(percentual,100)}%;
                            height:100%;
                            background:
                                ${percentual >= 100
                                    ? "#dc2626"
                                    : "var(--orange)"};
                        "></div>
                    </div>

                    <small>
                        ${percentual.toFixed(0)}% utilizado
                    </small>

                </div>
            `;

        }).join("");
}

/* =========================================================
   PREMIUM
   ========================================================= */

async function verificarPremium() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("subscriptions")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();

    if (error) {

        console.warn(
            "Subscription:",
            error.message
        );

        if (userPlan) {
            userPlan.textContent =
                "ControleS Grátis";
        }

        return;
    }

    const premium =
        data &&
        (
            data.status === "active" ||
            data.status === "trialing"
        );

    if (userPlan) {

        userPlan.textContent =
            premium
                ? "ControleS Premium ⭐"
                : "ControleS Grátis";
    }
}

async function ativarPremium() {

    if (!currentUser) return;

    alert(
        "A assinatura do Premium ainda precisa ser conectada ao sistema de pagamento.\n\n" +
        "O cadastro da assinatura será preparado no Supabase."
    );

    const agora =
        new Date();

    const fimTeste =
        new Date(
            agora.getTime() +
            7 * 24 * 60 * 60 * 1000
        );

    const { error } =
        await supabaseClient
            .from("subscriptions")
            .insert({
                user_id: currentUser.id,
                plan: "premium",
                status: "trialing",
                trial_start_at: agora.toISOString(),
                trial_end_at: fimTeste.toISOString(),
                current_period_start: agora.toISOString(),
                current_period_end: fimTeste.toISOString(),
                price: 24.99
            });

    if (error) {

        console.error(error);

        alert(
            "Não foi possível iniciar o Premium:\n\n" +
            error.message
        );

        return;
    }

    await verificarPremium();

    alert(
        "Teste Premium iniciado com sucesso! ⭐"
    );
}

/* =========================================================
   PREMIUM — ANÁLISES
   ========================================================= */

function atualizarPremium() {

    const lista =
        transactions.map(normalizarTransaction);

    const receitas =
        lista
            .filter(item => item.type === "income")
            .reduce(
                (sum, item) =>
                    sum + item.amount,
                0
            );

    const despesas =
        lista
            .filter(item => item.type === "expense")
            .reduce(
                (sum, item) =>
                    sum + item.amount,
                0
            );

    const saldo =
        receitas - despesas;

    const texto =
        document.getElementById(
            "premiumPerformanceText"
        );

    if (texto) {

        if (!lista.length) {

            texto.textContent =
                "Cadastre seus lançamentos para acompanhar seu desempenho.";

        } else if (saldo > 0) {

            texto.textContent =
                `Você está com saldo positivo de ${formatMoney(saldo)}. Continue acompanhando seus gastos.`;

        } else {

            texto.textContent =
                `Suas despesas estão acima das receitas em ${formatMoney(Math.abs(saldo))}.`;
        }
    }

    atualizarSaudeFinanceira(
        receitas,
        despesas
    );

    atualizarAlertas(
        receitas,
        despesas
    );

    atualizarComparacao(
        receitas,
        despesas
    );

    atualizarAnalisePremium(
        receitas,
        despesas
    );
}

function atualizarSaudeFinanceira(
    receitas,
    despesas
) {

    const result =
        document.getElementById("healthResult");

    if (!result) return;

    if (receitas === 0 && despesas === 0) {

        result.innerHTML =
            `<p>Cadastre movimentações para calcular sua saúde financeira.</p>`;

        return;
    }

    if (despesas > receitas) {

        result.innerHTML =
            `<p>
                🔴 <strong>Crítica:</strong>
                seus gastos estão acima das receitas.
             </p>`;

    } else if (
        receitas > 0 &&
        despesas / receitas >= 0.8
    ) {

        result.innerHTML =
            `<p>
                🟡 <strong>Atenção:</strong>
                seus gastos consomem grande parte da sua renda.
             </p>`;

    } else {

        result.innerHTML =
            `<p>
                🟢 <strong>Saudável:</strong>
                você possui uma boa margem financeira.
             </p>`;
    }
}

function atualizarAlertas(
    receitas,
    despesas
) {

    const container =
        document.getElementById("smartAlerts");

    if (!container) return;

    const alertas = [];

    if (despesas > receitas) {

        alertas.push(
            "🚨 Suas despesas estão acima das receitas."
        );
    }

    if (
        receitas > 0 &&
        despesas / receitas >= 0.8
    ) {

        alertas.push(
            "⚠️ Você já utilizou mais de 80% das suas receitas."
        );
    }

    if (!alertas.length) {

        alertas.push(
            "✅ Nenhum alerta financeiro importante no momento."
        );
    }

    container.innerHTML =
        alertas
            .map(
                alerta =>
                    `<div class="empty-state">
                        ${alerta}
                     </div>`
            )
            .join("");
}

function atualizarComparacao(
    receitas,
    despesas
) {

    const container =
        document.getElementById(
            "monthlyComparison"
        );

    if (!container) return;

    const saldo =
        receitas - despesas;

    container.innerHTML = `
        <p>
            Receitas:
            <strong>${formatMoney(receitas)}</strong>
        </p>

        <p>
            Despesas:
            <strong>${formatMoney(despesas)}</strong>
        </p>

        <p>
            Resultado:
            <strong class="${
                saldo >= 0
                    ? "forecast-positive"
                    : "forecast-negative"
            }">
                ${formatMoney(saldo)}
            </strong>
        </p>
    `;
}

function atualizarAnalisePremium(
    receitas,
    despesas
) {

    const container =
        document.getElementById(
            "premiumAnalysis"
        );

    if (!container) return;

    if (!receitas && !despesas) {

        container.innerHTML =
            "Cadastre seus lançamentos para gerar uma análise financeira personalizada.";

        return;
    }

    const percentual =
        receitas > 0
            ? (despesas / receitas) * 100
            : 0;

    let recomendacao;

    if (percentual > 100) {

        recomendacao =
            "Seu principal objetivo agora deve ser reduzir despesas ou aumentar receitas.";

    } else if (percentual > 80) {

        recomendacao =
            "Sua margem está apertada. Tente reduzir gastos não essenciais.";

    } else {

        recomendacao =
            "Sua relação entre receitas e despesas está saudável. Continue mantendo uma reserva.";
    }

    container.innerHTML = `
        <p>
            Você recebeu
            <strong>${formatMoney(receitas)}</strong>
            e gastou
            <strong>${formatMoney(despesas)}</strong>.
        </p>

        <p>
            Seus gastos representam
            <strong>${percentual.toFixed(1)}%</strong>
            das receitas.
        </p>

        <p>
            💡 ${recomendacao}
        </p>
    `;
}

/* =========================================================
   SIMULADOR
   ========================================================= */

function simularDespesa() {

    const input =
        document.getElementById(
            "simulationAmount"
        );

    const result =
        document.getElementById(
            "simulationResult"
        );

    if (!input || !result) return;

    const valor =
        Number(input.value);

    if (!valor || valor <= 0) {

        result.textContent =
            "Digite um valor válido.";

        return;
    }

    const lista =
        transactions.map(normalizarTransaction);

    const receitas =
        lista
            .filter(item => item.type === "income")
            .reduce(
                (sum, item) =>
                    sum + item.amount,
                0
            );

    const despesas =
        lista
            .filter(item => item.type === "expense")
            .reduce(
                (sum, item) =>
                    sum + item.amount,
                0
            );

    const novoSaldo =
        receitas -
        despesas -
        valor;

    result.innerHTML = `
        Saldo atual:
        <strong>${formatMoney(receitas - despesas)}</strong>
        <br>
        Após a nova despesa:
        <strong class="${
            novoSaldo >= 0
                ? "forecast-positive"
                : "forecast-negative"
        }">
            ${formatMoney(novoSaldo)}
        </strong>
    `;
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function mostrarSecao(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.add("hidden");
        });

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.remove("hidden");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionId
            );
        });

    const titulos = {

        dashboard: "Tela principal",

        transactions: "Lançamentos",

        categories: "Gastos por categoria",

        reports: "Relatórios",

        premium: "Premium"
    };

    if (pageTitle) {

        pageTitle.textContent =
            titulos[sectionId] ||
            "ControleS";
    }

    if (sectionId === "premium") {

        atualizarPremium();
        renderGoals();
        renderBudgets();
    }
}

/* =========================================================
   MODAL LANÇAMENTO
   ========================================================= */

function abrirModalLancamento() {

    const modal =
        document.getElementById(
            "transactionModal"
        );

    if (!modal) return;

    modal.classList.remove("hidden");

    configurarDataLancamento();
}

function fecharModalLancamento() {

    document
        .getElementById("transactionModal")
        ?.classList.add("hidden");
}

function configurarDataLancamento() {

    const input =
        document.getElementById("dateInput");

    if (!input) return;

    if (!input.value) {

        input.value =
            new Date()
                .toISOString()
                .slice(0, 10);
    }
}

/* =========================================================
   TEMA
   ========================================================= */

function alternarTema() {

    document.body.classList.toggle("dark");

    const ativo =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "controles_theme",
        ativo
            ? "dark"
            : "light"
    );
}

(function carregarTema() {

    const tema =
        localStorage.getItem(
            "controles_theme"
        );

    if (tema === "dark") {
        document.body.classList.add("dark");
    }

})();

/* =========================================================
   EXPORTAR
   ========================================================= */

function exportarDados() {

    const dados = {

        profile: currentProfile,

        transactions,

        goals,

        budgets
    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    dados,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "controles-dados.json";

    link.click();

    URL.revokeObjectURL(url);
}

/* =========================================================
   ATUALIZAÇÃO GERAL
   ========================================================= */

function atualizarTudo() {

    atualizarDashboard();

    renderTransactions();

    atualizarCategorias();

    atualizarPremium();

    renderGoals();

    renderBudgets();
}

/* =========================================================
   DATA
   ========================================================= */

function configurarDataAtual() {

    if (!currentDate) return;

    const agora =
        new Date();

    currentDate.textContent =
        agora.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatMoney(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}

function formatDate(data) {

    if (!data) return "";

    const partes =
        String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

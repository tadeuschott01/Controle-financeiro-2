/* =========================================================
   CONTROLES 1.0 — APP.JS

   Login + Cadastro + Dashboard + Lançamentos
   + A Receber + Categorias + Relatórios + Premium + Tema
   + Supabase
   + Cofrinho Mensal + Resumo Mensal + Ranking
========================================================= */

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


/* =========================================================
   ESTADO DA APLICAÇÃO
========================================================= */

let supabaseClient = null;

let currentUser = null;
let currentProfile = null;

let transactions = [];
let goals = [];
let budgets = [];
let subscription = null;

let customCategories = [];

let financeChart = null;
let categoryChart = null;

let selectedTransactionType = "income";
let editingTransactionId = null;

let toastTimer = null;

let authInitialized = false;
let enteringApp = false;


/* =========================================================
   ESTADO — A RECEBER
========================================================= */

let receivablePromptedThisSession = new Set();
let receivablePromptQueue = [];
let processingReceivablePrompt = false;


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
   ATALHOS
========================================================= */

const $ = id =>
  document.getElementById(id);

const valueOf = id =>
  $(id)?.value ?? "";


/* =========================================================
   NORMALIZAR TIPO DO LANÇAMENTO
========================================================= */

function normalizeTransactionType(type) {
  const value =
    String(type || "")
      .toLowerCase()
      .trim();

  if (
    value === "despesa" ||
    value === "expense"
  ) {
    return "expense";
  }

  if (
    value === "receita" ||
    value === "income"
  ) {
    return "income";
  }

  return "income";
}


/* =========================================================
   CONVERTER TIPO PARA O SUPABASE
========================================================= */

function databaseTransactionType(type) {
  return normalizeTransactionType(type) === "expense"
    ? "despesa"
    : "receita";
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
       REGISTRAR SERVICE WORKER

       O arquivo sw.js deve estar no mesmo local
       do app.js/app.html ou em caminho compatível.
    */

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          console.log(
            "Service Worker registrado com sucesso."
          );
        })
        .catch(error => {
          console.error(
            "Erro ao registrar Service Worker:",
            error
          );
        });
    }

    setupEvents();

    setCurrentDate();
    setDefaultDate();

    loadTheme();
    loadLocalCategories();

    initializeSupabase();

    await checkSession();
  }
);


/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {
  if (
    !window.supabase?.createClient
  ) {
    showMessage(
      "loginMessage",
      "Não foi possível carregar o sistema. Atualize a página."
    );

    return;
  }

  try {
    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
  } catch (error) {
    console.error(error);

    showMessage(
      "loginMessage",
      "Erro ao conectar ao banco de dados."
    );
  }
}


/* =========================================================
   SESSÃO
========================================================= */

async function checkSession() {
  if (!supabaseClient) {
    return;
  }

  try {
    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      await enterApp(
        data.session.user
      );
    } else {
      showLoginView();
    }

    if (!authInitialized) {
      supabaseClient.auth.onAuthStateChange(
        (event, session) => {
          if (
            event === "SIGNED_OUT"
          ) {
            currentUser = null;
            currentProfile = null;
            subscription = null;

            transactions = [];
            goals = [];
            budgets = [];

            receivablePromptQueue = [];
            receivablePromptedThisSession =
              new Set();
            processingReceivablePrompt =
              false;

            destroyCharts();

            showLoginView();
          }
        }
      );

      authInitialized = true;
    }
  } catch (error) {
    console.error(
      "checkSession:",
      error
    );

    showLoginView();
  }
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(event) {
  event.preventDefault();

  if (!supabaseClient) {
    showMessage(
      "loginMessage",
      "O sistema ainda não terminou de carregar."
    );

    return;
  }

  const email =
    valueOf("loginEmail")
      .trim()
      .toLowerCase();

  const password =
    valueOf("loginPassword");

  clearMessage("loginMessage");

  if (!email || !password) {
    showMessage(
      "loginMessage",
      "Preencha o e-mail e a senha."
    );

    return;
  }

  if (!isValidEmail(email)) {
    showMessage(
      "loginMessage",
      "Digite um e-mail válido."
    );

    return;
  }

  const button =
    $("loginSubmitBtn");

  setButtonLoading(
    button,
    true,
    "Entrando..."
  );

  try {
    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword(
        {
          email,
          password
        }
      );

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    await enterApp(
      data.user
    );
  } catch (error) {
    console.error(
      "login:",
      error
    );

    showMessage(
      "loginMessage",
      friendlyAuthError(error)
    );
  } finally {
    setButtonLoading(
      button,
      false,
      "Entrar no ControleS"
    );
  }
}


/* =========================================================
   CADASTRO
========================================================= */

async function registerUser(event) {
  event.preventDefault();

  if (!supabaseClient) {
    showMessage(
      "registerMessage",
      "O sistema ainda não terminou de carregar."
    );

    return;
  }

  const name =
    valueOf("registerName")
      .trim();

  const email =
    valueOf("registerEmail")
      .trim()
      .toLowerCase();

  const password =
    valueOf("registerPassword");

  const confirm =
    valueOf(
      "registerPasswordConfirm"
    );

  clearMessage(
    "registerMessage"
  );

  if (
    !name ||
    !email ||
    !password ||
    !confirm
  ) {
    showMessage(
      "registerMessage",
      "Preencha todos os campos."
    );

    return;
  }

  if (!isValidEmail(email)) {
    showMessage(
      "registerMessage",
      "Digite um e-mail válido."
    );

    return;
  }

  if (password.length < 6) {
    showMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres."
    );

    return;
  }

  if (password !== confirm) {
    showMessage(
      "registerMessage",
      "As senhas não são iguais."
    );

    return;
  }

  const button =
    $("createAccountBtn");

  setButtonLoading(
    button,
    true,
    "Criando conta..."
  );

  try {
    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp(
        {
          email,
          password,

          options: {
            data: {
              full_name: name,
              name: name
            }
          }
        }
      );

    if (error) {
      throw error;
    }

    if (
      data.user &&
      data.session
    ) {
      await createProfileIfNeeded(
        data.user,
        name
      );

      showMessage(
        "registerMessage",
        "Conta criada! Entrando...",
        true
      );

      await enterApp(
        data.user
      );
    } else {
      showMessage(
        "registerMessage",
        "Conta criada! Verifique seu e-mail para confirmar a conta e depois faça login.",
        true
      );

      setTimeout(
        showLoginView,
        2500
      );
    }
  } catch (error) {
    console.error(
      "register:",
      error
    );

    showMessage(
      "registerMessage",
      friendlyAuthError(error)
    );
  } finally {
    setButtonLoading(
      button,
      false,
      "Criar minha conta"
    );
  }
}


/* =========================================================
   PERFIL
========================================================= */

async function createProfileIfNeeded(
  user,
  name = ""
) {
  if (
    !supabaseClient ||
    !user?.id
  ) {
    return;
  }

  const profileName =
    name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Usuário";

  try {
    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
      console.warn(
        "profiles select:",
        error
      );

      return;
    }

    if (!data) {
      const result =
        await supabaseClient
          .from("profiles")
          .insert({
            id: user.id,
            full_name: profileName
          });

      if (result.error) {
        console.warn(
          "profiles insert:",
          result.error
        );
      }
    }
  } catch (error) {
    console.warn(error);
  }
}


async function loadProfile() {
  currentProfile = null;

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  try {
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
      throw error;
    }

    currentProfile =
      data || null;
  } catch (error) {
    console.warn(
      "loadProfile:",
      error
    );
  }
}


function getUserFullName() {
  return (
    currentProfile?.full_name ||
    currentProfile?.name ||
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    "Usuário"
  );
}


function getFirstName() {
  return (
    getUserFullName()
      .trim()
      .split(/\s+/)[0] ||
    "Usuário"
  );
}


function updateProfileUI() {
  const name =
    getUserFullName();

  if ($("userName")) {
    $("userName").textContent =
      name;
  }

  if ($("userEmail")) {
    $("userEmail").textContent =
      currentUser?.email || "";
  }

  if ($("userAvatar")) {
    $("userAvatar").textContent =
      name
        .charAt(0)
        .toUpperCase();
  }

  if ($("welcomeMessage")) {
    $("welcomeMessage").textContent =
      `Olá, ${getFirstName()}! 👋`;
  }
}


/* =========================================================
   ENTRAR NO APP
========================================================= */

async function enterApp(user) {
  if (
    !user ||
    enteringApp
  ) {
    return;
  }

  enteringApp = true;

  try {
    currentUser = user;

    showAppView();

    await createProfileIfNeeded(
      user
    );

    await loadProfile();

    updateProfileUI();

    await loadUserData();

    updateDashboard();

    updateReports();

    renderCategories();

    renderTransactions();

    updatePremiumUI();

    renderReceivables();

    /*
       Verifica se existem receitas
       vencidas ou com vencimento hoje.
    */

    checkReceivablesDue();

  } catch (error) {
    console.error(
      "enterApp:",
      error
    );

    showToast(
      "A conta entrou, mas alguns dados não puderam ser carregados."
    );
  } finally {
    enteringApp = false;
  }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
  } catch (error) {
    console.error(error);
  }

  currentUser = null;
  currentProfile = null;
  subscription = null;

  transactions = [];
  goals = [];
  budgets = [];

  receivablePromptQueue = [];
  receivablePromptedThisSession =
    new Set();
  processingReceivablePrompt =
    false;

  destroyCharts();

  showLoginView();
}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function loadUserData() {
  if (!currentUser) {
    return;
  }

  await Promise.all([
    loadTransactions(),
    loadGoals(),
    loadBudgets(),
    loadSubscription()
  ]);
}


/* =========================================================
   TRANSAÇÕES
========================================================= */

async function loadTransactions() {
  transactions = [];

  try {
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
        );

    if (error) {
      throw error;
    }

    transactions =
      (data || []).map(
        transaction => ({
          ...transaction,

          type:
            normalizeTransactionType(
              transaction.type
            ),

          payment_status:
            transaction.payment_status ||
            "received"
        })
      );

  } catch (error) {
    console.warn(
      "loadTransactions:",
      error
    );
  }
}


/* =========================================================
   METAS
========================================================= */

async function loadGoals() {
  goals = [];

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  try {
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
      throw error;
    }

    goals =
      (data || []).map(
        goal => ({
          ...goal,

          target:
            Number(goal.target) ||
            0,

          saved:
            Number(goal.saved) ||
            0
        })
      );
  } catch (error) {
    console.warn(
      "loadGoals:",
      error
    );
  }
}


/* =========================================================
   ORÇAMENTOS
========================================================= */

async function loadBudgets() {
  budgets = [];

  try {
    const {
      data,
      error
    } =
      await supabaseClient
        .from("budgets")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        );

    if (error) {
      throw error;
    }

    budgets =
      data || [];

  } catch (error) {
    console.warn(
      "loadBudgets:",
      error
    );
  }
}


/* =========================================================
   ASSINATURA
========================================================= */

async function loadSubscription() {
  subscription = null;

  try {
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
      throw error;
    }

    subscription =
      data || null;

  } catch (error) {
    console.warn(
      "loadSubscription:",
      error
    );
  }
}


/* =========================================================
   A RECEBER — REGRAS
========================================================= */

function isIncomeTransaction(transaction) {
  return (
    normalizeTransactionType(
      transaction?.type
    ) === "income"
  );
}


function isTransactionReceived(transaction) {
  if (
    !isIncomeTransaction(
      transaction
    )
  ) {
    return true;
  }

  return (
    String(
      transaction.payment_status ||
      "received"
    ) === "received"
  );
}


function isPendingReceivable(transaction) {
  return (
    isIncomeTransaction(
      transaction
    ) &&
    String(
      transaction.payment_status ||
      "received"
    ) === "pending"
  );
}


function getPendingReceivables() {
  return transactions.filter(
    transaction =>
      isPendingReceivable(
        transaction
      )
  );
}


function getReceivablesDue() {
  const today =
    todayISO();

  return getPendingReceivables()
    .filter(transaction => {
      const date =
        normalizeDate(
          transaction.date
        );

      return (
        date &&
        date <= today
      );
    })
    .sort(
      (a, b) =>
        String(
          a.date
        ).localeCompare(
          String(
            b.date
          )
        )
    );
}


/* =========================================================
   SALVAR TRANSAÇÃO
========================================================= */

async function saveTransaction(event) {
  event.preventDefault();

  if (!currentUser) {
    showMessage(
      "transactionMessage",
      "Faça login novamente."
    );

    return;
  }

  const description =
    valueOf(
      "transactionDescription"
    ).trim();

  const amount =
    Number(
      valueOf(
        "transactionAmount"
      )
    );

  const date =
    valueOf(
      "transactionDate"
    );

  const category =
    valueOf(
      "transactionCategory"
    );

  clearMessage(
    "transactionMessage"
  );

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !date ||
    !category
  ) {
    showMessage(
      "transactionMessage",
      "Preencha os campos obrigatórios."
    );

    return;
  }

  const button =
    $("saveTransactionBtn");

  setButtonLoading(
    button,
    true,
    "Salvando..."
  );

  /*
     REGRA DO A RECEBER

     Receita futura:
     payment_status = pending

     Receita hoje/passada:
     payment_status = received

     Despesa:
     payment_status = received
  */

  let paymentStatus =
    "received";

  if (
    selectedTransactionType ===
    "income"
  ) {

    if (!editingTransactionId) {

      paymentStatus =
        date > todayISO()
          ? "pending"
          : "received";

    } else {

      const existing =
        transactions.find(
          transaction =>
            String(
              transaction.id
            ) ===
            String(
              editingTransactionId
            )
        );

      /*
         Se já foi recebido,
         não volta automaticamente
         para pendente.

         Se ainda estava pendente,
         continua pendente.
      */

      if (
        existing?.payment_status ===
        "received"
      ) {
        paymentStatus =
          "received";
      } else {
        paymentStatus =
          "pending";
      }
    }
  }

  const payload = {
    user_id:
      currentUser.id,

    type:
      databaseTransactionType(
        selectedTransactionType
      ),

    description,

    amount,

    date,

    category,

    payment_status:
      paymentStatus
  };

  try {
    let result;

    if (editingTransactionId) {

      result =
        await supabaseClient
          .from("transactions")
          .update(
            payload
          )
          .eq(
            "id",
            editingTransactionId
          )
          .eq(
            "user_id",
            currentUser.id
          );

    } else {

      result =
        await supabaseClient
          .from("transactions")
          .insert(
            payload
          );
    }

    if (result.error) {
      throw result.error;
    }

    closeModal(
      "transactionModal"
    );

    editingTransactionId =
      null;

    if (
      paymentStatus ===
      "pending"
    ) {
      showToast(
        "Receita adicionada em A Receber!"
      );
    } else {
      showToast(
        "Lançamento salvo!"
      );
    }

    await loadTransactions();

    updateDashboard();
    updateReports();

    renderTransactions();
    renderReceivables();

  } catch (error) {
    console.error(
      "saveTransaction:",
      error
    );

    showMessage(
      "transactionMessage",
      databaseError(
        error,
        "Não foi possível salvar o lançamento."
      )
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Salvar lançamento"
    );
  }
}


/* =========================================================
   MODAL TRANSAÇÃO
========================================================= */

function openTransactionModal(
  type = "income",
  transaction = null
) {
  selectedTransactionType =
    normalizeTransactionType(
      type
    );

  editingTransactionId =
    transaction?.id || null;

  if ($("transactionModalTitle")) {
    $("transactionModalTitle")
      .textContent =
      transaction
        ? "Editar lançamento"
        : "Novo lançamento";
  }

  if ($("transactionId")) {
    $("transactionId").value =
      transaction?.id || "";
  }

  if (
    $("transactionDescription")
  ) {
    $("transactionDescription")
      .value =
      transaction?.description ||
      "";
  }

  if ($("transactionAmount")) {
    $("transactionAmount").value =
      transaction?.amount ?? "";
  }

  if ($("transactionDate")) {
    $("transactionDate").value =
      normalizeDate(
        transaction?.date
      ) ||
      todayISO();
  }

  if ($("transactionNotes")) {
    $("transactionNotes").value =
      transaction?.notes || "";
  }

  setTransactionTypeButtons();

  populateTransactionCategories(
    transaction?.category || ""
  );

  openModal(
    "transactionModal"
  );
}


function setTransactionTypeButtons() {
  document
    .querySelectorAll(
      "[data-transaction-type]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset
          .transactionType ===
          selectedTransactionType
      );

    });

  if ($("transactionType")) {
    $("transactionType").value =
      selectedTransactionType;
  }
}


/* =========================================================
   A RECEBER — CONFIRMAR RECEBIMENTO
========================================================= */

async function markReceivableAsReceived(
  id
) {
  if (
    !currentUser ||
    !id
  ) {
    return;
  }

  const transaction =
    transactions.find(
      item =>
        String(
          item.id
        ) ===
        String(id)
    );

  if (!transaction) {
    return;
  }

  try {

    const {
      error
    } =
      await supabaseClient
        .from("transactions")
        .update({
          payment_status:
            "received"
        })
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          currentUser.id
        );

    if (error) {
      throw error;
    }

    transaction.payment_status =
      "received";

    /*
       Remove o item atual da fila.
    */

    receivablePromptQueue =
      receivablePromptQueue.filter(
        item =>
          String(item.id) !==
          String(id)
      );

    receivablePromptedThisSession.add(
      String(id)
    );

    closeModal(
      "receivableConfirmModal"
    );

    showToast(
      "Recebimento confirmado! O valor entrou no saldo."
    );

    updateDashboard();
    updateReports();
    renderTransactions();
    renderReceivables();

    processingReceivablePrompt =
      false;

    processNextReceivablePrompt();

  } catch (error) {

    console.error(
      "markReceivableAsReceived:",
      error
    );

    showToast(
      "Não foi possível confirmar o recebimento."
    );
  }
}


/* =========================================================
   A RECEBER — AINDA NÃO RECEBI
========================================================= */

function keepReceivablePending() {

  const transaction =
    receivablePromptQueue.shift();

  closeModal(
    "receivableConfirmModal"
  );

  if (transaction?.id) {

    receivablePromptedThisSession.add(
      String(
        transaction.id
      )
    );
  }

  processingReceivablePrompt =
    false;

  renderReceivables();

  /*
     Não mostra outro aviso imediatamente.
     O usuário pode continuar usando o app.
  */
}


/* =========================================================
   A RECEBER — VERIFICAR VENCIMENTOS
========================================================= */

function checkReceivablesDue() {

  if (!currentUser) {
    return;
  }

  if (
    processingReceivablePrompt
  ) {
    return;
  }

  const due =
    getReceivablesDue()
      .filter(
        transaction =>
          !receivablePromptedThisSession.has(
            String(
              transaction.id
            )
          )
      );

  if (!due.length) {
    return;
  }

  receivablePromptQueue =
    due;

  processNextReceivablePrompt();
}


/* =========================================================
   A RECEBER — MOSTRAR AVISO
========================================================= */

function processNextReceivablePrompt() {

  if (
    processingReceivablePrompt
  ) {
    return;
  }

  if (
    !receivablePromptQueue.length
  ) {
    processingReceivablePrompt =
      false;

    return;
  }

  const transaction =
    receivablePromptQueue[0];

  if (!transaction) {

    receivablePromptQueue.shift();

    processNextReceivablePrompt();

    return;
  }

  processingReceivablePrompt =
    true;

  if (
    $("receivableConfirmTitle")
  ) {
    $("receivableConfirmTitle")
      .textContent =
      "Você já recebeu este valor?";
  }

  if (
    $("receivableConfirmDescription")
  ) {
    $("receivableConfirmDescription")
      .textContent =
      transaction.description ||
      "Receita";
  }

  if (
    $("receivableConfirmAmount")
  ) {
    $("receivableConfirmAmount")
      .textContent =
      formatMoney(
        transaction.amount
      );
  }

  if (
    $("receivableConfirmDate")
  ) {
    $("receivableConfirmDate")
      .textContent =
      formatDate(
        transaction.date
      );
  }

  openModal(
    "receivableConfirmModal"
  );
}


/* =========================================================
   A RECEBER — RENDERIZAÇÃO
========================================================= */

function renderReceivables() {

  const list =
    $("receivableList");

  /*
     Se o HTML ainda não possui
     a seção A Receber, simplesmente
     não faz nada.

     Isso evita quebrar o restante
     do aplicativo.
  */

  if (!list) {
    return;
  }

  const empty =
    $("receivableEmpty");

  const pending =
    getPendingReceivables()
      .sort(
        (a, b) =>
          String(
            a.date || ""
          ).localeCompare(
            String(
              b.date || ""
            )
          )
      );

  list.innerHTML = "";

  const total =
    pending.reduce(
      (
        sum,
        transaction
      ) =>
        sum +
        (
          Number(
            transaction.amount
          ) || 0
        ),
      0
    );

  const today =
    todayISO();

  const todayTotal =
    pending
      .filter(
        transaction =>
          normalizeDate(
            transaction.date
          ) === today
      )
      .reduce(
        (
          sum,
          transaction
        ) =>
          sum +
          (
            Number(
              transaction.amount
            ) || 0
          ),
        0
      );

  if ($("receivableTotal")) {
    $("receivableTotal")
      .textContent =
      formatMoney(
        total
      );
  }

  if ($("receivableToday")) {
    $("receivableToday")
      .textContent =
      formatMoney(
        todayTotal
      );
  }

  if ($("receivableCount")) {
    $("receivableCount")
      .textContent =
      pending.length;
  }

  if (!pending.length) {

    empty?.classList.remove(
      "hidden"
    );

    return;
  }

  empty?.classList.add(
    "hidden"
  );

  pending.forEach(
    transaction => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "recent-item";

      const transactionDate =
        normalizeDate(
          transaction.date
        );

      const isDue =
        transactionDate <=
        today;

      item.innerHTML = `
        <div class="recent-left">

          <strong>
            ${escapeHTML(
              transaction.description ||
              "Receita"
            )}
          </strong>

          <small>

            ${escapeHTML(
              transaction.category ||
              "Outros"
            )}

            •

            ${formatDate(
              transaction.date
            )}

            •

            ${
              isDue
                ? "Vencido / hoje"
                : "A receber"
            }

          </small>

        </div>

        <div class="recent-right positive">

          <strong>
            + ${formatMoney(
              transaction.amount
            )}
          </strong>

          ${
            isDue
              ? `
                <button
                  type="button"
                  class="btn btn-primary"
                  data-receivable-confirm="${escapeAttribute(
                    transaction.id
                  )}"
                >
                  Já recebi
                </button>
              `
              : ""
          }

        </div>
      `;

      list.appendChild(
        item
      );
    }
  );
}


/* =========================================================
   EXCLUIR TRANSAÇÃO
========================================================= */

async function deleteTransaction(id) {
  if (
    !currentUser ||
    !id
  ) {
    return;
  }

  if (
    !window.confirm(
      "Excluir este lançamento?"
    )
  ) {
    return;
  }

  try {

    const {
      error
    } =
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

    if (error) {
      throw error;
    }

    receivablePromptQueue =
      receivablePromptQueue.filter(
        transaction =>
          String(transaction.id) !==
          String(id)
      );

    showToast(
      "Lançamento excluído!"
    );

    await loadTransactions();

    updateDashboard();
    updateReports();

    renderTransactions();
    renderReceivables();

  } catch (error) {

    console.error(
      error
    );

    showToast(
      "Não foi possível excluir o lançamento."
    );
  }
}


/* =========================================================
   RENDER TRANSAÇÕES
========================================================= */

function renderTransactions() {

  const body =
    $("transactionsTableBody");

  const empty =
    $("transactionsEmpty");

  if (!body) {
    return;
  }

  const list =
    applyTransactionFilters();

  body.innerHTML = "";

  if (!list.length) {

    empty?.classList.remove(
      "hidden"
    );

    return;
  }

  empty?.classList.add(
    "hidden"
  );

  list.forEach(t => {

    const type =
      normalizeTransactionType(
        t.type
      );

    const pending =
      isPendingReceivable(
        t
      );

    const tr =
      document.createElement(
        "tr"
      );

    tr.innerHTML = `
      <td>

        <strong>
          ${escapeHTML(
            t.description ||
            "Sem descrição"
          )}
        </strong>

      </td>

      <td>

        ${escapeHTML(
          t.category ||
          "Outros"
        )}

      </td>

      <td>

        ${formatDate(
          t.date
        )}

      </td>

      <td>

        <span class="type-pill ${type}">

          ${
            type === "income"
              ? "Receita"
              : "Despesa"
          }

        </span>

        ${
          pending
            ? `
              <small>
                • A receber
              </small>
            `
            : ""
        }

      </td>

      <td class="${
        type === "income"
          ? "positive"
          : "negative"
      }">

        <strong>

          ${
            type === "expense"
              ? "- "
              : "+ "
          }

          ${formatMoney(
            t.amount
          )}

        </strong>

      </td>

      <td>

        <div class="row-actions">

          <button
            class="icon-button"
            data-edit-transaction="${escapeAttribute(
              t.id
            )}"
            type="button"
          >
            ✎
          </button>

          <button
            class="icon-button delete"
            data-delete-transaction="${escapeAttribute(
              t.id
            )}"
            type="button"
          >
            ×
          </button>

        </div>

      </td>
    `;

    body.appendChild(
      tr
    );
  });
}


/* =========================================================
   FILTROS
========================================================= */

function applyTransactionFilters() {

  const search =
    valueOf(
      "transactionSearch"
    )
      .trim()
      .toLowerCase();

  const filterA =
    valueOf(
      "transactionFilter"
    ) ||
    "all";

  const filterB =
    valueOf(
      "typeFilter"
    ) ||
    "all";

  const category =
    valueOf(
      "categoryFilter"
    ) ||
    "all";

  const type =
    filterB !== "all"
      ? filterB
      : filterA;

  return transactions.filter(
    t => {

      const haystack =
        `${t.description || ""} ${
          t.category || ""
        } ${
          t.notes || ""
        }`.toLowerCase();

      const transactionType =
        normalizeTransactionType(
          t.type
        );

      return (
        (
          !search ||
          haystack.includes(
            search
          )
        ) &&

        (
          type === "all" ||
          transactionType ===
            normalizeTransactionType(
              type
            )
        ) &&

        (
          category === "all" ||
          t.category ===
            category
        )
      );
    }
  );
}


/* =========================================================
   CATEGORIAS
========================================================= */

async function saveCategory(event) {
  event.preventDefault();

  const name =
    valueOf(
      "categoryName"
    ).trim();

  const type =
    valueOf(
      "categoryType"
    ) ||
    "expense";

  if (!name) {

    showMessage(
      "categoryMessage",
      "Digite o nome da categoria."
    );

    return;
  }

  const exists =
    getAllCategories()
      .some(
        c =>
          c.toLowerCase() ===
          name.toLowerCase()
      );

  if (exists) {

    showMessage(
      "categoryMessage",
      "Essa categoria já existe."
    );

    return;
  }

  customCategories.push({
    name,
    type
  });

  saveLocalCategories();

  populateTransactionCategories();
  populateCategoryFilter();

  renderCategories();

  closeModal(
    "categoryModal"
  );

  showToast(
    "Categoria criada!"
  );
}


function getAllCategories() {

  const customNames =
    customCategories.map(
      c =>
        typeof c === "string"
          ? c
          : c.name
    );

  return [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...customNames
    ])
  ];
}


function loadLocalCategories() {

  try {

    const raw =
      localStorage.getItem(
        "controles_custom_categories"
      );

    customCategories =
      raw
        ? JSON.parse(raw)
        : [];

    if (
      !Array.isArray(
        customCategories
      )
    ) {
      customCategories = [];
    }

  } catch {

    customCategories = [];
  }
}


function saveLocalCategories() {

  localStorage.setItem(
    "controles_custom_categories",
    JSON.stringify(
      customCategories
    )
  );
}


function populateTransactionCategories(
  selected = ""
) {

  const select =
    $("transactionCategory");

  if (!select) {
    return;
  }

  const currentType =
    selectedTransactionType;

  const items = [
    ...DEFAULT_CATEGORIES.map(
      name => ({
        name,
        type:
          categoryDefaultType(
            name
          )
      })
    ),

    ...customCategories
  ];

  const filtered =
    items.filter(
      item =>
        item.type ===
          currentType ||
        !item.type
    );

  select.innerHTML = "";

  filtered.forEach(
    item => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        item.name;

      option.textContent =
        item.name;

      if (
        item.name ===
        selected
      ) {
        option.selected =
          true;
      }

      select.appendChild(
        option
      );
    }
  );

  if (
    selected &&
    !filtered.some(
      i =>
        i.name ===
        selected
    )
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      selected;

    option.textContent =
      selected;

    option.selected =
      true;

    select.appendChild(
      option
    );
  }
}


function categoryDefaultType(name) {

  return [
    "Salário",
    "Investimentos"
  ].includes(name)
    ? "income"
    : "expense";
}


function populateCategoryFilter() {

  const select =
    $("categoryFilter");

  if (!select) {
    return;
  }

  const current =
    select.value ||
    "all";

  select.innerHTML = "";

  const allOption =
    document.createElement(
      "option"
    );

  allOption.value =
    "all";

  allOption.textContent =
    "Todas as categorias";

  select.appendChild(
    allOption
  );

  getAllCategories()
    .forEach(
      name => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          name;

        option.textContent =
          name;

        select.appendChild(
          option
        );
      }
    );

  select.value =
    getAllCategories()
      .includes(current)
      ? current
      : "all";
}


function renderCategories() {

  const grid =
    $("categoriesGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  getAllCategories()
    .forEach(
      name => {

        const count =
          transactions.filter(
            t =>
              t.category ===
              name
          ).length;

        const card =
          document.createElement(
            "article"
          );

        card.className =
          "category-card";

        card.innerHTML = `
          <div class="category-icon">
            ◈
          </div>

          <strong>
            ${escapeHTML(
              name
            )}
          </strong>

          <small>

            ${count}

            ${
              count === 1
                ? "lançamento"
                : "lançamentos"
            }

          </small>
        `;

        grid.appendChild(
          card
        );
      }
    );

  populateCategoryFilter();
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const totals =
    getTotals();

  if ($("balanceValue")) {

    $("balanceValue")
      .textContent =
      formatMoney(
        totals.balance
      );
  }

  if ($("incomeValue")) {

    $("incomeValue")
      .textContent =
      formatMoney(
        totals.income
      );
  }

  if ($("expenseValue")) {

    $("expenseValue")
      .textContent =
      formatMoney(
        totals.expense
      );
  }

  renderRecentTransactions();

  renderFinanceChart();

  updatePremiumDashboard();
}


/* =========================================================
   TOTAIS

   RECEITAS PENDENTES NÃO ENTRAM
   NO SALDO.
========================================================= */

function getTotals() {

  let income = 0;
  let expense = 0;

  transactions.forEach(
    t => {

      const amount =
        Number(t.amount) ||
        0;

      const type =
        normalizeTransactionType(
          t.type
        );

      if (
        type === "expense"
      ) {

        expense +=
          amount;

      } else if (
        isTransactionReceived(
          t
        )
      ) {

        income +=
          amount;
      }
    }
  );

  return {

    income,

    expense,

    balance:
      income - expense
  };
}


/* =========================================================
   PREMIUM — DASHBOARD
========================================================= */

function updatePremiumDashboard() {

  const container =
    $("premiumDashboardContent");

  if (!container) {
    return;
  }

  const premium =
    isPremiumActive();

  container.classList.toggle(
    "hidden",
    !premium
  );

  if (!premium) {
    return;
  }

  const monthly =
    getCurrentMonthSummary();


  /* -------------------------------------------------------
     COFRINHO
  ------------------------------------------------------- */

  if ($("monthlySavingsValue")) {

    $("monthlySavingsValue")
      .textContent =
      formatMoney(
        monthly.balance
      );
  }

  if ($("monthlySavingsText")) {

    if (
      monthly.balance > 0
    ) {

      $("monthlySavingsText")
        .textContent =
        `Você tem ${formatMoney(
          monthly.balance
        )} de sobra neste mês.`;

    } else if (
      monthly.balance < 0
    ) {

      $("monthlySavingsText")
        .textContent =
        `Suas despesas ultrapassaram as receitas em ${formatMoney(
          Math.abs(
            monthly.balance
          )
        )}.`;

    } else {

      $("monthlySavingsText")
        .textContent =
        "Receitas e despesas estão equilibradas.";
    }
  }


  /* -------------------------------------------------------
     RESUMO MENSAL
  ------------------------------------------------------- */

  if ($("monthlyIncomeValue")) {

    $("monthlyIncomeValue")
      .textContent =
      formatMoney(
        monthly.income
      );
  }

  if ($("monthlyExpenseValue")) {

    $("monthlyExpenseValue")
      .textContent =
      formatMoney(
        monthly.expense
      );
  }

  if ($("monthlyBalanceValue")) {

    $("monthlyBalanceValue")
      .textContent =
      formatMoney(
        monthly.balance
      );

    $("monthlyBalanceValue")
      .classList.toggle(
        "positive",
        monthly.balance >= 0
      );

    $("monthlyBalanceValue")
      .classList.toggle(
        "negative",
        monthly.balance < 0
      );
  }


  /* -------------------------------------------------------
     RANKING
  ------------------------------------------------------- */

  const ranking =
    getMonthlyExpenseRanking();

  const rankingContainer =
    $("expenseRanking");

  if (rankingContainer) {

    rankingContainer.innerHTML =
      "";

    if (!ranking.length) {

      rankingContainer.innerHTML = `
        <div class="empty-state">

          <div>◎</div>

          <h3>
            Nenhuma despesa neste mês
          </h3>

          <p>
            Adicione uma despesa para aparecer no ranking.
          </p>

        </div>
      `;

    } else {

      ranking.forEach(
        (item, index) => {

          const row =
            document.createElement(
              "div"
            );

          row.className =
            "expense-ranking-item";

          const percentage =
            monthly.expense > 0
              ? (
                  item.amount /
                  monthly.expense
                ) *
                100
              : 0;

          row.innerHTML = `
            <div class="ranking-position">
              ${index + 1}
            </div>

            <div class="ranking-info">

              <div class="ranking-top">

                <strong>
                  ${escapeHTML(
                    item.category
                  )}
                </strong>

                <strong>
                  ${formatMoney(
                    item.amount
                  )}
                </strong>

              </div>

              <div class="ranking-bar">

                <div
                  class="ranking-bar-fill"
                  style="width: ${Math.min(
                    percentage,
                    100
                  )}%"
                ></div>

              </div>

              <small>
                ${percentage.toFixed(
                  1
                )}% das despesas do mês
              </small>

            </div>
          `;

          rankingContainer.appendChild(
            row
          );
        }
      );
    }
  }


  /* -------------------------------------------------------
     MAIOR GASTO
  ------------------------------------------------------- */

  const top =
    ranking[0];

  if ($("topCategoryValue")) {

    $("topCategoryValue")
      .textContent =
      top
        ? formatMoney(
            top.amount
          )
        : "—";
  }

  if ($("topCategoryText")) {

    $("topCategoryText")
      .textContent =
      top
        ? top.category
        : "Nenhuma despesa registrada";
  }
}


/* =========================================================
   RESUMO DO MÊS ATUAL
========================================================= */

function getCurrentMonthSummary() {

  const now =
    new Date();

  let income = 0;
  let expense = 0;

  transactions.forEach(
    transaction => {

      if (
        !isDateInCurrentMonth(
          transaction.date,
          now
        )
      ) {
        return;
      }

      const amount =
        Number(
          transaction.amount
        ) || 0;

      const type =
        normalizeTransactionType(
          transaction.type
        );

      if (
        type === "expense"
      ) {

        expense +=
          amount;

      } else if (
        isTransactionReceived(
          transaction
        )
      ) {

        income +=
          amount;
      }
    }
  );

  return {

    income,

    expense,

    balance:
      income - expense
  };
}


/* =========================================================
   RANKING DE GASTOS DO MÊS
========================================================= */

function getMonthlyExpenseRanking() {

  const now =
    new Date();

  const totals = {};

  transactions.forEach(
    transaction => {

      if (
        !isDateInCurrentMonth(
          transaction.date,
          now
        )
      ) {
        return;
      }

      if (
        normalizeTransactionType(
          transaction.type
        ) !== "expense"
      ) {
        return;
      }

      const category =
        String(
          transaction.category ||
            "Outros"
        ).trim() ||
        "Outros";

      const amount =
        Number(
          transaction.amount
        ) || 0;

      totals[category] =
        (
          totals[category] ||
          0
        ) + amount;
    }
  );

  return Object.entries(
    totals
  )
    .map(
      ([category, amount]) => ({
        category,
        amount
      })
    )
    .sort(
      (a, b) =>
        b.amount -
        a.amount
    )
    .slice(0, 5);
}


/* =========================================================
   VERIFICAR MÊS ATUAL
========================================================= */

function isDateInCurrentMonth(
  value,
  referenceDate = new Date()
) {

  const date =
    parseDate(value);

  if (!date) {
    return false;
  }

  return (
    date.getFullYear() ===
      referenceDate.getFullYear() &&

    date.getMonth() ===
      referenceDate.getMonth()
  );
}


/* =========================================================
   TRANSAÇÕES RECENTES
========================================================= */

function renderRecentTransactions() {

  const container =
    $("recentTransactions");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const recent =
    [...transactions]
      .sort(
        (a, b) =>
          String(
            b.date || ""
          ).localeCompare(
            String(
              a.date || ""
            )
          )
      )
      .slice(0, 6);

  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div>◎</div>

        <h3>
          Nenhum lançamento
        </h3>

        <p>
          Adicione uma receita ou despesa.
        </p>

      </div>
    `;

    return;
  }

  recent.forEach(t => {

    const type =
      normalizeTransactionType(
        t.type
      );

    const pending =
      isPendingReceivable(
        t
      );

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "recent-item";

    item.innerHTML = `
      <div class="recent-left">

        <strong>
          ${escapeHTML(
            t.description ||
            "Sem descrição"
          )}
        </strong>

        <small>

          ${escapeHTML(
            t.category ||
            "Outros"
          )}

          •

          ${formatDate(
            t.date
          )}

          ${
            pending
              ? " • A receber"
              : ""
          }

        </small>

      </div>

      <div class="recent-right ${
        type === "income"
          ? "positive"
          : "negative"
      }">

        ${
          type === "expense"
            ? "- "
            : "+ "
        }

        ${formatMoney(
          t.amount
        )}

      </div>
    `;

    container.appendChild(
      item
    );
  });
}


/* =========================================================
   GRÁFICO FINANCEIRO
========================================================= */

function renderFinanceChart() {

  const canvas =
    $("financeChart");

  if (
    !canvas ||
    !window.Chart
  ) {
    return;
  }

  const months = [];

  const now =
    new Date();

  for (
    let i = 5;
    i >= 0;
    i--
  ) {

    const d =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    months.push({

      key:
        `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(
          2,
          "0"
        )}`,

      label:
        d.toLocaleDateString(
          "pt-BR",
          {
            month: "short"
          }
        )
    });
  }

  const incomeData =
    months.map(
      m =>
        sumByMonth(
          m.key,
          "income"
        )
    );

  const expenseData =
    months.map(
      m =>
        sumByMonth(
          m.key,
          "expense"
        )
    );

  if (financeChart) {
    financeChart.destroy();
  }

  financeChart =
    new Chart(
      canvas,
      {
        type: "bar",

        data: {

          labels:
            months.map(
              m => m.label
            ),

          datasets: [

            {
              label:
                "Receitas",

              data:
                incomeData,

              borderWidth:
                0
            },

            {
              label:
                "Despesas",

              data:
                expenseData,

              borderWidth:
                0
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
          },

          scales: {

            y: {

              beginAtZero:
                true,

              ticks: {

                callback:
                  value =>
                    formatCompactMoney(
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
   SOMAR POR MÊS
========================================================= */

function sumByMonth(
  key,
  type
) {

  return transactions.reduce(
    (sum, t) => {

      const transactionType =
        normalizeTransactionType(
          t.type
        );

      const requestedType =
        normalizeTransactionType(
          type
        );

      if (
        transactionType !==
        requestedType
      ) {
        return sum;
      }

      /*
         RECEITA PENDENTE NÃO APARECE
         NO GRÁFICO FINANCEIRO.
      */

      if (
        transactionType ===
        "income" &&
        !isTransactionReceived(
          t
        )
      ) {
        return sum;
      }

      return String(
        t.date || ""
      ).slice(
        0,
        7
      ) === key
        ? sum +
          (
            Number(
              t.amount
            ) || 0
          )
        : sum;

    },
    0
  );
}


/* =========================================================
   RELATÓRIOS
========================================================= */

function updateReports() {

  const totals =
    getTotals();

  const ids = {

    reportIncomeCard:
      totals.income,

    reportExpenseCard:
      totals.expense,

    reportBalanceCard:
      totals.balance,

    reportIncome:
      totals.income,

    reportExpense:
      totals.expense,

    reportBalance:
      totals.balance
  };

  Object.entries(ids)
    .forEach(
      ([id, value]) => {

        if ($(id)) {

          $(id).textContent =
            formatMoney(
              value
            );
        }
      }
    );


  /* -------------------------------------------------------
     COMPARAÇÃO COM MÊS ANTERIOR
  ------------------------------------------------------- */

  updateReportComparison();


  /* -------------------------------------------------------
     PREMIUM
  ------------------------------------------------------- */

  const premium =
    isPremiumActive();

  $(
    "premiumReportContent"
  )?.classList.toggle(
    "hidden",
    premium
  );

  $(
    "normalReportContent"
  )?.classList.toggle(
    "hidden",
    !premium
  );

  if (premium) {

    renderCategoryChart();

  } else if (
    categoryChart
  ) {

    categoryChart.destroy();

    categoryChart = null;
  }

  updatePremiumDashboard();
}


/* =========================================================
   COMPARAÇÃO MENSAL
========================================================= */

function getMonthKey(date) {

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}`;
}


function getMonthSummary(date) {

  const key =
    getMonthKey(date);

  let income = 0;
  let expense = 0;

  let hasTransactions =
    false;

  transactions.forEach(
    transaction => {

      const transactionDate =
        parseDate(
          transaction.date
        );

      if (!transactionDate) {
        return;
      }

      if (
        getMonthKey(
          transactionDate
        ) !== key
      ) {
        return;
      }

      hasTransactions =
        true;

      const amount =
        Number(
          transaction.amount
        ) || 0;

      const type =
        normalizeTransactionType(
          transaction.type
        );

      if (
        type === "expense"
      ) {

        expense +=
          amount;

      } else if (
        isTransactionReceived(
          transaction
        )
      ) {

        income +=
          amount;
      }
    }
  );

  return {

    income,

    expense,

    balance:
      income - expense,

    hasTransactions
  };
}


function getPreviousMonthDate() {

  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );
}


function calculatePercentageChange(
  current,
  previous
) {

  if (
    previous === 0
  ) {

    if (
      current === 0
    ) {
      return 0;
    }

    return null;
  }

  return (
    (
      (current - previous) /
      Math.abs(previous)
    ) * 100
  );
}


function formatPercentageChange(
  current,
  previous
) {

  const change =
    calculatePercentageChange(
      current,
      previous
    );

  if (
    change === null
  ) {

    return current > 0
      ? "novo"
      : "—";
  }

  if (
    Math.abs(change) <
    0.05
  ) {

    return "0%";
  }

  const sign =
    change > 0
      ? "+"
      : "";

  return `${sign}${change.toFixed(
    1
  )}%`;
}


function getChangeClass(
  current,
  previous,
  lowerIsBetter = false
) {

  if (
    current === previous
  ) {
    return "neutral";
  }

  const increased =
    current > previous;

  if (lowerIsBetter) {

    return increased
      ? "negative"
      : "positive";
  }

  return increased
    ? "positive"
    : "negative";
}


function getMonthName(date) {

  return date.toLocaleDateString(
    "pt-BR",
    {
      month: "long"
    }
  );
}


/* =========================================================
   ATUALIZAR COMPARAÇÃO DOS RELATÓRIOS
========================================================= */

function updateReportComparison() {

  const now =
    new Date();

  const previousDate =
    getPreviousMonthDate();

  const current =
    getMonthSummary(
      now
    );

  const previous =
    getMonthSummary(
      previousDate
    );

  const comparison = {

    comparisonIncome: {

      current:
        current.income,

      previous:
        previous.income,

      lowerIsBetter:
        false
    },

    comparisonExpense: {

      current:
        current.expense,

      previous:
        previous.expense,

      lowerIsBetter:
        true
    },

    comparisonBalance: {

      current:
        current.balance,

      previous:
        previous.balance,

      lowerIsBetter:
        false
    }
  };

  Object.entries(
    comparison
  ).forEach(
    ([id, data]) => {

      const element =
        $(id);

      if (!element) {
        return;
      }

      const percentage =
        formatPercentageChange(
          data.current,
          data.previous
        );

      const className =
        getChangeClass(
          data.current,
          data.previous,
          data.lowerIsBetter
        );

      element.textContent =
        `${formatMoney(
          data.current
        )} (${percentage})`;

      element.classList.remove(
        "positive",
        "negative",
        "neutral"
      );

      element.classList.add(
        className
      );
    }
  );

  renderReportAnalysis(
    current,
    previous,
    now,
    previousDate
  );
}


/* =========================================================
   ANÁLISE AUTOMÁTICA DOS RELATÓRIOS
========================================================= */

function renderReportAnalysis(
  current,
  previous,
  currentDate,
  previousDate
) {

  const container =
    $("automaticReportAnalysis");

  if (!container) {
    return;
  }

  if (
    !current.hasTransactions &&
    !previous.hasTransactions
  ) {

    container.innerHTML = `
      <div class="report-analysis-content">

        <strong>
          📊 Ainda não há dados suficientes.
        </strong>

        <p>
          Adicione receitas e despesas para que o
          ControleS possa analisar sua evolução financeira.
        </p>

      </div>
    `;

    return;
  }

  if (
    !previous.hasTransactions
  ) {

    container.innerHTML = `
      <div class="report-analysis-content">

        <strong>
          📅 Primeiro mês de análise
        </strong>

        <p>
          Ainda não existem lançamentos suficientes no
          mês anterior para fazer uma comparação.
          Continue registrando suas movimentações para
          acompanhar sua evolução financeira.
        </p>

      </div>
    `;

    return;
  }

  const incomeChange =
    calculatePercentageChange(
      current.income,
      previous.income
    );

  const expenseChange =
    calculatePercentageChange(
      current.expense,
      previous.expense
    );

  const balanceChange =
    calculatePercentageChange(
      current.balance,
      previous.balance
    );

  const incomeImproved =
    current.income >
    previous.income;

  const incomeWorsened =
    current.income <
    previous.income;

  const expenseImproved =
    current.expense <
    previous.expense;

  const expenseWorsened =
    current.expense >
    previous.expense;

  const balanceImproved =
    current.balance >
    previous.balance;

  const balanceWorsened =
    current.balance <
    previous.balance;

  let title =
    "Sua situação financeira está estável.";

  let text =
    "Houve poucas mudanças entre os dois meses.";

  let icon =
    "📊";


  /* -------------------------------------------------------
     MELHOROU
  ------------------------------------------------------- */

  if (
    (
      incomeImproved &&
      !expenseWorsened
    ) ||
    (
      expenseImproved &&
      !incomeWorsened
    ) ||
    balanceImproved
  ) {

    title =
      "Sua situação financeira melhorou.";

    icon =
      "📈";

    if (
      incomeImproved &&
      expenseImproved
    ) {

      text =
        `Você aumentou suas receitas e reduziu suas despesas em relação a ${getMonthName(
          previousDate
        )}. Isso fez seu saldo melhorar.`;

    } else if (
      incomeImproved &&
      expenseWorsened
    ) {

      text =
        `Suas receitas aumentaram, mas suas despesas também subiram. Mesmo assim, seu saldo apresentou uma evolução positiva.`;

    } else if (
      expenseImproved
    ) {

      text =
        `Você conseguiu reduzir suas despesas em relação a ${getMonthName(
          previousDate
        )}, o que ajudou a melhorar seu resultado financeiro.`;

    } else {

      text =
        `Seu saldo ficou melhor do que no mês anterior. Continue acompanhando seus gastos para manter essa evolução.`;
    }
  }


  /* -------------------------------------------------------
     PIOROU
  ------------------------------------------------------- */

  if (
    (
      incomeWorsened &&
      !expenseImproved
    ) ||
    (
      expenseWorsened &&
      !incomeImproved
    ) ||
    balanceWorsened
  ) {

    title =
      "Sua situação financeira piorou.";

    icon =
      "📉";

    if (
      incomeWorsened &&
      expenseWorsened
    ) {

      text =
        `Suas receitas diminuíram e suas despesas aumentaram em relação a ${getMonthName(
          previousDate
        )}. Vale a pena revisar seus gastos.`;

    } else if (
      incomeWorsened
    ) {

      text =
        `Suas receitas diminuíram em relação ao mês anterior. Tente controlar as despesas para evitar que isso afete ainda mais seu saldo.`;

    } else if (
      expenseWorsened
    ) {

      text =
        `Suas despesas aumentaram em relação ao mês anterior. Observe principalmente as categorias que tiveram maior crescimento.`;

    } else {

      text =
        `Seu saldo ficou abaixo do resultado de ${getMonthName(
          previousDate
        )}. Vale a pena acompanhar suas receitas e despesas com mais atenção.`;
    }
  }


  /* -------------------------------------------------------
     SALDO NEGATIVO NOS DOIS MESES
  ------------------------------------------------------- */

  if (
    current.balance < 0 &&
    previous.balance < 0
  ) {

    title =
      "Atenção ao seu saldo.";

    icon =
      "⚠️";

    if (
      current.balance >
      previous.balance
    ) {

      text =
        `Apesar de seu saldo ainda estar negativo, houve uma melhora em relação ao mês anterior. Suas despesas ainda estão acima das receitas.`;

    } else {

      text =
        `Seu saldo continua negativo e ficou pior em relação ao mês anterior. Procure reduzir despesas ou aumentar suas receitas.`;
    }
  }


  const incomeText =
    incomeChange === null
      ? current.income > 0
        ? "novo"
        : "—"
      : formatPercentageChange(
          current.income,
          previous.income
        );

  const expenseText =
    expenseChange === null
      ? current.expense > 0
        ? "novo"
        : "—"
      : formatPercentageChange(
          current.expense,
          previous.expense
        );

  const balanceText =
    balanceChange === null
      ? current.balance > 0
        ? "novo"
        : "—"
      : formatPercentageChange(
          current.balance,
          previous.balance
        );


  container.innerHTML = `
    <div class="report-analysis-content">

      <div class="report-analysis-title">

        <span>
          ${icon}
        </span>

        <strong>
          ${title}
        </strong>

      </div>

      <p>
        ${text}
      </p>

      <div class="report-analysis-details">

        <div>

          <span>
            Receitas
          </span>

          <strong>
            ${formatMoney(
              current.income
            )}
          </strong>

          <small>
            ${incomeText}
            vs. mês anterior
          </small>

        </div>


        <div>

          <span>
            Despesas
          </span>

          <strong>
            ${formatMoney(
              current.expense
            )}
          </strong>

          <small>
            ${expenseText}
            vs. mês anterior
          </small>

        </div>


        <div>

          <span>
            Saldo
          </span>

          <strong>
            ${formatMoney(
              current.balance
            )}
          </strong>

          <small>
            ${balanceText}
            vs. mês anterior
          </small>

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   GRÁFICO DE CATEGORIAS
========================================================= */

function renderCategoryChart() {

  const canvas =
    $("categoryChart");

  if (
    !canvas ||
    !window.Chart
  ) {
    return;
  }

  const totals = {};

  transactions
    .filter(
      t =>
        normalizeTransactionType(
          t.type
        ) === "expense"
    )
    .forEach(t => {

      const category =
        t.category ||
        "Outros";

      totals[category] =
        (
          totals[category] ||
          0
        ) +
        (
          Number(
            t.amount
          ) || 0
        );
    });

  const labels =
    Object.keys(
      totals
    );

  const values =
    Object.values(
      totals
    );

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart =
    new Chart(
      canvas,
      {
        type: "doughnut",

        data: {

          labels:
            labels.length
              ? labels
              : [
                  "Sem despesas"
                ],

          datasets: [

            {
              data:
                values.length
                  ? values
                  : [1],

              borderWidth:
                1
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
   PREMIUM
========================================================= */

function updatePremiumUI() {

  const active =
    isPremiumActive();

  const status =
    $("premiumStatusText");

  const button =
    $("activatePremiumBtn");

  if (active) {

    if (status) {

      status.textContent =
        `Premium ativo até ${formatDate(
          subscription?.current_period_end ||
          subscription?.expires_at
        )}.`;
    }

    if (button) {

      button.textContent =
        "Premium ativo";

      button.disabled =
        true;
    }

  } else {

    if (status) {

      status.textContent =
        "Modo de teste: ativação disponível para testes.";
    }

    if (button) {

      button.textContent =
        "Ativar Premium";

      button.disabled =
        false;
    }
  }

  updateReports();

  updatePremiumDashboard();
}


function isPremiumActive() {

  if (!subscription) {
    return false;
  }

  const status =
    String(
      subscription.status ||
      ""
    ).toLowerCase();

  if (
    !["active"].includes(
      status
    )
  ) {
    return false;
  }

  const end =
    subscription.current_period_end ||
    subscription.expires_at ||
    subscription.trial_end;

  if (!end) {
    return true;
  }

  const date =
    new Date(end);

  return (
    !Number.isNaN(
      date.getTime()
    ) &&
    date.getTime() >
      Date.now()
  );
}


function openPremiumModal() {

  if (
    isPremiumActive()
  ) {

    showToast(
      "Seu Premium já está ativo."
    );

    return;
  }

  clearMessage(
    "premiumMessage"
  );

  openModal(
    "premiumModal"
  );
}


/* =========================================================
   ATIVAÇÃO PREMIUM — TESTE
========================================================= */

async function activatePremium() {

  if (!currentUser) {

    showMessage(
      "premiumMessage",
      "Faça login novamente."
    );

    return;
  }

  const button =
    $("confirmPremiumBtn");

  setButtonLoading(
    button,
    true,
    "Ativando..."
  );

  try {

    const start =
      new Date();

    const end =
      new Date(
        start.getTime() +
        7 *
          24 *
          60 *
          60 *
          1000
      );

    const payload = {

      user_id:
        currentUser.id,

      status:
        "active",

      plan:
        "trial",

      price:
        24.99,

      current_period_start:
        start.toISOString(),

      current_period_end:
        end.toISOString()
    };

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "subscriptions"
        )
        .upsert(
          payload,
          {
            onConflict:
              "user_id"
          }
        )
        .select()
        .maybeSingle();

    if (error) {
      throw error;
    }

    subscription =
      data ||
      payload;

    closeModal(
      "premiumModal"
    );

    updatePremiumUI();

    showToast(
      "Premium ativado por 7 dias para teste!"
    );

  } catch (error) {

    console.error(
      "activatePremium:",
      error
    );

    showMessage(
      "premiumMessage",
      databaseError(
        error,
        "Não foi possível ativar o Premium."
      )
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Confirmar ativação"
    );
  }
}


/* =========================================================
   METAS
========================================================= */

async function saveGoal(event) {

  event.preventDefault();

  if (!currentUser) {

    showMessage(
      "goalMessage",
      "Faça login novamente."
    );

    return;
  }

  const name =
    valueOf(
      "goalName"
    ).trim();

  const target =
    Number(
      valueOf(
        "goalTarget"
      )
    );

  const current =
    Number(
      valueOf(
        "goalCurrent"
      ) || 0
    );

  if (
    !name ||
    !Number.isFinite(
      target
    ) ||
    target <= 0
  ) {

    showMessage(
      "goalMessage",
      "Informe o nome e o valor da meta."
    );

    return;
  }

  if (
    !Number.isFinite(
      current
    ) ||
    current < 0
  ) {

    showMessage(
      "goalMessage",
      "O valor guardado é inválido."
    );

    return;
  }

  if (
    current > target
  ) {

    showMessage(
      "goalMessage",
      "O valor guardado não pode ser maior que o valor da meta."
    );

    return;
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

          target,

          saved:
            current
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    if (data) {

      goals.unshift({
        ...data,

        target:
          Number(
            data.target
          ) || 0,

        saved:
          Number(
            data.saved
          ) || 0
      });
    }

    closeModal(
      "goalModal"
    );

    showToast(
      "Meta criada!"
    );

    await loadGoals();

  } catch (error) {

    console.error(
      "saveGoal:",
      error
    );

    showMessage(
      "goalMessage",
      databaseError(
        error,
        "Não foi possível criar a meta."
      )
    );
  }
}


function openGoalModal() {

  clearMessage(
    "goalMessage"
  );

  if ($("goalName")) {
    $("goalName").value =
      "";
  }

  if ($("goalTarget")) {
    $("goalTarget").value =
      "";
  }

  if ($("goalCurrent")) {
    $("goalCurrent").value =
      "0";
  }

  if ($("goalDeadline")) {
    $("goalDeadline").value =
      "";
  }

  openModal(
    "goalModal"
  );
}


/* =========================================================
   MODAL CATEGORIA
========================================================= */

function openCategoryModal() {

  clearMessage(
    "categoryMessage"
  );

  if ($("categoryName")) {
    $("categoryName").value =
      "";
  }

  openModal(
    "categoryModal"
  );
}


/* =========================================================
   SEÇÕES
========================================================= */

function showSection(
  section
) {

  if (
    !SECTION_TITLES[
      section
    ]
  ) {
    return;
  }

  document
    .querySelectorAll(
      ".content-section"
    )
    .forEach(el => {

      el.classList.toggle(
        "active",
        el.id ===
          `${section}Section`
      );
    });

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(el => {

      el.classList.toggle(
        "active",
        el.dataset.section ===
          section
      );
    });

  if ($("pageTitle")) {

    $("pageTitle").textContent =
      SECTION_TITLES[
        section
      ];
  }

  if (
    section ===
    "transactions"
  ) {

    renderTransactions();
  }

  if (
    section ===
    "receivable"
  ) {

    renderReceivables();
  }

  if (
    section ===
    "categories"
  ) {

    renderCategories();
  }

  if (
    section ===
    "reports"
  ) {

    updateReports();
  }

  if (
    section ===
    "premium"
  ) {

    updatePremiumUI();
  }

  if (
    section ===
    "dashboard"
  ) {

    updatePremiumDashboard();
  }

  $("sidebar")
    ?.classList.remove(
      "mobile-open"
    );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

  $("loginForm")
    ?.addEventListener(
      "submit",
      loginUser
    );

  $("registerForm")
    ?.addEventListener(
      "submit",
      registerUser
    );

  $("registerBtn")
    ?.addEventListener(
      "click",
      showRegisterView
    );

  $("backToLoginBtn")
    ?.addEventListener(
      "click",
      showLoginView
    );

  $("transactionForm")
    ?.addEventListener(
      "submit",
      saveTransaction
    );

  $("categoryForm")
    ?.addEventListener(
      "submit",
      saveCategory
    );

  $("goalForm")
    ?.addEventListener(
      "submit",
      saveGoal
    );

  $("confirmPremiumBtn")
    ?.addEventListener(
      "click",
      activatePremium
    );

  $("activatePremiumBtn")
    ?.addEventListener(
      "click",
      openPremiumModal
    );

  $("addTransactionBtn")
    ?.addEventListener(
      "click",
      () =>
        openTransactionModal(
          "income"
        )
    );

  $("addTransactionBtn2")
    ?.addEventListener(
      "click",
      () =>
        openTransactionModal(
          "income"
        )
    );

  $("addCategoryBtn")
    ?.addEventListener(
      "click",
      openCategoryModal
    );

  $("addCategoryBtn2")
    ?.addEventListener(
      "click",
      openCategoryModal
    );

  $("addGoalBtn")
    ?.addEventListener(
      "click",
      openGoalModal
    );

  $("logoutBtn")
    ?.addEventListener(
      "click",
      logout
    );

  $("themeBtn")
    ?.addEventListener(
      "click",
      toggleTheme
    );

  $("mobileMenuBtn")
    ?.addEventListener(
      "click",
      () => {

        $("sidebar")
          ?.classList.toggle(
            "mobile-open"
          );
      }
    );


  /* =======================================================
     A RECEBER — BOTÕES DO MODAL
  ======================================================= */

  $("receivableReceivedBtn")
    ?.addEventListener(
      "click",
      async () => {

        const transaction =
          receivablePromptQueue[0];

        if (!transaction) {

          closeModal(
            "receivableConfirmModal"
          );

          processingReceivablePrompt =
            false;

          return;
        }

        await markReceivableAsReceived(
          transaction.id
        );
      }
    );


  $("receivablePendingBtn")
    ?.addEventListener(
      "click",
      keepReceivablePending
    );


  /* =======================================================
     CLIQUES GERAIS
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const nav =
        event.target.closest(
          ".nav-item,[data-section]"
        );

      if (
        nav?.dataset.section &&
        !event.target.closest(
          ".modal"
        )
      ) {

        event.preventDefault();

        showSection(
          nav.dataset.section
        );

        return;
      }


      /* ---------------------------------------------------
         A RECEBER — JÁ RECEBI
      --------------------------------------------------- */

      const receivableConfirm =
        event.target.closest(
          "[data-receivable-confirm]"
        );

      if (receivableConfirm) {

        markReceivableAsReceived(
          receivableConfirm.dataset
            .receivableConfirm
        );

        return;
      }


      /* ---------------------------------------------------
         AÇÕES
      --------------------------------------------------- */

      const action =
        event.target.closest(
          "[data-action]"
        );

      if (
        action?.dataset.action ===
        "add-income"
      ) {

        openTransactionModal(
          "income"
        );
      }

      if (
        action?.dataset.action ===
        "add-expense"
      ) {

        openTransactionModal(
          "expense"
        );
      }


      /* ---------------------------------------------------
         EDITAR
      --------------------------------------------------- */

      const edit =
        event.target.closest(
          "[data-edit-transaction]"
        );

      if (edit) {

        const transaction =
          transactions.find(
            item =>
              String(
                item.id
              ) ===
              String(
                edit.dataset
                  .editTransaction
              )
          );

        if (transaction) {

          openTransactionModal(
            normalizeTransactionType(
              transaction.type
            ),
            transaction
          );
        }
      }


      /* ---------------------------------------------------
         EXCLUIR
      --------------------------------------------------- */

      const del =
        event.target.closest(
          "[data-delete-transaction]"
        );

      if (del) {

        deleteTransaction(
          del.dataset
            .deleteTransaction
        );
      }


      /* ---------------------------------------------------
         FECHAR MODAL
      --------------------------------------------------- */

      const close =
        event.target.closest(
          "[data-close-modal],.modal-close"
        );

      if (close) {

        closeModal(
          close.closest(
            ".modal"
          )?.id
        );
      }

    }
  );


  /* =======================================================
     TIPO TRANSAÇÃO
  ======================================================= */

  document
    .querySelectorAll(
      "[data-transaction-type]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const type =
              button.dataset
                .transactionType;

            if (
              type ===
                "income" ||
              type ===
                "expense"
            ) {

              selectedTransactionType =
                type;

              setTransactionTypeButtons();

              populateTransactionCategories();
            }
          }
        );
      }
    );


  /* =======================================================
     MOSTRAR SENHA
  ======================================================= */

  document
    .querySelectorAll(
      "[data-password-toggle]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const input =
              $(
                button.dataset
                  .passwordToggle
              );

            if (!input) {
              return;
            }

            input.type =
              input.type ===
              "password"
                ? "text"
                : "password";

            button.setAttribute(
              "aria-label",
              input.type ===
                "password"
                ? "Mostrar senha"
                : "Ocultar senha"
            );
          }
        );
      }
    );


  /* =======================================================
     FILTROS
  ======================================================= */

  [
    "transactionSearch",
    "transactionFilter",
    "typeFilter",
    "categoryFilter"
  ].forEach(id => {

    $(id)?.addEventListener(
      "input",
      renderTransactions
    );

    $(id)?.addEventListener(
      "change",
      renderTransactions
    );
  });


  /* =======================================================
     FECHAR MODAIS
  ======================================================= */

  document
    .querySelectorAll(
      ".modal"
    )
    .forEach(
      modal => {

        modal.addEventListener(
          "click",
          event => {

            if (
              event.target ===
              modal
            ) {

              closeModal(
                modal.id
              );
            }
          }
        );
      }
    );


  /* =======================================================
     ESC
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        document
          .querySelectorAll(
            ".modal:not(.hidden)"
          )
          .forEach(
            modal =>
              closeModal(
                modal.id
              )
          );
      }
    }
  );
}


/* =========================================================
   TELAS
========================================================= */

function showLoginView() {

  $("loginView")
    ?.classList.remove(
      "hidden"
    );

  $("registerView")
    ?.classList.add(
      "hidden"
    );

  $("appView")
    ?.classList.add(
      "hidden"
    );

  $("loginEmail")
    ?.focus();
}


function showRegisterView() {

  $("loginView")
    ?.classList.add(
      "hidden"
    );

  $("registerView")
    ?.classList.remove(
      "hidden"
    );

  $("appView")
    ?.classList.add(
      "hidden"
    );

  clearMessage(
    "registerMessage"
  );

  $("registerName")
    ?.focus();
}


function showAppView() {

  $("loginView")
    ?.classList.add(
      "hidden"
    );

  $("registerView")
    ?.classList.add(
      "hidden"
    );

  $("appView")
    ?.classList.remove(
      "hidden"
    );

  showSection(
    "dashboard"
  );
}


/* =========================================================
   MODAIS
========================================================= */

function openModal(id) {

  $(id)
    ?.classList.remove(
      "hidden"
    );
}


function closeModal(id) {

  if (!id) {
    return;
  }

  $(id)
    ?.classList.add(
      "hidden"
    );
}


/* =========================================================
   DATA
========================================================= */

function setCurrentDate() {

  const el =
    $("currentDate");

  if (!el) {
    return;
  }

  el.textContent =
    new Date().toLocaleDateString(
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

  if (
    $("transactionDate")
  ) {

    $("transactionDate")
      .value =
      todayISO();
  }
}


function todayISO() {

  const d =
    new Date();

  const local =
    new Date(
      d.getTime() -
      d.getTimezoneOffset() *
        60000
    );

  return local
    .toISOString()
    .slice(
      0,
      10
    );
}


function normalizeDate(
  value
) {

  if (!value) {
    return "";
  }

  const text =
    String(value);

  return text.length >= 10
    ? text.slice(
        0,
        10
      )
    : "";
}


function parseDate(
  value
) {

  if (!value) {
    return null;
  }

  const normalized =
    normalizeDate(
      value
    );

  if (!normalized) {
    return null;
  }

  const date =
    new Date(
      `${normalized}T12:00:00`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatDate(
  value
) {

  const date =
    parseDate(
      value
    );

  return date
    ? date.toLocaleDateString(
        "pt-BR"
      )
    : "—";
}


/* =========================================================
   DINHEIRO
========================================================= */

function formatMoney(
  value
) {

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


function formatCompactMoney(
  value
) {

  const n =
    Number(
      value || 0
    );

  if (
    Math.abs(n) >=
    1000000
  ) {

    return `R$ ${(
      n / 1000000
    ).toFixed(1)} mi`;
  }

  if (
    Math.abs(n) >=
    1000
  ) {

    return `R$ ${(
      n / 1000
    ).toFixed(1)} mil`;
  }

  return `R$ ${n.toFixed(
    0
  )}`;
}


/* =========================================================
   VALIDAÇÃO
========================================================= */

function isValidEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


/* =========================================================
   ERROS AUTH
========================================================= */

function friendlyAuthError(
  error
) {

  const message =
    String(
      error?.message ||
      ""
    ).toLowerCase();

  if (
    message.includes(
      "invalid login credentials"
    )
  ) {

    return "E-mail ou senha incorretos.";
  }

  if (
    message.includes(
      "user already registered"
    )
  ) {

    return "Este e-mail já está cadastrado.";
  }

  if (
    message.includes(
      "email not confirmed"
    )
  ) {

    return "Confirme seu e-mail antes de entrar.";
  }

  if (
    message.includes(
      "password"
    )
  ) {

    return "A senha informada não é válida.";
  }

  if (
    message.includes(
      "rate limit"
    )
  ) {

    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }

  if (
    message.includes(
      "invalid api key"
    )
  ) {

    return "A chave do Supabase não foi aceita. Confira a Publishable Key do projeto.";
  }

  return (
    error?.message ||
    "Não foi possível concluir a operação."
  );
}


/* =========================================================
   ERROS DATABASE
========================================================= */

function databaseError(
  error,
  fallback
) {

  if (
    error?.code ===
    "23505"
  ) {

    return "Este registro já existe.";
  }

  return (
    error?.message ||
    fallback
  );
}


/* =========================================================
   MENSAGENS
========================================================= */

function clearMessage(id) {

  const el =
    $(id);

  if (!el) {
    return;
  }

  el.textContent =
    "";

  el.classList.remove(
    "success"
  );
}


function showMessage(
  id,
  message,
  success = false
) {

  const el =
    $(id);

  if (!el) {
    return;
  }

  el.textContent =
    message;

  el.classList.toggle(
    "success",
    success
  );
}


/* =========================================================
   BOTÕES
========================================================= */

function setButtonLoading(
  button,
  loading,
  text
) {

  if (!button) {
    return;
  }

  if (loading) {

    button.dataset
      .originalText =
      button.textContent;

    button.disabled =
      true;

    button.textContent =
      text;

  } else {

    button.disabled =
      false;

    button.textContent =
      text ||
      button.dataset
        .originalText ||
      "Salvar";
  }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {

  const toast =
    $("toast");

  if (!toast) {
    return;
  }

  clearTimeout(
    toastTimer
  );

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  toastTimer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      3000
    );
}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    char =>
      ({
        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"
      }[char])
  );
}


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );
}


/* =========================================================
   GRÁFICOS
========================================================= */

function destroyCharts() {

  if (financeChart) {

    financeChart.destroy();

    financeChart =
      null;
  }

  if (categoryChart) {

    categoryChart.destroy();

    categoryChart =
      null;
  }
}


/* =========================================================
   TEMA
========================================================= */

function loadTheme() {

  const theme =
    localStorage.getItem(
      "controles_theme"
    );

  if (
    theme ===
    "dark"
  ) {

    document.body.classList.add(
      "dark"
    );
  }
}


function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );

  localStorage.setItem(
    "controles_theme",
    document.body.classList.contains(
      "dark"
    )
      ? "dark"
      : "light"
  );
}

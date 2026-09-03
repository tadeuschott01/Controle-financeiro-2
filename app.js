/* =========================================================
   CONTROLES - APP.JS
   Login + Cadastro + Dashboard + Lançamentos + Categorias
   + Metas + Relatórios + Premium + Tema + Supabase
========================================================= */

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const PREMIUM_TEST_MODE = true;

const PREMIUM_PRICE = 24.99;

const PREMIUM_TRIAL_DAYS = 7;

const CATEGORIES_STORAGE_KEY =
  "controles_categories";

const THEME_STORAGE_KEY =
  "controles_theme";


/* =========================================================
   VARIÁVEIS
========================================================= */

let supabaseClient = null;

let currentUser = null;

let currentProfile = null;

let transactions = [];

let goals = [];

let budgets = [];

let subscription = null;

let financeChart = null;

let categoryChart = null;

let selectedTransactionType = "income";

let editingTransactionId = null;

let toastTimer = null;

let authInitialized = false;

let enteringApp = false;


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
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupEvents();

    setCurrentDate();

    setDefaultDate();

    loadTheme();

    initializeSupabase();

    if (!supabaseClient) {
      showLogin();
      return;
    }

    await checkSession();
  }
);


/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {

  try {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !==
        "function"
    ) {
      throw new Error(
        "Biblioteca do Supabase não carregada."
      );
    }

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

    console.error(
      "Erro ao iniciar Supabase:",
      error
    );

    supabaseClient = null;
  }
}


/* =========================================================
   SESSÃO
========================================================= */

async function checkSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    supabaseClient.auth.onAuthStateChange(
      async (
        event,
        session
      ) => {

        if (
          event ===
          "SIGNED_OUT"
        ) {

          currentUser = null;

          currentProfile = null;

          transactions = [];

          goals = [];

          budgets = [];

          subscription = null;

          destroyCharts();

          showLogin();

          return;
        }

        if (
          event ===
            "SIGNED_IN" &&
          session?.user &&
          authInitialized
        ) {

          currentUser =
            session.user;

          await enterApp();
        }
      }
    );

    if (
      data?.session?.user
    ) {

      currentUser =
        data.session.user;

      await enterApp();

    } else {

      showLogin();
    }

    authInitialized = true;

  } catch (error) {

    console.error(
      "Erro ao verificar sessão:",
      error
    );

    authInitialized = true;

    showLogin();
  }
}


/* =========================================================
   LOGIN / CADASTRO
========================================================= */

function showLogin() {

  const loginView =
    document.getElementById(
      "loginView"
    );

  const registerView =
    document.getElementById(
      "registerView"
    );

  const loginScreen =
    document.getElementById(
      "loginScreen"
    );

  const app =
    document.getElementById(
      "app"
    );

  loginScreen?.classList.remove(
    "hidden"
  );

  loginView?.classList.remove(
    "hidden"
  );

  registerView?.classList.add(
    "hidden"
  );

  app?.classList.add(
    "hidden"
  );

  showLoginView();
}


function showLoginView() {

  document
    .getElementById(
      "loginView"
    )
    ?.classList.remove(
      "hidden"
    );

  document
    .getElementById(
      "registerView"
    )
    ?.classList.add(
      "hidden"
    );

  clearMessage(
    "loginMessage"
  );

  clearMessage(
    "registerMessage"
  );
}


function showRegister() {

  document
    .getElementById(
      "loginView"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "registerView"
    )
    ?.classList.remove(
      "hidden"
    );

  clearMessage(
    "registerMessage"
  );

  document
    .getElementById(
      "registerName"
    )
    ?.focus();
}


function showLoginForm() {

  showLoginView();
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
  event
) {

  event.preventDefault();

  if (!supabaseClient) {

    showMessage(
      "loginMessage",
      "Não foi possível conectar ao servidor. Verifique sua internet.",
      "error"
    );

    return;
  }

  const email =
    valueOf(
      "loginEmail"
    )
      .trim()
      .toLowerCase();

  const password =
    valueOf(
      "loginPassword"
    );

  if (
    !email ||
    !password
  ) {

    showMessage(
      "loginMessage",
      "Preencha e-mail e senha.",
      "error"
    );

    return;
  }

  const button =
    document.querySelector(
      "#loginForm button[type='submit']"
    );

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

    if (!data?.user) {

      throw new Error(
        "Não foi possível identificar o usuário."
      );
    }

    currentUser =
      data.user;

    await createProfileIfNeeded();

    showMessage(
      "loginMessage",
      "Login realizado. Abrindo seu ControleS...",
      "success"
    );

    await enterApp();

  } catch (error) {

    console.error(
      "Login:",
      error
    );

    let message =
      "Não foi possível entrar. Confira seu e-mail e senha.";

    const errorMessage =
      String(
        error?.message || ""
      );

    if (
      /email not confirmed/i.test(
        errorMessage
      )
    ) {

      message =
        "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";

    } else if (
      /invalid login credentials/i.test(
        errorMessage
      )
    ) {

      message =
        "E-mail ou senha incorretos.";
    }

    showMessage(
      "loginMessage",
      message,
      "error"
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

async function handleRegister(
  event
) {

  event.preventDefault();

  if (!supabaseClient) {

    showMessage(
      "registerMessage",
      "Não foi possível conectar ao servidor.",
      "error"
    );

    return;
  }

  const name =
    valueOf(
      "registerName"
    )
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  const email =
    valueOf(
      "registerEmail"
    )
      .trim()
      .toLowerCase();

  const password =
    valueOf(
      "registerPassword"
    );

  const confirm =
    valueOf(
      "registerPasswordConfirm"
    );

  if (
    name.length < 2
  ) {

    showMessage(
      "registerMessage",
      "Digite seu nome completo.",
      "error"
    );

    return;
  }

  if (
    !isValidEmail(email)
  ) {

    showMessage(
      "registerMessage",
      "Digite um e-mail válido.",
      "error"
    );

    return;
  }

  if (
    password.length < 6
  ) {

    showMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres.",
      "error"
    );

    return;
  }

  if (
    password !==
    confirm
  ) {

    showMessage(
      "registerMessage",
      "As senhas não coincidem.",
      "error"
    );

    return;
  }

  const button =
    document.getElementById(
      "createAccountBtn"
    );

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
              full_name:
                name,

              name:
                name
            }
          }
        }
      );

    if (error) {
      throw error;
    }

    if (
      data?.user &&
      data.session
    ) {

      currentUser =
        data.user;

      await createProfileIfNeeded();

      showMessage(
        "registerMessage",
        "Conta criada com sucesso!",
        "success"
      );

      await enterApp();

      return;
    }

    const loginEmail =
      document.getElementById(
        "loginEmail"
      );

    const loginPassword =
      document.getElementById(
        "loginPassword"
      );

    if (loginEmail) {
      loginEmail.value =
        email;
    }

    if (loginPassword) {
      loginPassword.value =
        "";
    }

    showMessage(
      "registerMessage",
      "Conta criada! Verifique seu e-mail para confirmar a conta e depois faça login.",
      "success"
    );

    setTimeout(
      () => {
        showLoginView();
      },
      1800
    );

  } catch (error) {

    console.error(
      "Cadastro:",
      error
    );

    let message =
      error?.message ||
      "Não foi possível criar a conta.";

    if (
      /already registered|already exists|user already/i.test(
        message
      )
    ) {

      message =
        "Este e-mail já possui uma conta. Volte e faça login.";
    }

    showMessage(
      "registerMessage",
      message,
      "error"
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

async function createProfileIfNeeded() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return null;
  }

  try {

    const {
      data: existing,
      error: readError
    } =
      await supabaseClient
        .from(
          "profiles"
        )
        .select("*")
        .eq(
          "id",
          currentUser.id
        )
        .maybeSingle();

    if (readError) {

      console.warn(
        "Perfil não pôde ser consultado:",
        readError.message
      );

      return null;
    }

    if (existing) {

      currentProfile =
        existing;

      return existing;
    }

    const metadata =
      currentUser.user_metadata ||
      {};

    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      "";

    const payload = {
      id:
        currentUser.id,

      full_name:
        name || null,

      email:
        currentUser.email ||
        null
    };

    const {
      data: created,
      error: insertError
    } =
      await supabaseClient
        .from(
          "profiles"
        )
        .insert(
          payload
        )
        .select()
        .single();

    if (insertError) {

      console.warn(
        "Perfil não pôde ser criado:",
        insertError.message
      );

      return null;
    }

    currentProfile =
      created;

    return created;

  } catch (error) {

    console.warn(
      "createProfileIfNeeded:",
      error
    );

    return null;
  }
}


async function loadProfile() {

  if (!currentUser) {
    return;
  }

  const profile =
    await createProfileIfNeeded();

  if (profile) {
    currentProfile =
      profile;
  }

  updateProfileUI();
}


function getUserFullName() {

  const metadata =
    currentUser?.user_metadata ||
    {};

  return (
    currentProfile?.full_name ||
    currentProfile?.name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    ""
  )
    .trim();
}


function getFirstName() {

  const fullName =
    getUserFullName();

  if (fullName) {

    return fullName
      .split(/\s+/)[0];
  }

  const email =
    currentUser?.email ||
    "";

  const localPart =
    email.split("@")[0];

  return localPart
    ? localPart
        .replace(
          /[._-]+/g,
          " "
        )
        .split(/\s+/)[0]
    : "Usuário";
}


function updateProfileUI() {

  const fullName =
    getUserFullName();

  const firstName =
    getFirstName();

  const email =
    currentUser?.email ||
    "—";

  const nameElement =
    document.getElementById(
      "topbarUserName"
    );

  const emailElement =
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

  nameElement &&
    (nameElement.textContent =
      fullName ||
      firstName);

  emailElement &&
    (emailElement.textContent =
      email);

  avatar &&
    (avatar.textContent =
      firstName
        .charAt(0)
        .toUpperCase());

  welcome &&
    (welcome.textContent =
      `Olá, ${firstName}! 👋`);
}


/* =========================================================
   ENTRAR NO APP
========================================================= */

async function enterApp() {

  if (
    !currentUser ||
    enteringApp
  ) {
    return;
  }

  enteringApp = true;

  document
    .getElementById(
      "loginScreen"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "loginView"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "registerView"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "app"
    )
    ?.classList.remove(
      "hidden"
    );

  try {

    await loadUserData();

    updateProfileUI();

    showSection(
      "dashboard"
    );

  } catch (error) {

    console.error(
      "Erro ao abrir o ControleS:",
      error
    );

    showToast(
      "Não foi possível carregar todos os dados. Tente novamente."
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

    console.error(
      "Logout:",
      error
    );

  } finally {

    currentUser = null;

    currentProfile = null;

    transactions = [];

    goals = [];

    budgets = [];

    subscription = null;

    destroyCharts();

    showLogin();

    showToast(
      "Você saiu da sua conta."
    );
  }
}


/* =========================================================
   CARREGAMENTO DOS DADOS
========================================================= */

async function loadUserData() {

  if (!currentUser) {
    return;
  }

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

  renderReports();

  renderPremiumState();
}


/* =========================================================
   LANÇAMENTOS - BANCO
========================================================= */

async function loadTransactions() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "transactions"
        )
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "date",
          {
            ascending:
              false
          }
        );

    if (error) {
      throw error;
    }

    transactions =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      "Lançamentos:",
      error.message
    );

    transactions = [];
  }
}


/* =========================================================
   METAS - BANCO
========================================================= */

async function loadGoals() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "goals"
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
        );

    if (error) {
      throw error;
    }

    goals =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      "Metas:",
      error.message
    );

    goals = [];
  }
}


/* =========================================================
   ORÇAMENTOS - BANCO
========================================================= */

async function loadBudgets() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "budgets"
        )
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        );

    if (error) {
      throw error;
    }

    budgets =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      "Orçamentos:",
      error.message
    );

    budgets = [];
  }
}


/* =========================================================
   ASSINATURA PREMIUM - BANCO
========================================================= */

async function loadSubscription() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } =
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

    if (error) {
      throw error;
    }

    subscription =
      data || null;

  } catch (error) {

    console.warn(
      "Premium:",
      error.message
    );

    subscription = null;
  }
}


/* =========================================================
   LANÇAMENTOS
========================================================= */

async function handleTransactionSubmit(
  event
) {

  event.preventDefault();

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  const description =
    valueOf(
      "transactionDescription"
    )
      .trim();

  const amount =
    Number(
      valueOf(
        "transactionAmount"
      )
    );

  const type =
    valueOf(
      "transactionType"
    );

  const category =
    valueOf(
      "transactionCategory"
    )
      .trim();

  const date =
    valueOf(
      "transactionDate"
    );

  if (
    !description ||
    !Number.isFinite(
      amount
    ) ||
    amount <= 0 ||
    !type ||
    !category ||
    !date
  ) {

    showMessage(
      "transactionMessage",
      "Preencha todos os campos corretamente.",
      "error"
    );

    return;
  }

  const submitButton =
    document.querySelector(
      "#transactionForm button[type='submit']"
    );

  setButtonLoading(
    submitButton,
    true,
    "Salvando..."
  );

  const payload = {

    user_id:
      currentUser.id,

    type,

    description,

    amount,

    category,

    date
  };

  const wasEditing =
    Boolean(
      editingTransactionId
    );

  try {

    let result;

    if (wasEditing) {

      result =
        await supabaseClient
          .from(
            "transactions"
          )
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
          )
          .select()
          .single();

    } else {

      result =
        await supabaseClient
          .from(
            "transactions"
          )
          .insert(
            payload
          )
          .select()
          .single();
    }

    if (result.error) {
      throw result.error;
    }

    editingTransactionId =
      null;

    closeModal(
      "transactionModal"
    );

    await loadTransactions();

    updateDashboard();

    renderTransactions();

    renderCategories();

    renderReports();

    showToast(
      wasEditing
        ? "Lançamento atualizado."
        : "Lançamento salvo."
    );

  } catch (error) {

    console.error(
      "Salvar lançamento:",
      error
    );

    showMessage(
      "transactionMessage",
      "Não foi possível salvar o lançamento. Verifique os campos da tabela transactions no Supabase.",
      "error"
    );

  } finally {

    setButtonLoading(
      submitButton,
      false,
      "Salvar lançamento"
    );
  }
}


/* =========================================================
   NOVO LANÇAMENTO
========================================================= */

function openTransactionModal(
  type = "income"
) {

  editingTransactionId =
    null;

  selectedTransactionType =
    type;

  const form =
    document.getElementById(
      "transactionForm"
    );

  form?.reset();

  const title =
    document.getElementById(
      "transactionModalTitle"
    );

  if (title) {
    title.textContent =
      "Novo lançamento";
  }

  const typeInput =
    document.getElementById(
      "transactionType"
    );

  if (typeInput) {
    typeInput.value =
      type;
  }

  const dateInput =
    document.getElementById(
      "transactionDate"
    );

  if (dateInput) {
    dateInput.value =
      todayISO();
  }

  populateCategorySelect();

  clearMessage(
    "transactionMessage"
  );

  openModal(
    "transactionModal"
  );
}


/* =========================================================
   EDITAR LANÇAMENTO
========================================================= */

function openEditTransaction(
  id
) {

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

  editingTransactionId =
    transaction.id;

  selectedTransactionType =
    transaction.type ||
    "expense";

  const title =
    document.getElementById(
      "transactionModalTitle"
    );

  if (title) {
    title.textContent =
      "Editar lançamento";
  }

  const description =
    document.getElementById(
      "transactionDescription"
    );

  if (description) {
    description.value =
      transaction.description ||
      "";
  }

  const amount =
    document.getElementById(
      "transactionAmount"
    );

  if (amount) {
    amount.value =
      transaction.amount ||
      "";
  }

  const type =
    document.getElementById(
      "transactionType"
    );

  if (type) {
    type.value =
      transaction.type ||
      "expense";
  }

  const date =
    document.getElementById(
      "transactionDate"
    );

  if (date) {
    date.value =
      normalizeDate(
        transaction.date
      );
  }

  populateCategorySelect(
    transaction.category ||
      ""
  );

  const notes =
    document.getElementById(
      "transactionNotes"
    );

  if (notes) {
    notes.value =
      transaction.notes ||
      "";
  }

  clearMessage(
    "transactionMessage"
  );

  openModal(
    "transactionModal"
  );
}


/* =========================================================
   EXCLUIR LANÇAMENTO
========================================================= */

async function deleteTransaction(
  id
) {

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  if (
    !window.confirm(
      "Deseja realmente excluir este lançamento?"
    )
  ) {
    return;
  }

  try {

    const {
      error
    } =
      await supabaseClient
        .from(
          "transactions"
        )
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

    await loadTransactions();

    updateDashboard();

    renderTransactions();

    renderCategories();

    renderReports();

    showToast(
      "Lançamento excluído."
    );

  } catch (error) {

    console.error(
      "Excluir:",
      error
    );

    showToast(
      "Não foi possível excluir o lançamento."
    );
  }
}


/* =========================================================
   RENDERIZAÇÃO DE LANÇAMENTOS
========================================================= */

function renderTransactions() {

  const tbody =
    document.getElementById(
      "transactionsTableBody"
    );

  const empty =
    document.getElementById(
      "transactionsEmpty"
    );

  if (tbody) {

    renderTransactionsTable(
      tbody,
      empty
    );
  }

  const list =
    document.getElementById(
      "transactionsList"
    );

  if (list) {

    renderTransactionsList(
      list
    );
  }

  populateTransactionFilters();
}


/* =========================================================
   TABELA DE LANÇAMENTOS
========================================================= */

function renderTransactionsTable(
  tbody,
  empty
) {

  if (
    !transactions.length
  ) {

    tbody.innerHTML =
      "";

    empty?.classList.remove(
      "hidden"
    );

    return;
  }

  empty?.classList.add(
    "hidden"
  );

  tbody.innerHTML =
    transactions
      .map(
        transaction => {

          const isIncome =
            transaction.type ===
            "income";

          const amount =
            formatMoney(
              transaction.amount
            );

          const sign =
            isIncome
              ? "+"
              : "-";

          return `
            <tr>

              <td>
                ${escapeHTML(
                  formatDate(
                    transaction.date
                  )
                )}
              </td>

              <td>
                ${escapeHTML(
                  transaction.description ||
                  "Sem descrição"
                )}
              </td>

              <td>
                ${escapeHTML(
                  transaction.category ||
                  "Outros"
                )}
              </td>

              <td class="${
                isIncome
                  ? "transaction-income"
                  : "transaction-expense"
              }">
                ${
                  isIncome
                    ? "Entrada"
                    : "Saída"
                }
              </td>

              <td class="${
                isIncome
                  ? "transaction-income"
                  : "transaction-expense"
              }">
                ${sign}${amount}
              </td>

              <td>

                <button
                  class="table-action"
                  type="button"
                  onclick="openEditTransaction('${escapeAttribute(
                    transaction.id
                  )}')"
                >
                  Editar
                </button>

                <button
                  class="table-action delete"
                  type="button"
                  onclick="deleteTransaction('${escapeAttribute(
                    transaction.id
                  )}')"
                >
                  Excluir
                </button>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* =========================================================
   LISTA DE LANÇAMENTOS
========================================================= */

function renderTransactionsList(
  container
) {

  if (
    !transactions.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        <div>
          <span>🧾</span>
          <p>Nenhum lançamento encontrado.</p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    transactions
      .map(
        transaction => {

          const isIncome =
            transaction.type ===
            "income";

          return `
            <div class="transaction-item">

              <div class="transaction-main">

                <div class="transaction-icon">
                  ${
                    isIncome
                      ? "↗"
                      : "↘"
                  }
                </div>

                <div class="transaction-info">

                  <strong>
                    ${escapeHTML(
                      transaction.description ||
                      "Sem descrição"
                    )}
                  </strong>

                  <span>
                    ${escapeHTML(
                      transaction.category ||
                      "Outros"
                    )}
                    •
                    ${escapeHTML(
                      formatDate(
                        transaction.date
                      )
                    )}
                  </span>

                </div>

              </div>

              <div class="transaction-right">

                <div class="transaction-value ${
                  isIncome
                    ? "transaction-income"
                    : "transaction-expense"
                }">

                  ${
                    isIncome
                      ? "+"
                      : "-"
                  }

                  ${formatMoney(
                    transaction.amount
                  )}

                </div>

                <div class="transaction-actions">

                  <button
                    class="icon-button"
                    type="button"
                    title="Editar"
                    onclick="openEditTransaction('${escapeAttribute(
                      transaction.id
                    )}')"
                  >
                    ✏️
                  </button>

                  <button
                    class="icon-button"
                    type="button"
                    title="Excluir"
                    onclick="deleteTransaction('${escapeAttribute(
                      transaction.id
                    )}')"
                  >
                    🗑️
                  </button>

                </div>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   CATEGORIAS
========================================================= */

function getCustomCategories() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          CATEGORIES_STORAGE_KEY
        ) ||
        "[]"
      );

    return Array.isArray(
      saved
    )
      ? saved
      : [];

  } catch {

    return [];
  }
}


function getAllCategories() {

  const fromTransactions =
    transactions
      .map(
        item =>
          item.category
      )
      .filter(Boolean);

  return [
    ...new Set(
      [
        ...DEFAULT_CATEGORIES,
        ...getCustomCategories(),
        ...fromTransactions
      ]
    )
  ].sort(
    (
      a,
      b
    ) =>
      a.localeCompare(
        b,
        "pt-BR"
      )
  );
}


function populateCategorySelect(
  selected = ""
) {

  const select =
    document.getElementById(
      "transactionCategory"
    );

  if (!select) {
    return;
  }

  const categories =
    getAllCategories();

  select.innerHTML =
    `
      <option value="">
        Selecione uma categoria
      </option>
    ` +
    categories
      .map(
        category =>
          `
            <option value="${escapeAttribute(
              category
            )}">
              ${escapeHTML(
                category
              )}
            </option>
          `
      )
      .join("");

  if (selected) {
    select.value =
      selected;
  }
}


/* =========================================================
   MODAL CATEGORIA
========================================================= */

function openCategoryModal() {

  document
    .getElementById(
      "categoryForm"
    )
    ?.reset();

  clearMessage(
    "categoryMessage"
  );

  openModal(
    "categoryModal"
  );
}


function handleCategorySubmit(
  event
) {

  event.preventDefault();

  const name =
    valueOf(
      "categoryName"
    )
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  if (
    name.length < 2
  ) {

    showMessage(
      "categoryMessage",
      "Digite um nome válido.",
      "error"
    );

    return;
  }

  const categories =
    getCustomCategories();

  const alreadyExists =
    [
      ...DEFAULT_CATEGORIES,
      ...categories
    ].some(
      item =>
        item.toLowerCase() ===
        name.toLowerCase()
    );

  if (
    alreadyExists
  ) {

    showMessage(
      "categoryMessage",
      "Essa categoria já existe.",
      "error"
    );

    return;
  }

  categories.push(
    name
  );

  localStorage.setItem(
    CATEGORIES_STORAGE_KEY,
    JSON.stringify(
      categories
    )
  );

  document
    .getElementById(
      "categoryForm"
    )
    ?.reset();

  populateCategorySelect();

  renderCategories();

  closeModal(
    "categoryModal"
  );

  showToast(
    "Categoria criada."
  );
}


function renderCategories() {

  const grid =
    document.getElementById(
      "categoriesGrid"
    );

  if (!grid) {
    return;
  }

  const categories =
    getAllCategories();

  grid.innerHTML =
    categories
      .map(
        category => {

          const count =
            transactions.filter(
              item =>
                item.category ===
                category
            ).length;

          return `
            <div class="category-card">

              <div class="category-card-icon">
                📊
              </div>

              <h3>
                ${escapeHTML(
                  category
                )}
              </h3>

              <p>
                ${count}
                lançamento${
                  count === 1
                    ? ""
                    : "s"
                }
              </p>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   DASHBOARD
========================================================= */

function getTotals() {

  return transactions.reduce(
    (
      totals,
      transaction
    ) => {

      const amount =
        Number(
          transaction.amount
        ) || 0;

      if (
        transaction.type ===
        "income"
      ) {

        totals.income +=
          amount;

      } else {

        totals.expense +=
          amount;
      }

      return totals;

    },
    {
      income: 0,
      expense: 0
    }
  );
}


function updateDashboard() {

  const {
    income,
    expense
  } =
    getTotals();

  const balance =
    income -
    expense;

  setText(
    "incomeValue",
    formatMoney(
      income
    )
  );

  setText(
    "expenseValue",
    formatMoney(
      expense
    )
  );

  setText(
    "balanceValue",
    formatMoney(
      balance
    )
  );

  renderFinanceChart();

  renderRecentTransactions();
}


/* =========================================================
   LANÇAMENTOS RECENTES
========================================================= */

function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );

  if (!container) {
    return;
  }

  const recent =
    [...transactions]
      .sort(
        (
          a,
          b
        ) =>
          parseDate(
            b.date
          ) -
          parseDate(
            a.date
          )
      )
      .slice(
        0,
        5
      );

  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>
          <span>🧾</span>
          <p>Nenhum lançamento recente.</p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    recent
      .map(
        item => {

          const isIncome =
            item.type ===
            "income";

          return `
            <div class="recent-item">

              <div class="recent-info">

                <strong>
                  ${escapeHTML(
                    item.description ||
                    "Sem descrição"
                  )}
                </strong>

                <span>
                  ${escapeHTML(
                    item.category ||
                    "Outros"
                  )}
                  •
                  ${escapeHTML(
                    formatDate(
                      item.date
                    )
                  )}
                </span>

              </div>

              <div class="recent-value ${
                isIncome
                  ? "transaction-income"
                  : "transaction-expense"
              }">

                ${
                  isIncome
                    ? "+"
                    : "-"
                }

                ${formatMoney(
                  item.amount
                )}

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   GRÁFICO PRINCIPAL
========================================================= */

function renderFinanceChart() {

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

  const data =
    getMonthlyData(
      6
    );

  if (financeChart) {

    financeChart.destroy();

    financeChart = null;
  }

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return;
  }

  financeChart =
    new Chart(
      context,
      {
        type:
          "bar",

        data: {

          labels:
            data.labels,

          datasets: [

            {
              label:
                "Entradas",

              data:
                data.income,

              backgroundColor:
                "#26845a",

              borderRadius:
                7,

              maxBarThickness:
                28
            },

            {
              label:
                "Saídas",

              data:
                data.expense,

              backgroundColor:
                "#c84b4b",

              borderRadius:
                7,

              maxBarThickness:
                28
            }
          ]
        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          interaction: {

            mode:
              "index",

            intersect:
              false
          },

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


function getMonthlyData(
  monthCount = 6
) {

  const now =
    new Date();

  const labels = [];

  const income = [];

  const expense = [];

  for (
    let index =
      monthCount - 1;
    index >= 0;
    index--
  ) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() -
          index,
        1
      );

    const year =
      date.getFullYear();

    const month =
      date.getMonth();

    labels.push(
      date
        .toLocaleDateString(
          "pt-BR",
          {
            month:
              "short"
          }
        )
        .replace(
          ".",
          ""
        )
    );

    let monthIncome =
      0;

    let monthExpense =
      0;

    transactions.forEach(
      transaction => {

        const transactionDate =
          parseDate(
            transaction.date
          );

        if (
          transactionDate.getFullYear() ===
            year &&
          transactionDate.getMonth() ===
            month
        ) {

          const amount =
            Number(
              transaction.amount
            ) || 0;

          if (
            transaction.type ===
            "income"
          ) {

            monthIncome +=
              amount;

          } else {

            monthExpense +=
              amount;
          }
        }
      }
    );

    income.push(
      monthIncome
    );

    expense.push(
      monthExpense
    );
  }

  return {
    labels,
    income,
    expense
  };
}


/* =========================================================
   RELATÓRIOS
========================================================= */

function renderReports() {

  const {
    income,
    expense
  } =
    getTotals();

  const balance =
    income -
    expense;

  const values = [

    [
      "reportIncome",
      formatMoney(
        income
      )
    ],

    [
      "reportExpense",
      formatMoney(
        expense
      )
    ],

    [
      "reportBalance",
      formatMoney(
        balance
      )
    ],

    [
      "reportIncomeCard",
      formatMoney(
        income
      )
    ],

    [
      "reportExpenseCard",
      formatMoney(
        expense
      )
    ],

    [
      "reportBalanceCard",
      formatMoney(
        balance
      )
    ]
  ];

  values.forEach(
    (
      [id, value]
    ) => {

      setText(
        id,
        value
      );
    }
  );

  renderCategoryChart();

  renderPremiumReport();
}


/* =========================================================
   GRÁFICO POR CATEGORIA
========================================================= */

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

  const grouped = {};

  transactions
    .filter(
      item =>
        item.type ===
        "expense"
    )
    .forEach(
      item => {

        const category =
          item.category ||
          "Outros";

        grouped[category] =
          (
            grouped[
              category
            ] || 0
          ) +
          (
            Number(
              item.amount
            ) || 0
          );
      }
    );

  const labels =
    Object.keys(
      grouped
    );

  const values =
    Object.values(
      grouped
    );

  if (categoryChart) {

    categoryChart.destroy();

    categoryChart = null;
  }

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return;
  }

  categoryChart =
    new Chart(
      context,
      {
        type:
          "doughnut",

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

              backgroundColor: [

                "#123c2b",

                "#e88732",

                "#26845a",

                "#c84b4b",

                "#6b7280",

                "#8b5cf6",

                "#0891b2",

                "#d97706",

                "#16a34a",

                "#dc2626",

                "#475569"
              ],

              borderWidth:
                0
            }
          ]
        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "66%",

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
   RELATÓRIO PREMIUM
========================================================= */

function renderPremiumReport() {

  const container =
    document.getElementById(
      "premiumReportContent"
    );

  if (!container) {
    return;
  }

  const {
    income,
    expense
  } =
    getTotals();

  if (
    !transactions.length
  ) {

    container.innerHTML = `
      <div class="report-row">
        <span>
          📑 Gráfico de distribuição
        </span>

        <strong>
          Adicione lançamentos
        </strong>
      </div>

      <div class="report-row">
        <span>
          📄 Análise por categoria
        </span>

        <strong>
          Aguardando dados
        </strong>
      </div>
    `;

    return;
  }

  const largestExpense =
    [...transactions]
      .filter(
        item =>
          item.type ===
          "expense"
      )
      .sort(
        (
          a,
          b
        ) =>
          Number(
            b.amount
          ) -
          Number(
            a.amount
          )
      )[0];

  container.innerHTML = `
    <div class="report-row">
      <span>
        📑 Total movimentado
      </span>

      <strong>
        ${formatMoney(
          income +
          expense
        )}
      </strong>
    </div>

    <div class="report-row">
      <span>
        📄 Maior despesa
      </span>

      <strong>
        ${
          largestExpense
            ? escapeHTML(
                largestExpense.category ||
                "Outros"
              )
            : "—"
        }
      </strong>
    </div>

    <div class="report-row report-total">
      <span>
        💰 Saldo
      </span>

      <strong>
        ${formatMoney(
          income -
          expense
        )}
      </strong>
    </div>
  `;
}


/* =========================================================
   PREMIUM
========================================================= */

function isPremiumActive() {

  if (!subscription) {
    return false;
  }

  const status =
    String(
      subscription.status ||
      ""
    ).toLowerCase();

  const validStatus = [
    "active",
    "trialing",
    "premium"
  ].includes(
    status
  );

  if (!validStatus) {
    return false;
  }

  const periodEnd =
    subscription.current_period_end;

  if (periodEnd) {

    const end =
      new Date(
        periodEnd
      );

    if (
      !Number.isNaN(
        end.getTime()
      ) &&
      end.getTime() <=
        Date.now()
    ) {
      return false;
    }
  }

  return true;
}


function renderPremiumState() {

  const button =
    document.getElementById(
      "activatePremiumBtn"
    );

  if (!button) {
    return;
  }

  if (
    isPremiumActive()
  ) {

    button.textContent =
      "⭐ Premium ativo";

    button.disabled =
      true;

  } else {

    button.textContent =
      "⭐ Ativar Premium";

    button.disabled =
      false;
  }
}


function openPremiumModal() {

  clearMessage(
    "premiumMessage"
  );

  if (
    isPremiumActive()
  ) {

    showMessage(
      "premiumMessage",
      "Seu Premium já está ativo.",
      "success"
    );
  }

  openModal(
    "premiumModal"
  );
}


/* =========================================================
   PREMIUM - TESTE
========================================================= */

async function activatePremium() {

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  if (
    !PREMIUM_TEST_MODE
  ) {

    showMessage(
      "premiumMessage",
      "O pagamento do Premium precisa ser confirmado antes da ativação.",
      "error"
    );

    return;
  }

  const button =
    document.getElementById(
      "confirmPremiumBtn"
    );

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
        start
      );

    end.setDate(
      end.getDate() +
        PREMIUM_TRIAL_DAYS
    );

    const payload = {

      user_id:
        currentUser.id,

      status:
        "trialing",

      plan:
        "premium",

      price:
        PREMIUM_PRICE,

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
        .single();

    if (error) {
      throw error;
    }

    subscription =
      data;

    renderPremiumState();

    closeModal(
      "premiumModal"
    );

    showToast(
      `Seu teste Premium de ${PREMIUM_TRIAL_DAYS} dias foi ativado.`
    );

  } catch (error) {

    console.error(
      "Premium:",
      error
    );

    showMessage(
      "premiumMessage",
      "Não foi possível ativar o Premium agora. Verifique a tabela subscriptions no Supabase.",
      "error"
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Começar 7 dias grátis"
    );
  }
}


/* =========================================================
   METAS
========================================================= */

async function handleGoalSubmit(
  event
) {

  event.preventDefault();

  if (
    !currentUser ||
    !supabaseClient
  ) {
    return;
  }

  const name =
    valueOf(
      "goalName"
    )
      .trim();

  const amountField =
    document.getElementById(
      "goalTarget"
    ) ||
    document.getElementById(
      "goalAmount"
    );

  const amount =
    Number(
      amountField?.value ||
      0
    );

  if (
    !name ||
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {

    showMessage(
      "goalMessage",
      "Preencha os dados da meta corretamente.",
      "error"
    );

    return;
  }

  const button =
    document.querySelector(
      "#goalForm button[type='submit']"
    );

  setButtonLoading(
    button,
    true,
    "Criando..."
  );

  try {

    const {
      error
    } =
      await supabaseClient
        .from(
          "goals"
        )
        .insert(
          {
            user_id:
              currentUser.id,

            name,

            target_amount:
              amount
          }
        );

    if (error) {
      throw error;
    }

    await loadGoals();

    document
      .getElementById(
        "goalForm"
      )
      ?.reset();

    closeModal(
      "goalModal"
    );

    renderGoals();

    showToast(
      "Meta criada."
    );

  } catch (error) {

    console.error(
      "Meta:",
      error
    );

    showMessage(
      "goalMessage",
      "Não foi possível criar a meta. Verifique a tabela goals no Supabase.",
      "error"
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Criar meta"
    );
  }
}


function openGoalModal() {

  document
    .getElementById(
      "goalForm"
    )
    ?.reset();

  clearMessage(
    "goalMessage"
  );

  openModal(
    "goalModal"
  );
}


function renderGoals() {

  const container =
    document.getElementById(
      "goalsGrid"
    );

  if (!container) {
    return;
  }

  if (
    !goals.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        <div>
          <span>🎯</span>
          <p>Nenhuma meta cadastrada.</p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    goals
      .map(
        goal => {

          const target =
            Number(
              goal.target

/* =========================================================
   CONTROLES - APP.JS
   Login + Cadastro + Dashboard + Lançamentos + Categorias
   + Relatórios + Premium + Tema + Supabase
========================================================= */

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

let selectedTransactionType = "income";
let editingTransactionId = null;

let toastTimer = null;
let authInitialized = false;
let enteringApp = false;

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

document.addEventListener("DOMContentLoaded", async () => {

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

});


/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {

  try {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
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
      async (event, session) => {

        if (event === "SIGNED_OUT") {

          currentUser = null;
          currentProfile = null;

          transactions = [];
          goals = [];
          budgets = [];
          subscription = null;

          showLogin();

          return;
        }

        if (
          event === "SIGNED_IN" &&
          session?.user &&
          authInitialized
        ) {

          currentUser =
            session.user;

          await enterApp();
        }

      }
    );

    if (data?.session?.user) {

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
   ACESSO
========================================================= */

function showLogin() {

  /*
    O HTML atual possui loginView/registerView.
    O fallback para loginScreen mantém compatibilidade
    caso exista esse elemento em alguma versão anterior.
  */

  const loginScreen =
    document.getElementById("loginScreen") ||
    document.getElementById("loginView");

  const app =
    document.getElementById("app");

  if (loginScreen) {

    /*
      Remove qualquer estado antigo de hidden
      somente da tela de acesso.
    */

    loginScreen.classList.remove("hidden");
  }

  if (app) {

    app.classList.add("hidden");
  }

  /*
    Garante que o aplicativo não fique aberto
    por cima da tela de login.
  */

  document
    .getElementById("app")
    ?.classList.add("hidden");

  showLoginView();

}


function showLoginView() {

  const login =
    document.getElementById("loginView");

  const register =
    document.getElementById("registerView");

  if (login) {
    login.classList.remove("hidden");
  }

  if (register) {
    register.classList.add("hidden");
  }

  clearMessage("loginMessage");
  clearMessage("registerMessage");

}


function showRegister() {

  document
    .getElementById("loginView")
    ?.classList.add("hidden");

  document
    .getElementById("registerView")
    ?.classList.remove("hidden");

  clearMessage("registerMessage");

  document
    .getElementById("registerName")
    ?.focus();

}


function showLoginForm() {

  showLoginView();

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

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
    valueOf("loginEmail")
      .trim()
      .toLowerCase();

  const password =
    valueOf("loginPassword");

  if (!email || !password) {

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
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

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

    if (
      /email not confirmed/i.test(
        error.message || ""
      )
    ) {

      message =
        "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";

    } else if (
      /invalid login credentials/i.test(
        error.message || ""
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

async function handleRegister(event) {

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
    valueOf("registerName")
      .trim()
      .replace(/\s+/g, " ");

  const email =
    valueOf("registerEmail")
      .trim()
      .toLowerCase();

  const password =
    valueOf("registerPassword");

  const confirm =
    valueOf("registerPasswordConfirm");

  if (name.length < 2) {

    showMessage(
      "registerMessage",
      "Digite seu nome completo.",
      "error"
    );

    return;
  }

  if (password.length < 6) {

    showMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres.",
      "error"
    );

    return;
  }

  if (password !== confirm) {

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
      await supabaseClient.auth.signUp({
        email,
        password,

        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      });

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

    showMessage(
      "registerMessage",
      "Conta criada! Verifique seu e-mail para confirmar a conta e depois entre no ControleS.",
      "success"
    );

    const loginEmail =
      document.getElementById(
        "loginEmail"
      );

    const loginPassword =
      document.getElementById(
        "loginPassword"
      );

    if (loginEmail) {
      loginEmail.value = email;
    }

    if (loginPassword) {
      loginPassword.value = "";
    }

    setTimeout(
      () => {
        showLoginView();
      },
      1600
    );

  } catch (error) {

    console.error(
      "Cadastro:",
      error
    );

    let message =
      error.message ||
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
        .from("profiles")
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
      currentUser.user_metadata || {};

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
        currentUser.email || null

    };

    const {
      data: created,
      error: insertError
    } =
      await supabaseClient
        .from("profiles")
        .insert(payload)
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
    currentUser?.user_metadata || {};

  return (
    currentProfile?.full_name ||
    currentProfile?.name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    ""
  ).trim();

}


function getFirstName() {

  const fullName =
    getUserFullName();

  if (fullName) {

    return fullName
      .split(/\s+/)[0];
  }

  const email =
    currentUser?.email || "";

  const localPart =
    email.split("@")[0];

  return localPart
    ? localPart
        .replace(/[._-]+/g, " ")
        .split(/\s+/)[0]
    : "Usuário";

}


function updateProfileUI() {

  const fullName =
    getUserFullName();

  const firstName =
    getFirstName();

  const email =
    currentUser?.email || "—";

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

  if (nameElement) {
    nameElement.textContent =
      fullName || firstName;
  }

  if (emailElement) {
    emailElement.textContent =
      email;
  }

  if (avatar) {
    avatar.textContent =
      firstName
        .charAt(0)
        .toUpperCase();
  }

  if (welcome) {

    welcome.textContent =
      `Olá, ${firstName}! 👋`;
  }

}


/* =========================================================
   ENTRADA / SAÍDA
========================================================= */

async function enterApp() {

  if (
    !currentUser ||
    enteringApp
  ) {
    return;
  }

  enteringApp = true;

  /*
    IMPORTANTE:
    A versão anterior procurava somente #loginScreen,
    mas o HTML atual trabalha com #loginView.
    Agora os dois são tratados.
  */

  const loginScreen =
    document.getElementById(
      "loginScreen"
    ) ||
    document.getElementById(
      "loginView"
    );

  const registerView =
    document.getElementById(
      "registerView"
    );

  const app =
    document.getElementById(
      "app"
    );

  /*
    Fecha completamente a área de acesso
    antes de mostrar o aplicativo.
  */

  loginScreen?.classList.add(
    "hidden"
  );

  registerView?.classList.add(
    "hidden"
  );

  app?.classList.remove(
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


async function logout() {

  if (!supabaseClient) {

    showLogin();

    return;
  }

  try {

    await supabaseClient.auth.signOut();

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

    showLogin();

    showToast(
      "Você saiu da sua conta."
    );
  }

}


/* =========================================================
   DADOS
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
  renderReports();
  renderPremiumState();

}


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

      goals = [];

      return;
    }

    goals =
      Array.isArray(data)
        ? data
        : [];

  } catch {

    goals = [];
  }

}


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
        .from("budgets")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        );

    if (error) {

      budgets = [];

      return;
    }

    budgets =
      Array.isArray(data)
        ? data
        : [];

  } catch {

    budgets = [];
  }

}


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

      subscription = null;

      return;
    }

    subscription =
      data || null;

  } catch {

    subscription = null;
  }

}


/* =========================================================
   LANÇAMENTOS
========================================================= */

async function handleTransactionSubmit(event) {

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
    ).trim();

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
    ).trim();

  const date =
    valueOf(
      "transactionDate"
    );

  if (
    !description ||
    !amount ||
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

  try {

    let result;

    if (editingTransactionId) {

      result =
        await supabaseClient
          .from("transactions")
          .update(payload)
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
          .from("transactions")
          .insert(payload)
          .select()
          .single();
    }

    if (result.error) {
      throw result.error;
    }

    closeModal(
      "transactionModal"
    );

    await loadTransactions();

    updateDashboard();
    renderTransactions();
    renderReports();

    showToast(
      editingTransactionId
        ? "Lançamento atualizado."
        : "Lançamento salvo."
    );

    editingTransactionId = null;

  } catch (error) {

    console.error(
      "Salvar lançamento:",
      error
    );

    showMessage(
      "transactionMessage",
      "Não foi possível salvar. Verifique se a tabela transactions possui os campos user_id, type, description, amount, category e date.",
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

  editingTransactionId = null;

  selectedTransactionType =
    type;

  const form =
    document.getElementById(
      "transactionForm"
    );

  /*
    Reseta o formulário antes de preencher
    os valores padrão.
  */

  if (form) {
    form.reset();
  }

  /*
    CORREÇÃO:
    O título precisa existir no HTML como
    #transactionModalTitle.
  */

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


function openEditTransaction(id) {

  const transaction =
    transactions.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!transaction) {
    return;
  }

  editingTransactionId =
    transaction.id;

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
      transaction.description || "";
  }

  const amount =
    document.getElementById(
      "transactionAmount"
    );

  if (amount) {

    amount.value =
      transaction.amount || "";
  }

  const type =
    document.getElementById(
      "transactionType"
    );

  if (type) {

    type.value =
      transaction.type || "expense";
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

  populateCategorySelect();

  const category =
    document.getElementById(
      "transactionCategory"
    );

  if (category) {

    category.value =
      transaction.category || "";
  }

  clearMessage(
    "transactionMessage"
  );

  openModal(
    "transactionModal"
  );

}


async function deleteTransaction(id) {

  if (
    !currentUser ||
    !supabaseClient
  ) {
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

    await loadTransactions();

    updateDashboard();
    renderTransactions();
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


function renderTransactions() {

  const tbody =
    document.getElementById(
      "transactionsTableBody"
    );

  const empty =
    document.getElementById(
      "transactionsEmpty"
    );

  if (
    !tbody ||
    !empty
  ) {
    return;
  }

  if (!transactions.length) {

    tbody.innerHTML = "";

    empty.classList.remove(
      "hidden"
    );

    return;
  }

  empty.classList.add(
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

                ${sign}
                ${amount}

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
   CATEGORIAS
========================================================= */

function getCustomCategories() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "controles_categories"
        ) || "[]"
      );

    return Array.isArray(saved)
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
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...getCustomCategories(),
      ...fromTransactions
    ])
  ].sort(
    (a, b) =>
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
    `<option value="">Selecione uma categoria</option>` +
    categories
      .map(
        category =>
          `<option value="${escapeAttribute(
            category
          )}">
            ${escapeHTML(
              category
            )}
          </option>`
      )
      .join("");

  if (selected) {

    select.value =
      selected;
  }

}


function handleCategorySubmit(event) {

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

  if (name.length < 2) {

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

  if (alreadyExists) {

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
    "controles_categories",
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
    income - expense;

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
        (a, b) =>
          new Date(
            b.date
          ) -
          new Date(
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

          <p>
            Nenhum lançamento recente.
          </p>

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
    getMonthlyData(6);

  if (financeChart) {

    financeChart.destroy();
  }

  financeChart =
    new Chart(
      canvas.getContext("2d"),
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
    income - expense;

  const ids = [

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

  ids.forEach(
    ([id, value]) =>
      setText(
        id,
        value
      )
  );

  renderCategoryChart();

  renderPremiumReport();

}


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
  }

  categoryChart =
    new Chart(
      canvas.getContext("2d"),
      {

        type:
          "doughnut",

        data: {

          labels:
            labels.length
              ? labels
              : ["Sem despesas"],

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

  if (!transactions.length) {

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
        (a, b) =>
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
          income + expense
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
          income - expense
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

  const validStatus =
    [
      "active",
      "trialing",
      "premium"
    ].includes(
      status
    );

  if (!validStatus) {
    return false;
  }

  /*
    CORREÇÃO:
    Se o período Premium terminou,
    ele deixa de ser considerado ativo.
  */

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

  if (isPremiumActive()) {

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

  if (isPremiumActive()) {

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


async function activatePremium() {

  if (
    !currentUser ||
    !supabaseClient
  ) {
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
      end.getDate() + 7
    );

    const payload = {

      user_id:
        currentUser.id,

      status:
        "trialing",

      plan:
        "premium",

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
      "Seu teste Premium de 7 dias foi ativado."
    );

  } catch (error) {

    console.error(
      "Premium:",
      error
    );

    showMessage(
      "premiumMessage",
      "Não foi possível ativar o Premium agora. Verifique a estrutura da tabela subscriptions no Supabase.",
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

async function handleGoalSubmit(event) {

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
    ).trim();

  const amount =
    Number(
      valueOf(
        "goalAmount"
      )
    );

  if (
    !name ||
    !amount ||
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
        .from("goals")
        .insert({

          user_id:
            currentUser.id,

          name,

          target_amount:
            amount

        });

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


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showSection(
  sectionName
) {

  const sections =
    document.querySelectorAll(
      ".app-section"
    );

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  sections.forEach(
    section => {

      const active =
        section.id ===
        `${sectionName}Section`;

      section.classList.toggle(
        "active-section",
        active
      );

      section.classList.toggle(
        "hidden",
        !active
      );

    }
  );

  navItems.forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.section ===
          sectionName
      );

    }
  );

  /*
    Ao navegar pelo menu no celular,
    fecha o menu lateral.
  */

  document
    .getElementById(
      "sidebar"
    )
    ?.classList.remove(
      "mobile-open"
    );

  const mobileButton =
    document.getElementById(
      "mobileMenuBtn"
    );

  mobileButton?.setAttribute(
    "aria-expanded",
    "false"
  );

  mobileButton?.setAttribute(
    "aria-label",
    "Abrir menu"
  );

  if (
    sectionName ===
    "reports"
  ) {

    renderReports();
  }

  if (
    sectionName ===
    "categories"
  ) {

    renderCategories();
  }

}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

  /*
    LOGIN
  */

  document
    .getElementById(
      "loginForm"
    )
    ?.addEventListener(
      "submit",
      handleLogin
    );


  /*
    CADASTRO
  */

  document
    .getElementById(
      "registerForm"
    )
    ?.addEventListener(
      "submit",
      handleRegister
    );


  /*
    CRIAR CONTA
  */

  document
    .getElementById(
      "registerBtn"
    )
    ?.addEventListener(
      "click",
      event => {

        event.preventDefault();

        showRegister();

      }
    );

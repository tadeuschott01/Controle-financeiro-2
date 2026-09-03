/* =========================================================
   CONTROLES 1.0 — APP.JS
   Login + Cadastro + Dashboard + Lançamentos
   + Categorias + Relatórios + Premium + Tema
   + Supabase
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
  categories: "Categorias",
  reports: "Relatórios",
  premium: "Premium"
};


/* =========================================================
   ATALHOS
========================================================= */

const $ = id => document.getElementById(id);

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

  return normalizeTransactionType(type) ===
    "expense"
      ? "despesa"
      : "receita";
}


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

    loadLocalCategories();

    initializeSupabase();

    await checkSession();

  }
);


/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {

  if (!window.supabase?.createClient) {

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
   VERIFICAÇÃO DE SESSÃO
========================================================= */

async function checkSession() {

  if (!supabaseClient) {
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

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

          if (event === "SIGNED_OUT") {

            currentUser = null;

            currentProfile = null;

            subscription = null;

            transactions = [];

            goals = [];

            budgets = [];

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
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


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
    valueOf("registerPasswordConfirm");


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
   CRIAÇÃO DO PERFIL
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


/* =========================================================
   CARREGAR PERFIL
========================================================= */

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
        .eq("id", currentUser.id)
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


/* =========================================================
   NOME DO USUÁRIO
========================================================= */

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


/* =========================================================
   ATUALIZAR INTERFACE DO PERFIL
========================================================= */

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
      name.charAt(0).toUpperCase();
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

  destroyCharts();

  showLoginView();
}


/* =========================================================
   CARREGAR DADOS DO USUÁRIO
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
   LANÇAMENTOS
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
            )
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


    /*
      A tabela goals usa:

      id
      user_id
      name
      target
      saved
      created_at

      Portanto não usamos:

      target_amount
      current_amount
      deadline
    */

    goals =
      (data || []).map(
        goal => ({
          ...goal,

          target:
            Number(
              goal.target
            ) || 0,

          saved:
            Number(
              goal.saved
            ) || 0
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
   ASSINATURA PREMIUM
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
   SALVAR LANÇAMENTO
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

    category

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


    showToast(
      "Lançamento salvo!"
    );


    await loadTransactions();


    updateDashboard();

    updateReports();

    renderTransactions();


  } catch (error) {

    console.error(error);


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
   ABRIR MODAL DE LANÇAMENTO
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


  if ($("transactionDescription")) {

    $("transactionDescription").value =
      transaction?.description || "";
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


/* =========================================================
   BOTÕES DE TIPO
========================================================= */

function setTransactionTypeButtons() {

  document
    .querySelectorAll(
      "[data-transaction-type]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.transactionType ===
          selectedTransactionType
      );

    });


  if ($("transactionType")) {

    $("transactionType").value =
      selectedTransactionType;
  }
}


/* =========================================================
   EXCLUIR LANÇAMENTO
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


    showToast(
      "Lançamento excluído."
    );


    await loadTransactions();


    updateDashboard();

    updateReports();

    renderTransactions();


  } catch (error) {

    console.error(error);

    showToast(
      "Não foi possível excluir o lançamento."
    );
  }
}


/* =========================================================
   RENDERIZAR LANÇAMENTOS
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
        <span
          class="type-pill ${type}"
        >
          ${
            type === "income"
              ? "Receita"
              : "Despesa"
          }
        </span>
      </td>

      <td
        class="${
          type === "income"
            ? "positive"
            : "negative"
        }"
      >
        <strong>
          ${
            type === "expense"
              ? "- "
              : "+ "
          }${formatMoney(
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
        }`
          .toLowerCase();


      const transactionType =
        normalizeTransactionType(
          t.type
        );


      return (
        (!search ||
          haystack.includes(
            search
          )) &&

        (
          type === "all" ||
          transactionType ===
            normalizeTransactionType(
              type
            )
        ) &&

        (
          category === "all" ||
          t.category === category
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


/* =========================================================
   TODAS AS CATEGORIAS
========================================================= */

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


/* =========================================================
   CATEGORIAS LOCAIS
========================================================= */

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


/* =========================================================
   CATEGORIAS DO LANÇAMENTO
========================================================= */

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
        i.name === selected
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


/* =========================================================
   TIPO DAS CATEGORIAS PADRÃO
========================================================= */

function categoryDefaultType(
  name
) {

  return [
    "Salário",
    "Investimentos"
  ].includes(name)
    ? "income"
    : "expense";
}


/* =========================================================
   FILTRO DE CATEGORIAS
========================================================= */

function populateCategoryFilter() {

  const select =
    $("categoryFilter");


  if (!select) {
    return;
  }


  const current =
    select.value ||
    "all";


  select.innerHTML =
    '<option value="all">Todas as categorias</option>';


  getAllCategories()
    .forEach(name => {

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
    });


  select.value =
    getAllCategories()
      .includes(current)
      ? current
      : "all";
}


/* =========================================================
   RENDERIZAR CATEGORIAS
========================================================= */

function renderCategories() {

  const grid =
    $("categoriesGrid");


  if (!grid) {
    return;
  }


  grid.innerHTML = "";


  getAllCategories()
    .forEach(name => {

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
    });


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
}


/* =========================================================
   TOTAIS
========================================================= */

function getTotals() {

  let income = 0;

  let expense = 0;


  transactions.forEach(
    t => {

      const amount =
        Number(t.amount) ||
        0;


      if (
        normalizeTransactionType(
          t.type
        ) === "expense"
      ) {

        expense += amount;

      } else {

        income += amount;
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
   LANÇAMENTOS RECENTES
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

        <div>
          ◎
        </div>

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


  recent.forEach(
    t => {

      const type =
        normalizeTransactionType(
          t.type
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
          </small>

        </div>


        <div
          class="recent-right ${
            type === "income"
              ? "positive"
              : "negative"
          }"
        >

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
    }
  );
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
        ).padStart(2, "0")}`,

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

          responsive:
            true,

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

      if (
        normalizeTransactionType(
          t.type
        ) !==
        normalizeTransactionType(
          type
        )
      ) {

        return sum;
      }


      return String(
        t.date || ""
      ).slice(0, 7) === key

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


  Object.entries(
    ids
  ).forEach(
    ([id, value]) => {

      if ($(id)) {

        $(id).textContent =
          formatMoney(
            value
          );
      }
    }
  );


  const premium =
    isPremiumActive();


  $("premiumReportContent")
    ?.classList.toggle(
      "hidden",
      premium
    );


  $("normalReportContent")
    ?.classList.toggle(
      "hidden",
      !premium
    );


  if (premium) {

    renderCategoryChart();
  }
}


/* =========================================================
   GRÁFICO POR CATEGORIA
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
    .forEach(
      t => {

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
      }
    );


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
        `Premium ativo até ${
          formatDate(
            subscription?.current_period_end ||
            subscription?.expires_at
          )
        }.`;
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
}


/* =========================================================
   VERIFICAR PREMIUM
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


  if (
    ![
      "active"
    ].includes(status)
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


/* =========================================================
   MODAL PREMIUM
========================================================= */

function openPremiumModal() {

  if (isPremiumActive()) {

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


    /*
      ======================================================
      MODO DE TESTE

      Libera Premium por 7 dias.

      IMPORTANTE:
      Isto NÃO valida pagamento.

      Quando formos colocar a versão de produção,
      esta função deverá ser substituída pela validação
      real da assinatura/pagamento.
      ======================================================
    */


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
        .from("subscriptions")
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
      data || payload;


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
      ) ||
      0
    );


  /*
    A tabela goals NÃO possui deadline.

    O campo pode continuar existindo
    no HTML por enquanto, mas não será
    enviado ao Supabase.
  */


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


  if (current > target) {

    showMessage(
      "goalMessage",
      "O valor guardado não pode ser maior que o valor da meta."
    );

    return;
  }


  try {

    /*
      ======================================================
      ESTRUTURA REAL DA TABELA goals

      id
      user_id
      name
      target
      saved
      created_at

      Portanto:

      target_amount  -> target
      current_amount -> saved

      deadline NÃO existe e não é enviado.
      ======================================================
    */

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

          target:
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


/* =========================================================
   ABRIR MODAL DE META
========================================================= */

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
   ABRIR MODAL DE CATEGORIA
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
   NAVEGAÇÃO
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
    .forEach(
      el => {

        el.classList.toggle(
          "active",
          el.id ===
            `${section}Section`
        );
      }
    );


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      el => {

        el.classList.toggle(
          "active",
          el.dataset.section ===
            section
        );
      }
    );


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

  /* LOGIN */

  $("loginForm")
    ?.addEventListener(
      "submit",
      loginUser
    );


  /* CADASTRO */

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


  /* LANÇAMENTO */

  $("transactionForm")
    ?.addEventListener(
      "submit",
      saveTransaction
    );


  /* CATEGORIA */

  $("categoryForm")
    ?.addEventListener(
      "submit",
      saveCategory
    );


  /* META */

  $("goalForm")
    ?.addEventListener(
      "submit",
      saveGoal
    );


  /* PREMIUM */

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


  /* BOTÕES */

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


  /* TEMA */

  $("themeBtn")
    ?.addEventListener(
      "click",
      toggleTheme
    );


  /* MENU MOBILE */

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


  /* ======================================================
     EVENTOS GERAIS DE CLIQUE
  ====================================================== */

  document.addEventListener(
    "click",
    event => {

      /* NAVEGAÇÃO */

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


      /* AÇÕES */

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


      /* EDITAR */

      const edit =
        event.target.closest(
          "[data-edit-transaction]"
        );


      if (edit) {

        const transaction =
          transactions.find(
            item =>
              String(item.id) ===
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


      /* EXCLUIR */

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


      /* FECHAR MODAL */

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


  /* ======================================================
     TIPO DE TRANSAÇÃO
  ====================================================== */

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


  /* ======================================================
     MOSTRAR / OCULTAR SENHA
  ====================================================== */

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


  /* ======================================================
     FILTROS
  ====================================================== */

  [
    "transactionSearch",
    "transactionFilter",
    "typeFilter",
    "categoryFilter"
  ]
    .forEach(
      id => {

        $(id)
          ?.addEventListener(
            "input",
            renderTransactions
          );


        $(id)
          ?.addEventListener(
            "change",
            renderTransactions
          );

      }
    );


  /* ======================================================
     FECHAR MODAL CLICANDO FORA
  ====================================================== */

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


  /* ======================================================
     ESC
  ====================================================== */

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
   MOSTRAR LOGIN
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


/* =========================================================
   MOSTRAR CADASTRO
========================================================= */

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


/* =========================================================
   MOSTRAR APP
========================================================= */

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
   DATA ATUAL
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


/* =========================================================
   DATA PADRÃO
========================================================= */

function setDefaultDate() {

  if (
    $("transactionDate")
  ) {

    $("transactionDate")
      .value =
      todayISO();
  }
}


/* =========================================================
   DATA ISO LOCAL
========================================================= */

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


/* =========================================================
   NORMALIZAR DATA
========================================================= */

function normalizeDate(
  value
) {

  if (!value) {
    return "";
  }


  const text =
    String(value);


  return text.length >= 10
    ? text.slice(0, 10)
    : "";
}


/* =========================================================
   CONVERTER DATA
========================================================= */

function parseDate(
  value
) {

  if (!value) {
    return null;
  }


  const date =
    new Date(
      `${normalizeDate(
        value
      )}T12:00:00`
    );


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


/* =========================================================
   FORMATAR DATA
========================================================= */

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
   FORMATAR DINHEIRO
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


/* =========================================================
   FORMATAR DINHEIRO COMPACTO
========================================================= */

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

    return `R$ ${
      (n / 1000000)
        .toFixed(1)
    } mi`;
  }


  if (
    Math.abs(n) >=
    1000
  ) {

    return `R$ ${
      (n / 1000)
        .toFixed(1)
    } mil`;
  }


  return `R$ ${
    n.toFixed(0)
  }`;
}


/* =========================================================
   VALIDAR E-MAIL
========================================================= */

function isValidEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


/* =========================================================
   ERROS DE AUTENTICAÇÃO
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

    return (
      "E-mail ou senha incorretos."
    );
  }


  if (
    message.includes(
      "user already registered"
    )
  ) {

    return (
      "Este e-mail já está cadastrado."
    );
  }


  if (
    message.includes(
      "email not confirmed"
    )
  ) {

    return (
      "Confirme seu e-mail antes de entrar."
    );
  }


  if (
    message.includes(
      "password"
    )
  ) {

    return (
      "A senha informada não é válida."
    );
  }


  if (
    message.includes(
      "rate limit"
    )
  ) {

    return (
      "Muitas tentativas. Aguarde um pouco e tente novamente."
    );
  }


  return (
    error?.message ||
    "Não foi possível concluir a operação."
  );
}


/* =========================================================
   ERROS DO BANCO
========================================================= */

function databaseError(
  error,
  fallback
) {

  if (
    error?.code ===
    "23505"
  ) {

    return (
      "Este registro já existe."
    );
  }


  return (
    error?.message ||
    fallback
  );
}


/* =========================================================
   LIMPAR MENSAGEM
========================================================= */

function clearMessage(
  id
) {

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


/* =========================================================
   MOSTRAR MENSAGEM
========================================================= */

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
   LOADING DO BOTÃO
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
    char => ({

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
   DESTRUIR GRÁFICOS
========================================================= */

function destroyCharts() {

  if (financeChart) {

    financeChart.destroy();

    financeChart = null;
  }


  if (categoryChart) {

    categoryChart.destroy();

    categoryChart = null;
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

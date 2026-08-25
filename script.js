// =============================================
// FINCONTROL
// =============================================

// COLOQUE AQUI OS DADOS DO SEU PROJETO SUPABASE

const SUPABASE_URL = "COLE_AQUI_A_PROJECT_URL";

const SUPABASE_PUBLISHABLE_KEY =
  "COLE_AQUI_A_PUBLISHABLE_KEY";


const { createClient } = window.supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);


// =============================================
// ESTADO
// =============================================

let currentUser = null;

let transactions = [];


// =============================================
// ELEMENTOS
// =============================================

const authScreen =
  document.getElementById("authScreen");

const appScreen =
  document.getElementById("appScreen");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const recoveryForm =
  document.getElementById("recoveryForm");

const transactionModal =
  document.getElementById("transactionModal");

const transactionForm =
  document.getElementById("transactionForm");


// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener(
  "DOMContentLoaded",
  initialize
);


async function initialize() {

  setupEvents();

  setToday();

  setCurrentMonth();

  const {
    data
  } = await supabaseClient.auth.getSession();


  if (data.session) {

    await startApplication(
      data.session.user
    );

  } else {

    showAuth();

  }


  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      if (
        event === "SIGNED_IN" &&
        session
      ) {

        await startApplication(
          session.user
        );

      }


      if (
        event === "SIGNED_OUT"
      ) {

        showAuth();

      }

    }
  );

}


// =============================================
// EVENTOS
// =============================================

function setupEvents() {

  loginForm.addEventListener(
    "submit",
    handleLogin
  );


  registerForm.addEventListener(
    "submit",
    handleRegister
  );


  recoveryForm.addEventListener(
    "submit",
    handleRecovery
  );


  document
    .getElementById("showRegister")
    .addEventListener(
      "click",
      () => showAuthForm("register")
    );


  document
    .getElementById("showLogin")
    .addEventListener(
      "click",
      () => showAuthForm("login")
    );


  document
    .getElementById("forgotPassword")
    .addEventListener(
      "click",
      () => showAuthForm("recovery")
    );


  document
    .getElementById("backToLogin")
    .addEventListener(
      "click",
      () => showAuthForm("login")
    );


  document
    .querySelectorAll(".eye-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => togglePassword(
          button.dataset.target
        )
      );

    });


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          navigate(
            button.dataset.page
          );

        }
      );

    });


  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      if (
        !button.classList.contains(
          "nav-item"
        )
      ) {

        button.addEventListener(
          "click",
          () => {

            navigate(
              button.dataset.page
            );

          }
        );

      }

    });


  document
    .getElementById("logoutButton")
    .addEventListener(
      "click",
      logout
    );


  document
    .getElementById("themeButton")
    .addEventListener(
      "click",
      toggleTheme
    );


  document
    .getElementById("newTransaction")
    .addEventListener(
      "click",
      openTransactionModal
    );


  document
    .getElementById("newTransaction2")
    .addEventListener(
      "click",
      openTransactionModal
    );


  document
    .getElementById("closeModal")
    .addEventListener(
      "click",
      closeTransactionModal
    );


  document
    .getElementById("cancelModal")
    .addEventListener(
      "click",
      closeTransactionModal
    );


  transactionForm.addEventListener(
    "submit",
    saveTransaction
  );


  document
    .getElementById("dashboardMonth")
    .addEventListener(
      "change",
      renderDashboard
    );


  document
    .getElementById("searchInput")
    .addEventListener(
      "input",
      renderTransactionsTable
    );


  document
    .getElementById("typeFilter")
    .addEventListener(
      "change",
      renderTransactionsTable
    );


  document
    .getElementById("accountFilter")
    .addEventListener(
      "change",
      renderTransactionsTable
    );


  document
    .getElementById("mobileMenu")
    .addEventListener(
      "click",
      () => {

        document
          .getElementById("sidebar")
          .classList.toggle("open");

      }
    );

}


// =============================================
// AUTH
// =============================================

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


  setMessage(
    "loginMessage",
    "Entrando...",
    "success"
  );


  const {
    error
  } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });


  if (error) {

    setMessage(
      "loginMessage",
      getAuthError(error),
      "error"
    );

    return;

  }


  loginForm.reset();

}


async function handleRegister(event) {

  event.preventDefault();


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


  if (password.length < 6) {

    setMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres.",
      "error"
    );

    return;

  }


  setMessage(
    "registerMessage",
    "Criando sua conta...",
    "success"
  );


  const {
    data,
    error
  } =
    await supabaseClient.auth.signUp({

      email,
      password,

      options: {

        data: {
          name
        }

      }

    });


  if (error) {

    setMessage(
      "registerMessage",
      getAuthError(error),
      "error"
    );

    return;

  }


  if (data.session) {

    setMessage(
      "registerMessage",
      "Conta criada com sucesso!",
      "success"
    );

  } else {

    setMessage(
      "registerMessage",
      "Conta criada! Confira seu e-mail para confirmar o cadastro.",
      "success"
    );

  }

}


async function handleRecovery(event) {

  event.preventDefault();


  const email =
    document.getElementById(
      "recoveryEmail"
    ).value.trim();


  const redirectUrl =
    window.location.origin +
    window.location.pathname;


  const {
    error
  } =
    await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl
      }
    );


  if (error) {

    setMessage(
      "recoveryMessage",
      getAuthError(error),
      "error"
    );

    return;

  }


  setMessage(
    "recoveryMessage",
    "Enviamos as instruções para seu e-mail.",
    "success"
  );

}


async function logout() {

  await supabaseClient.auth.signOut();

}


// =============================================
// APLICAÇÃO
// =============================================

async function startApplication(user) {

  currentUser = user;

  authScreen.style.display = "none";

  appScreen.classList.add("active");


  const name =
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Usuário";


  document.getElementById(
    "userName"
  ).textContent = name;


  document.getElementById(
    "welcomeName"
  ).textContent = name;


  document.getElementById(
    "userEmail"
  ).textContent = user.email;


  document.getElementById(
    "userAvatar"
  ).textContent =
    name.charAt(0).toUpperCase();


  await loadTransactions();

  renderAll();

}


function showAuth() {

  currentUser = null;

  transactions = [];

  appScreen.classList.remove("active");

  authScreen.style.display = "grid";

  showAuthForm("login");

}


function showAuthForm(formName) {

  document
    .querySelectorAll(".auth-form")
    .forEach(form => {

      form.classList.remove("active");

    });


  const target =
    document.getElementById(
      formName + "Form"
    );


  if (target) {
    target.classList.add("active");
  }

}


// =============================================
// BANCO
// =============================================

async function loadTransactions() {

  if (!currentUser) return;


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

    console.error(error);

    alert(
      "Não foi possível carregar suas movimentações."
    );

    return;

  }


  transactions = data || [];

}


async function saveTransaction(event) {

  event.preventDefault();


  if (!currentUser) return;


  const id =
    document.getElementById(
      "transactionId"
    ).value;


  const type =
    document.querySelector(
      'input[name="transactionType"]:checked'
    ).value;


  const transaction = {

    user_id:
      currentUser.id,

    description:
      document.getElementById(
        "transactionDescription"
      ).value.trim(),

    value:
      Number(
        document.getElementById(
          "transactionValue"
        ).value
      ),

    date:
      document.getElementById(
        "transactionDate"
      ).value,

    type,

    category:
      document.getElementById(
        "transactionCategory"
      ).value,

    account:
      document.getElementById(
        "transactionAccount"
      ).value,

    wallet:
      document.getElementById(
        "transactionWallet"
      ).value,

    notes:
      document.getElementById(
        "transactionNotes"
      ).value.trim()

  };


  let result;


  if (id) {

    result =
      await supabaseClient
        .from("transactions")
        .update(transaction)
        .eq("id", id)
        .eq(
          "user_id",
          currentUser.id
        );

  } else {

    result =
      await supabaseClient
        .from("transactions")
        .insert(transaction);

  }


  if (result.error) {

    console.error(result.error);

    alert(
      "Não foi possível salvar a movimentação."
    );

    return;

  }


  closeTransactionModal();

  transactionForm.reset();

  setToday();

  await loadTransactions();

  renderAll();

}


async function deleteTransaction(id) {

  if (!currentUser) return;


  const confirmed =
    confirm(
      "Deseja excluir esta movimentação?"
    );


  if (!confirmed) return;


  const {
    error
  } =
    await supabaseClient
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    alert(
      "Não foi possível excluir."
    );

    return;

  }


  await loadTransactions();

  renderAll();

}


async function editTransaction(id) {

  const transaction =
    transactions.find(
      item => item.id === id
    );


  if (!transaction) return;


  document.getElementById(
    "transactionId"
  ).value = transaction.id;


  document.getElementById(
    "transactionDescription"
  ).value =
    transaction.description;


  document.getElementById(
    "transactionValue"
  ).value =
    transaction.value;


  document.getElementById(
    "transactionDate"
  ).value =
    transaction.date;


  document.getElementById(
    "transactionCategory"
  ).value =
    transaction.category;


  document.getElementById(
    "transactionAccount"
  ).value =
    transaction.account;


  document.getElementById(
    "transactionWallet"
  ).value =
    transaction.wallet || "principal";


  document.getElementById(
    "transactionNotes"
  ).value =
    transaction.notes || "";


  const radio =
    document.querySelector(
      `input[name="transactionType"][value="${transaction.type}"]`
    );


  if (radio) {
    radio.checked = true;
  }


  document.getElementById(
    "modalTitle"
  ).textContent =
    "Editar movimentação";


  transactionModal.classList.add(
    "active"
  );

}


// =============================================
// DASHBOARD
// =============================================

function renderDashboard() {

  const month =
    document.getElementById(
      "dashboardMonth"
    ).value;


  let data =
    transactions;


  if (month) {

    data =
      transactions.filter(
        item =>
          item.date.startsWith(month)
      );

  }


  const summary =
    calculate(data);


  document.getElementById(
    "balanceValue"
  ).textContent =
    formatCurrency(
      summary.balance
    );


  document.getElementById(
    "incomeValue"
  ).textContent =
    formatCurrency(
      summary.income
    );


  document.getElementById(
    "expenseValue"
  ).textContent =
    formatCurrency(
      summary.expense
    );


  document.getElementById(
    "resultValue"
  ).textContent =
    formatCurrency(
      summary.result
    );


  renderRecent(data);

  renderCategories(data);

}


function calculate(data) {

  let income = 0;

  let expense = 0;


  data.forEach(item => {

    if (
      item.type === "receita"
    ) {

      income += Number(
        item.value
      );

    } else {

      expense += Number(
        item.value
      );

    }

  });


  return {

    income,

    expense,

    balance:
      income - expense,

    result:
      income - expense

  };

}


// =============================================
// RECENTES
// =============================================

function renderRecent(data) {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  const recent =
    [...data]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 6);


  if (!recent.length) {

    container.innerHTML = `

      <div class="empty-state">

        <span>◎</span>

        <strong>
          Nenhuma movimentação
        </strong>

        <p>
          Comece adicionando sua primeira
          receita ou despesa.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    recent.map(item => {

      const income =
        item.type === "receita";


      return `

        <div class="recent-item">

          <div class="recent-icon ${
            income
              ? "income"
              : "expense"
          }">

            ${income ? "↗" : "↘"}

          </div>


          <div>

            <div class="recent-description">

              ${escapeHTML(
                item.description
              )}

            </div>

            <div class="recent-meta">

              ${formatDate(item.date)}
              ·
              ${formatCategory(
                item.category
              )}

            </div>

          </div>


          <div class="recent-value ${
            income
              ? "income"
              : "expense"
          }">

            ${income ? "+" : "-"}

            ${formatCurrency(
              item.value
            )}

          </div>

        </div>

      `;

    }).join("");

}


// =============================================
// CATEGORIAS
// =============================================

function renderCategories(data) {

  const container =
    document.getElementById(
      "categoryChart"
    );


  const expenses =
    data.filter(
      item =>
        item.type === "despesa"
    );


  if (!expenses.length) {

    container.innerHTML = `
      <div class="empty-small">
        Nenhuma despesa cadastrada.
      </div>
    `;

    return;

  }


  const categories = {};


  expenses.forEach(item => {

    categories[item.category] =
      (categories[item.category] || 0) +
      Number(item.value);

  });


  const ordered =
    Object.entries(categories)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5);


  const max =
    ordered[0]?.[1] || 1;


  container.innerHTML =
    ordered.map(
      ([category, value]) => `

        <div class="category-row">

          <span class="category-name">

            ${formatCategory(
              category
            )}

          </span>

          <div class="category-track">

            <div
              class="category-fill"
              style="
                width:${(value / max) * 100}%;
              "
            ></div>

          </div>

          <span class="category-value">

            ${formatCurrency(
              value
            )}

          </span>

        </div>

      `
    ).join("");

}


// =============================================
// TABELA
// =============================================

function renderTransactionsTable() {

  const tbody =
    document.getElementById(
      "transactionsTable"
    );


  const search =
    document.getElementById(
      "searchInput"
    ).value
      .toLowerCase();


  const type =
    document.getElementById(
      "typeFilter"
    ).value;


  const account =
    document.getElementById(
      "accountFilter"
    ).value;


  let data =
    [...transactions];


  if (search) {

    data =
      data.filter(
        item =>
          item.description
            .toLowerCase()
            .includes(search)
      );

  }


  if (type !== "todos") {

    data =
      data.filter(
        item =>
          item.type === type
      );

  }


  if (account !== "todos") {

    data =
      data.filter(
        item =>
          item.account === account
      );

  }


  if (!data.length) {

    tbody.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="empty-state">

            Nenhuma movimentação encontrada.

          </div>

        </td>

      </tr>

    `;

    return;

  }


  tbody.innerHTML =
    data.map(item => {

      const income =
        item.type === "receita";


      return `

        <tr>

          <td>
            ${formatDate(item.date)}
          </td>


          <td>

            <strong>
              ${escapeHTML(
                item.description
              )}
            </strong>

          </td>


          <td>
            ${formatCategory(
              item.category
            )}
          </td>


          <td>
            ${
              item.account === "empresa"
                ? "🏢 Empresa"
                : "👤 Pessoal"
            }
          </td>


          <td>

            <span class="badge ${
              income
                ? "income"
                : "expense"
            }">

              ${
                income
                  ? "Receita"
                  : "Despesa"
              }

            </span>

          </td>


          <td>

            <strong>

              ${income ? "+" : "-"}

              ${formatCurrency(
                item.value
              )}

            </strong>

          </td>


          <td>

            <button
              class="table-action"
              onclick="editTransaction('${item.id}')"
            >
              ✏️
            </button>


            <button
              class="table-action"
              onclick="deleteTransaction('${item.id}')"
            >
              🗑️
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


// =============================================
// NAVEGAÇÃO
// =============================================

function navigate(page) {

  document
    .querySelectorAll(".page")
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      "page-" + page
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });


  const titles = {

    dashboard: [
      "Dashboard",
      "Visão geral das suas finanças"
    ],

    movimentacoes: [
      "Movimentações",
      "Controle suas entradas e saídas"
    ],

    receitas: [
      "Receitas",
      "Suas entradas financeiras"
    ],

    despesas: [
      "Despesas",
      "Seus gastos"
    ],

    contas: [
      "Contas e cartões",
      "Organize seus bancos e cartões"
    ],

    planejamento: [
      "Planejamento",
      "Planeje seu futuro financeiro"
    ],

    metas: [
      "Metas",
      "Objetivos para seu dinheiro"
    ],

    pessoal: [
      "Financeiro pessoal",
      "Sua vida financeira"
    ],

    empresa: [
      "Financeiro empresarial",
      "Sua empresa"
    ],

    relatorios: [
      "Relatórios",
      "Análise financeira"
    ]

  };


  const title =
    titles[page] ||
    titles.dashboard;


  document.getElementById(
    "pageTitle"
  ).textContent = title[0];


  document.getElementById(
    "pageSubtitle"
  ).textContent = title[1];


  document
    .getElementById("sidebar")
    .classList.remove("open");


  renderPageData(page);

}


function renderPageData(page) {

  if (
    page === "dashboard"
  ) {

    renderDashboard();

  }


  if (
    page === "movimentacoes"
  ) {

    renderTransactionsTable();

  }


  if (
    page === "receitas"
  ) {

    renderSimpleList(
      "incomeList",
      "receita"
    );

  }


  if (
    page === "despesas"
  ) {

    renderSimpleList(
      "expenseList",
      "despesa"
    );

  }


  if (
    page === "pessoal"
  ) {

    renderEnvironment(
      "pessoal",
      "personalBalance"
    );

  }


  if (
    page === "empresa"
  ) {

    renderEnvironment(
      "empresa",
      "companyBalance"
    );

  }


  if (
    page === "relatorios"
  ) {

    renderReports();

  }

}


// =============================================
// LISTAS
// =============================================

function renderSimpleList(
  elementId,
  type
) {

  const container =
    document.getElementById(
      elementId
    );


  const data =
    transactions.filter(
      item =>
        item.type === type
    );


  if (!data.length) {

    container.innerHTML = `

      <div class="coming-card">

        <span>
          ${type === "receita" ? "↗" : "↘"}
        </span>

        <h3>
          Nenhum lançamento
        </h3>

        <p>
          Ainda não existem registros nesta categoria.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    data.map(item => `

      <div class="simple-item">

        <div>

          <strong>
            ${escapeHTML(
              item.description
            )}
          </strong>

          <small>

            ${formatDate(item.date)}
            ·
            ${formatCategory(
              item.category
            )}

          </small>

        </div>


        <strong
          style="
            color:${
              type === "receita"
                ? "var(--green)"
                : "var(--red)"
            }
          "
        >

          ${type === "receita" ? "+" : "-"}

          ${formatCurrency(
            item.value
          )}

        </strong>

      </div>

    `).join("");

}


// =============================================
// AMBIENTES
// =============================================

function renderEnvironment(
  account,
  elementId
) {

  const data =
    transactions.filter(
      item =>
        item.account === account
    );


  const summary =
    calculate(data);


  document.getElementById(
    elementId
  ).textContent =
    formatCurrency(
      summary.balance
    );

}


// =============================================
// RELATÓRIOS
// =============================================

function renderReports() {

  const container =
    document.getElementById(
      "reportContent"
    );


  const summary =
    calculate(
      transactions
    );


  container.innerHTML = `

    <div class="report-card">

      <span>
        Receitas
      </span>

      <strong>
        ${formatCurrency(
          summary.income
        )}
      </strong>

    </div>


    <div class="report-card">

      <span>
        Despesas
      </span>

      <strong>
        ${formatCurrency(
          summary.expense
        )}
      </strong>

    </div>


    <div class="report-card">

      <span>
        Resultado
      </span>

      <strong>
        ${formatCurrency(
          summary.result
        )}
      </strong>

    </div>

  `;

}


// =============================================
// MODAL
// =============================================

function openTransactionModal() {

  transactionForm.reset();

  document.getElementById(
    "transactionId"
  ).value = "";


  document.getElementById(
    "modalTitle"
  ).textContent =
    "Nova movimentação";


  document.querySelector(
    'input[name="transactionType"][value="receita"]'
  ).checked = true;


  setToday();


  transactionModal.classList.add(
    "active"
  );

}


function closeTransactionModal() {

  transactionModal.classList.remove(
    "active"
  );

}


// =============================================
// TEMA
// =============================================

function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );


  const dark =
    document.body.classList.contains(
      "dark"
    );


  localStorage.setItem(
    "fincontrol_theme",
    dark
      ? "dark"
      : "light"
  );


  document.getElementById(
    "themeButton"
  ).innerHTML =
    dark
      ? "☀ <span>Tema claro</span>"
      : "☾ <span>Tema escuro</span>";

}


function loadTheme() {

  const theme =
    localStorage.getItem(
      "fincontrol_theme"
    );


  if (theme === "dark") {

    document.body.classList.add(
      "dark"
    );

  }

}


// =============================================
// UTILIDADES
// =============================================

function setToday() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const input =
    document.getElementById(
      "transactionDate"
    );


  if (input) {
    input.value = today;
  }

}


function setCurrentMonth() {

  const date =
    new Date();


  const month =
    date.getFullYear() +
    "-" +
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const input =
    document.getElementById(
      "dashboardMonth"
    );


  if (input) {
    input.value = month;
  }

}


function formatCurrency(value) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(
    Number(value) || 0
  );

}


function formatDate(date) {

  if (!date) return "-";


  return new Date(
    date + "T00:00:00"
  ).toLocaleDateString(
    "pt-BR"
  );

}


function formatCategory(category) {

  const categories = {

    salario: "Salário",

    vendas: "Vendas",

    servicos: "Serviços",

    alimentacao: "Alimentação",

    moradia: "Moradia",

    transporte: "Transporte",

    saude: "Saúde",

    educacao: "Educação",

    lazer: "Lazer",

    compras: "Compras",

    impostos: "Impostos",

    fornecedores: "Fornecedores",

    marketing: "Marketing",

    outros: "Outros"

  };


  return (
    categories[category] ||
    category ||
    "Outros"
  );

}


function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


function togglePassword(id) {

  const input =
    document.getElementById(
      id
    );


  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


function setMessage(
  id,
  message,
  type
) {

  const element =
    document.getElementById(
      id
    );


  element.textContent =
    message;


  element.className =
    "auth-message " +
    type;

}


function getAuthError(error) {

  const message =
    error?.message || "";


  if (
    message.includes(
      "Invalid login credentials"
    )
  ) {

    return "E-mail ou senha incorretos.";

  }


  if (
    message.includes(
      "User already registered"
    )
  ) {

    return "Este e-mail já está cadastrado.";

  }


  if (
    message.includes(
      "Password should be at least"
    )
  ) {

    return "A senha precisa ter pelo menos 6 caracteres.";

  }


  return message ||
    "Ocorreu um erro. Tente novamente.";

}


// Carregar tema
loadTheme();

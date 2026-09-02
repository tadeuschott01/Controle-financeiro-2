/* =====================================================
   CONTROLES — APP JAVASCRIPT
   Sistema financeiro
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

let supabaseClient = null;


/* =====================================================
   ESTADO DA APLICAÇÃO
===================================================== */

let currentUser = null;
let currentProfile = null;

let transactions = [];
let goals = [];
let budgets = [];
let subscription = null;

let financeChart = null;
let categoryChart = null;
let reportCategoryChart = null;

let selectedTransactionType = "income";
let editingTransactionId = null;

let isInitializing = true;


/* =====================================================
   CATEGORIAS PADRÃO
===================================================== */

const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Salário",
  "Investimentos",
  "Contas",
  "Outros"
];


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  setupEvents();

  setCurrentDate();

  setDefaultDate();

  loadTheme();

  initializeSupabase();

  await checkSession();

});


/* =====================================================
   INICIALIZAR SUPABASE
===================================================== */

function initializeSupabase() {

  if (
    typeof window.supabase === "undefined" ||
    !window.supabase.createClient
  ) {
    console.error("Supabase não foi carregado.");

    showLogin();

    return;
  }

  supabaseClient = window.supabase.createClient(
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
}


/* =====================================================
   SESSÃO
===================================================== */

async function checkSession() {

  if (!supabaseClient) {
    showLogin();
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("Erro ao verificar sessão:", error);

      showLogin();

      return;
    }

    if (
      data &&
      data.session &&
      data.session.user
    ) {

      currentUser = data.session.user;

      await enterApp();

    } else {

      showLogin();

    }

  } catch (error) {

    console.error(error);

    showLogin();

  } finally {

    isInitializing = false;

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
        session &&
        session.user
      ) {

        currentUser = session.user;

        if (!isInitializing) {
          await enterApp();
        }

      }

    }
  );
}


/* =====================================================
   LOGIN
===================================================== */

function showLogin() {

  const loginView =
    document.getElementById("loginView");

  const registerView =
    document.getElementById("registerView");

  const app =
    document.getElementById("app");


  if (loginView) {
    loginView.classList.remove("hidden");
  }

  if (registerView) {
    registerView.classList.add("hidden");
  }

  if (app) {
    app.classList.add("hidden");
  }

  clearAuthMessages();

}


function showLoginView() {

  const loginView =
    document.getElementById("loginView");

  const registerView =
    document.getElementById("registerView");


  if (loginView) {
    loginView.classList.remove("hidden");
  }

  if (registerView) {
    registerView.classList.add("hidden");
  }

  clearAuthMessages();

}


function showRegister() {

  const loginView =
    document.getElementById("loginView");

  const registerView =
    document.getElementById("registerView");


  if (loginView) {
    loginView.classList.add("hidden");
  }

  if (registerView) {
    registerView.classList.remove("hidden");
  }

  clearAuthMessages();

}


function clearAuthMessages() {

  const loginMessage =
    document.getElementById("loginMessage");

  const registerMessage =
    document.getElementById("registerMessage");


  if (loginMessage) {

    loginMessage.textContent = "";

    loginMessage.className =
      "auth-message hidden";

  }

  if (registerMessage) {

    registerMessage.textContent = "";

    registerMessage.className =
      "auth-message hidden";

  }

}


function showAuthMessage(
  elementId,
  message,
  type = "error"
) {

  const element =
    document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;

  element.className =
    `auth-message ${type}`;

}


/* =====================================================
   LOGIN FORM
===================================================== */

async function handleLogin(event) {

  event.preventDefault();

  if (!supabaseClient) {

    showAuthMessage(
      "loginMessage",
      "Sistema de login indisponível no momento."
    );

    return;
  }


  const email =
    document
      .getElementById("loginEmail")
      ?.value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      ?.value;


  if (!email || !password) {

    showAuthMessage(
      "loginMessage",
      "Preencha e-mail e senha."
    );

    return;
  }


  const button =
    document.querySelector(
      "#loginForm .login-submit"
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

      console.error(error);

      let message =
        "Não foi possível entrar.";

      if (
        error.message
          .toLowerCase()
          .includes("email not confirmed")
      ) {

        message =
          "Confirme seu e-mail antes de entrar.";

      } else if (
        error.message
          .toLowerCase()
          .includes("invalid login credentials")
      ) {

        message =
          "E-mail ou senha incorretos.";

      }

      showAuthMessage(
        "loginMessage",
        message
      );

      return;
    }


    if (
      data &&
      data.user
    ) {

      currentUser = data.user;

      showAuthMessage(
        "loginMessage",
        "Login realizado com sucesso.",
        "success"
      );

      await enterApp();

    }

  } catch (error) {

    console.error(error);

    showAuthMessage(
      "loginMessage",
      "Ocorreu um erro ao tentar entrar."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Entrar no ControleS"
    );

  }

}


/* =====================================================
   CADASTRO
===================================================== */

async function handleRegister(event) {

  event.preventDefault();

  if (!supabaseClient) {

    showAuthMessage(
      "registerMessage",
      "Sistema de cadastro indisponível."
    );

    return;
  }


  const name =
    document
      .getElementById("registerName")
      ?.value
      .trim();

  const email =
    document
      .getElementById("registerEmail")
      ?.value
      .trim();

  const password =
    document
      .getElementById("registerPassword")
      ?.value;

  const passwordConfirm =
    document
      .getElementById("registerPasswordConfirm")
      ?.value;


  if (!name) {

    showAuthMessage(
      "registerMessage",
      "Digite seu nome completo."
    );

    return;
  }


  if (!email) {

    showAuthMessage(
      "registerMessage",
      "Digite um e-mail válido."
    );

    return;
  }


  if (password.length < 6) {

    showAuthMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres."
    );

    return;
  }


  if (password !== passwordConfirm) {

    showAuthMessage(
      "registerMessage",
      "As senhas não são iguais."
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

      console.error(error);

      showAuthMessage(
        "registerMessage",
        translateSupabaseError(error.message)
      );

      return;
    }


    if (!data || !data.user) {

      showAuthMessage(
        "registerMessage",
        "Não foi possível criar sua conta."
      );

      return;
    }


    currentUser = data.user;


    if (data.session) {

      await createProfileIfNeeded();

      showAuthMessage(
        "registerMessage",
        "Conta criada com sucesso!",
        "success"
      );

      await enterApp();

    } else {

      showAuthMessage(
        "registerMessage",
        "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois entre no ControleS.",
        "success"
      );

    }

  } catch (error) {

    console.error(error);

    showAuthMessage(
      "registerMessage",
      "Ocorreu um erro ao criar sua conta."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Criar minha conta"
    );

  }

}


/* =====================================================
   PERFIL
===================================================== */

async function createProfileIfNeeded() {

  if (!supabaseClient || !currentUser) {
    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {

      console.warn(
        "Não foi possível consultar o perfil:",
        error
      );

      return;

    }


    if (!data) {

      const fullName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        "";


      const {
        error: insertError
      } =
        await supabaseClient
          .from("profiles")
          .insert({
            id: currentUser.id,
            full_name: fullName,
            email: currentUser.email || ""
          });


      if (insertError) {

        console.warn(
          "Não foi possível criar o perfil:",
          insertError
        );

      }

    }

  } catch (error) {

    console.warn(error);

  }

}


async function loadProfile() {

  if (!currentUser) {
    return;
  }


  await createProfileIfNeeded();


  if (!supabaseClient) {
    updateProfileUI();
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

      console.warn(
        "Erro ao carregar perfil:",
        error
      );

      currentProfile = null;

    } else {

      currentProfile = data;

    }

  } catch (error) {

    console.warn(error);

    currentProfile = null;

  }


  updateProfileUI();

}


/* =====================================================
   INTERFACE DO USUÁRIO
===================================================== */

function getUserFullName() {

  return (
    currentProfile?.full_name ||
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    ""
  ).trim();

}


function getFirstName() {

  const fullName =
    getUserFullName();


  if (fullName) {

    return fullName
      .split(/\s+/)[0]
      .trim();

  }


  if (currentUser?.email) {

    return currentUser.email
      .split("@")[0]
      .trim();

  }


  return "Usuário";

}


function updateProfileUI() {

  if (!currentUser) {
    return;
  }


  const fullName =
    getUserFullName();

  const firstName =
    getFirstName();

  const email =
    currentUser.email || "";


  const nameElement =
    document.getElementById(
      "topbarUserName"
    );

  const emailElement =
    document.getElementById(
      "topbarUserEmail"
    );

  const avatarElement =
    document.getElementById(
      "userAvatarLetter"
    );

  const welcomeElement =
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


  if (avatarElement) {

    avatarElement.textContent =
      firstName
        .charAt(0)
        .toUpperCase();

  }


  if (welcomeElement) {

    welcomeElement.textContent =
      `Olá, ${firstName}!`;

  }

}


/* =====================================================
   ENTRAR NO APP
===================================================== */

async function enterApp() {

  if (!currentUser) {
    showLogin();
    return;
  }


  const loginView =
    document.getElementById("loginView");

  const registerView =
    document.getElementById("registerView");

  const app =
    document.getElementById("app");


  if (loginView) {
    loginView.classList.add("hidden");
  }

  if (registerView) {
    registerView.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }


  try {

    await loadUserData();

  } catch (error) {

    console.error(
      "Erro ao carregar dados:",
      error
    );

  }


  updateProfileUI();

  showSection("dashboard");

}


/* =====================================================
   CARREGAR DADOS
===================================================== */

async function loadUserData() {

  await loadProfile();

  await loadTransactions();

  await loadGoals();

  await loadBudgets();

  await loadSubscription();

  updateDashboard();

  renderTransactions();

  renderCategories();

  renderReports();

  renderPremium();

}


/* =====================================================
   TRANSAÇÕES
===================================================== */

async function loadTransactions() {

  transactions = [];


  if (!supabaseClient || !currentUser) {
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
        .eq("user_id", currentUser.id)
        .order("date", {
          ascending: false
        });


    if (error) {

      console.warn(
        "Erro ao carregar transações:",
        error
      );

      return;

    }


    transactions =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(error);

  }

}


/* =====================================================
   MODAL TRANSAÇÃO
===================================================== */

function openTransactionModal(
  type = "income"
) {

  const modal =
    document.getElementById(
      "transactionModal"
    );

  const form =
    document.getElementById(
      "transactionForm"
    );


  if (!modal || !form) {
    return;
  }


  editingTransactionId = null;

  selectedTransactionType = type;


  form.reset();


  const title =
    modal.querySelector(
      ".modal-header h2"
    );

  if (title) {

    title.textContent =
      "Novo lançamento";

  }


  const typeElement =
    document.getElementById(
      "transactionType"
    );

  if (typeElement) {

    typeElement.value =
      type;

  }


  setDefaultDate();

  populateCategorySelect();


  clearFormMessage(
    "transactionMessage"
  );


  modal.classList.remove("hidden");

}


function closeModal(modalId) {

  const modal =
    document.getElementById(
      modalId
    );

  if (modal) {

    modal.classList.add("hidden");

  }

}


function openEditTransaction(id) {

  const transaction =
    transactions.find(
      item => String(item.id) === String(id)
    );


  if (!transaction) {
    return;
  }


  const modal =
    document.getElementById(
      "transactionModal"
    );

  if (!modal) {
    return;
  }


  editingTransactionId =
    transaction.id;


  const title =
    modal.querySelector(
      ".modal-header h2"
    );

  if (title) {

    title.textContent =
      "Editar lançamento";

  }


  document.getElementById(
    "transactionDescription"
  ).value =
    transaction.description || "";


  document.getElementById(
    "transactionAmount"
  ).value =
    Number(transaction.amount || 0);


  document.getElementById(
    "transactionType"
  ).value =
    transaction.type || "income";


  populateCategorySelect(
    transaction.category || ""
  );


  document.getElementById(
    "transactionDate"
  ).value =
    normalizeDateInput(
      transaction.date
    );


  clearFormMessage(
    "transactionMessage"
  );


  modal.classList.remove("hidden");

}


/* =====================================================
   SALVAR TRANSAÇÃO
===================================================== */

async function handleTransactionSubmit(
  event
) {

  event.preventDefault();


  if (!supabaseClient || !currentUser) {

    showFormMessage(
      "transactionMessage",
      "Você precisa estar conectado para salvar."
    );

    return;

  }


  const description =
    document
      .getElementById(
        "transactionDescription"
      )
      .value
      .trim();


  const amount =
    parseFloat(
      document.getElementById(
        "transactionAmount"
      ).value
    );


  const type =
    document.getElementById(
      "transactionType"
    ).value;


  const category =
    document.getElementById(
      "transactionCategory"
    ).value;


  const date =
    document.getElementById(
      "transactionDate"
    ).value;


  if (!description) {

    showFormMessage(
      "transactionMessage",
      "Digite uma descrição."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showFormMessage(
      "transactionMessage",
      "Digite um valor válido."
    );

    return;

  }


  if (!category) {

    showFormMessage(
      "transactionMessage",
      "Selecione uma categoria."
    );

    return;

  }


  if (!date) {

    showFormMessage(
      "transactionMessage",
      "Selecione uma data."
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

    user_id: currentUser.id,

    description,

    amount,

    type,

    category,

    date

  };


  try {

    let error = null;


    if (editingTransactionId) {

      const response =
        await supabaseClient
          .from("transactions")
          .update(payload)
          .eq("id", editingTransactionId)
          .eq("user_id", currentUser.id);

      error = response.error;

    } else {

      const response =
        await supabaseClient
          .from("transactions")
          .insert(payload);

      error = response.error;

    }


    if (error) {

      console.error(error);

      showFormMessage(
        "transactionMessage",
        translateSupabaseError(
          error.message
        )
      );

      return;

    }


    closeModal("transactionModal");

    showToast(
      editingTransactionId
        ? "Lançamento atualizado."
        : "Lançamento salvo com sucesso."
    );


    await loadTransactions();

    updateDashboard();

    renderTransactions();

    renderReports();


  } catch (error) {

    console.error(error);

    showFormMessage(
      "transactionMessage",
      "Não foi possível salvar o lançamento."
    );

  } finally {

    setButtonLoading(
      submitButton,
      false,
      "Salvar lançamento"
    );

  }

}


/* =====================================================
   EXCLUIR TRANSAÇÃO
===================================================== */

async function deleteTransaction(id) {

  if (!supabaseClient || !currentUser) {
    return;
  }


  const confirmed =
    window.confirm(
      "Deseja realmente excluir este lançamento?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);


    if (error) {

      console.error(error);

      showToast(
        "Não foi possível excluir o lançamento."
      );

      return;

    }


    showToast(
      "Lançamento excluído."
    );


    await loadTransactions();

    updateDashboard();

    renderTransactions();

    renderReports();


  } catch (error) {

    console.error(error);

    showToast(
      "Erro ao excluir lançamento."
    );

  }

}


/* =====================================================
   RENDERIZAR TRANSAÇÕES
===================================================== */

function renderTransactions() {

  const tbody =
    document.getElementById(
      "transactionsTableBody"
    );

  const empty =
    document.getElementById(
      "transactionsEmpty"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (!transactions.length) {

    if (empty) {
      empty.classList.remove("hidden");
    }

    return;

  }


  if (empty) {
    empty.classList.add("hidden");
  }


  transactions.forEach(
    transaction => {

      const tr =
        document.createElement("tr");


      const isIncome =
        transaction.type === "income";


      const typeLabel =
        isIncome
          ? "Entrada"
          : "Saída";


      const formattedDate =
        formatDate(
          transaction.date
        );


      const formattedAmount =
        formatMoney(
          transaction.amount
        );


      tr.innerHTML = `

        <td>
          ${escapeHtml(formattedDate)}
        </td>

        <td>
          <span class="table-description">
            ${escapeHtml(
              transaction.description || "Sem descrição"
            )}
          </span>
        </td>

        <td>
          <span class="table-category">
            ${escapeHtml(
              transaction.category || "Outros"
            )}
          </span>
        </td>

        <td>
          <span class="type-badge ${isIncome ? "income" : "expense"}">
            ${typeLabel}
          </span>
        </td>

        <td>
          <span class="${isIncome ? "amount-income" : "amount-expense"}">
            ${isIncome ? "+" : "-"} ${formattedAmount}
          </span>
        </td>

        <td>

          <div class="table-actions">

            <button
              type="button"
              class="table-action"
              onclick="openEditTransaction('${escapeAttribute(transaction.id)}')"
              title="Editar"
            >
              ✎
            </button>

            <button
              type="button"
              class="table-action delete"
              onclick="deleteTransaction('${escapeAttribute(transaction.id)}')"
              title="Excluir"
            >
              ×
            </button>

          </div>

        </td>

      `;


      tbody.appendChild(tr);

    }
  );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

  let income = 0;
  let expense = 0;


  transactions.forEach(
    transaction => {

      const amount =
        Number(transaction.amount) || 0;


      if (transaction.type === "income") {

        income += amount;

      } else {

        expense += amount;

      }

    }
  );


  const balance =
    income - expense;


  const balanceElement =
    document.getElementById(
      "balanceValue"
    );

  const incomeElement =
    document.getElementById(
      "incomeValue"
    );

  const expenseElement =
    document.getElementById(
      "expenseValue"
    );


  if (balanceElement) {

    balanceElement.textContent =
      formatMoney(balance);

  }


  if (incomeElement) {

    incomeElement.textContent =
      formatMoney(income);

  }


  if (expenseElement) {

    expenseElement.textContent =
      formatMoney(expense);

  }


  renderFinanceChart();

  renderRecentTransactions();

}


/* =====================================================
   TRANSAÇÕES RECENTES
===================================================== */

function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  if (!container) {
    return;
  }


  if (!transactions.length) {

    container.innerHTML = `

      <div class="empty-state">

        <span>🧾</span>

        <h3>Nenhum lançamento</h3>

        <p>
          Seus lançamentos recentes aparecerão aqui.
        </p>

      </div>

    `;

    return;

  }


  const recent =
    [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


  container.innerHTML = `

    <div class="recent-list">

      ${recent.map(transaction => {

        const isIncome =
          transaction.type === "income";

        return `

          <div class="recent-item">

            <div class="recent-left">

              <div class="recent-icon">
                ${isIncome ? "↗" : "↘"}
              </div>

              <div class="recent-info">

                <strong>
                  ${escapeHtml(
                    transaction.description || "Sem descrição"
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    transaction.category || "Outros"
                  )}
                  ·
                  ${escapeHtml(
                    formatDate(transaction.date)
                  )}
                </span>

              </div>

            </div>

            <div
              class="recent-value ${isIncome ? "income" : "expense"}"
            >
              ${isIncome ? "+" : "-"}
              ${formatMoney(transaction.amount)}
            </div>

          </div>

        `;

      }).join("")}

    </div>

  `;

}


/* =====================================================
   GRÁFICO FINANCEIRO
===================================================== */

function renderFinanceChart() {

  const canvas =
    document.getElementById(
      "financeChart"
    );


  if (!canvas) {
    return;
  }


  if (
    typeof Chart === "undefined"
  ) {
    return;
  }


  if (financeChart) {

    financeChart.destroy();

    financeChart = null;

  }


  const monthlyData =
    getMonthlyData();


  const ctx =
    canvas.getContext("2d");


  financeChart =
    new Chart(ctx, {

      type: "bar",

      data: {

        labels:
          monthlyData.labels,

        datasets: [

          {

            label: "Entradas",

            data:
              monthlyData.income,

            borderRadius: 6,

            backgroundColor:
              "rgba(38,132,90,.75)"

          },

          {

            label: "Saídas",

            data:
              monthlyData.expense,

            borderRadius: 6,

            backgroundColor:
              "rgba(200,75,75,.65)"

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false
        },

        plugins: {

          legend: {
            display: true
          }

        },

        scales: {

          y: {

            beginAtZero: true,

            ticks: {

              callback: value =>
                formatMoney(value)

            }

          }

        }

      }

    });

}


/* =====================================================
   DADOS MENSAIS
===================================================== */

function getMonthlyData() {

  const labels = [];
  const income = [];
  const expense = [];


  const now =
    new Date();


  for (
    let i = 5;
    i >= 0;
    i--
  ) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );


    const year =
      date.getFullYear();

    const month =
      date.getMonth();


    labels.push(
      date.toLocaleDateString(
        "pt-BR",
        {
          month: "short"
        }
      ).replace(".", "")
    );


    let monthIncome = 0;
    let monthExpense = 0;


    transactions.forEach(
      transaction => {

        if (!transaction.date) {
          return;
        }


        const transactionDate =
          new Date(
            `${transaction.date}T00:00:00`
          );


        if (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        ) {

          const amount =
            Number(transaction.amount) || 0;


          if (
            transaction.type === "income"
          ) {

            monthIncome += amount;

          } else {

            monthExpense += amount;

          }

        }

      }
    );


    income.push(
      Number(monthIncome.toFixed(2))
    );

    expense.push(
      Number(monthExpense.toFixed(2))
    );

  }


  return {
    labels,
    income,
    expense
  };

}


/* =====================================================
   CATEGORIAS
===================================================== */

function getCustomCategories() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "controleS_categories"
        ) || "[]"
      );


    if (Array.isArray(saved)) {
      return saved;
    }

  } catch (error) {

    console.warn(error);

  }


  return [];

}


function getAllCategories() {

  const categories =
    new Set(DEFAULT_CATEGORIES);


  transactions.forEach(
    transaction => {

      if (
        transaction.category &&
        transaction.category.trim()
      ) {

        categories.add(
          transaction.category.trim()
        );

      }

    }
  );


  getCustomCategories()
    .forEach(category => {

      if (
        category &&
        category.trim()
      ) {

        categories.add(
          category.trim()
        );

      }

    });


  return Array.from(categories)
    .sort((a, b) =>
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


  select.innerHTML = `

    <option value="">
      Selecione uma categoria
    </option>

  `;


  categories.forEach(
    category => {

      const option =
        document.createElement("option");


      option.value =
        category;

      option.textContent =
        category;


      if (
        category === selected
      ) {

        option.selected =
          true;

      }


      select.appendChild(option);

    }
  );

}


/* =====================================================
   RENDERIZAR CATEGORIAS
===================================================== */

function renderCategories() {

  const container =
    document.getElementById(
      "categoriesGrid"
    );


  if (!container) {
    return;
  }


  const categories =
    getAllCategories();


  container.innerHTML =
    categories.map(
      category => {

        const total =
          transactions
            .filter(
              transaction =>
                transaction.category === category
            )
            .reduce(
              (sum, transaction) =>
                sum +
                (
                  Number(transaction.amount) || 0
                ),
              0
            );


        return `

          <div class="category-card">

            <div class="category-icon">
              ${getCategoryIcon(category)}
            </div>

            <h3>
              ${escapeHtml(category)}
            </h3>

            <p>
              ${formatMoney(total)}
              movimentado
            </p>

          </div>

        `;

      }
    ).join("");

}


/* =====================================================
   RELATÓRIOS
===================================================== */

function renderReports() {

  let income = 0;
  let expense = 0;


  transactions.forEach(
    transaction => {

      const amount =
        Number(transaction.amount) || 0;


      if (
        transaction.type === "income"
      ) {

        income += amount;

      } else {

        expense += amount;

      }

    }
  );


  const balance =
    income - expense;


  setText(
    "reportIncomeCard",
    formatMoney(income)
  );

  setText(
    "reportExpenseCard",
    formatMoney(expense)
  );

  setText(
    "reportBalanceCard",
    formatMoney(balance)
  );


  setText(
    "reportIncome",
    formatMoney(income)
  );

  setText(
    "reportExpense",
    formatMoney(expense)
  );

  setText(
    "reportBalance",
    formatMoney(balance)
  );


  renderCategoryChart();

}


/* =====================================================
   GRÁFICO POR CATEGORIA
===================================================== */

function renderCategoryChart() {

  const canvas =
    document.getElementById(
      "categoryChart"
    );


  if (!canvas) {
    return;
  }


  if (
    typeof Chart === "undefined"
  ) {
    return;
  }


  if (categoryChart) {

    categoryChart.destroy();

    categoryChart = null;

  }


  const categoryTotals = {};


  transactions
    .filter(
      transaction =>
        transaction.type === "expense"
    )
    .forEach(
      transaction => {

        const category =
          transaction.category ||
          "Outros";


        categoryTotals[category] =
          (
            categoryTotals[category] || 0
          ) +
          (
            Number(transaction.amount) || 0
          );

      }
    );


  const labels =
    Object.keys(categoryTotals);


  const values =
    Object.values(categoryTotals);


  const ctx =
    canvas.getContext("2d");


  if (!labels.length) {

    categoryChart =
      new Chart(ctx, {

        type: "doughnut",

        data: {

          labels: [
            "Sem despesas"
          ],

          datasets: [

            {

              data: [1],

              backgroundColor: [
                "#dfe7e2"
              ]

            }

          ]

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

    return;

  }


  categoryChart =
    new Chart(ctx, {

      type: "doughnut",

      data: {

        labels,

        datasets: [

          {

            data: values,

            borderWidth: 2,

            borderColor: "#ffffff"

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "66%",

        plugins: {

          legend: {
            position: "bottom"
          },

          tooltip: {

            callbacks: {

              label: context => {

                const value =
                  Number(
                    context.raw
                  ) || 0;

                const total =
                  values.reduce(
                    (a, b) =>
                      a + b,
                    0
                  );

                const percentage =
                  total > 0
                    ? (
                        value /
                        total *
                        100
                      )
                    : 0;


                return `${context.label}: ${formatMoney(value)} (${percentage.toFixed(1)}%)`;

              }

            }

          }

        }

      }

    });

}


/* =====================================================
   METAS
===================================================== */

async function loadGoals() {

  goals = [];


  if (!supabaseClient || !currentUser) {
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
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false
        });


    if (error) {

      console.warn(
        "Não foi possível carregar metas:",
        error
      );

      return;

    }


    goals =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(error);

  }

}


async function handleGoalSubmit(event) {

  event.preventDefault();


  if (!supabaseClient || !currentUser) {
    return;
  }


  const name =
    document.getElementById(
      "goalName"
    ).value.trim();


  const amount =
    parseFloat(
      document.getElementById(
        "goalAmount"
      ).value
    );


  if (!name) {

    showFormMessage(
      "goalMessage",
      "Digite o nome da meta."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showFormMessage(
      "goalMessage",
      "Digite um valor válido."
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

          amount

        });


    if (error) {

      console.error(error);

      showFormMessage(
        "goalMessage",
        translateSupabaseError(
          error.message
        )
      );

      return;

    }


    closeModal("goalModal");

    showToast(
      "Meta criada com sucesso."
    );


    await loadGoals();

  } catch (error) {

    console.error(error);

    showFormMessage(
      "goalMessage",
      "Não foi possível criar a meta."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Criar meta"
    );

  }

}


/* =====================================================
   ORÇAMENTOS
===================================================== */

async function loadBudgets() {

  budgets = [];


  if (!supabaseClient || !currentUser) {
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
        .eq("user_id", currentUser.id);


    if (error) {

      console.warn(
        "Orçamentos indisponíveis:",
        error
      );

      return;

    }


    budgets =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(error);

  }

}


/* =====================================================
   PREMIUM
===================================================== */

async function loadSubscription() {

  subscription = null;


  if (!supabaseClient || !currentUser) {
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
        .eq("user_id", currentUser.id)
        .maybeSingle();


    if (error) {

      console.warn(
        "Assinatura indisponível:",
        error
      );

      return;

    }


    subscription = data;

  } catch (error) {

    console.warn(error);

  }

}


function isPremiumActive() {

  if (!subscription) {
    return false;
  }


  const status =
    String(
      subscription.status || ""
    ).toLowerCase();


  return [
    "active",
    "trialing"
  ].includes(status);

}


function renderPremium() {

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


/* =====================================================
   PREMIUM MODAL
===================================================== */

function openPremiumModal() {

  const modal =
    document.getElementById(
      "premiumModal"
    );


  if (!modal) {
    return;
  }


  const message =
    document.getElementById(
      "premiumMessage"
    );


  if (message) {

    message.textContent = "";

    message.className =
      "form-message hidden";

  }


  modal.classList.remove("hidden");

}


async function activatePremium() {

  if (!supabaseClient || !currentUser) {
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

    /*
      Nesta etapa o Premium é preparado
      para receber o fluxo de pagamento.

      O pagamento real pode ser conectado
      posteriormente ao gateway escolhido.
    */


    const {
      error
    } =
      await supabaseClient
        .from("subscriptions")
        .upsert({

          user_id:
            currentUser.id,

          status:
            "trialing",

          plan:
            "monthly",

          price:
            24.99

        }, {

          onConflict:
            "user_id"

        });


    if (error) {

      console.error(error);

      showFormMessage(
        "premiumMessage",
        translateSupabaseError(
          error.message
        )
      );

      return;

    }


    closeModal("premiumModal");

    showToast(
      "Premium ativado com sucesso."
    );


    await loadSubscription();

    renderPremium();

    renderReports();


  } catch (error) {

    console.error(error);

    showFormMessage(
      "premiumMessage",
      "Não foi possível ativar o Premium."
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "Começar 7 dias grátis"
    );

  }

}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function showSection(sectionName) {

  const sections =
    document.querySelectorAll(
      ".app-section"
    );


  sections.forEach(
    section => {

      section.classList.remove(
        "active-section"
      );

      section.classList.add(
        "hidden"
      );

    }
  );


  const target =
    document.getElementById(
      `${sectionName}Section`
    );


  if (target) {

    target.classList.remove(
      "hidden"
    );

    target.classList.add(
      "active-section"
    );

  }


  const navItems =
    document.querySelectorAll(
      ".nav-item"
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


  closeSidebarMobile();

}


/* =====================================================
   EVENTOS
===================================================== */

function setupEvents() {

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );

  }


  const registerForm =
    document.getElementById(
      "registerForm"
    );

  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      handleRegister
    );

  }


  const transactionForm =
    document.getElementById(
      "transactionForm"
    );

  if (transactionForm) {

    transactionForm.addEventListener(
      "submit",
      handleTransactionSubmit
    );

  }


  const categoryForm =
    document.getElementById(
      "categoryForm"
    );

  if (categoryForm) {

    categoryForm.addEventListener(
      "submit",
      handleCategorySubmit
    );

  }


  const goalForm =
    document.getElementById(
      "goalForm"
    );

  if (goalForm) {

    goalForm.addEventListener(
      "submit",
      handleGoalSubmit
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          showSection(
            item.dataset.section
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


  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          closeModal(
            element.dataset.closeModal
          );

        }
      );

    });


  const addTransactionBtn =
    document.getElementById(
      "addTransactionBtn"
    );

  if (addTransactionBtn) {

    addTransactionBtn.addEventListener(
      "click",
      () => openTransactionModal("income")
    );

  }


  const addTransactionBtn2 =
    document.getElementById(
      "addTransactionBtn2"
    );

  if (addTransactionBtn2) {

    addTransactionBtn2.addEventListener(
      "click",
      () => openTransactionModal("income")
    );

  }


  const addCategoryBtn =
    document.getElementById(
      "addCategoryBtn"
    );

  if (addCategoryBtn) {

    addCategoryBtn.addEventListener(
      "click",
      openCategoryModal
    );

  }


  const addCategoryBtn2 =
    document.getElementById(
      "addCategoryBtn2"
    );

  if (addCategoryBtn2) {

    addCategoryBtn2.addEventListener(
      "click",
      openCategoryModal
    );

  }


  const addGoalBtn =
    document.getElementById(
      "addGoalBtn"
    );

  if (addGoalBtn) {

    addGoalBtn.addEventListener(
      "click",
      openGoalModal
    );

  }


  const premiumBtn =
    document.getElementById(
      "premiumBtn"
    );

  if (premiumBtn) {

    premiumBtn.addEventListener(
      "click",
      openPremiumModal
    );

  }


  const activatePremiumBtn =
    document.getElementById(
      "activatePremiumBtn"
    );

  if (activatePremiumBtn) {

    activatePremiumBtn.addEventListener(
      "click",
      openPremiumModal
    );

  }


  const confirmPremiumBtn =
    document.getElementById(
      "confirmPremiumBtn"
    );

  if (confirmPremiumBtn) {

    confirmPremiumBtn.addEventListener(
      "click",
      activatePremium
   

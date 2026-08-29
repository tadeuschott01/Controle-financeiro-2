// ============================================================
// CONTROLES - SCRIPT.JS
// Login + Cadastro + Sessão + Finanças
// Compatível com o HTML enviado
// ============================================================

// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
} else {
  console.error("Supabase não foi carregado.");
}

// ============================================================
// VARIÁVEIS
// ============================================================

let currentUser = null;
let transactions = [];
let financeChart = null;

// ============================================================
// ELEMENTOS
// ============================================================

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const authMessage = document.getElementById("authMessage");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const logoutButton = document.getElementById("logoutButton");
const mobileLogout = document.getElementById("mobileLogout");

// ============================================================
// MENSAGENS
// ============================================================

function showMessage(message, type = "error") {
  if (!authMessage) {
    alert(message);
    return;
  }

  authMessage.textContent = message;
  authMessage.className = "auth-message " + type;
}

function clearMessage() {
  if (!authMessage) return;

  authMessage.textContent = "";
  authMessage.className = "auth-message";
}

// ============================================================
// ABAS
// ============================================================

function showLoginForm() {
  if (loginForm) {
    loginForm.style.display = "block";
  }

  if (registerForm) {
    registerForm.style.display = "none";
  }

  if (loginTab) {
    loginTab.classList.add("active");
  }

  if (registerTab) {
    registerTab.classList.remove("active");
  }
}

function showRegisterForm() {
  if (loginForm) {
    loginForm.style.display = "none";
  }

  if (registerForm) {
    registerForm.style.display = "block";
  }

  if (loginTab) {
    loginTab.classList.remove("active");
  }

  if (registerTab) {
    registerTab.classList.add("active");
  }
}

if (loginTab) {
  loginTab.addEventListener("click", function (event) {
    event.preventDefault();

    clearMessage();
    showLoginForm();
  });
}

if (registerTab) {
  registerTab.addEventListener("click", function (event) {
    event.preventDefault();

    clearMessage();
    showRegisterForm();
  });
}

// ============================================================
// MOSTRAR APLICAÇÃO
// ============================================================

function showApp(user) {
  currentUser = user;

  if (authScreen) {
    authScreen.style.display = "none";
  }

  if (appScreen) {
    appScreen.style.display = "block";
  }

  const userName =
    document.getElementById("userName");

  if (userName) {
    const name =
      user?.user_metadata?.name ||
      user?.user_metadata?.nome ||
      user?.email ||
      "Usuário";

    userName.textContent = "Olá, " + name;
  }

  loadTransactions();
}

// ============================================================
// MOSTRAR LOGIN
// ============================================================

function showAuth() {
  currentUser = null;

  if (appScreen) {
    appScreen.style.display = "none";
  }

  if (authScreen) {
    authScreen.style.display = "flex";
  }
}

// ============================================================
// LOGIN
// ============================================================

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    clearMessage();

    const emailInput =
      document.getElementById("loginEmail");

    const passwordInput =
      document.getElementById("loginPassword");

    const email =
      emailInput
        ? emailInput.value.trim()
        : "";

    const password =
      passwordInput
        ? passwordInput.value
        : "";

    if (!email) {
      showMessage("Digite seu e-mail.");
      return;
    }

    if (!password) {
      showMessage("Digite sua senha.");
      return;
    }

    if (!supabaseClient) {
      showMessage(
        "Erro: o Supabase não foi carregado."
      );
      return;
    }

    if (loginButton) {
      loginButton.disabled = true;
      loginButton.textContent = "Entrando...";
    }

    try {
      const result =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

      const data = result.data;
      const error = result.error;

      console.log("LOGIN:", data, error);

      if (error) {
        const message =
          String(error.message || "").toLowerCase();

        if (
          message.includes("email not confirmed") ||
          message.includes("email not verified")
        ) {
          showMessage(
            "Seu e-mail ainda não foi confirmado. Confirme o e-mail da sua conta antes de entrar."
          );
          return;
        }

        if (
          message.includes("invalid login credentials")
        ) {
          showMessage(
            "E-mail ou senha incorretos."
          );
          return;
        }

        showMessage(
          error.message ||
          "Não foi possível entrar."
        );

        return;
      }

      if (data && data.user) {
        showApp(data.user);
      } else {
        showMessage(
          "Não foi possível iniciar sua sessão."
        );
      }

    } catch (error) {
      console.error(
        "Erro inesperado no login:",
        error
      );

      showMessage(
        "Erro ao comunicar com o Supabase."
      );

    } finally {
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
      }
    }
  });
}

// ============================================================
// CADASTRO
// ============================================================

if (registerForm) {
  registerForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      clearMessage();

      const nameInput =
        document.getElementById("registerName");

      const emailInput =
        document.getElementById("registerEmail");

      const passwordInput =
        document.getElementById("registerPassword");

      const name =
        nameInput
          ? nameInput.value.trim()
          : "";

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      const password =
        passwordInput
          ? passwordInput.value
          : "";

      if (!name) {
        showMessage("Digite seu nome.");
        return;
      }

      if (!email) {
        showMessage("Digite seu e-mail.");
        return;
      }

      if (!password || password.length < 6) {
        showMessage(
          "A senha precisa ter pelo menos 6 caracteres."
        );
        return;
      }

      if (!supabaseClient) {
        showMessage(
          "Erro: o Supabase não foi carregado."
        );
        return;
      }

      if (registerButton) {
        registerButton.disabled = true;
        registerButton.textContent =
          "Criando conta...";
      }

      try {
        const result =
          await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                name: name
              }
            }
          });

        const data = result.data;
        const error = result.error;

        console.log(
          "CADASTRO:",
          data,
          error
        );

        if (error) {
          const message =
            String(error.message || "")
              .toLowerCase();

          if (
            message.includes(
              "user already registered"
            )
          ) {
            showMessage(
              "Este e-mail já possui uma conta."
            );
            return;
          }

          showMessage(
            error.message ||
            "Não foi possível criar a conta."
          );

          return;
        }

        if (data && data.session && data.user) {
          showApp(data.user);
          return;
        }

        showMessage(
          "Conta criada! Se o Supabase estiver exigindo confirmação, confirme seu e-mail antes de entrar.",
          "success"
        );

        registerForm.reset();

        setTimeout(function () {
          showLoginForm();
        }, 1500);

      } catch (error) {
        console.error(
          "Erro inesperado no cadastro:",
          error
        );

        showMessage(
          "Erro ao comunicar com o Supabase."
        );

      } finally {
        if (registerButton) {
          registerButton.disabled = false;
          registerButton.textContent =
            "Criar conta";
        }
      }
    }
  );
}

// ============================================================
// LOGOUT
// ============================================================

async function logout() {
  if (!supabaseClient) {
    showAuth();
    return;
  }

  try {
    const result =
      await supabaseClient.auth.signOut();

    if (result.error) {
      console.error(
        "Erro ao sair:",
        result.error
      );
    }

  } catch (error) {
    console.error(
      "Erro no logout:",
      error
    );

  } finally {
    transactions = [];
    showAuth();
  }
}

if (logoutButton) {
  logoutButton.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      logout();
    }
  );
}

if (mobileLogout) {
  mobileLogout.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      logout();
    }
  );
}

// ============================================================
// SESSÃO
// ============================================================

async function checkSession() {
  if (!supabaseClient) {
    showAuth();
    return;
  }

  try {
    const result =
      await supabaseClient.auth.getSession();

    const data = result.data;
    const error = result.error;

    if (error) {
      console.error(
        "Erro ao verificar sessão:",
        error
      );

      showAuth();
      return;
    }

    if (
      data &&
      data.session &&
      data.session.user
    ) {
      showApp(data.session.user);
    } else {
      showAuth();
    }

  } catch (error) {
    console.error(
      "Erro na sessão:",
      error
    );

    showAuth();
  }
}

// ============================================================
// MONITORAR AUTENTICAÇÃO
// ============================================================

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(
    function (event, session) {
      console.log(
        "Supabase Auth:",
        event
      );

      if (event === "SIGNED_OUT") {
        showAuth();
      }
    }
  );
}

// ============================================================
// TRANSAÇÕES
// ============================================================

async function loadTransactions() {
  if (!currentUser) {
    return;
  }

  const key =
    "controles_transactions_" +
    currentUser.id;

  try {
    const saved =
      localStorage.getItem(key);

    if (saved) {
      transactions = JSON.parse(saved);
    } else {
      transactions = [];
    }

  } catch (error) {
    console.error(
      "Erro ao carregar transações:",
      error
    );

    transactions = [];
  }

  updateDashboard();
}

// ============================================================
// SALVAR TRANSAÇÕES
// ============================================================

function saveTransactions() {
  if (!currentUser) {
    return;
  }

  const key =
    "controles_transactions_" +
    currentUser.id;

  try {
    localStorage.setItem(
      key,
      JSON.stringify(transactions)
    );
  } catch (error) {
    console.error(
      "Erro ao salvar transações:",
      error
    );
  }
}

// ============================================================
// ENTRADAS
// ============================================================

const incomeForm =
  document.getElementById("incomeForm");

if (incomeForm) {
  incomeForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      if (!currentUser) {
        alert("Faça login primeiro.");
        return;
      }

      const description =
        document
          .getElementById("incomeDescription")
          ?.value
          .trim();

      const amount =
        Number(
          document
            .getElementById("incomeAmount")
            ?.value
        );

      const category =
        document
          .getElementById("incomeCategory")
          ?.value || "Outros";

      const date =
        document
          .getElementById("incomeDate")
          ?.value || today();

      if (!description) {
        alert("Digite uma descrição.");
        return;
      }

      if (!amount || amount <= 0) {
        alert("Digite um valor válido.");
        return;
      }

      transactions.push({
        id: Date.now().toString(),
        description: description,
        amount: amount,
        category: category,
        date: date,
        type: "income"
      });

      saveTransactions();

      incomeForm.reset();

      setDefaultDates();

      updateDashboard();

      alert(
        "Entrada adicionada com sucesso!"
      );
    }
  );
}

// ============================================================
// DESPESAS
// ============================================================

const expenseForm =
  document.getElementById("expenseForm");

if (expenseForm) {
  expenseForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      if (!currentUser) {
        alert("Faça login primeiro.");
        return;
      }

      const description =
        document
          .getElementById("expenseDescription")
          ?.value
          .trim();

      const amount =
        Number(
          document
            .getElementById("expenseAmount")
            ?.value
        );

      const category =
        document
          .getElementById("expenseCategory")
          ?.value || "Outros";

      const date =
        document
          .getElementById("expenseDate")
          ?.value || today();

      if (!description) {
        alert("Digite uma descrição.");
        return;
      }

      if (!amount || amount <= 0) {
        alert("Digite um valor válido.");
        return;
      }

      transactions.push({
        id: Date.now().toString(),
        description: description,
        amount: amount,
        category: category,
        date: date,
        type: "expense"
      });

      saveTransactions();

      expenseForm.reset();

      setDefaultDates();

      updateDashboard();

      alert(
        "Despesa adicionada com sucesso!"
      );
    }
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {
  let income = 0;
  let expense = 0;

  transactions.forEach(
    function (transaction) {
      const value =
        Number(transaction.amount || 0);

      if (transaction.type === "income") {
        income += value;
      }

      if (transaction.type === "expense") {
        expense += value;
      }
    }
  );

  const balance =
    income - expense;

  const balanceValue =
    document.getElementById(
      "balanceValue"
    );

  const incomeValue =
    document.getElementById(
      "incomeValue"
    );

  const expenseValue =
    document.getElementById(
      "expenseValue"
    );

  if (balanceValue) {
    balanceValue.textContent =
      formatMoney(balance);
  }

  if (incomeValue) {
    incomeValue.textContent =
      formatMoney(income);
  }

  if (expenseValue) {
    expenseValue.textContent =
      formatMoney(expense);
  }

  renderTransactions();

  renderRecentTransactions();

  renderChart(
    income,
    expense
  );
}

// ============================================================
// TABELA
// ============================================================

function renderTransactions() {
  const tbody =
    document.getElementById(
      "transactionsTableBody"
    );

  if (!tbody) {
    return;
  }

  if (
    !transactions ||
    transactions.length === 0
  ) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          Nenhuma transação encontrada.
        </td>
      </tr>
    `;

    return;
  }

  const sorted =
    [...transactions].sort(
      function (a, b) {
        return String(
          b.date || ""
        ).localeCompare(
          String(a.date || "")
        );
      }
    );

  tbody.innerHTML =
    sorted.map(
      function (transaction) {
        const isIncome =
          transaction.type === "income";

        const type =
          isIncome
            ? "Entrada"
            : "Despesa";

        const sign =
          isIncome
            ? "+"
            : "-";

        const className =
          isIncome
            ? "income-text"
            : "expense-text";

        return `
          <tr>
            <td>
              ${escapeHTML(
                transaction.description
              )}
            </td>

            <td>
              ${escapeHTML(
                transaction.category || "-"
              )}
            </td>

            <td>
              ${formatDate(
                transaction.date
              )}
            </td>

            <td>
              ${type}
            </td>

            <td class="${className}">
              ${sign}
              ${formatMoney(
                transaction.amount
              )}
            </td>
          </tr>
        `;
      }
    ).join("");
}

// ============================================================
// ÚLTIMAS TRANSAÇÕES
// ============================================================

function renderRecentTransactions() {
  const container =
    document.getElementById(
      "recentTransactions"
    );

  if (!container) {
    return;
  }

  if (
    !transactions ||
    transactions.length === 0
  ) {
    container.innerHTML = `
      <p style="
        color:#6b7280;
        font-size:14px;
      ">
        Nenhuma transação encontrada.
      </p>
    `;

    return;
  }

  const recent =
    [...transactions]
      .sort(
        function (a, b) {
          return String(
            b.date || ""
          ).localeCompare(
            String(a.date || "")
          );
        }
      )
      .slice(0, 5);

  container.innerHTML =
    recent.map(
      function (transaction) {
        const isIncome =
          transaction.type === "income";

        const sign =
          isIncome
            ? "+"
            : "-";

        const className =
          isIncome
            ? "income-text"
            : "expense-text";

        return `
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:12px 0;
            border-bottom:1px solid #eee;
          ">

            <div>

              <strong>
                ${escapeHTML(
                  transaction.description
                )}
              </strong>

              <div style="
                font-size:12px;
                color:#6b7280;
                margin-top:4px;
              ">
                ${escapeHTML(
                  transaction.category || ""
                )}
              </div>

            </div>

            <strong class="${className}">
              ${sign}
              ${formatMoney(
                transaction.amount
              )}
            </strong>

          </div>
        `;
      }
    ).join("");
}

// ============================================================
// GRÁFICO
// ============================================================

function renderChart(
  income,
  expense
) {
  const canvas =
    document.getElementById(
      "financeChart"
    );

  if (!canvas) {
    return;
  }

  if (typeof Chart === "undefined") {
    console.warn(
      "Chart.js não foi carregado."
    );
    return;
  }

  if (financeChart) {
    financeChart.destroy();
  }

  financeChart =
    new Chart(
      canvas,
      {
        type: "doughnut",

        data: {
          labels: [
            "Entradas",
            "Despesas"
          ],

          datasets: [
            {
              data: [
                income,
                expense
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
      }
    );
}

// ============================================================
// NAVEGAÇÃO
// ============================================================

function activateSection(
  sectionId,
  menuId,
  title
) {
  document
    .querySelectorAll(".section")
    .forEach(
      function (section) {
        section.classList.remove(
          "active"
        );
      }
    );

  const section =
    document.getElementById(
      sectionId
    );

  if (section) {
    section.classList.add("active");
  }

  document
    .querySelectorAll(".menu button")
    .forEach(
      function (button) {
        button.classList.remove(
          "active"
        );
      }
    );

  const menu =
    document.getElementById(
      menuId
    );

  if (menu) {
    menu.classList.add("active");
  }

  const pageTitle =
    document.getElementById(
      "pageTitle"
    );

  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

const dashboardMenu =
  document.getElementById(
    "dashboardMenu"
  );

if (dashboardMenu) {
  dashboardMenu.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      activateSection(
        "dashboardSection",
        "dashboardMenu",
        "Dashboard"
      );
    }
  );
}

const incomeMenu =
  document.getElementById(
    "incomeMenu"
  );

if (incomeMenu) {
  incomeMenu.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      activateSection(
        "incomeSection",
        "incomeMenu",
        "Entradas"
      );
    }
  );
}

const expenseMenu =
  document.getElementById(
    "expenseMenu"
  );

if (expenseMenu) {
  expenseMenu.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      activateSection(
        "expenseSection",
        "expenseMenu",
        "Despesas"
      );
    }
  );
}

const transactionsMenu =
  document.getElementById(
    "transactionsMenu"
  );

if (transactionsMenu) {
  transactionsMenu.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      activateSection(
        "transactionsSection",
        "transactionsMenu",
        "Transações"
      );
    }
  );
}

// ============================================================
// DATA
// ============================================================

function today() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
}

function setDefaultDates() {
  const incomeDate =
    document.getElementById(
      "incomeDate"
    );

  const expenseDate =
    document.getElementById(
      "expenseDate"
    );

  if (incomeDate) {
    incomeDate.value = today();
  }

  if (expenseDate) {
    expenseDate.value = today();
  }
}

// ============================================================
// DATA FORMATADA
// ============================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parts =
    String(value).split("-");

  if (parts.length !== 3) {
    return value;
  }

  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );
}

// ============================================================
// DINHEIRO
// ============================================================

function formatMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}

// ============================================================
// SEGURANÇA
// ============================================================

function escapeHTML(value) {
  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(
      /'/g,
      "&#039;"
    );
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {
    console.log(
      "ControleS iniciado."
    );

    setDefaultDates();

    showLoginForm();

    checkSession();
  }
);

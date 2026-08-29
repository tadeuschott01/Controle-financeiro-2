/* ============================================================
   CONTROLS
   Sistema financeiro - Frontend completo
   ============================================================ */


/* ================= ESTADO ================= */

let transactions = [];

let isRegisterMode = false;

let financeChart = null;
let categoryChart = null;


/* ================= ELEMENTOS ================= */

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const authForm = document.getElementById("authForm");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const nameInput = document.getElementById("nameInput");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authButtonText = document.getElementById("authButtonText");
const authMessage = document.getElementById("authMessage");

const switchAuth = document.getElementById("switchAuth");
const switchText = document.getElementById("switchText");

const logoutBtn = document.getElementById("logoutBtn");

const transactionModal =
  document.getElementById("transactionModal");

const transactionForm =
  document.getElementById("transactionForm");

const descriptionInput =
  document.getElementById("descriptionInput");

const amountInput =
  document.getElementById("amountInput");

const dateInput =
  document.getElementById("dateInput");

const transactionCategory =
  document.getElementById("transactionCategory");

const noteInput =
  document.getElementById("noteInput");

const recentTransactions =
  document.getElementById("recentTransactions");

const allTransactions =
  document.getElementById("allTransactions");

const searchInput =
  document.getElementById("searchInput");

const typeFilter =
  document.getElementById("typeFilter");

const categoryFilter =
  document.getElementById("categoryFilter");


/* ================= UTIL ================= */

function money(value) {

  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function today() {

  const date = new Date();

  return date.toISOString().split("T")[0];

}


function generateId() {

  return Date.now().toString() +
    Math.random().toString(16).slice(2);

}


/* ================= STORAGE ================= */

function saveTransactions() {

  localStorage.setItem(
    "controls_transactions",
    JSON.stringify(transactions)
  );

}


function loadTransactions() {

  const saved =
    localStorage.getItem("controls_transactions");

  if (!saved) {

    transactions = [];

    return;

  }

  try {

    transactions = JSON.parse(saved);

  } catch {

    transactions = [];

  }

}


/* ================= AUTH ================= */

function getUser() {

  try {

    return JSON.parse(
      localStorage.getItem("controls_user")
    );

  } catch {

    return null;

  }

}


function saveUser(user) {

  localStorage.setItem(
    "controls_user",
    JSON.stringify(user)
  );

}


function showApp(user) {

  authScreen.classList.add("hidden");

  app.classList.remove("hidden");

  const name =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  document.getElementById("userName")
    .textContent = name;

  document.getElementById("welcomeName")
    .textContent = name.split(" ")[0];

  document.getElementById("userAvatar")
    .textContent =
    name.charAt(0).toUpperCase();

  loadTransactions();

  renderAll();

}


function showAuth() {

  authScreen.classList.remove("hidden");

  app.classList.add("hidden");

}


function setAuthMessage(message, error = false) {

  authMessage.textContent = message;

  authMessage.style.color =
    error ? "#dc4c4c" : "#27966b";

}


/* ================= LOGIN / CADASTRO ================= */

switchAuth.addEventListener("click", () => {

  isRegisterMode = !isRegisterMode;

  const registerFields =
    document.querySelectorAll(".register-field");

  registerFields.forEach(field => {

    field.classList.toggle(
      "hidden",
      !isRegisterMode
    );

  });

  if (isRegisterMode) {

    authTitle.textContent =
      "Crie sua conta";

    authSubtitle.textContent =
      "Comece a organizar sua vida financeira.";

    authButtonText.textContent =
      "Criar conta";

    switchText.textContent =
      "Já possui uma conta?";

    switchAuth.textContent =
      "Entrar";

  } else {

    authTitle.textContent =
      "Bem-vindo de volta";

    authSubtitle.textContent =
      "Entre para acessar seu controle financeiro.";

    authButtonText.textContent =
      "Entrar";

    switchText.textContent =
      "Ainda não possui uma conta?";

    switchAuth.textContent =
      "Criar conta";

  }

});


authForm.addEventListener("submit", event => {

  event.preventDefault();

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  if (!email || !password) {

    setAuthMessage(
      "Preencha todos os campos.",
      true
    );

    return;

  }


  if (isRegisterMode) {

    const name =
      nameInput.value.trim();

    if (!name) {

      setAuthMessage(
        "Digite seu nome.",
        true
      );

      return;

    }

    const user = {
      name,
      email
    };

    saveUser(user);

    setAuthMessage(
      "Conta criada com sucesso!"
    );

    setTimeout(() => {

      showApp(user);

    }, 500);

    return;

  }


  const savedUser = getUser();

  if (!savedUser) {

    setAuthMessage(
      "Nenhuma conta cadastrada neste dispositivo.",
      true
    );

    return;

  }

  if (savedUser.email !== email) {

    setAuthMessage(
      "E-mail não encontrado.",
      true
    );

    return;

  }

  showApp(savedUser);

});


logoutBtn.addEventListener("click", () => {

  app.classList.add("hidden");

  authScreen.classList.remove("hidden");

});


/* ================= NAVEGAÇÃO ================= */

const navItems =
  document.querySelectorAll(".nav-item[data-section]");

const sections = {

  dashboard:
    document.getElementById("dashboardSection"),

  transactions:
    document.getElementById("transactionsSection"),

  categories:
    document.getElementById("categoriesSection"),

  reports:
    document.getElementById("reportsSection")

};


navItems.forEach(item => {

  item.addEventListener("click", () => {

    const section =
      item.dataset.section;

    navigate(section);

  });

});


function navigate(section) {

  Object.values(sections).forEach(
    element =>
      element.classList.add("hidden")
  );

  sections[section]
    .classList.remove("hidden");

  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.section === section
    );

  });

  const titles = {

    dashboard: "Dashboard",
    transactions: "Transações",
    categories: "Categorias",
    reports: "Relatórios"

  };

  document.getElementById("pageTitle")
    .textContent = titles[section];

}


/* ================= MOBILE MENU ================= */

document
  .getElementById("mobileMenu")
  .addEventListener("click", () => {

    document
      .querySelector(".sidebar")
      .classList.toggle("open");

  });


/* ================= MODAL ================= */

function openModal() {

  transactionModal
    .classList.remove("hidden");

  dateInput.value = today();

}


function closeModal() {

  transactionModal
    .classList.add("hidden");

}


document
  .getElementById("openTransactionBtn")
  .addEventListener("click", openModal);


document
  .getElementById("openTransactionBtn2")
  .addEventListener("click", openModal);


document
  .getElementById("closeModal")
  .addEventListener("click", closeModal);


document
  .querySelector(".modal-overlay")
  .addEventListener("click", closeModal);


/* ================= TIPO ================= */

document
  .querySelectorAll(
    'input[name="transactionType"]'
  )
  .forEach(input => {

    input.addEventListener("change", () => {

      document
        .querySelectorAll(".type-option")
        .forEach(option =>
          option.classList.remove("active")
        );

      input
        .closest(".type-option")
        .classList.add("active");

    });

  });


/* ================= ADICIONAR TRANSAÇÃO ================= */

transactionForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const type =
      document.querySelector(
        'input[name="transactionType"]:checked'
      ).value;

    const transaction = {

      id: generateId(),

      type,

      description:
        descriptionInput.value.trim(),

      amount:
        Number(amountInput.value),

      date:
        dateInput.value,

      category:
        transactionCategory.value,

      note:
        noteInput.value.trim()

    };


    if (
      !transaction.description ||
      !transaction.amount ||
      !transaction.date
    ) {

      alert(
        "Preencha os campos obrigatórios."
      );

      return;

    }


    transactions.unshift(transaction);

    saveTransactions();

    transactionForm.reset();

    dateInput.value = today();

    closeModal();

    renderAll();

  }
);


/* ================= CÁLCULOS ================= */

function calculateTotals() {

  let income = 0;
  let expense = 0;

  transactions.forEach(transaction => {

    if (transaction.type === "income") {

      income += Number(transaction.amount);

    } else {

      expense += Number(transaction.amount);

    }

  });

  return {

    income,

    expense,

    balance: income - expense

  };

}


function updateStats() {

  const totals =
    calculateTotals();

  document.getElementById(
    "balanceValue"
  ).textContent =
    money(totals.balance);

  document.getElementById(
    "incomeValue"
  ).textContent =
    money(totals.income);

  document.getElementById(
    "expenseValue"
  ).textContent =
    money(totals.expense);


  const economy =
    totals.income > 0
      ? ((totals.income - totals.expense)
        / totals.income) * 100
      : 0;

  document.getElementById(
    "economyValue"
  ).textContent =
    `${Math.max(0, economy).toFixed(0)}%`;


  document.getElementById(
    "reportIncome"
  ).textContent =
    money(totals.income);

  document.getElementById(
    "reportExpense"
  ).textContent =
    money(totals.expense);

  document.getElementById(
    "reportBalance"
  ).textContent =
    money(totals.balance);

}


/* ================= TRANSAÇÕES ================= */

function transactionHTML(transaction) {

  const isIncome =
    transaction.type === "income";

  const icon =
    isIncome ? "↗" : "↘";

  const sign =
    isIncome ? "+" : "-";

  const date =
    new Date(
      transaction.date + "T12:00:00"
    ).toLocaleDateString("pt-BR");


  return `

    <div class="transaction">

      <div class="transaction-icon">
        ${icon}
      </div>

      <div class="transaction-info">

        <strong>
          ${escapeHTML(transaction.description)}
        </strong>

        <small>
          ${escapeHTML(transaction.category)}
          · ${date}
        </small>

      </div>

      <div class="transaction-value ${transaction.type}">
        ${sign} ${money(transaction.amount)}
      </div>

      <button
        class="transaction-delete"
        onclick="deleteTransaction('${transaction.id}')"
        title="Excluir"
      >
        ×
      </button>

    </div>

  `;

}


function renderRecentTransactions() {

  const recent =
    transactions.slice(0, 6);

  if (!recent.length) {

    recentTransactions.innerHTML = `

      <div class="empty-state">

        <div>₱</div>

        <h4>Nenhuma movimentação</h4>

        <p>
          Adicione sua primeira receita ou despesa.
        </p>

      </div>

    `;

    return;

  }

  recentTransactions.innerHTML =
    recent.map(transactionHTML).join("");

}


function renderAllTransactions() {

  let list =
    [...transactions];

  const search =
    searchInput?.value
      .toLowerCase()
      .trim();

  const type =
    typeFilter?.value || "all";

  const category =
    categoryFilter?.value || "all";


  if (search) {

    list =
      list.filter(transaction =>
        transaction.description
          .toLowerCase()
          .includes(search)
      );

  }


  if (type !== "all") {

    list =
      list.filter(transaction =>
        transaction.type === type
      );

  }


  if (category !== "all") {

    list =
      list.filter(transaction =>
        transaction.category === category
      );

  }


  if (!list.length) {

    allTransactions.innerHTML = `

      <div class="empty-state">

        <div>⌕</div>

        <h4>Nenhuma transação encontrada</h4>

        <p>
          Tente mudar os filtros.
        </p>

      </div>

    `;

    return;

  }


  allTransactions.innerHTML =
    list.map(transactionHTML).join("");

}


/* ================= DELETE ================= */

function deleteTransaction(id) {

  const confirmDelete =
    confirm(
      "Deseja realmente excluir esta movimentação?"
    );

  if (!confirmDelete) return;

  transactions =
    transactions.filter(
      transaction =>
        transaction.id !== id
    );

  saveTransactions();

  renderAll();

}


/* ================= CATEGORIAS ================= */

function renderCategories() {

  const categories = {};

  transactions.forEach(transaction => {

    if (!categories[transaction.category]) {

      categories[transaction.category] = 0;

    }

    if (transaction.type === "expense") {

      categories[transaction.category] +=
        Number(transaction.amount);

    }

  });


  const container =
    document.getElementById(
      "categoriesGrid"
    );


  const entries =
    Object.entries(categories);


  if (!entries.length) {

    container.innerHTML = `

      <div class="panel">

        <h3>Nenhuma categoria utilizada</h3>

        <p style="color:var(--muted);margin-top:8px">
          Adicione despesas para visualizar sua distribuição.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    entries.map(([category, value]) => `

      <div class="category-card">

        <div class="category-icon">
          ◈
        </div>

        <strong>
          ${escapeHTML(category)}
        </strong>

        <span>
          ${money(value)} em despesas
        </span>

      </div>

    `).join("");

}


/* ================= FILTROS ================= */

function updateCategoryFilter() {

  const categories =
    [...new Set(
      transactions.map(
        transaction =>
          transaction.category
      )
    )];


  categoryFilter.innerHTML =
    `<option value="all">
      Todas categorias
    </option>`;


  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(option);

  });

}


searchInput?.addEventListener(
  "input",
  renderAllTransactions
);

typeFilter?.addEventListener(
  "change",
  renderAllTransactions
);

categoryFilter?.addEventListener(
  "change",
  renderAllTransactions
);


/* ================= GRÁFICO FINANCEIRO ================= */

function renderFinanceChart() {

  const canvas =
    document.getElementById(
      "financeChart"
    );

  if (!canvas) return;


  const labels = [];
  const incomes = [];
  const expenses = [];


  const grouped = {};


  transactions.forEach(transaction => {

    if (!grouped[transaction.date]) {

      grouped[transaction.date] = {
        income: 0,
        expense: 0
      };

    }

    grouped[
      transaction.date
    ][transaction.type] +=
      Number(transaction.amount);

  });


  Object.keys(grouped)
    .sort()
    .slice(-7)
    .forEach(date => {

      labels.push(
        new Date(
          date + "T12:00:00"
        ).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit"
          }
        )
      );

      incomes.push(
        grouped[date].income
      );

      expenses.push(
        grouped[date].expense
      );

    });


  if (financeChart) {

    financeChart.destroy();

  }


  financeChart =
    new Chart(canvas, {

      type: "line",

      data: {

        labels,

        datasets: [

          {
            label: "Receitas",

            data: incomes,

            borderColor: "#2f6b50",

            backgroundColor:
              "rgba(47,107,80,.08)",

            fill: true,

            tension: .4,

            borderWidth: 2

          },

          {
            label: "Despesas",

            data: expenses,

            borderColor: "#f28c28",

            backgroundColor:
              "rgba(242,140,40,.06)",

            fill: true,

            tension: .4,

            borderWidth: 2

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

        },

        scales: {

          y: {
            beginAtZero: true,

            ticks: {

              callback: value =>
                "R$ " + value

            }

          }

        }

      }

    });

}


/* ================= GRÁFICO CATEGORIAS ================= */

function renderCategoryChart() {

  const canvas =
    document.getElementById(
      "categoryChart"
    );

  if (!canvas) return;


  const categories = {};


  transactions.forEach(transaction => {

    if (transaction.type !== "expense")
      return;

    categories[transaction.category] =
      (categories[transaction.category] || 0)
      + Number(transaction.amount);

  });


  const labels =
    Object.keys(categories);

  const values =
    Object.values(categories);


  if (categoryChart) {

    categoryChart.destroy();

  }


  categoryChart =
    new Chart(canvas, {

      type: "doughnut",

      data: {

        labels,

        datasets: [{

          data: values,

          backgroundColor: [

            "#1f513d",
            "#f28c28",
            "#2f6b50",
            "#d96f12",
            "#6d927f",
            "#e9a45c",
            "#8bb29e",
            "#b6c9bf"

          ],

          borderWidth: 0

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "68%",

        plugins: {

          legend: {
            display: false
          }

        }

      }

    });


  const legend =
    document.getElementById(
      "categoryLegend"
    );


  legend.innerHTML =
    labels.map((label, index) => `

      <div class="legend-item">

        <span>
          ${escapeHTML(label)}
        </span>

        <strong>
          ${money(values[index])}
        </strong>

      </div>

    `).join("");

}


/* ================= ESCAPE ================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ================= RENDER ================= */

function renderAll() {

  updateStats();

  updateCategoryFilter();

  renderRecentTransactions();

  renderAllTransactions();

  renderCategories();

  renderFinanceChart();

  renderCategoryChart();

}


/* ================= TEMA ================= */

document
  .getElementById("themeBtn")
  .addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
      "controls_dark",
      document.body.classList.contains("dark")
    );

  });


if (
  localStorage.getItem(
    "controls_dark"
  ) === "true"
) {

  document.body.classList.add("dark");

}


/* ================= LINKS ================= */

document
  .querySelectorAll("[data-section-target]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        navigate(
          button.dataset.sectionTarget
        );

      }
    );

  });


/* ================= INICIALIZAÇÃO ================= */

const currentUser =
  getUser();

if (currentUser) {

  showApp(currentUser);

} else {

  showAuth();

}

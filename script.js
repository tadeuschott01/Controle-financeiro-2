// ==========================================
// FINCONTROL
// Sistema Financeiro Pessoal e Empresarial
// ==========================================


// BANCO LOCAL
let transactions = JSON.parse(
  localStorage.getItem("fincontrol_transactions")
) || [];


// ELEMENTOS
const modal = document.getElementById("transactionModal");
const form = document.getElementById("transactionForm");

const transactionId = document.getElementById("transactionId");
const descriptionInput = document.getElementById("transactionDescription");
const valueInput = document.getElementById("transactionValue");
const dateInput = document.getElementById("transactionDate");
const typeInput = document.getElementById("transactionType");
const accountInput = document.getElementById("transactionAccount");
const categoryInput = document.getElementById("transactionCategory");
const notesInput = document.getElementById("transactionNotes");


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  setCurrentDate();

  setDefaultDate();

  setDefaultMonth();

  renderAll();

  setupEvents();

});


// ==========================================
// DATA ATUAL
// ==========================================

function setCurrentDate() {

  const element = document.getElementById("currentDate");

  const date = new Date();

  element.textContent = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

}


function setDefaultDate() {

  const today = new Date();

  dateInput.value = today.toISOString().split("T")[0];

}


function setDefaultMonth() {

  const today = new Date();

  const month =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0");

  document.getElementById("dashboardMonth").value = month;

}


// ==========================================
// EVENTOS
// ==========================================

function setupEvents() {

  // MENU
  document.querySelectorAll(".menu-item").forEach(button => {

    button.addEventListener("click", () => {

      changeSection(button.dataset.section);

      document.querySelector(".sidebar").classList.remove("open");

    });

  });


  // BOTÕES DE SEÇÃO
  document.querySelectorAll("[data-section]").forEach(button => {

    if (!button.classList.contains("menu-item")) {

      button.addEventListener("click", () => {
        changeSection(button.dataset.section);
      });

    }

  });


  // NOVA MOVIMENTAÇÃO
  document
    .getElementById("newTransactionButton")
    .addEventListener("click", openNewTransaction);


  document
    .getElementById("newTransactionButton2")
    .addEventListener("click", openNewTransaction);


  // FECHAR MODAL
  document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);


  document
    .getElementById("cancelModal")
    .addEventListener("click", closeModal);


  // FORMULÁRIO
  form.addEventListener("submit", saveTransaction);


  // FILTROS
  document
    .getElementById("dashboardMonth")
    .addEventListener("change", renderDashboard);


  document
    .getElementById("dashboardType")
    .addEventListener("change", renderDashboard);


  document
    .getElementById("searchTransaction")
    .addEventListener("input", renderTransactionsTable);


  document
    .getElementById("filterType")
    .addEventListener("change", renderTransactionsTable);


  document
    .getElementById("filterAccount")
    .addEventListener("change", renderTransactionsTable);


  // TEMA
  document
    .getElementById("themeButton")
    .addEventListener("click", toggleTheme);


  // MENU MOBILE
  document
    .getElementById("mobileMenu")
    .addEventListener("click", () => {

      document.querySelector(".sidebar").classList.toggle("open");

    });

}


// ==========================================
// NAVEGAÇÃO
// ==========================================

function changeSection(section) {

  document.querySelectorAll(".section").forEach(element => {
    element.classList.remove("active");
  });


  const target = document.getElementById(
    section + "Section"
  );

  if (target) {
    target.classList.add("active");
  }


  document.querySelectorAll(".menu-item").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.section === section
    );

  });


  const titles = {

    dashboard: "Dashboard",

    movimentacoes: "Movimentações",

    receitas: "Receitas",

    despesas: "Despesas",

    empresa: "Financeiro da Empresa",

    pessoal: "Financeiro Pessoal",

    relatorios: "Relatórios"

  };


  document.getElementById("pageTitle").textContent =
    titles[section] || "Dashboard";


  renderAll();

}


// ==========================================
// MODAL
// ==========================================

function openNewTransaction() {

  form.reset();

  transactionId.value = "";

  document.getElementById("modalTitle").textContent =
    "Nova movimentação";

  setDefaultDate();

  modal.classList.add("active");

}


function closeModal() {

  modal.classList.remove("active");

}


// ==========================================
// SALVAR
// ==========================================

function saveTransaction(event) {

  event.preventDefault();


  const id = transactionId.value;

  const transaction = {

    id: id || Date.now().toString(),

    description: descriptionInput.value.trim(),

    value: Number(valueInput.value),

    date: dateInput.value,

    type: typeInput.value,

    account: accountInput.value,

    category: categoryInput.value,

    notes: notesInput.value.trim()

  };


  if (!transaction.description || !transaction.value) {

    alert("Preencha a descrição e o valor.");

    return;

  }


  if (id) {

    transactions = transactions.map(item =>
      item.id === id ? transaction : item
    );

  } else {

    transactions.push(transaction);

  }


  saveData();

  closeModal();

  renderAll();

}


// ==========================================
// EDITAR
// ==========================================

function editTransaction(id) {

  const transaction = transactions.find(
    item => item.id === id
  );


  if (!transaction) return;


  transactionId.value = transaction.id;

  descriptionInput.value = transaction.description;

  valueInput.value = transaction.value;

  dateInput.value = transaction.date;

  typeInput.value = transaction.type;

  accountInput.value = transaction.account;

  categoryInput.value = transaction.category;

  notesInput.value = transaction.notes || "";


  document.getElementById("modalTitle").textContent =
    "Editar movimentação";


  modal.classList.add("active");

}


// ==========================================
// EXCLUIR
// ==========================================

function deleteTransaction(id) {

  const transaction = transactions.find(
    item => item.id === id
  );


  if (!transaction) return;


  const confirmation = confirm(
    `Excluir "${transaction.description}"?`
  );


  if (!confirmation) return;


  transactions = transactions.filter(
    item => item.id !== id
  );


  saveData();

  renderAll();

}


// ==========================================
// LOCAL STORAGE
// ==========================================

function saveData() {

  localStorage.setItem(
    "fincontrol_transactions",
    JSON.stringify(transactions)
  );

}


// ==========================================
// CÁLCULOS
// ==========================================

function calculate(data) {

  let income = 0;
  let expense = 0;


  data.forEach(transaction => {

    if (transaction.type === "receita") {

      income += transaction.value;

    } else {

      expense += transaction.value;

    }

  });


  return {

    income,

    expense,

    balance: income - expense,

    result: income - expense

  };

}


// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {

  const month =
    document.getElementById("dashboardMonth").value;

  const account =
    document.getElementById("dashboardType").value;


  let filtered = transactions;


  if (month) {

    filtered = filtered.filter(transaction =>
      transaction.date.startsWith(month)
    );

  }


  if (account !== "todos") {

    filtered = filtered.filter(transaction =>
      transaction.account === account
    );

  }


  const data = calculate(filtered);


  document.getElementById("balance").textContent =
    formatCurrency(data.balance);


  document.getElementById("income").textContent =
    formatCurrency(data.income);


  document.getElementById("expense").textContent =
    formatCurrency(data.expense);


  document.getElementById("result").textContent =
    formatCurrency(data.result);


  renderChart(data);

  renderRecentTransactions(filtered);

}


// ==========================================
// GRÁFICO
// ==========================================

function renderChart(data) {

  const total = data.income + data.expense;


  let incomePercent = 0;
  let expensePercent = 0;


  if (total > 0) {

    incomePercent =
      Math.round((data.income / total) * 100);

    expensePercent =
      Math.round((data.expense / total) * 100);

  }


  document.getElementById("incomeBar").style.width =
    incomePercent + "%";


  document.getElementById("expenseBar").style.width =
    expensePercent + "%";


  document.getElementById("incomePercent").textContent =
    incomePercent + "%";


  document.getElementById("expensePercent").textContent =
    expensePercent + "%";

}


// ==========================================
// ÚLTIMAS MOVIMENTAÇÕES
// ==========================================

function renderRecentTransactions(data) {

  const container =
    document.getElementById("recentTransactions");


  const recent = [...data]
    .sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    )
    .slice(0, 5);


  if (!recent.length) {

    container.innerHTML =
      `<div class="empty">
        Nenhuma movimentação cadastrada.
      </div>`;

    return;

  }


  container.innerHTML = recent.map(transaction => {

    const isIncome =
      transaction.type === "receita";


    return `

      <div class="transaction-item">

        <div class="transaction-info">

          <div class="transaction-icon">
            ${isIncome ? "📈" : "📉"}
          </div>

          <div>

            <div class="transaction-description">
              ${escapeHTML(transaction.description)}
            </div>

            <div class="transaction-category">
              ${formatCategory(transaction.category)}
            </div>

          </div>

        </div>

        <div class="transaction-value ${isIncome ? "income" : "expense"}">

          ${isIncome ? "+" : "-"}
          ${formatCurrency(transaction.value)}

        </div>

      </div>

    `;

  }).join("");

}


// ==========================================
// TABELA
// ==========================================

function renderTransactionsTable() {

  const table =
    document.getElementById("transactionsTable");


  const search =
    document
      .getElementById("searchTransaction")
      .value
      .toLowerCase();


  const type =
    document.getElementById("filterType").value;


  const account =
    document.getElementById("filterAccount").value;


  let filtered = [...transactions];


  if (search) {

    filtered = filtered.filter(transaction =>
      transaction.description
        .toLowerCase()
        .includes(search)
    );

  }


  if (type !== "todos") {

    filtered = filtered.filter(transaction =>
      transaction.type === type
    );

  }


  if (account !== "todos") {

    filtered = filtered.filter(transaction =>
      transaction.account === account
    );

  }


  filtered.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );


  if (!filtered.length) {

    table.innerHTML = `

      <tr>
        <td colspan="7">
          <div class="empty">
            Nenhuma movimentação encontrada.
          </div>
        </td>
      </tr>

    `;

    return;

  }


  table.innerHTML = filtered.map(transaction => {

    const isIncome =
      transaction.type === "receita";


    return `

      <tr>

        <td>
          ${formatDate(transaction.date)}
        </td>

        <td>
          <strong>
            ${escapeHTML(transaction.description)}
          </strong>
        </td>

        <td>
          ${formatCategory(transaction.category)}
        </td>

        <td>

          <span class="badge ${
            isIncome
              ? "badge-income"
              : "badge-expense"
          }">

            ${isIncome ? "Receita" : "Despesa"}

          </span>

        </td>

        <td>
          ${transaction.account === "empresa"
            ? "🏢 Empresa"
            : "👤 Pessoal"}
        </td>

        <td class="${isIncome ? "income" : "expense"}">

          <strong>
            ${isIncome ? "+" : "-"}
            ${formatCurrency(transaction.value)}
          </strong>

        </td>

        <td>

          <button
            class="action-button"
            onclick="editTransaction('${transaction.id}')"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="action-button"
            onclick="deleteTransaction('${transaction.id}')"
            title="Excluir"
          >
            🗑️
          </button>

        </td>

      </tr>

    `;

  }).join("");

}


// ==========================================
// RECEITAS
// ==========================================

function renderIncomeList() {

  const container =
    document.getElementById("incomeList");


  const data = transactions
    .filter(transaction =>
      transaction.type === "receita"
    )
    .sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );


  renderSimpleList(container, data);

}


// ==========================================
// DESPESAS
// ==========================================

function renderExpenseList() {

  const container =
    document.getElementById("expenseList");


  const data = transactions
    .filter(transaction =>
      transaction.type === "despesa"
    )
    .sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );


  renderSimpleList(container, data);

}


// ==========================================
// LISTA SIMPLES
// ==========================================

function renderSimpleList(container, data) {

  if (!data.length) {

    container.innerHTML =
      `<div class="panel">
        <div class="empty">
          Nenhum lançamento encontrado.
        </div>
      </div>`;

    return;

  }


  container.innerHTML = `

    <div class="panel">

      ${data.map(transaction => {

        const isIncome =
          transaction.type === "receita";


        return `

          <div class="transaction-item">

            <div class="transaction-info">

              <div class="transaction-icon">
                ${isIncome ? "📈" : "📉"}
              </div>

              <div>

                <div class="transaction-description">
                  ${escapeHTML(transaction.description)}
                </div>

                <div class="transaction-category">
                  ${formatDate(transaction.date)}
                  •
                  ${formatCategory(transaction.category)}
                </div>

              </div>

            </div>

            <div
              class="transaction-value ${
                isIncome ? "income" : "expense"
              }"
            >

              ${isIncome ? "+" : "-"}
              ${formatCurrency(transaction.value)}

            </div>

          </div>

        `;

      }).join("")}

    </div>

  `;

}


// ==========================================
// EMPRESA
// ==========================================

function renderCompany() {

  const data = calculate(
    transactions.filter(
      transaction =>
        transaction.account === "empresa"
    )
  );


  document.getElementById("companyBalance").textContent =
    formatCurrency(data.balance);


  document.getElementById("companyIncome").textContent =
    formatCurrency(data.income);


  document.getElementById("companyExpense").textContent =
    formatCurrency(data.expense);


  document.getElementById("companyResult").textContent =
    formatCurrency(data.result);

}


// ==========================================
// PESSOAL
// ==========================================

function renderPersonal() {

  const data = calculate(
    transactions.filter(
      transaction =>
        transaction.account === "pessoal"
    )
  );


  document.getElementById("personalBalance").textContent =
    formatCurrency(data.balance);


  document.getElementById("personalIncome").textContent =
    formatCurrency(data.income);


  document.getElementById("personalExpense").textContent =
    formatCurrency(data.expense);


  document.getElementById("personalResult").textContent =
    formatCurrency(data.result);

}


// ==========================================
// RELATÓRIO
// ==========================================

function renderReport() {

  const container =
    document.getElementById("reportContent");


  const data = calculate(transactions);


  const categories = {};


  transactions
    .filter(transaction =>
      transaction.type === "despesa"
    )
    .forEach(transaction => {

      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }

      categories[transaction.category] +=
        transaction.value;

    });


  const sortedCategories =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);


  container.innerHTML = `

    <div class="cards small-cards">

      <div class="card">
        <span>Total de receitas</span>
        <strong>${formatCurrency(data.income)}</strong>
      </div>

      <div class="card">
        <span>Total de despesas</span>
        <strong>${formatCurrency(data.expense)}</strong>
      </div>

      <div class="card">
        <span>Resultado</span>
        <strong>${formatCurrency(data.result)}</strong>
      </div>

    </div>


    <div class="panel">

      <div class="panel-header">

        <div>
          <h2>Despesas por categoria</h2>
          <p>Onde seu dinheiro está sendo gasto.</p>
        </div>

      </div>


      ${
        sortedCategories.length
          ? sortedCategories.map(item => `

              <div class="transaction-item">

                <div>
                  <strong>
                    ${formatCategory(item[0])}
                  </strong>
                </div>

                <strong>
                  ${formatCurrency(item[1])}
                </strong>

              </div>

            `).join("")
          : `
            <div class="empty">
              Nenhuma despesa cadastrada.
            </div>
          `
      }

    </div>

  `;

}


// ==========================================
// RENDER GERAL
// ==========================================

function renderAll() {

  renderDashboard();

  renderTransactionsTable();

  renderIncomeList();

  renderExpenseList();

  renderCompany();

  renderPersonal();

  renderReport();

}


// ==========================================
// FORMATAÇÃO
// ==========================================

function formatCurrency(value) {

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

}


function formatDate(date) {

  if (!date) return "-";

  return new Date(
    date + "T00:00:00"
  ).toLocaleDateString("pt-BR");

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


  return categories[category] || category;

}


// ==========================================
// SEGURANÇA
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// TEMA
// ==========================================

function toggleTheme() {

  document.body.classList.toggle("dark");


  const dark =
    document.body.classList.contains("dark");


  localStorage.setItem(
    "fincontrol_theme",
    dark ? "dark" : "light"
  );


  document.getElementById("themeButton").textContent =
    dark
      ? "☀️ Tema claro"
      : "🌙 Tema escuro";

}


// RESTAURAR TEMA
if (
  localStorage.getItem("fincontrol_theme") === "dark"
) {

  document.body.classList.add("dark");

  const button =
    document.getElementById("themeButton");

  if (button) {
    button.textContent = "☀️ Tema claro";
  }

}

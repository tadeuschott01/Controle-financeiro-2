/* ==========================================================
   CONTROLES — SISTEMA FINANCEIRO
   FRONTEND + DADOS LOCAIS
   Estrutura preparada para integração futura com Supabase
   ========================================================== */


"use strict";


// ==========================================================
// CONFIGURAÇÕES
// ==========================================================

const STORAGE_KEY = "controles_v3_transactions";

let transactions = [];

let currentType = "income";

let editingId = null;

let currentFilter = "all";

let balanceVisible = true;


// ==========================================================
// CATEGORIAS
// ==========================================================

const categories = {

  Alimentação: "🛒",

  Moradia: "🏠",

  Transporte: "🚗",

  Lazer: "🎮",

  Saúde: "❤️",

  Educação: "📚",

  Trabalho: "💼",

  Outros: "📦"

};


// ==========================================================
// CARREGAR DADOS
// ==========================================================

function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {

      transactions =
        JSON.parse(saved);

    } else {

      transactions = [];

    }

  } catch (error) {

    console.error(
      "Erro ao carregar dados:",
      error
    );

    transactions = [];

  }

}


// ==========================================================
// SALVAR DADOS
// ==========================================================

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

  } catch (error) {

    console.error(
      "Erro ao salvar dados:",
      error
    );

  }

}


// ==========================================================
// UTILIDADES
// ==========================================================

function money(value) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(Number(value) || 0);

}


function today() {

  const date =
    new Date();

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
      offset * 60000
    );

  return local
    .toISOString()
    .split("T")[0];

}


function formatDate(value) {

  if (!value) return "";

  const date =
    new Date(
      value + "T12:00:00"
    );

  return date.toLocaleDateString(
    "pt-BR"
  );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function getTotals() {

  let income = 0;

  let expense = 0;


  transactions.forEach(item => {

    const value =
      Number(item.amount) || 0;

    if (item.type === "income") {

      income += value;

    } else {

      expense += value;

    }

  });


  return {

    income,

    expense,

    balance:
      income - expense

  };

}


// ==========================================================
// NAVEGAÇÃO
// ==========================================================

function showScreen(screenId) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });


  const target =
    document.getElementById(screenId);


  if (!target) return;


  target.classList.add("active");


  document
    .querySelectorAll(
      ".side-link[data-screen], .mobile-nav-link[data-screen]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.screen === screenId
      );

    });


  document
    .querySelector(".sidebar")
    ?.classList.remove("open");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  updateScreenData(screenId);

}


function updateScreenData(screenId) {

  if (screenId === "dashboard") {

    renderDashboard();

  }

  if (screenId === "transactions") {

    renderTransactions();

  }

  if (screenId === "reports") {

    renderReports();

  }

  if (screenId === "categories") {

    renderFullCategories();

  }

}


// ==========================================================
// MODAL
// ==========================================================

function openModal(
  type = "income",
  id = null
) {

  const modal =
    document.getElementById("modal");


  if (!modal) return;


  modal.classList.add("show");


  editingId = id;


  const title =
    document.getElementById(
      "modalTitle"
    );


  const saveButton =
    document.getElementById(
      "saveTransaction"
    );


  if (id) {

    const item =
      transactions.find(
        transaction =>
          transaction.id === id
      );


    if (!item) return;


    title.textContent =
      "Editar movimentação";


    saveButton.textContent =
      "Salvar alterações";


    document.getElementById(
      "amount"
    ).value =
      item.amount;


    document.getElementById(
      "description"
    ).value =
      item.description;


    document.getElementById(
      "category"
    ).value =
      item.category;


    document.getElementById(
      "date"
    ).value =
      item.date;


    setType(item.type);

  } else {

    title.textContent =
      "Adicionar movimentação";


    saveButton.textContent =
      "Salvar movimentação";


    document.getElementById(
      "amount"
    ).value = "";


    document.getElementById(
      "description"
    ).value = "";


    document.getElementById(
      "category"
    ).value =
      "Alimentação";


    document.getElementById(
      "date"
    ).value =
      today();


    setType(type);

  }


  setTimeout(() => {

    document
      .getElementById("amount")
      ?.focus();

  }, 100);

}


function closeModal() {

  document
    .getElementById("modal")
    ?.classList.remove("show");


  editingId = null;

}


function setType(type) {

  currentType = type;


  document
    .querySelectorAll(".type-option")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.type === type
      );

    });

}


// ==========================================================
// SALVAR TRANSAÇÃO
// ==========================================================

function saveTransaction() {

  const amount =
    Number(
      document.getElementById(
        "amount"
      ).value
    );


  const description =
    document.getElementById(
      "description"
    ).value.trim();


  const category =
    document.getElementById(
      "category"
    ).value;


  const date =
    document.getElementById(
      "date"
    ).value;


  if (!amount || amount <= 0) {

    alert(
      "Digite um valor maior que zero."
    );

    return;

  }


  if (!description) {

    alert(
      "Digite uma descrição."
    );

    return;

  }


  if (!date) {

    alert(
      "Selecione uma data."
    );

    return;

  }


  if (editingId) {

    const index =
      transactions.findIndex(
        item =>
          item.id === editingId
      );


    if (index !== -1) {

      transactions[index] = {

        ...transactions[index],

        type:
          currentType,

        amount:
          amount,

        description:
          description,

        category:
          category,

        date:
          date

      };

    }

  } else {

    transactions.push({

      id:
        Date.now().toString(),

      type:
        currentType,

      amount:
        amount,

      description:
        description,

      category:
        category,

      date:
        date

    });

  }


  saveData();

  closeModal();

  renderEverything();

}


// ==========================================================
// EXCLUIR
// ==========================================================

function deleteTransaction(id) {

  const confirmed =
    confirm(
      "Deseja realmente excluir esta movimentação?"
    );


  if (!confirmed) return;


  transactions =
    transactions.filter(
      item =>
        item.id !== id
    );


  saveData();

  renderEverything();

}


// ==========================================================
// DASHBOARD
// ==========================================================

function renderDashboard() {

  const totals =
    getTotals();


  const balance =
    document.getElementById(
      "balanceValue"
    );


  const income =
    document.getElementById(
      "incomeValue"
    );


  const expense =
    document.getElementById(
      "expenseValue"
    );


  if (balance) {

    balance.textContent =
      balanceVisible
        ? money(totals.balance)
        : "R$ •••••";

  }


  if (income) {

    income.textContent =
      money(totals.income);

  }


  if (expense) {

    expense.textContent =
      money(totals.expense);

  }


  const total =
    totals.income +
    totals.expense;


  const incomePercent =
    total > 0
      ? Math.round(
          totals.income /
          total *
          100
        )
      : 0;


  const expensePercent =
    total > 0
      ? Math.round(
          totals.expense /
          total *
          100
        )
      : 0;


  document.getElementById(
    "incomePercent"
  ).textContent =
    incomePercent + "%";


  document.getElementById(
    "expensePercent"
  ).textContent =
    expensePercent + "%";


  const trend =
    document.getElementById(
      "balanceTrend"
    );


  if (trend) {

    if (totals.balance > 0) {

      trend.textContent =
        "Seu saldo está positivo";

    } else if (totals.balance < 0) {

      trend.textContent =
        "Atenção: saldo negativo";

    } else {

      trend.textContent =
        "Comece adicionando uma movimentação";

    }

  }


  renderRecentTransactions();

  renderCategories();

  renderChart();

}


// ==========================================================
// TRANSAÇÕES RECENTES
// ==========================================================

function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  if (!container) return;


  const list =
    [...transactions]
      .sort(
        (a,b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0,5);


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          +
        </div>

        <strong>
          Nenhuma movimentação ainda
        </strong>

        <p>
          Adicione sua primeira receita ou despesa
          para começar a acompanhar suas finanças.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(
        item =>
          transactionHTML(
            item,
            false
          )
      )
      .join("");

}


// ==========================================================
// TRANSAÇÃO HTML
// ==========================================================

function transactionHTML(
  item,
  actions = false
) {

  const sign =
    item.type === "income"
      ? "+"
      : "-";


  const typeClass =
    item.type === "income"
      ? "income"
      : "expense";


  const emoji =
    item.type === "income"
      ? "💰"
      : (
        categories[item.category]
        || "📦"
      );


  return `

    <div
      class="transaction-row"
      data-id="${escapeHTML(item.id)}"
    >

      <div class="transaction-icon">
        ${emoji}
      </div>

      <div class="transaction-description">

        <strong>
          ${escapeHTML(item.description)}
        </strong>

        <small>
          ${formatDate(item.date)}
        </small>

      </div>

      <span class="transaction-tag">
        ${escapeHTML(item.category)}
      </span>

      <strong
        class="transaction-value ${typeClass}"
      >
        ${sign} ${money(item.amount)}
      </strong>

      ${
        actions
          ? `

            <div class="row-actions">

              <button
                data-edit="${escapeHTML(item.id)}"
                title="Editar"
              >
                ✎
              </button>

              <button
                data-delete="${escapeHTML(item.id)}"
                title="Excluir"
              >
                ×
              </button>

            </div>

          `
          : ""
      }

    </div>

  `;

}


// ==========================================================
// TODAS AS TRANSAÇÕES
// ==========================================================

function renderTransactions() {

  const container =
    document.getElementById(
      "transactionTable"
    );


  if (!container) return;


  const totals =
    getTotals();


  document.getElementById(
    "transactionIncome"
  ).textContent =
    money(totals.income);


  document.getElementById(
    "transactionExpense"
  ).textContent =
    money(totals.expense);


  document.getElementById(
    "transactionBalance"
  ).textContent =
    money(totals.balance);


  const search =
    document.getElementById(
      "transactionSearch"
    )?.value
      .toLowerCase()
      .trim()
      || "";


  let list =
    [...transactions];


  if (currentFilter !== "all") {

    list =
      list.filter(
        item =>
          item.type === currentFilter
      );

  }


  if (search) {

    list =
      list.filter(item => {

        return (

          item.description
            .toLowerCase()
            .includes(search)

          ||

          item.category
            .toLowerCase()
            .includes(search)

        );

      });

  }


  list.sort(
    (a,b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          🔎
        </div>

        <strong>
          Nenhuma transação encontrada
        </strong>

        <p>
          Tente mudar os filtros ou adicionar uma nova movimentação.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(
        item =>
          transactionHTML(
            item,
            true
          )
      )
      .join("");

}


// ==========================================================
// CATEGORIAS
// ==========================================================

function getCategoryTotals() {

  const totals = {};


  transactions
    .filter(
      item =>
        item.type === "expense"
    )
    .forEach(item => {

      const value =
        Number(item.amount) || 0;


      if (!totals[item.category]) {

        totals[item.category] = 0;

      }


      totals[item.category] +=
        value;

    });


  return totals;

}


function renderCategories() {

  const container =
    document.getElementById(
      "categoryList"
    );


  if (!container) return;


  const data =
    getCategoryTotals();


  const total =
    Object.values(data)
      .reduce(
        (sum,value) =>
          sum + value,
        0
      );


  const sorted =
    Object.entries(data)
      .sort(
        (a,b) =>
          b[1] - a[1]
      )
      .slice(0,5);


  if (!sorted.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          ◫
        </div>

        <strong>
          Sem despesas ainda
        </strong>

        <p>
          Suas categorias aparecerão aqui.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    sorted
      .map(
        ([name,value]) => {

          const percent =
            total > 0
              ? Math.round(
                  value /
                  total *
                  100
                )
              : 0;


          return `

            <div class="category-row">

              <div class="category-icon">
                ${categories[name] || "📦"}
              </div>

              <div class="category-info">

                <strong>
                  ${escapeHTML(name)}
                </strong>

                <div class="progress">
                  <span
                    style="width:${percent}%"
                  ></span>
                </div>

              </div>

              <strong class="category-value">
                ${money(value)}
              </strong>

            </div>

          `;

        }
      )
      .join("");

}


// ==========================================================
// CATEGORIAS COMPLETAS
// ==========================================================

function renderFullCategories() {

  const container =
    document.getElementById(
      "fullCategories"
    );


  if (!container) return;


  const data =
    getCategoryTotals();


  container.innerHTML =
    Object.keys(categories)
      .map(name => {

        const value =
          data[name] || 0;


        return `

          <div class="full-category-card">

            <div class="category-icon">
              ${categories[name]}
            </div>

            <strong>
              ${name}
            </strong>

            <span>
              ${money(value)}
            </span>

          </div>

        `;

      })
      .join("");

}


// ==========================================================
// GRÁFICO
// ==========================================================

function renderChart() {

  const incomeLine =
    document.getElementById(
      "incomeLine"
    );


  const expenseLine =
    document.getElementById(
      "expenseLine"
    );


  if (!incomeLine || !expenseLine) {
    return;
  }


  const days = 7;

  const income =
    Array(days).fill(0);

  const expense =
    Array(days).fill(0);


  const now =
    new Date();


  transactions.forEach(item => {

    const date =
      new Date(
        item.date + "T12:00:00"
      );


    const difference =
      Math.floor(
        (
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ) -
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
        ) /
        86400000
      );


    if (
      difference >= 0 &&
      difference < days
    ) {

      const index =
        days -
        1 -
        difference;


      if (item.type === "income") {

        income[index] +=
          Number(item.amount);

      } else {

        expense[index] +=
          Number(item.amount);

      }

    }

  });


  const max =
    Math.max(
      ...income,
      ...expense,
      100
    );


  function points(values) {

    return values
      .map(
        (value,index) => {

          const x =
            (index /
              (days - 1))
            * 600;


          const y =
            210 -
            (
              value /
              max
            ) *
            190;


          return `${x},${y}`;

        }
      )
      .join(" ");

  }


  incomeLine.setAttribute(
    "points",
    points(income)
  );


  expenseLine.setAttribute(
    "points",
    points(expense)
  );

}


// ==========================================================
// RELATÓRIOS
// ==========================================================

function renderReports() {

  const totals =
    getTotals();


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


  const title =
    document.getElementById(
      "reportTitle"
    );


  const description =
    document.getElementById(
      "reportDescription"
    );


  if (totals.balance > 0) {

    title.textContent =
      "Seu resultado está positivo";


    description.textContent =
      "Suas receitas estão maiores que suas despesas no período registrado.";

  } else if (totals.balance < 0) {

    title.textContent =
      "Atenção ao seu resultado";


    description.textContent =
      "Suas despesas estão maiores que suas receitas. Analise seus gastos por categoria.";

  } else {

    title.textContent =
      "Comece seu controle financeiro";


    description.textContent =
      "Registre suas receitas e despesas para visualizar uma análise completa.";

  }

}


// ==========================================================
// PESQUISA GLOBAL
// ==========================================================

function globalSearch(value) {

  const text =
    value.trim();


  if (!text) return;


  showScreen("transactions");


  const input =
    document.getElementById(
      "transactionSearch"
    );


  if (input) {

    input.value =
      text;

  }


  renderTransactions();

}


// ==========================================================
// ATUALIZA TUDO
// ==========================================================

function renderEverything() {

  renderDashboard();

  renderTransactions();

  renderReports();

  renderFullCategories();

}


// ==========================================================
// EVENTOS
// ==========================================================

function setupEvents() {


  // NAVEGAÇÃO SIDEBAR

  document
    .querySelectorAll(
      ".side-link[data-screen]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showScreen(
            button.dataset.screen
          );

        }
      );

    });


  // NAVEGAÇÃO MOBILE

  document
    .querySelectorAll(
      ".mobile-nav-link[data-screen]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showScreen(
            button.dataset.screen
          );

        }
      );

    });


  // MENU MOBILE

  document
    .getElementById("mobileMenu")
    ?.addEventListener(
      "click",
      () => {

        document
          .querySelector(".sidebar")
          ?.classList.toggle("open");

      }
    );


  // BOTÕES DE ADICIONAR

  document
    .getElementById("dashboardAdd")
    ?.addEventListener(
      "click",
      () =>
        openModal("income")
    );


  document
    .getElementById("transactionAdd")
    ?.addEventListener(
      "click",
      () =>
        openModal("income")
    );


  document
    .getElementById("mobileAdd")
    ?.addEventListener(
      "click",
      () =>
        openModal("income")
    );


  // MODAL

  document
    .getElementById("closeModal")
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById("cancelModal")
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById("modal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target.id === "modal"
        ) {

          closeModal();

        }

      }
    );


  // TIPO

  document
    .querySelectorAll(".type-option")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          setType(
            button.dataset.type
          )
      );

    });


  // SALVAR

  document
    .getElementById("saveTransaction")
    ?.addEventListener(
      "click",
      saveTransaction
    );


  // ENTER NO FORMULÁRIO

  document
    .getElementById("modal")
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          event.target.tagName !== "SELECT"
        ) {

          event.preventDefault();

          saveTransaction();

        }

      }
    );


  // EDITAR / EXCLUIR

  document.addEventListener(
    "click",
    event => {

      const edit =
        event.target.closest(
          "[data-edit]"
        );


      if (edit) {

        openModal(
          "income",
          edit.dataset.edit
        );

        return;

      }


      const remove =
        event.target.closest(
          "[data-delete]"
        );


      if (remove) {

        deleteTransaction(
          remove.dataset.delete
        );

      }

    }
  );


  // PESQUISA

  document
    .getElementById(
      "transactionSearch"
    )
    ?.addEventListener(
      "input",
      renderTransactions
    );


  document
    .getElementById(
      "globalSearch"
    )
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          globalSearch(
            event.target.value
          );

        }

      }
    );


  // FILTROS

  document
    .querySelectorAll(".filter-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-button"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentFilter =
            button.dataset.filter;


          renderTransactions();

        }
      );

    });


  // SALDO

  document
    .getElementById(
      "toggleBalance"
    )
    ?.addEventListener(
      "click",
      () => {

        balanceVisible =
          !balanceVisible;

        renderDashboard();

      }
    );


  // VER TRANSAÇÕES

  document
    .getElementById(
      "viewTransactions"
    )
    ?.addEventListener(
      "click",
      () =>
        showScreen("transactions")
    );


  // VER CATEGORIAS

  document
    .getElementById(
      "viewCategories"
    )
    ?.addEventListener(
      "click",
      () =>
        showScreen("categories")
    );


  // TEMA

  const themeButtons = [

    document.getElementById(
      "themeButton"
    ),

    document.getElementById(
      "settingsTheme"
    )

  ];


  themeButtons.forEach(button => {

    button?.addEventListener(
      "click",
      toggleTheme
    );

  });


  // LIMPAR

  document
    .getElementById(
      "clearData"
    )
    ?.addEventListener(
      "click",
      clearAllData
    );


  // PERFIL

  document
    .getElementById(
      "profileButton"
    )
    ?.addEventListener(
      "click",
      () =>
        showScreen("profile")
    );


  // ESC

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );

}


// ==========================================================
// TEMA
// ==========================================================

function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );

}


// ==========================================================
// LIMPAR DADOS
// ==========================================================

function clearAllData() {

  if (!transactions.length) {

    alert(
      "Não existem movimentações para apagar."
    );

    return;

  }


  const confirmed =
    confirm(
      "Isso apagará todas as suas movimentações salvas neste dispositivo. Continuar?"
    );


  if (!confirmed) return;


  transactions = [];

  saveData();

  renderEverything();


  alert(
    "Todas as movimentações foram apagadas."
  );

}


// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

function init() {

  loadData();

  setupEvents();

  renderEverything();

  showScreen("dashboard");

}


document.addEventListener(
  "DOMContentLoaded",
  init
);

// ============================================================
// CONTROLES 2.0
// Sistema financeiro local
// ============================================================


// ============================================================
// DADOS
// ============================================================

let transactions =
  JSON.parse(localStorage.getItem("controles_transactions")) || [];

let currentType = "income";

let currentFilter = "all";

let balanceVisible = true;


// ============================================================
// ELEMENTOS
// ============================================================

const modal =
  document.getElementById("transactionModal");

const floatingAdd =
  document.getElementById("floatingAdd");

const navAdd =
  document.getElementById("navAdd");

const closeModal =
  document.getElementById("closeModal");

const saveTransaction =
  document.getElementById("saveTransaction");

const amountInput =
  document.getElementById("transactionAmount");

const descriptionInput =
  document.getElementById("transactionDescription");

const categoryInput =
  document.getElementById("transactionCategory");

const dateInput =
  document.getElementById("transactionDate");


// ============================================================
// FORMATAR DINHEIRO
// ============================================================

function money(value) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(value);

}


// ============================================================
// FORMATAR DATA
// ============================================================

function formatDate(date) {

  const d = new Date(date + "T12:00:00");

  return d.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short"
    }
  );

}


// ============================================================
// SALVAR
// ============================================================

function saveData() {

  localStorage.setItem(
    "controles_transactions",
    JSON.stringify(transactions)
  );

}


// ============================================================
// CÁLCULOS
// ============================================================

function calculateTotals() {

  let income = 0;

  let expense = 0;


  transactions.forEach(transaction => {

    if (transaction.type === "income") {

      income += transaction.amount;

    } else {

      expense += transaction.amount;

    }

  });


  return {

    income,

    expense,

    balance: income - expense

  };

}


// ============================================================
// ATUALIZAR DASHBOARD
// ============================================================

function updateDashboard() {

  const totals = calculateTotals();


  document.getElementById(
    "incomeValue"
  ).textContent = money(totals.income);


  document.getElementById(
    "expenseValue"
  ).textContent = money(totals.expense);


  const balanceElement =
    document.getElementById("balanceValue");


  if (balanceVisible) {

    balanceElement.textContent =
      money(totals.balance);

  } else {

    balanceElement.textContent =
      "R$ ••••••";

  }


  let variation = 0;


  if (totals.income > 0) {

    variation =
      ((totals.income - totals.expense) /
        totals.income) *
      100;

  }


  document.getElementById(
    "balanceVariation"
  ).textContent =
    `${variation >= 0 ? "+" : ""}${variation.toFixed(1)}%`;

}


// ============================================================
// RENDERIZAR TRANSAÇÕES
// ============================================================

function renderTransactions() {

  renderHomeTransactions();

  renderAllTransactions();

}


// ============================================================
// ÍCONE DA CATEGORIA
// ============================================================

function categoryIcon(category) {

  const icons = {

    "Alimentação": "🛒",

    "Transporte": "🚗",

    "Casa": "🏠",

    "Lazer": "🎮",

    "Saúde": "❤️",

    "Educação": "📚",

    "Trabalho": "💼",

    "Outros": "📦"

  };


  return icons[category] || "📦";

}


// ============================================================
// TRANSAÇÕES DA HOME
// ============================================================

function renderHomeTransactions() {

  const container =
    document.getElementById(
      "homeTransactions"
    );


  container.innerHTML = "";


  const latest =
    [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


  if (latest.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div>💰</div>

        <strong>
          Nenhuma movimentação ainda
        </strong>

        <span>
          Comece adicionando sua primeira receita ou despesa.
        </span>

      </div>

    `;

    return;

  }


  latest.forEach(transaction => {

    container.appendChild(
      createTransactionElement(transaction)
    );

  });

}


// ============================================================
// TODAS AS TRANSAÇÕES
// ============================================================

function renderAllTransactions() {

  const container =
    document.getElementById(
      "allTransactions"
    );


  container.innerHTML = "";


  let list = [...transactions];


  if (currentFilter !== "all") {

    list =
      list.filter(
        transaction =>
          transaction.type === currentFilter
      );

  }


  list.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  if (list.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div>📋</div>

        <strong>
          Nenhuma transação encontrada
        </strong>

        <span>
          Adicione uma movimentação para começar.
        </span>

      </div>

    `;

    return;

  }


  list.forEach(transaction => {

    container.appendChild(
      createTransactionElement(
        transaction,
        true
      )
    );

  });

}


// ============================================================
// CRIAR TRANSAÇÃO
// ============================================================

function createTransactionElement(
  transaction,
  showDelete = false
) {

  const element =
    document.createElement("div");


  element.className =
    "transaction";


  const sign =
    transaction.type === "income"
      ? "+"
      : "-";


  const amountClass =
    transaction.type === "income"
      ? "income"
      : "expense";


  const icon =
    transaction.type === "income"
      ? "💼"
      : categoryIcon(transaction.category);


  element.innerHTML = `

    <div class="transaction-icon">
      ${icon}
    </div>


    <div class="transaction-info">

      <strong>
        ${escapeHTML(transaction.description)}
      </strong>

      <span>
        ${formatDate(transaction.date)}
        •
        ${escapeHTML(transaction.category)}
      </span>

    </div>


    <strong
      class="transaction-amount ${amountClass}"
    >
      ${sign} ${money(transaction.amount)}
    </strong>


    ${
      showDelete
        ? `
          <button
            class="delete-transaction"
            data-id="${transaction.id}"
            title="Excluir"
          >
            ×
          </button>
        `
        : ""
    }

  `;


  return element;

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================================
// CATEGORIAS
// ============================================================

function renderCategories() {

  const container =
    document.getElementById(
      "categoryList"
    );


  container.innerHTML = "";


  const expenses =
    transactions.filter(
      transaction =>
        transaction.type === "expense"
    );


  if (expenses.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div>📊</div>

        <strong>
          Sem gastos registrados
        </strong>

        <span>
          Suas categorias aparecerão aqui.
        </span>

      </div>

    `;

    return;

  }


  const categories = {};


  expenses.forEach(transaction => {

    if (!categories[transaction.category]) {

      categories[transaction.category] = 0;

    }

    categories[transaction.category] +=
      transaction.amount;

  });


  const total =
    expenses.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );


  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([category, value]) => {

      const percentage =
        total > 0
          ? (value / total) * 100
          : 0;


      const element =
        document.createElement("div");


      element.className =
        "category-item";


      element.innerHTML = `

        <div class="category-left">

          <div class="category-icon">

            ${categoryIcon(category)}

          </div>


          <div>

            <div class="category-name">

              ${escapeHTML(category)}

            </div>

            <span class="category-percent">

              ${percentage.toFixed(0)}% dos gastos

            </span>

          </div>

        </div>


        <strong class="category-value">

          ${money(value)}

        </strong>

      `;


      container.appendChild(element);

    });

}


// ============================================================
// RELATÓRIOS
// ============================================================

function renderReports() {

  const totals =
    calculateTotals();


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


  const message =
    document.getElementById(
      "reportMessage"
    );


  if (totals.balance > 0) {

    message.textContent =
      "Você está mantendo mais dinheiro do que está gastando.";

  } else if (totals.balance < 0) {

    message.textContent =
      "Suas despesas estão maiores que suas receitas.";

  } else {

    message.textContent =
      "Comece adicionando suas movimentações.";

  }


  renderReportCategories();

}


// ============================================================
// RELATÓRIO DE CATEGORIAS
// ============================================================

function renderReportCategories() {

  const container =
    document.getElementById(
      "reportCategories"
    );


  container.innerHTML = "";


  const expenses =
    transactions.filter(
      transaction =>
        transaction.type === "expense"
    );


  const categories = {};


  expenses.forEach(transaction => {

    categories[transaction.category] =
      (categories[transaction.category] || 0) +
      transaction.amount;

  });


  const total =
    expenses.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );


  const entries =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);


  if (entries.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div>📊</div>

        <strong>
          Ainda não há dados
        </strong>

        <span>
          Registre despesas para gerar o relatório.
        </span>

      </div>

    `;

    return;

  }


  entries.forEach(
    ([category, value]) => {

      const percentage =
        total > 0
          ? (value / total) * 100
          : 0;


      const element =
        document.createElement("div");


      element.className =
        "report-category";


      element.innerHTML = `

        <div class="report-category-header">

          <span>
            ${categoryIcon(category)}
            ${escapeHTML(category)}
          </span>

          <strong>
            ${money(value)}
          </strong>

        </div>


        <div class="report-bar">

          <div
            style="width:${percentage}%"
          ></div>

        </div>

      `;


      container.appendChild(element);

    }
  );

}


// ============================================================
// GRÁFICO VISUAL
// ============================================================

function renderChart() {

  const chart =
    document.getElementById(
      "chart"
    );

  const empty =
    document.getElementById(
      "chartEmpty"
    );


  if (transactions.length === 0) {

    chart.innerHTML = "";

    chart.style.display = "none";

    empty.style.display = "flex";

    return;

  }


  chart.style.display = "block";

  empty.style.display = "none";


  const totals =
    calculateTotals();


  const income =
    totals.income;


  const expense =
    totals.expense;


  const max =
    Math.max(income, expense, 1);


  const incomeHeight =
    Math.max(
      8,
      (income / max) * 100
    );


  const expenseHeight =
    Math.max(
      8,
      (expense / max) * 100
    );


  chart.innerHTML = `

    <div style="
      height:100%;
      display:flex;
      align-items:flex-end;
      justify-content:center;
      gap:35px;
      padding:10px 25px;
    ">

      <div style="
        height:${incomeHeight}%;
        width:65px;
        background:#1f6046;
        border-radius:12px 12px 5px 5px;
        min-height:12px;
        position:relative;
      ">

        <span style="
          position:absolute;
          top:-22px;
          width:100%;
          text-align:center;
          font-size:9px;
          font-weight:700;
          color:#1f6046;
        ">
          Receitas
        </span>

      </div>


      <div style="
        height:${expenseHeight}%;
        width:65px;
        background:#f28c28;
        border-radius:12px 12px 5px 5px;
        min-height:12px;
        position:relative;
      ">

        <span style="
          position:absolute;
          top:-22px;
          width:100%;
          text-align:center;
          font-size:9px;
          font-weight:700;
          color:#d96f12;
        ">
          Despesas
        </span>

      </div>

    </div>

  `;

}


// ============================================================
// ABRIR MODAL
// ============================================================

function openModal(type = "income") {

  modal.classList.add("show");

  setTransactionType(type);

  amountInput.value = "";

  descriptionInput.value = "";

  categoryInput.value =
    "Alimentação";


  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  dateInput.value = today;


  setTimeout(
    () => amountInput.focus(),
    100
  );

}


// ============================================================
// FECHAR MODAL
// ============================================================

function closeTransactionModal() {

  modal.classList.remove("show");

}


floatingAdd.addEventListener(
  "click",
  () => openModal()
);


navAdd.addEventListener(
  "click",
  () => openModal()
);


closeModal.addEventListener(
  "click",
  closeTransactionModal
);


modal.addEventListener(
  "click",
  event => {

    if (event.target === modal) {

      closeTransactionModal();

    }

  }
);


// ============================================================
// TIPO
// ============================================================

function setTransactionType(type) {

  currentType = type;


  document
    .querySelectorAll(".type")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.type === type
      );

    });

}


document
  .querySelectorAll(".type")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setTransactionType(
          button.dataset.type
        );

      }
    );

  });


// ============================================================
// SALVAR TRANSAÇÃO
// ============================================================

saveTransaction.addEventListener(
  "click",
  () => {

    const amount =
      Number(amountInput.value);


    const description =
      descriptionInput.value.trim();


    const category =
      categoryInput.value;


    const date =
      dateInput.value;


    if (!amount || amount <= 0) {

      alert(
        "Digite um valor válido."
      );

      amountInput.focus();

      return;

    }


    if (!description) {

      alert(
        "Digite uma descrição."
      );

      descriptionInput.focus();

      return;

    }


    if (!date) {

      alert(
        "Selecione uma data."
      );

      return;

    }


    const transaction = {

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

    };


    transactions.push(
      transaction
    );


    saveData();


    updateAll();


    closeTransactionModal();


  }
);


// ============================================================
// EXCLUIR TRANSAÇÃO
// ============================================================

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".delete-transaction"
      );


    if (!button) return;


    const id =
      button.dataset.id;


    const confirmed =
      confirm(
        "Deseja realmente excluir esta movimentação?"
      );


    if (!confirmed) return;


    transactions =
      transactions.filter(
        transaction =>
          transaction.id !== id
      );


    saveData();

    updateAll();

  }
);


// ============================================================
// NAVEGAÇÃO
// ============================================================

function navigateTo(page) {

  document
    .querySelectorAll(".page")
    .forEach(section => {

      section.classList.remove(
        "active-page"
      );

    });


  const target =
    document.getElementById(
      `page-${page}`
    );


  if (target) {

    target.classList.add(
      "active-page"
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


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


document
  .querySelectorAll("[data-page]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        navigateTo(
          button.dataset.page
        );

      }
    );

  });


// ============================================================
// FILTROS
// ============================================================

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter")
          .forEach(
            filter =>
              filter.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        currentFilter =
          button.dataset.filter;


        renderAllTransactions();

      }
    );

  });


// ============================================================
// VER TODAS
// ============================================================

document
  .querySelectorAll(".see-all")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        navigateTo(
          "transactions"
        );

      }
    );

  });


// ============================================================
// MOSTRAR / ESCONDER SALDO
// ============================================================

document
  .getElementById("toggleBalance")
  .addEventListener(
    "click",
    () => {

      balanceVisible =
        !balanceVisible;


      updateDashboard();

    }
  );


// ============================================================
// LIMPAR DADOS
// ============================================================

document
  .getElementById("clearData")
  .addEventListener(
    "click",
    () => {

      if (
        transactions.length === 0
      ) {

        alert(
          "Não existem movimentações para apagar."
        );

        return;

      }


      const confirmed =
        confirm(
          "Isso apagará todas as suas movimentações. Deseja continuar?"
        );


      if (!confirmed) return;


      transactions = [];


      saveData();

      updateAll();

      navigateTo("home");


      alert(
        "Dados apagados com sucesso."
      );

    }
  );


// ============================================================
// ATUALIZAR TUDO
// ============================================================

function updateAll() {

  updateDashboard();

  renderTransactions();

  renderCategories();

  renderReports();

  renderChart();

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateAll();

  }
);

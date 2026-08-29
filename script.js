// ============================================================
// CONTROLES 2.1
// FRONTEND LOCAL
// Preparado para futura integração com Supabase
// ============================================================


// ============================================================
// ESTADO
// ============================================================

let transactions =
  JSON.parse(
    localStorage.getItem("controles_transactions")
  ) || [];

let currentType = "income";

let currentFilter = "all";

let editingId = null;

let balanceVisible = true;


// ============================================================
// ELEMENTOS
// ============================================================

const modal =
  document.getElementById("modal");

const amount =
  document.getElementById("amount");

const description =
  document.getElementById("description");

const category =
  document.getElementById("category");

const date =
  document.getElementById("date");

const saveButton =
  document.getElementById("saveButton");

const modalTitle =
  document.getElementById("modalTitle");


// ============================================================
// UTILIDADES
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


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function saveData() {

  localStorage.setItem(
    "controles_transactions",
    JSON.stringify(transactions)
  );

}


function categoryIcon(name) {

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

  return icons[name] || "📦";

}


function formatDate(value) {

  if (!value) return "";

  const d =
    new Date(value + "T12:00:00");

  return d.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short"
    }
  );

}


function today() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


// ============================================================
// CÁLCULOS
// ============================================================

function totals(list = transactions) {

  let income = 0;

  let expense = 0;


  list.forEach(item => {

    if (item.type === "income") {

      income += Number(item.amount);

    } else {

      expense += Number(item.amount);

    }

  });


  return {

    income,
    expense,
    balance: income - expense

  };

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

  const data = totals();


  document.getElementById(
    "incomeValue"
  ).textContent =
    money(data.income);


  document.getElementById(
    "expenseValue"
  ).textContent =
    money(data.expense);


  const balance =
    document.getElementById(
      "balanceValue"
    );


  balance.textContent =
    balanceVisible
      ? money(data.balance)
      : "R$ ••••••";


  let percentage = 0;


  if (data.income > 0) {

    percentage =
      ((data.income - data.expense) /
        data.income) * 100;

  }


  document.getElementById(
    "balancePercent"
  ).textContent =
    `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;

}


// ============================================================
// TRANSAÇÃO HTML
// ============================================================

function transactionHTML(
  item,
  showButtons = false
) {

  const sign =
    item.type === "income"
      ? "+"
      : "-";


  const amountClass =
    item.type === "income"
      ? "income"
      : "expense";


  const icon =
    item.type === "income"
      ? "💰"
      : categoryIcon(item.category);


  return `

    <div class="transaction">

      <div class="transaction-icon">
        ${icon}
      </div>


      <div class="transaction-info">

        <strong>
          ${escapeHTML(item.description)}
        </strong>

        <span>
          ${formatDate(item.date)}
          •
          ${escapeHTML(item.category)}
        </span>

      </div>


      <strong class="transaction-amount ${amountClass}">
        ${sign} ${money(item.amount)}
      </strong>


      ${
        showButtons
          ? `
            <div class="transaction-buttons">

              <button
                class="edit-button"
                data-edit="${item.id}"
                title="Editar"
              >
                ✎
              </button>

              <button
                class="delete-button"
                data-delete="${item.id}"
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


// ============================================================
// TRANSAÇÕES RECENTES
// ============================================================

function renderRecent() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  const list =
    [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          💰
        </div>

        <strong>
          Nenhuma movimentação ainda
        </strong>

        <span>
          Adicione sua primeira receita ou despesa.
        </span>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(item =>
        transactionHTML(item)
      )
      .join("");

}


// ============================================================
// TODAS AS TRANSAÇÕES
// ============================================================

function renderAllTransactions() {

  const container =
    document.getElementById(
      "allTransactions"
    );


  const search =
    document.getElementById(
      "searchInput"
    ).value
      .trim()
      .toLowerCase();


  const categoryValue =
    document.getElementById(
      "categoryFilter"
    ).value;


  let list =
    [...transactions];


  if (currentFilter !== "all") {

    list =
      list.filter(
        item =>
          item.type === currentFilter
      );

  }


  if (categoryValue !== "all") {

    list =
      list.filter(
        item =>
          item.category === categoryValue
      );

  }


  if (search) {

    list =
      list.filter(item =>

        item.description
          .toLowerCase()
          .includes(search)

        ||

        item.category
          .toLowerCase()
          .includes(search)

      );

  }


  list.sort(
    (a, b) =>
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

        <span>
          Tente mudar os filtros ou adicionar um lançamento.
        </span>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(item =>
        transactionHTML(item, true)
      )
      .join("");

}


// ============================================================
// CATEGORIAS
// ============================================================

function renderCategories() {

  const container =
    document.getElementById(
      "categoryList"
    );


  const expenses =
    transactions.filter(
      item =>
        item.type === "expense"
    );


  if (!expenses.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          📊
        </div>

        <strong>
          Sem despesas registradas
        </strong>

        <span>
          Suas categorias aparecerão aqui.
        </span>

      </div>

    `;

    return;

  }


  const categories = {};


  expenses.forEach(item => {

    categories[item.category] =
      (categories[item.category] || 0) +
      Number(item.amount);

  });


  const total =
    expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );


  container.innerHTML =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(
        ([name, value]) => {

          const percent =
            total
              ? (value / total) * 100
              : 0;


          return `

            <div class="category-item">

              <div class="category-left">

                <div class="category-icon">
                  ${categoryIcon(name)}
                </div>

                <div>

                  <div class="category-name">
                    ${escapeHTML(name)}
                  </div>

                  <span class="category-percent">
                    ${percent.toFixed(0)}% dos gastos
                  </span>

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


// ============================================================
// RELATÓRIO
// ============================================================

function renderReports() {

  const data =
    totals();


  document.getElementById(
    "reportIncome"
  ).textContent =
    money(data.income);


  document.getElementById(
    "reportExpense"
  ).textContent =
    money(data.expense);


  document.getElementById(
    "reportBalance"
  ).textContent =
    money(data.balance);


  const message =
    document.getElementById(
      "reportMessage"
    );


  if (data.balance > 0) {

    message.textContent =
      "Seu resultado está positivo.";

  } else if (data.balance < 0) {

    message.textContent =
      "Suas despesas estão maiores que suas receitas.";

  } else {

    message.textContent =
      "Comece adicionando suas movimentações.";

  }


  renderReportCategories();

}


function renderReportCategories() {

  const container =
    document.getElementById(
      "reportCategories"
    );


  const expenses =
    transactions.filter(
      item =>
        item.type === "expense"
    );


  const categories = {};


  expenses.forEach(item => {

    categories[item.category] =
      (categories[item.category] || 0) +
      Number(item.amount);

  });


  const total =
    expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );


  const entries =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);


  if (!entries.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-state-icon">
          📊
        </div>

        <strong>
          Ainda não há dados
        </strong>

        <span>
          Registre despesas para gerar seu relatório.
        </span>

      </div>

    `;

    return;

  }


  container.innerHTML =
    entries.map(
      ([name, value]) => {

        const percent =
          total
            ? (value / total) * 100
            : 0;


        return `

          <div class="report-category">

            <div class="report-category-header">

              <span>
                ${categoryIcon(name)}
                ${escapeHTML(name)}
              </span>

              <strong>
                ${money(value)}
              </strong>

            </div>


            <div class="report-bar">

              <div
                style="width:${percent}%"
              ></div>

            </div>

          </div>

        `;

      }
    ).join("");

}


// ============================================================
// GRÁFICO
// ============================================================

function renderChart() {

  const chart =
    document.getElementById(
      "financialChart"
    );

  const empty =
    document.getElementById(
      "chartEmpty"
    );


  const period =
    document.getElementById(
      "periodSelect"
    ).value;


  let list =
    [...transactions];


  if (period === "month") {

    const now =
      new Date();


    const month =
      now.getMonth();


    const year =
      now.getFullYear();


    list =
      list.filter(item => {

        const d =
          new Date(
            item.date + "T12:00:00"
          );

        return (
          d.getMonth() === month &&
          d.getFullYear() === year
        );

      });

  }


  const data =
    totals(list);


  if (!list.length) {

    chart.style.display = "none";

    empty.style.display = "flex";

    return;

  }


  chart.style.display = "block";

  empty.style.display = "none";


  const max =
    Math.max(
      data.income,
      data.expense,
      1
    );


  const incomeHeight =
    Math.max(
      8,
      data.income / max * 100
    );


  const expenseHeight =
    Math.max(
      8,
      data.expense / max * 100
    );


  chart.innerHTML = `

    <div style="
      height:100%;
      display:flex;
      align-items:flex-end;
      justify-content:center;
      gap:38px;
      padding:30px 25px 10px;
    ">

      <div style="
        position:relative;
        width:65px;
        height:${incomeHeight}%;
        min-height:10px;
        border-radius:12px 12px 5px 5px;
        background:#24664a;
      ">

        <span style="
          position:absolute;
          top:-22px;
          width:100%;
          text-align:center;
          font-size:8px;
          font-weight:700;
          color:#24664a;
        ">
          Receitas
        </span>

      </div>


      <div style="
        position:relative;
        width:65px;
        height:${expenseHeight}%;
        min-height:10px;
        border-radius:12px 12px 5px 5px;
        background:#f28c28;
      ">

        <span style="
          position:absolute;
          top:-22px;
          width:100%;
          text-align:center;
          font-size:8px;
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
// ATUALIZA TUDO
// ============================================================

function updateAll() {

  updateDashboard();

  renderRecent();

  renderAllTransactions();

  renderCategories();

  renderReports();

  renderChart();

}


// ============================================================
// MODAL
// ============================================================

function openModal(type = "income", id = null) {

  modal.classList.add("show");


  editingId = id;


  if (id) {

    const item =
      transactions.find(
        transaction =>
          transaction.id === id
      );


    if (!item) return;


    modalTitle.textContent =
      "Editar lançamento";


    saveButton.textContent =
      "Salvar alterações";


    amount.value =
      item.amount;


    description.value =
      item.description;


    category.value =
      item.category;


    date.value =
      item.date;


    setType(item.type);

  } else {

    modalTitle.textContent =
      "Nova movimentação";


    saveButton.textContent =
      "Salvar lançamento";


    amount.value = "";

    description.value = "";

    category.value =
      "Alimentação";

    date.value =
      today();


    setType(type);

  }


  setTimeout(
    () => amount.focus(),
    100
  );

}


function closeModalWindow() {

  modal.classList.remove("show");

  editingId = null;

}


function setType(type) {

  currentType = type;


  document
    .querySelectorAll(".type-button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.type === type
      );

    });

}


document
  .querySelectorAll("[data-open-type]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () =>
        openModal(
          button.dataset.openType
        )
    );

  });


document
  .querySelectorAll(".type-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () =>
        setType(
          button.dataset.type
        )
    );

  });


document
  .getElementById("floatingAdd")
  .addEventListener(
    "click",
    () => openModal()
  );


document
  .getElementById("navAdd")
  .addEventListener(
    "click",
    () => openModal()
  );


document
  .getElementById("headerAdd")
  .addEventListener(
    "click",
    () => openModal()
  );


document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    closeModalWindow
  );


modal.addEventListener(
  "click",
  event => {

    if (event.target === modal) {

      closeModalWindow();

    }

  }
);


// ============================================================
// SALVAR
// ============================================================

saveButton.addEventListener(
  "click",
  () => {

    const value =
      Number(amount.value);


    const text =
      description.value.trim();


    if (!value || value <= 0) {

      alert(
        "Digite um valor válido."
      );

      amount.focus();

      return;

    }


    if (!text) {

      alert(
        "Digite uma descrição."
      );

      description.focus();

      return;

    }


    if (!date.value) {

      alert(
        "Escolha uma data."
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

          type: currentType,

          amount: value,

          description: text,

          category: category.value,

          date: date.value

        };

      }

    } else {

      transactions.push({

        id:
          Date.now().toString(),

        type:
          currentType,

        amount:
          value,

        description:
          text,

        category:
          category.value,

        date:
          date.value

      });

    }


    saveData();

    updateAll();

    closeModalWindow();

  }
);


// ============================================================
// EDITAR / EXCLUIR
// ============================================================

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


    const deleteButton =
      event.target.closest(
        "[data-delete]"
      );


    if (deleteButton) {

      const id =
        deleteButton.dataset.delete;


      const confirmed =
        confirm(
          "Deseja excluir este lançamento?"
        );


      if (!confirmed) return;


      transactions =
        transactions.filter(
          item =>
            item.id !== id
        );


      saveData();

      updateAll();

    }

  }
);


// ============================================================
// NAVEGAÇÃO
// ============================================================

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
      `page-${page}`
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

        navigate(
          button.dataset.page
        );

      }
    );

  });


document
  .getElementById("profileButton")
  .addEventListener(
    "click",
    () => navigate("profile")
  );


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


        renderAllTransactions();

      }
    );

  });


document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    renderAllTransactions
  );


document
  .getElementById("categoryFilter")
  .addEventListener(
    "change",
    renderAllTransactions
  );


document
  .getElementById("periodSelect")
  .addEventListener(
    "change",
    renderChart
  );


// ============================================================
// SALDO
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

      if (!transactions.length) {

        alert(
          "Não existem dados para apagar."
        );

        return;

      }


      const confirmed =
        confirm(
          "Tem certeza que deseja apagar todas as movimentações?"
        );


      if (!confirmed) return;


      transactions = [];

      saveData();

      updateAll();

      navigate("home");


      alert(
        "Dados apagados com sucesso."
      );

    }
  );


// ============================================================
// INICIALIZAÇÃO
// ============================================================

updateAll();

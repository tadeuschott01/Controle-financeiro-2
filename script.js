/* =====================================================
   CONTROLE FINANCEIRO
   SUPABASE + LOGIN + CADASTRO + FINANÇAS
   ===================================================== */


/* =====================================================
   SUPABASE
   ===================================================== */

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   VARIÁVEIS
   ===================================================== */

let currentUser = null;

let currentProfile = null;

let transactions = [];

let editingTransactionId = null;

let selectedTransactionType = "receita";

let financeChart = null;

let reportChart = null;


/* =====================================================
   ELEMENTOS
   ===================================================== */

const authScreen =
  document.getElementById("authScreen");

const appScreen =
  document.getElementById("appScreen");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const loginMessage =
  document.getElementById("loginMessage");

const registerMessage =
  document.getElementById("registerMessage");

const transactionModal =
  document.getElementById("transactionModal");

const deleteModal =
  document.getElementById("deleteModal");


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


async function initializeApp() {

  setupEvents();

  setTodayDate();

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();


  if (session) {

    currentUser =
      session.user;

    await startApplication();

  } else {

    showAuthentication();

  }


  supabaseClient.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {

      if (session) {

        currentUser =
          session.user;

      }

    }
  );

}


/* =====================================================
   EVENTOS
   ===================================================== */

function setupEvents() {


  document
    .getElementById("loginButton")
    .addEventListener(
      "click",
      login
    );


  document
    .getElementById("registerButton")
    .addEventListener(
      "click",
      register
    );


  document
    .getElementById("showRegisterButton")
    .addEventListener(
      "click",
      showRegister
    );


  document
    .getElementById("showLoginButton")
    .addEventListener(
      "click",
      showLogin
    );


  document
    .getElementById("registerAccountType")
    .addEventListener(
      "change",
      handleAccountType
    );


  document
    .getElementById("logoutButton")
    .addEventListener(
      "click",
      logout
    );


  document
    .querySelectorAll(".menu-item")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showSection(
              button.dataset.section
            );

          }
        );

      }
    );


  document
    .querySelectorAll("[data-section-target]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showSection(
              button.dataset.sectionTarget
            );

          }
        );

      }
    );


  document
    .getElementById("newTransactionButton")
    .addEventListener(
      "click",
      () =>
        openTransactionModal(
          "receita"
        )
    );


  document
    .getElementById("quickIncomeButton")
    .addEventListener(
      "click",
      () =>
        openTransactionModal(
          "receita"
        )
    );


  document
    .getElementById("quickExpenseButton")
    .addEventListener(
      "click",
      () =>
        openTransactionModal(
          "despesa"
        )
    );


  document
    .getElementById("closeModalButton")
    .addEventListener(
      "click",
      closeTransactionModal
    );


  document
    .getElementById("cancelTransactionButton")
    .addEventListener(
      "click",
      closeTransactionModal
    );


  document
    .getElementById("transactionForm")
    .addEventListener(
      "submit",
      saveTransaction
    );


  document
    .querySelectorAll(".type-option")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            selectedTransactionType =
              button.dataset.type;


            document
              .querySelectorAll(
                ".type-option"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );

          }
        );

      }
    );


  document
    .getElementById("searchTransaction")
    .addEventListener(
      "input",
      renderTransactions
    );


  document
    .getElementById("filterType")
    .addEventListener(
      "change",
      renderTransactions
    );


  document
    .getElementById("filterArea")
    .addEventListener(
      "change",
      renderTransactions
    );


  document
    .getElementById("filterCategory")
    .addEventListener(
      "change",
      renderTransactions
    );


  document
    .getElementById("dashboardPeriod")
    .addEventListener(
      "change",
      updateDashboard
    );


  document
    .getElementById("cancelDeleteButton")
    .addEventListener(
      "click",
      closeDeleteModal
    );


  document
    .getElementById("confirmDeleteButton")
    .addEventListener(
      "click",
      deleteTransaction
    );


  document
    .getElementById("mobileMenuButton")
    .addEventListener(
      "click",
      () => {

        document
          .querySelector(".sidebar")
          .classList.toggle(
            "mobile-open"
          );

      }
    );

}


/* =====================================================
   LOGIN
   ===================================================== */

async function login() {

  const email =
    document
      .getElementById(
        "loginEmail"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;


  clearMessage(
    loginMessage
  );


  if (
    !email ||
    !password
  ) {

    showMessage(
      loginMessage,
      "Preencha o e-mail e a senha."
    );

    return;

  }


  setButtonLoading(
    "loginButton",
    true,
    "Entrando..."
  );


  const {
    data,
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({

        email,
        password

      });


  setButtonLoading(
    "loginButton",
    false,
    "Entrar"
  );


  if (error) {

    showMessage(
      loginMessage,
      getAuthError(error)
    );

    return;

  }


  currentUser =
    data.user;


  await startApplication();

}


/* =====================================================
   CADASTRO
   ===================================================== */

async function register() {

  const name =
    document
      .getElementById(
        "registerName"
      )
      .value
      .trim();


  const email =
    document
      .getElementById(
        "registerEmail"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "registerPassword"
      )
      .value;


  const accountType =
    document
      .getElementById(
        "registerAccountType"
      )
      .value;


  const companyName =
    document
      .getElementById(
        "registerCompany"
      )
      .value
      .trim();


  clearMessage(
    registerMessage
  );


  if (
    !name ||
    !email ||
    !password
  ) {

    showMessage(
      registerMessage,
      "Preencha os campos obrigatórios."
    );

    return;

  }


  if (
    password.length < 6
  ) {

    showMessage(
      registerMessage,
      "A senha precisa ter pelo menos 6 caracteres."
    );

    return;

  }


  if (
    (
      accountType === "empresa" ||
      accountType === "ambos"
    ) &&
    !companyName
  ) {

    showMessage(
      registerMessage,
      "Informe o nome da empresa."
    );

    return;

  }


  setButtonLoading(
    "registerButton",
    true,
    "Criando..."
  );


  const {
    data,
    error
  } =
    await supabaseClient.auth
      .signUp({

        email,

        password,

        options: {

          data: {

            full_name:
              name,

            account_type:
              accountType,

            company_name:
              companyName

          }

        }

      });


  setButtonLoading(
    "registerButton",
    false,
    "Criar minha conta"
  );


  if (error) {

    showMessage(
      registerMessage,
      getAuthError(error)
    );

    return;

  }


  if (!data.session) {

    showMessage(
      registerMessage,
      "Cadastro realizado! Confira seu e-mail para confirmar a conta."
    );

    return;

  }


  currentUser =
    data.user;


  await startApplication();

}


/* =====================================================
   INICIAR SISTEMA
   ===================================================== */

async function startApplication() {

  showApplication();


  await loadProfile();


  await loadTransactions();


  updateUserInterface();


  updateDashboard();


  renderTransactions();


  updateReports();

}


/* =====================================================
   PERFIL
   ===================================================== */

async function loadProfile() {

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq(
        "id",
        currentUser.id
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Erro ao carregar perfil:",
      error
    );

    return;

  }


  currentProfile =
    data;

}


/* =====================================================
   TRANSAÇÕES
   ===================================================== */

async function loadTransactions() {

  if (!currentUser) {
    return;
  }


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

    console.error(
      "Erro ao carregar lançamentos:",
      error
    );

    transactions = [];

    return;

  }


  transactions =
    data || [];

}


/* =====================================================
   SALVAR TRANSAÇÃO
   ===================================================== */

async function saveTransaction(
  event
) {

  event.preventDefault();


  if (!currentUser) {
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
    Number(
      document
        .getElementById(
          "transactionAmount"
        )
        .value
    );


  const date =
    document
      .getElementById(
        "transactionDate"
      )
      .value;


  const category =
    document
      .getElementById(
        "transactionCategory"
      )
      .value;


  const area =
    document
      .getElementById(
        "transactionArea"
      )
      .value;


  const note =
    document
      .getElementById(
        "transactionNote"
      )
      .value
      .trim();


  const message =
    document.getElementById(
      "transactionMessage"
    );


  clearMessage(
    message
  );


  if (!description) {

    showMessage(
      message,
      "Informe uma descrição."
    );

    return;

  }


  if (
    !amount ||
    amount <= 0
  ) {

    showMessage(
      message,
      "Informe um valor válido."
    );

    return;

  }


  if (!date) {

    showMessage(
      message,
      "Informe a data."
    );

    return;

  }


  if (!category) {

    showMessage(
      message,
      "Selecione uma categoria."
    );

    return;

  }


  const transactionData = {

    user_id:
      currentUser.id,

    type:
      selectedTransactionType,

    description,

    amount,

    category,

    date,

    area,

    note

  };


  let result;


  if (
    editingTransactionId
  ) {

    result =
      await supabaseClient
        .from("transactions")
        .update(
          transactionData
        )
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
          transactionData
        );

  }


  if (result.error) {

    console.error(
      result.error
    );

    showMessage(
      message,
      "Não foi possível salvar. Verifique a tabela transactions no Supabase."
    );

    return;

  }


  closeTransactionModal();


  await loadTransactions();


  updateDashboard();


  renderTransactions();


  updateReports();

}


/* =====================================================
   MODAL
   ===================================================== */

function openTransactionModal(
  type = "receita",
  transaction = null
) {

  transactionModal
    .classList
    .remove("hidden");


  editingTransactionId =
    transaction
      ? transaction.id
      : null;


  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      transaction
        ? "Editar lançamento"
        : "Novo lançamento";


  selectedTransactionType =
    transaction
      ? transaction.type
      : type;


  document
    .querySelectorAll(
      ".type-option"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.type ===
            selectedTransactionType
        );

      }
    );


  if (transaction) {

    document
      .getElementById(
        "transactionDescription"
      )
      .value =
        transaction.description ||
        "";


    document
      .getElementById(
        "transactionAmount"
      )
      .value =
        transaction.amount ||
        "";


    document
      .getElementById(
        "transactionDate"
      )
      .value =
        transaction.date ||
        "";


    document
      .getElementById(
        "transactionCategory"
      )
      .value =
        transaction.category ||
        "";


    document
      .getElementById(
        "transactionArea"
      )
      .value =
        transaction.area ||
        "pessoal";


    document
      .getElementById(
        "transactionNote"
      )
      .value =
        transaction.note ||
        "";

  } else {

    document
      .getElementById(
        "transactionForm"
      )
      .reset();


    document
      .getElementById(
        "transactionDate"
      )
      .value =
        getToday();


    document
      .getElementById(
        "transactionArea"
      )
      .value =
        "pessoal";


    document
      .querySelectorAll(
        ".type-option"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.type ===
              selectedTransactionType
          );

        }
      );

  }

}


function closeTransactionModal() {

  transactionModal
    .classList
    .add("hidden");


  editingTransactionId =
    null;


  clearMessage(
    document.getElementById(
      "transactionMessage"
    )
  );

}


/* =====================================================
   EDITAR
   ===================================================== */

window.editTransaction =
  function(id) {

    const transaction =
      transactions.find(
        item =>
          item.id === id
      );


    if (!transaction) {
      return;
    }


    openTransactionModal(
      transaction.type,
      transaction
    );

  };


/* =====================================================
   EXCLUIR
   ===================================================== */

window.confirmDelete =
  function(id) {

    document
      .getElementById(
        "deleteTransactionId"
      )
      .value =
        id;


    deleteModal
      .classList
      .remove("hidden");

  };


function closeDeleteModal() {

  deleteModal
    .classList
    .add("hidden");

}


async function deleteTransaction() {

  const id =
    document
      .getElementById(
        "deleteTransactionId"
      )
      .value;


  if (
    !id ||
    !currentUser
  ) {
    return;
  }


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

    console.error(
      error
    );

    alert(
      "Não foi possível excluir."
    );

    return;

  }


  closeDeleteModal();


  await loadTransactions();


  updateDashboard();


  renderTransactions();


  updateReports();

}


/* =====================================================
   TABELA
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


  const search =
    document
      .getElementById(
        "searchTransaction"
      )
      .value
      .toLowerCase()
      .trim();


  const type =
    document
      .getElementById(
        "filterType"
      )
      .value;


  const area =
    document
      .getElementById(
        "filterArea"
      )
      .value;


  const category =
    document
      .getElementById(
        "filterCategory"
      )
      .value;


  const filtered =
    transactions.filter(
      transaction => {

        const text =
          (
            transaction.description ||
            ""
          ).toLowerCase();


        const categoryText =
          (
            transaction.category ||
            ""
          ).toLowerCase();


        return (

          (
            !search ||
            text.includes(search) ||
            categoryText.includes(search)
          ) &&

          (
            type === "all" ||
            transaction.type === type
          ) &&

          (
            area === "all" ||
            transaction.area === area
          ) &&

          (
            category === "all" ||
            transaction.category === category
          )

        );

      }
    );


  tbody.innerHTML = "";


  if (!filtered.length) {

    empty.classList
      .remove("hidden");

    return;

  }


  empty.classList
    .add("hidden");


  filtered.forEach(
    transaction => {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>
          ${formatDate(
            transaction.date
          )}
        </td>

        <td>
          <strong>
            ${escapeHtml(
              transaction.description
            )}
          </strong>
        </td>

        <td>
          ${escapeHtml(
            transaction.category
          )}
        </td>

        <td>

          <span class="area-badge">

            ${
              transaction.area ===
              "empresa"
                ? "Empresa"
                : "Pessoal"
            }

          </span>

        </td>

        <td>

          <span class="type-badge ${
            transaction.type ===
            "receita"
              ? "income"
              : "expense"
          }">

            ${
              transaction.type ===
              "receita"
                ? "Receita"
                : "Despesa"
            }

          </span>

        </td>

        <td>

          <strong>

            ${
              transaction.type ===
              "receita"
                ? "+"
                : "-"
            }

            ${formatCurrency(
              transaction.amount
            )}

          </strong>

        </td>

        <td>

          <div class="table-actions">

            <button
              class="action-button"
              onclick="editTransaction('${transaction.id}')"
            >
              ✏️
            </button>

            <button
              class="action-button delete"
              onclick="confirmDelete('${transaction.id}')"
            >
              🗑️
            </button>

          </div>

        </td>

      `;


      tbody.appendChild(
        row
      );

    }
  );


  renderRecentTransactions();

}


/* =====================================================
   DASHBOARD
   ===================================================== */

function updateDashboard() {

  const period =
    document
      .getElementById(
        "dashboardPeriod"
      )
      .value;


  const filtered =
    filterByPeriod(
      transactions,
      period
    );


  const income =
    filtered
      .filter(
        item =>
          item.type ===
          "receita"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.amount
          ),
        0
      );


  const expense =
    filtered
      .filter(
        item =>
          item.type ===
          "despesa"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.amount
          ),
        0
      );


  const balance =
    income -
    expense;


  document
    .getElementById(
      "incomeValue"
    )
    .textContent =
      formatCurrency(
        income
      );


  document
    .getElementById(
      "expenseValue"
    )
    .textContent =
      formatCurrency(
        expense
      );


  document
    .getElementById(
      "balanceValue"
    )
    .textContent =
      formatCurrency(
        balance
      );


  document
    .getElementById(
      "transactionCount"
    )
    .textContent =
      filtered.length;


  renderCategoryList(
    filtered
  );


  renderFinanceChart(
    income,
    expense
  );


  renderRecentTransactions();

}


/* =====================================================
   PERÍODO
   ===================================================== */

function filterByPeriod(
  list,
  period
) {

  const now =
    new Date();


  return list.filter(
    transaction => {

      if (
        period === "all"
      ) {

        return true;

      }


      const date =
        new Date(
          transaction.date +
          "T00:00:00"
        );


      if (
        period === "year"
      ) {

        return (
          date.getFullYear() ===
          now.getFullYear()
        );

      }


      return (

        date.getMonth() ===
        now.getMonth() &&

        date.getFullYear() ===
        now.getFullYear()

      );

    }
  );

}


/* =====================================================
   CATEGORIAS
   ===================================================== */

function renderCategoryList(
  list
) {

  const container =
    document.getElementById(
      "categoryList"
    );


  const expenses =
    list.filter(
      item =>
        item.type ===
        "despesa"
    );


  if (!expenses.length) {

    container.innerHTML = `
      <div class="empty-state">
        Nenhuma despesa registrada.
      </div>
    `;

    return;

  }


  const totals = {};


  expenses.forEach(
    item => {

      totals[
        item.category
      ] =
        (
          totals[
            item.category
          ] ||
          0
        ) +
        Number(
          item.amount
        );

    }
  );


  const sorted =
    Object.entries(
      totals
    ).sort(
      (
        a,
        b
      ) =>
        b[1] -
        a[1]
    );


  container.innerHTML = "";


  sorted.forEach(
    (
      [
        category,
        value
      ]
    ) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "category-item";


      item.innerHTML = `

        <div class="category-name">

          <span
            class="category-dot"
          ></span>

          ${escapeHtml(
            category
          )}

        </div>

        <span
          class="category-value"
        >
          ${formatCurrency(
            value
          )}
        </span>

      `;


      container.appendChild(
        item
      );

    }
  );

}


/* =====================================================
   RECENTES
   ===================================================== */

function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  if (!transactions.length) {

    container.innerHTML = `
      <div class="empty-state">
        Nenhum lançamento encontrado.
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  transactions
    .slice(
      0,
      5
    )
    .forEach(
      transaction => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "transaction-row";


        row.innerHTML = `

          <div class="transaction-info">

            <div class="transaction-icon ${
              transaction.type ===
              "receita"
                ? "income"
                : "expense"
            }">

              ${
                transaction.type ===
                "receita"
                  ? "+"
                  : "-"
              }

            </div>

            <div>

              <div
                class="transaction-description"
              >
                ${escapeHtml(
                  transaction.description
                )}
              </div>

              <div
                class="transaction-date"
              >
                ${escapeHtml(
                  transaction.category
                )}
                ·
                ${formatDate(
                  transaction.date
                )}
              </div>

            </div>

          </div>


          <div
            class="transaction-value ${
              transaction.type ===
              "receita"
                ? "income"
                : "expense"
            }"
          >

            ${
              transaction.type ===
              "receita"
                ? "+"
                : "-"
            }

            ${formatCurrency(
              transaction.amount
            )}

          </div>

        `;


        container.appendChild(
          row
        );

      }
    );

}


/* =====================================================
   GRÁFICO
   ===================================================== */

function renderFinanceChart(
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


  if (financeChart) {

    financeChart.destroy();

  }


  financeChart =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels: [
            "Receitas",
            "Despesas"
          ],

          datasets: [

            {

              label:
                "Valor",

              data: [
                income,
                expense
              ],

              backgroundColor: [
                "#2f6b50",
                "#f28c28"
              ],

              borderRadius: 8

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            y: {

              beginAtZero:
                true

            }

          }

        }

      }
    );

}


/* =====================================================
   RELATÓRIOS
   ===================================================== */

function updateReports() {

  const income =
    transactions
      .filter(
        item =>
          item.type ===
          "receita"
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.amount
          ),
        0
      );


  const expense =
    transactions
      .filter(
        item =>
          item.type ===
          "despesa"
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.amount
          ),
        0
      );


  const balance =
    income -
    expense;


  document
    .getElementById(
      "reportIncome"
    )
    .textContent =
      formatCurrency(
        income
      );


  document
    .getElementById(
      "reportExpense"
    )
    .textContent =
      formatCurrency(
        expense
      );


  document
    .getElementById(
      "reportBalance"
    )
    .textContent =
      formatCurrency(
        balance
      );


  const totals = {};


  transactions
    .filter(
      item =>
        item.type ===
        "despesa"
    )
    .forEach(
      item => {

        totals[
          item.category
        ] =
          (
            totals[
              item.category
            ] ||
            0
          ) +
          Number(
            item.amount
          );

      }
    );


  const top =
    Object.entries(
      totals
    ).sort(
      (
        a,
        b
      ) =>
        b[1] -
        a[1]
    )[0];


  document
    .getElementById(
      "topCategory"
    )
    .textContent =
      top
        ? `${top[0]} — ${formatCurrency(top[1])}`
        : "Nenhuma informação.";


  renderReportChart();

}


/* =====================================================
   GRÁFICO RELATÓRIO
   ===================================================== */

function renderReportChart() {

  const canvas =
    document.getElementById(
      "reportChart"
    );


  if (!canvas) {
    return;
  }


  if (reportChart) {

    reportChart.destroy();

  }


  const labels = [];

  const incomeData = [];

  const expenseData = [];


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
        now.getMonth() -
          i,
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
      )
    );


    const monthTransactions =
      transactions.filter(
        transaction => {

          const transactionDate =
            new Date(
              transaction.date +
              "T00:00:00"
            );


          return (

            transactionDate
              .getFullYear() ===
              year &&

            transactionDate
              .getMonth() ===
              month

          );

        }
      );


    incomeData.push(
      monthTransactions
        .filter(
          item =>
            item.type ===
            "receita"
        )
        .reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount
            ),
          0
        )
    );


    expenseData.push(
      monthTransactions
        .filter(
          item =>
            item.type ===
            "despesa"
        )
        .reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount
            ),
          0
        )
    );

  }


  reportChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                "Receitas",

              data:
                incomeData,

              borderColor:
                "#2f6b50",

              backgroundColor:
                "rgba(47,107,80,.08)",

              tension:
                .3,

              fill:
                true

            },


            {

              label:
                "Despesas",

              data:
                expenseData,

              borderColor:
                "#f28c28",

              backgroundColor:
                "rgba(242,140,40,.08)",

              tension:
                .3,

              fill:
                true

            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false

        }

      }
    );

}


/* =====================================================
   INTERFACE DO USUÁRIO
   ===================================================== */

function updateUserInterface() {

  const name =
    currentProfile?.full_name ||
    currentUser
      ?.user_metadata
      ?.full_name ||
    "Usuário";


  const email =
    currentUser?.email ||
    "—";


  const accountType =
    currentProfile?.account_type ||
    currentUser
      ?.user_metadata
      ?.account_type ||
    "pessoal";


  document
    .getElementById(
      "userName"
    )
    .textContent =
      name;


  document
    .getElementById(
      "profileName"
    )
    .textContent =
      name;


  document
    .getElementById(
      "profileEmail"
    )
    .textContent =
      email;


  document
    .getElementById(
      "profileAccountType"
    )
    .textContent =
      getAccountTypeLabel(
        accountType
      );

}


/* =====================================================
   NAVEGAÇÃO
   ===================================================== */

function showSection(
  sectionId
) {

  document
    .querySelectorAll(
      ".content-section"
    )
    .forEach(
      section => {

        section.classList.remove(
          "active-section"
        );

      }
    );


  const section =
    document.getElementById(
      sectionId
    );


  if (section) {

    section.classList.add(
      "active-section"
    );

  }


  document
    .querySelectorAll(
      ".menu-item"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.section ===
            sectionId
        );

      }
    );


  document
    .querySelector(
      ".sidebar"
    )
    ?.classList.remove(
      "mobile-open"
    );

}


/* =====================================================
   LOGIN / CADASTRO
   ===================================================== */

function showAuthentication() {

  authScreen
    .classList
    .remove("hidden");


  appScreen
    .classList
    .add("hidden");

}


function showApplication() {

  authScreen
    .classList
    .add("hidden");


  appScreen
    .classList
    .remove("hidden");

}


function showRegister() {

  loginForm
    .classList
    .add("hidden");


  registerForm
    .classList
    .remove("hidden");


  clearMessage(
    registerMessage
  );

}


function showLogin() {

  registerForm
    .classList
    .add("hidden");


  loginForm
    .classList
    .remove("hidden");


  clearMessage(
    loginMessage
  );

}


function handleAccountType() {

  const type =
    document
      .getElementById(
        "registerAccountType"
      )
      .value;


  const companyField =
    document.getElementById(
      "companyField"
    );


  if (
    type === "empresa" ||
    type === "ambos"
  ) {

    companyField
      .classList
      .remove("hidden");

  } else {

    companyField
      .classList
      .add("hidden");

  }

}


/* =====================================================
   LOGOUT
   ===================================================== */

async function logout() {

  await supabaseClient.auth
    .signOut();


  currentUser = null;

  currentProfile = null;

  transactions = [];


  showAuthentication();

  showLogin();

}


/* =====================================================
   DATA
   ===================================================== */

function getToday() {

  const date =
    new Date();


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


function setTodayDate() {

  const input =
    document.getElementById(
      "transactionDate"
    );


  if (input) {

    input.value =
      getToday();

  }

}


/* =====================================================
   FORMATAÇÃO
   ===================================================== */

function formatCurrency(
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


function formatDate(
  date
) {

  if (!date) {
    return "—";
  }


  return new Date(
    date +
    "T00:00:00"
  ).toLocaleDateString(
    "pt-BR"
  );

}


function getAccountTypeLabel(
  type
) {

  const labels = {

    pessoal:
      "Pessoal",

    empresa:
      "Empresa",

    ambos:
      "Pessoal + Empresa"

  };


  return (
    labels[type] ||
    "Pessoal"
  );

}


/* =====================================================
   MENSAGENS
   ===================================================== */

function showMessage(
  element,
  message
) {

  element.textContent =
    message;

}


function clearMessage(
  element
) {

  element.textContent =
    "";

}


function setButtonLoading(
  id,
  loading,
  text
) {

  const button =
    document.getElementById(
      id
    );


  if (!button) {
    return;
  }


  button.disabled =
    loading;


  button.textContent =
    text;

}


/* =====================================================
   ERROS
   ===================================================== */

function getAuthError(
  error
) {

  const message =
    error?.message ||
    "";


  const lower =
    message.toLowerCase();


  if (
    lower.includes(
      "invalid login credentials"
    )
  ) {

    return "E-mail ou senha incorretos.";

  }


  if (
    lower.includes(
      "user already registered"
    )
  ) {

    return "Este e-mail já está cadastrado.";

  }


  if (
    lower.includes(
      "password should be at least"
    )
  ) {

    return "A senha precisa ter pelo menos 6 caracteres.";

  }


  return (
    message ||
    "Ocorreu um erro. Tente novamente."
  );

}


/* =====================================================
   SEGURANÇA
   ===================================================== */

function escapeHtml(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   FIM
   ===================================================== */

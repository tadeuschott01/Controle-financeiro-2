// ============================================================
// CONTROLES - SCRIPT COMPLETO
// LOGIN + CADASTRO + TRANSAÇÕES + DASHBOARD + GRÁFICO
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

let supabaseClient = null;

let currentUser = null;
let transactions = [];
let financeChart = null;


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  console.log("ControleS iniciado.");

  // ----------------------------------------------------------
  // SUPABASE
  // ----------------------------------------------------------

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

  } else {

    console.error("Supabase não foi carregado.");

    alert(
      "Erro: o Supabase não foi carregado. Verifique a conexão com a internet."
    );

    return;
  }


  // ----------------------------------------------------------
  // CONFIGURAÇÕES INICIAIS
  // ----------------------------------------------------------

  setDefaultDates();

  setupAuth();

  setupNavigation();

  setupTransactionForms();

  checkSession();

});


// ============================================================
// ELEMENTOS
// ============================================================

function getElement(id) {

  return document.getElementById(id);

}


// ============================================================
// MENSAGEM DE LOGIN
// ============================================================

function showMessage(message, type = "error") {

  const element =
    getElement("authMessage");

  if (!element) {

    alert(message);

    return;
  }

  element.textContent = message;

  element.className =
    "auth-message " + type;

}


function clearMessage() {

  const element =
    getElement("authMessage");

  if (!element) return;

  element.textContent = "";

  element.className =
    "auth-message";

}


// ============================================================
// LOGIN / CADASTRO
// ============================================================

function setupAuth() {

  const loginTab =
    getElement("loginTab");

  const registerTab =
    getElement("registerTab");

  const loginForm =
    getElement("loginForm");

  const registerForm =
    getElement("registerForm");


  // ----------------------------------------------------------
  // ABA LOGIN
  // ----------------------------------------------------------

  if (loginTab) {

    loginTab.onclick = function () {

      clearMessage();

      loginTab.classList.add("active");

      if (registerTab) {

        registerTab.classList.remove("active");

      }

      if (loginForm) {

        loginForm.style.display = "block";

      }

      if (registerForm) {

        registerForm.style.display = "none";

      }

    };

  }


  // ----------------------------------------------------------
  // ABA CADASTRO
  // ----------------------------------------------------------

  if (registerTab) {

    registerTab.onclick = function () {

      clearMessage();

      registerTab.classList.add("active");

      if (loginTab) {

        loginTab.classList.remove("active");

      }

      if (loginForm) {

        loginForm.style.display = "none";

      }

      if (registerForm) {

        registerForm.style.display = "block";

      }

    };

  }


  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  if (loginForm) {

    loginForm.onsubmit = async function (event) {

      event.preventDefault();

      event.stopPropagation();

      clearMessage();


      const email =
        getElement("loginEmail")?.value.trim();

      const password =
        getElement("loginPassword")?.value;


      if (!email) {

        showMessage(
          "Digite seu e-mail."
        );

        return false;

      }


      if (!password) {

        showMessage(
          "Digite sua senha."
        );

        return false;

      }


      const button =
        getElement("loginButton");


      if (button) {

        button.disabled = true;

        button.textContent =
          "Entrando...";

      }


      try {

        console.log(
          "Tentando fazer login..."
        );


        const result =
          await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

          });


        console.log(
          "Resultado login:",
          result
        );


        if (result.error) {

          console.error(
            "Erro login:",
            result.error
          );


          const errorMessage =
            String(
              result.error.message || ""
            ).toLowerCase();


          if (
            errorMessage.includes(
              "email not confirmed"
            )
          ) {

            showMessage(
              "Seu e-mail ainda não foi confirmado."
            );

            return false;

          }


          if (
            errorMessage.includes(
              "invalid login credentials"
            )
          ) {

            showMessage(
              "E-mail ou senha incorretos."
            );

            return false;

          }


          showMessage(
            result.error.message ||
            "Não foi possível entrar."
          );

          return false;

        }


        if (
          result.data &&
          result.data.user
        ) {

          console.log(
            "Login realizado!"
          );


          showApp(
            result.data.user
          );

        }


      } catch (error) {

        console.error(
          "Erro no login:",
          error
        );


        showMessage(
          "Erro ao comunicar com o Supabase."
        );

      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "Entrar";

        }

      }


      return false;

    };

  }


  // ----------------------------------------------------------
  // CADASTRO
  // ----------------------------------------------------------

  if (registerForm) {

    registerForm.onsubmit = async function (event) {

      event.preventDefault();

      event.stopPropagation();

      clearMessage();


      const name =
        getElement("registerName")?.value.trim();

      const email =
        getElement("registerEmail")?.value.trim();

      const password =
        getElement("registerPassword")?.value;


      if (!name) {

        showMessage(
          "Digite seu nome."
        );

        return false;

      }


      if (!email) {

        showMessage(
          "Digite seu e-mail."
        );

        return false;

      }


      if (
        !password ||
        password.length < 6
      ) {

        showMessage(
          "A senha precisa ter pelo menos 6 caracteres."
        );

        return false;

      }


      const button =
        getElement("registerButton");


      if (button) {

        button.disabled = true;

        button.textContent =
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


        console.log(
          "Resultado cadastro:",
          result
        );


        if (result.error) {

          showMessage(
            result.error.message ||
            "Não foi possível criar a conta."
          );

          return false;

        }


        // Caso o Supabase já crie sessão

        if (
          result.data &&
          result.data.session &&
          result.data.user
        ) {

          showApp(
            result.data.user
          );

          return false;

        }


        showMessage(
          "Conta criada! Confira seu e-mail para confirmar o cadastro.",
          "success"
        );


        registerForm.reset();


        // Volta para login

        setTimeout(function () {

          if (loginTab) {

            loginTab.click();

          }

        }, 1500);


      } catch (error) {

        console.error(
          "Erro cadastro:",
          error
        );


        showMessage(
          "Erro ao comunicar com o Supabase."
        );

      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "Criar conta";

        }

      }


      return false;

    };

  }


  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const logoutButton =
    getElement("logoutButton");

  const mobileLogout =
    getElement("mobileLogout");


  if (logoutButton) {

    logoutButton.onclick = logout;

  }


  if (mobileLogout) {

    mobileLogout.onclick = logout;

  }

}


// ============================================================
// VERIFICAR SESSÃO
// ============================================================

async function checkSession() {

  if (!supabaseClient) return;


  try {

    const result =
      await supabaseClient.auth.getSession();


    console.log(
      "Sessão:",
      result
    );


    if (
      result.data &&
      result.data.session &&
      result.data.session.user
    ) {

      showApp(
        result.data.session.user
      );

    } else {

      showAuth();

    }

  } catch (error) {

    console.error(
      "Erro verificando sessão:",
      error
    );

    showAuth();

  }

}


// ============================================================
// MOSTRAR APP
// ============================================================

function showApp(user) {

  currentUser = user;


  const authScreen =
    getElement("authScreen");

  const appScreen =
    getElement("appScreen");


  if (authScreen) {

    authScreen.style.display =
      "none";

  }


  if (appScreen) {

    appScreen.style.display =
      "block";

  }


  const userName =
    getElement("userName");


  if (userName) {

    const name =
      user?.user_metadata?.name ||
      user?.user_metadata?.nome ||
      user?.email ||
      "Usuário";


    userName.textContent =
      "Olá, " + name;

  }


  loadTransactions();

}


// ============================================================
// MOSTRAR LOGIN
// ============================================================

function showAuth() {

  currentUser = null;

  const authScreen =
    getElement("authScreen");

  const appScreen =
    getElement("appScreen");


  if (appScreen) {

    appScreen.style.display =
      "none";

  }


  if (authScreen) {

    authScreen.style.display =
      "flex";

  }

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {

    if (supabaseClient) {

      await supabaseClient.auth.signOut();

    }

  } catch (error) {

    console.error(
      "Erro ao sair:",
      error
    );

  }


  transactions = [];

  showAuth();

}


// ============================================================
// NAVEGAÇÃO
// ============================================================

function setupNavigation() {

  const menuMap = {

    dashboardMenu: {
      section: "dashboardSection",
      title: "Dashboard"
    },

    incomeMenu: {
      section: "incomeSection",
      title: "Entradas"
    },

    expenseMenu: {
      section: "expenseSection",
      title: "Despesas"
    },

    transactionsMenu: {
      section: "transactionsSection",
      title: "Transações"
    }

  };


  Object.keys(menuMap).forEach(function (menuId) {

    const button =
      getElement(menuId);


    if (!button) return;


    button.onclick = function () {

      Object.keys(menuMap).forEach(function (id) {

        const btn =
          getElement(id);

        if (btn) {

          btn.classList.remove(
            "active"
          );

        }

      });


      document
        .querySelectorAll(".section")
        .forEach(function (section) {

          section.classList.remove(
            "active"
          );

        });


      const section =
        getElement(
          menuMap[menuId].section
        );


      if (section) {

        section.classList.add(
          "active"
        );

      }


      button.classList.add(
        "active"
      );


      const pageTitle =
        getElement("pageTitle");


      if (pageTitle) {

        pageTitle.textContent =
          menuMap[menuId].title;

      }

    };

  });

}


// ============================================================
// FORMULÁRIOS DE TRANSAÇÕES
// ============================================================

function setupTransactionForms() {

  const incomeForm =
    getElement("incomeForm");

  const expenseForm =
    getElement("expenseForm");


  // ----------------------------------------------------------
  // ENTRADA
  // ----------------------------------------------------------

  if (incomeForm) {

    incomeForm.onsubmit = function (event) {

      event.preventDefault();

      event.stopPropagation();


      if (!currentUser) {

        alert(
          "Você precisa estar logado."
        );

        return false;

      }


      const description =
        getElement(
          "incomeDescription"
        )?.value.trim();


      const amount =
        Number(
          getElement(
            "incomeAmount"
          )?.value
        );


      const category =
        getElement(
          "incomeCategory"
        )?.value || "Outros";


      const date =
        getElement(
          "incomeDate"
        )?.value || today();


      if (!description) {

        alert(
          "Digite uma descrição."
        );

        return false;

      }


      if (
        !amount ||
        amount <= 0
      ) {

        alert(
          "Digite um valor válido."
        );

        return false;

      }


      const transaction = {

        id:
          Date.now().toString(),

        description:
          description,

        amount:
          amount,

        category:
          category,

        date:
          date,

        type:
          "income"

      };


      transactions.push(
        transaction
      );


      saveTransactions();


      incomeForm.reset();

      setDefaultDates();

      updateDashboard();


      alert(
        "Entrada adicionada com sucesso!"
      );


      return false;

    };

  }


  // ----------------------------------------------------------
  // DESPESA
  // ----------------------------------------------------------

  if (expenseForm) {

    expenseForm.onsubmit = function (event) {

      event.preventDefault();

      event.stopPropagation();


      if (!currentUser) {

        alert(
          "Você precisa estar logado."
        );

        return false;

      }


      const description =
        getElement(
          "expenseDescription"
        )?.value.trim();


      const amount =
        Number(
          getElement(
            "expenseAmount"
          )?.value
        );


      const category =
        getElement(
          "expenseCategory"
        )?.value || "Outros";


      const date =
        getElement(
          "expenseDate"
        )?.value || today();


      if (!description) {

        alert(
          "Digite uma descrição."
        );

        return false;

      }


      if (
        !amount ||
        amount <= 0
      ) {

        alert(
          "Digite um valor válido."
        );

        return false;

      }


      const transaction = {

        id:
          Date.now().toString(),

        description:
          description,

        amount:
          amount,

        category:
          category,

        date:
          date,

        type:
          "expense"

      };


      transactions.push(
        transaction
      );


      saveTransactions();


      expenseForm.reset();

      setDefaultDates();

      updateDashboard();


      alert(
        "Despesa adicionada com sucesso!"
      );


      return false;

    };

  }

}


// ============================================================
// LOCAL STORAGE
// ============================================================

function getStorageKey() {

  if (!currentUser) return null;

  return (
    "controles_transactions_" +
    currentUser.id
  );

}


function loadTransactions() {

  if (!currentUser) {

    transactions = [];

    return;

  }


  const key =
    getStorageKey();


  try {

    const saved =
      localStorage.getItem(key);


    if (saved) {

      transactions =
        JSON.parse(saved);


      if (!Array.isArray(transactions)) {

        transactions = [];

      }

    } else {

      transactions = [];

    }

  } catch (error) {

    console.error(
      "Erro carregando transações:",
      error
    );

    transactions = [];

  }


  updateDashboard();

}


function saveTransactions() {

  if (!currentUser) {

    console.error(
      "Usuário não está logado."
    );

    return;

  }


  const key =
    getStorageKey();


  try {

    localStorage.setItem(
      key,
      JSON.stringify(
        transactions
      )
    );


    console.log(
      "Transações salvas."
    );

  } catch (error) {

    console.error(
      "Erro salvando transações:",
      error
    );

  }

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
        Number(
          transaction.amount || 0
        );


      if (
        transaction.type ===
        "income"
      ) {

        income += value;

      }


      if (
        transaction.type ===
        "expense"
      ) {

        expense += value;

      }

    }
  );


  const balance =
    income - expense;


  const balanceValue =
    getElement(
      "balanceValue"
    );


  const incomeValue =
    getElement(
      "incomeValue"
    );


  const expenseValue =
    getElement(
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
    getElement(
      "transactionsTableBody"
    );


  if (!tbody) return;


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
          String(
            a.date || ""
          )
        );

      }
    );


  tbody.innerHTML =
    sorted.map(
      function (transaction) {

        const isIncome =
          transaction.type ===
          "income";


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
    getElement(
      "recentTransactions"
    );


  if (!container) return;


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
            String(
              a.date || ""
            )
          );

        }
      )
      .slice(0, 5);


  container.innerHTML =
    recent.map(
      function (transaction) {

        const isIncome =
          transaction.type ===
          "income";


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
    getElement(
      "financeChart"
    );


  if (!canvas) return;


  if (
    typeof Chart ===
    "undefined"
  ) {

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

        type:
          "doughnut",

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


// ============================================================
// DATAS
// ============================================================

function today() {

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
    getElement(
      "incomeDate"
    );


  const expenseDate =
    getElement(
      "expenseDate"
    );


  if (incomeDate) {

    incomeDate.value =
      today();

  }


  if (expenseDate) {

    expenseDate.value =
      today();

  }

}


// ============================================================
// FORMATAÇÃO
// ============================================================

function formatDate(value) {

  if (!value) {

    return "-";

  }


  const parts =
    String(value).split("-");


  if (
    parts.length !== 3
  ) {

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


function formatMoney(value) {

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


// ============================================================
// SEGURANÇA
// ============================================================

function escapeHTML(value) {

  return String(
    value ?? ""
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


// ============================================================
// MONITORAR SUPABASE
// ============================================================

function setupAuthListener() {

  if (!supabaseClient) return;


  supabaseClient.auth.onAuthStateChange(
    function (event, session) {

      console.log(
        "Supabase Auth:",
        event
      );


      if (
        event ===
        "SIGNED_OUT"
      ) {

        showAuth();

      }

    }
  );

}


// Executa depois que tudo foi carregado

setTimeout(
  setupAuthListener,
  500
);

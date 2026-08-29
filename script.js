// ============================================================
// CONTROLES - SCRIPT COMPLETO
// Supabase + Login + Cadastro + Sessão + Finanças
// ============================================================


// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_ANON_KEY =
  "COLE_AQUI_SUA_CHAVE_ANON_DO_SUPABASE";


// Inicialização
const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ============================================================
// ELEMENTOS
// ============================================================

const authScreen =
  document.getElementById("authScreen");

const appScreen =
  document.getElementById("appScreen");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const authMessage =
  document.getElementById("authMessage");

const userName =
  document.getElementById("userName");

const logoutButton =
  document.getElementById("logoutButton");


// ============================================================
// VARIÁVEIS
// ============================================================

let currentUser = null;
let transactions = [];
let financeChart = null;


// ============================================================
// MENSAGENS
// ============================================================

function showMessage(message, type = "error") {

  if (!authMessage) return;

  authMessage.textContent = message;

  authMessage.className =
    "auth-message " + type;

}


function clearMessage() {

  if (!authMessage) return;

  authMessage.textContent = "";

  authMessage.className =
    "auth-message";

}


// ============================================================
// FORMATAÇÃO DE DINHEIRO
// ============================================================

function formatMoney(value) {

  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
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
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// ============================================================
// MOSTRAR APP
// ============================================================

function showApp(user) {

  currentUser = user;

  if (authScreen) {

    authScreen.style.display =
      "none";

  }

  if (appScreen) {

    appScreen.style.display =
      "block";

  }

  if (userName) {

    const email =
      user?.email || "";

    userName.textContent =
      "Olá, " + email;

  }

  loadTransactions();

}


// ============================================================
// MOSTRAR LOGIN
// ============================================================

function showAuth() {

  currentUser = null;

  if (authScreen) {

    authScreen.style.display =
      "flex";

  }

  if (appScreen) {

    appScreen.style.display =
      "none";

  }

}


// ============================================================
// VERIFICAR SESSÃO
// ============================================================

async function checkSession() {

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Erro ao verificar sessão:",
        error
      );

      showAuth();

      return;

    }


    const session =
      data?.session;


    if (session?.user) {

      showApp(session.user);

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
// LOGIN
// ============================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      clearMessage();


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

        showMessage(
          "Preencha o e-mail e a senha."
        );

        return;

      }


      const button =
        document.getElementById(
          "loginButton"
        );


      if (button) {

        button.disabled = true;

        button.textContent =
          "Entrando...";

      }


      try {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({

              email: email,

              password: password

            });


        if (error) {

          console.error(
            "Erro no login:",
            error
          );

          showMessage(
            traduzirErroSupabase(
              error.message
            )
          );

          return;

        }


        if (!data?.user) {

          showMessage(
            "Não foi possível entrar na conta."
          );

          return;

        }


        showApp(data.user);


      } catch (error) {

        console.error(
          "Erro inesperado no login:",
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

    }
  );

}


// ============================================================
// CADASTRO
// ============================================================

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      clearMessage();


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


      if (!name) {

        showMessage(
          "Digite seu nome."
        );

        return;

      }


      if (!email) {

        showMessage(
          "Digite seu e-mail."
        );

        return;

      }


      if (!password || password.length < 6) {

        showMessage(
          "A senha precisa ter pelo menos 6 caracteres."
        );

        return;

      }


      const button =
        document.getElementById(
          "registerButton"
        );


      if (button) {

        button.disabled = true;

        button.textContent =
          "Criando conta...";

      }


      try {

        /*
          IMPORTANTE:

          Aqui usamos somente o Auth do Supabase.

          Não fazemos INSERT em profiles.

          Isso evita o erro anterior:
          "Database error saving new user."
        */

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signUp({

              email: email,

              password: password,

              options: {

                data: {

                  name: name

                }

              }

            });


        if (error) {

          console.error(
            "Erro no cadastro:",
            error
          );

          showMessage(
            traduzirErroSupabase(
              error.message
            )
          );

          return;

        }


        /*
          Dependendo da configuração
          de confirmação de e-mail
          do Supabase, o usuário pode
          precisar confirmar o e-mail.
        */

        if (data?.session) {

          showApp(data.user);

          return;

        }


        showMessage(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
          "success"
        );


        registerForm.reset();


      } catch (error) {

        console.error(
          "Erro inesperado no cadastro:",
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

    }
  );

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Erro ao sair:",
        error
      );

      return;

    }


    transactions = [];

    showAuth();


  } catch (error) {

    console.error(
      "Erro no logout:",
      error
    );

  }

}


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    logout
  );

}


const mobileLogout =
  document.getElementById(
    "mobileLogout"
  );


if (mobileLogout) {

  mobileLogout.addEventListener(
    "click",
    logout
  );

}


// ============================================================
// OBSERVAR MUDANÇAS DE AUTENTICAÇÃO
// ============================================================

supabaseClient.auth.onAuthStateChange(
  function (event, session) {

    console.log(
      "Auth:",
      event
    );


    if (
      session?.user &&
      event !== "SIGNED_OUT"
    ) {

      currentUser =
        session.user;

    }


    if (event === "SIGNED_OUT") {

      showAuth();

    }

  }
);


// ============================================================
// TRANSAÇÕES
// ============================================================

async function loadTransactions() {

  /*
    Por enquanto usamos localStorage
    para as transações.

    Assim conseguimos testar todo o
    sistema financeiro sem depender
    da tabela do banco.
  */

  if (!currentUser) return;


  const key =
    "controles_transactions_" +
    currentUser.id;


  try {

    const saved =
      localStorage.getItem(key);


    if (saved) {

      transactions =
        JSON.parse(saved);

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

  if (!currentUser) return;


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
// ADICIONAR ENTRADA
// ============================================================

const incomeForm =
  document.getElementById(
    "incomeForm"
  );


if (incomeForm) {

  incomeForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const description =
        document
          .getElementById(
            "incomeDescription"
          )
          ?.value
          .trim();


      const amount =
        Number(
          document
            .getElementById(
              "incomeAmount"
            )
            ?.value
        );


      const category =
        document
          .getElementById(
            "incomeCategory"
          )
          ?.value;


      const date =
        document
          .getElementById(
            "incomeDate"
          )
          ?.value || today();


      if (!description) {

        alert(
          "Digite uma descrição."
        );

        return;

      }


      if (!amount || amount <= 0) {

        alert(
          "Digite um valor válido."
        );

        return;

      }


      transactions.push({

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
// ADICIONAR DESPESA
// ============================================================

const expenseForm =
  document.getElementById(
    "expenseForm"
  );


if (expenseForm) {

  expenseForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const description =
        document
          .getElementById(
            "expenseDescription"
          )
          ?.value
          .trim();


      const amount =
        Number(
          document
            .getElementById(
              "expenseAmount"
            )
            ?.value
        );


      const category =
        document
          .getElementById(
            "expenseCategory"
          )
          ?.value;


      const date =
        document
          .getElementById(
            "expenseDate"
          )
          ?.value || today();


      if (!description) {

        alert(
          "Digite uma descrição."
        );

        return;

      }


      if (!amount || amount <= 0) {

        alert(
          "Digite um valor válido."
        );

        return;

      }


      transactions.push({

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

      const amount =
        Number

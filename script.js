// ============================================================
// CONTROLES - SCRIPT.JS COMPLETO
// Login + Cadastro + Sessão + Finanças + Dashboard
// ============================================================


// ============================================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


// Verifica se o Supabase carregou
if (!window.supabase) {
  console.error("Supabase não foi carregado.");
  alert(
    "Erro: o Supabase não foi carregado. Verifique sua conexão com a internet."
  );
}


// Cria conexão
const supabaseClient =
  window.supabase
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      )
    : null;


// ============================================================
// 2. VARIÁVEIS
// ============================================================

let currentUser = null;
let transactions = [];
let financeChart = null;


// ============================================================
// 3. ELEMENTOS DO HTML
// ============================================================

const authScreen =
  document.getElementById("authScreen");

const appScreen =
  document.getElementById("appScreen");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const loginTab =
  document.getElementById("loginTab");

const registerTab =
  document.getElementById("registerTab");

const authMessage =
  document.getElementById("authMessage");

const loginButton =
  document.getElementById("loginButton");

const registerButton =
  document.getElementById("registerButton");

const logoutButton =
  document.getElementById("logoutButton");

const mobileLogout =
  document.getElementById("mobileLogout");


// ============================================================
// 4. MENSAGENS
// ============================================================

function showMessage(message, type = "error") {

  if (!authMessage) {
    alert(message);
    return;
  }

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
// 5. ABAS LOGIN / CADASTRO
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

  clearMessage();
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

  clearMessage();
}


if (loginTab) {

  loginTab.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      showLoginForm();
    }
  );
}


if (registerTab) {

  registerTab.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      showRegisterForm();
    }
  );
}


// ============================================================
// 6. MOSTRAR APLICAÇÃO
// ============================================================

function showApp(user) {

  try {

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

      userName.textContent =
        "Olá, " + name;
    }


    loadTransactions();

  } catch (error) {

    console.error(
      "Erro ao abrir aplicação:",
      error
    );

    showAuth();

    showMessage(
      "O login foi realizado, mas ocorreu um erro ao abrir o sistema."
    );
  }
}


// ============================================================
// 7. MOSTRAR TELA DE LOGIN
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
// 8. VERIFICAR SESSÃO
// ============================================================

async function checkSession() {

  if (!supabaseClient) {
    showAuth();
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


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

      showApp(
        data.session.user
      );

    } else {

      showAuth();
    }

  } catch (error) {

    console.error(
      "Erro inesperado na sessão:",
      error
    );

    showAuth();
  }
}


// ============================================================
// 9. LOGIN
// ============================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();
      event.stopPropagation();

      clearMessage();


      const emailInput =
        document.getElementById(
          "loginEmail"
        );

      const passwordInput =
        document.getElementById(
          "login

// ============================================================
// CONTROLES - SCRIPT PRINCIPAL
// Login / Cadastro / Entradas / Despesas / Transações
// Saldo / Gráfico / LocalStorage
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

document.addEventListener("DOMContentLoaded", async function () {

  console.log("ControleS: JavaScript carregado.");

  // Supabase
  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log("ControleS: Supabase carregado.");

  } else {

    console.error("Supabase não carregado.");

    showMessage(
      "Não foi possível carregar o sistema de login."
    );

    return;
  }


  // Configurações
  configurarAbas();
  configurarLogin();
  configurarCadastro();
  configurarLogout();
  configurarNavegacao();
  configurarFormularios();

  setDefaultDates();

  // Verificar usuário
  await verificarSessao();

});


// ============================================================
// FUNÇÃO AUXILIAR
// ============================================================

function el(id) {
  return document.getElementById(id);
}


// ============================================================
// MENSAGENS
// ============================================================

function showMessage(message, type = "error") {

  const box = el("authMessage");

  if (!box) {

    alert(message);

    return;
  }

  box.textContent = message;

  box.className =
    "auth-message " + type;

}


function clearMessage() {

  const box = el("authMessage");

  if (!box) return;

  box.textContent = "";

  box.className = "auth-message";

}


// ============================================================
// ABAS LOGIN / CADASTRO
// ============================================================

function configurarAbas() {

  const loginTab = el("loginTab");
  const registerTab = el("registerTab");

  const loginForm = el("loginForm");
  const registerForm = el("registerForm");


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

}


// ============================================================
// LOGIN
// ============================================================

function configurarLogin() {

  const form = el("loginForm");

  if (!form) return;


  form.onsubmit = async function (event) {

    event.preventDefault();
    event.stopPropagation();

    clearMessage();


    const emailInput = el("loginEmail");
    const passwordInput = el("loginPassword");
    const button = el("loginButton");


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

      return false;
    }


    if (!password) {

      showMessage("Digite sua senha.");

      return false;
    }


    if (button) {

      button.disabled = true;
      button.textContent = "Entrando...";

    }


    try {

      console.log("ControleS: tentando login.");


      const result =
        await supabaseClient.auth.signInWithPassword({

          email: email,

          password: password

        });


      console.log(
        "ControleS: resposta login:",
        result
      );


      if (result.error) {

        const message =
          String(
            result.error.message || ""

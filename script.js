// ============================================================
// CONTROLES - SCRIPT COMPLETO
// Supabase + Login + Cadastro + Finanças
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

const APP_URL =
  "https://tadeuschott01.github.io/Controle-financeiro-2/";


// ============================================================
// CARREGAR SUPABASE JS
// ============================================================

function carregarSupabase() {
  return new Promise((resolve, reject) => {

    if (window.supabase) {
      resolve(window.supabase);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = () => {

      if (!window.supabase) {
        reject(
          new Error(
            "Biblioteca do Supabase não carregou."
          )
        );

        return;
      }

      resolve(window.supabase);
    };

    script.onerror = () => {

      reject(
        new Error(
          "Não foi possível carregar a biblioteca do Supabase."
        )
      );
    };

    document.head.appendChild(script);
  });
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

let supabaseClient = null;
let usuarioAtual = null;
let idEditando = null;


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

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginButton =
  document.getElementById("loginButton");

const loginMessage =
  document.getElementById("loginMessage");

const registerName =
  document.getElementById("registerName");

const registerEmail =
  document.getElementById("registerEmail");

const registerPassword =
  document.getElementById("registerPassword");

const registerAccountType =
  document.getElementById("registerAccountType");

const registerCompany =
  document.getElementById("registerCompany");

const registerButton =
  document.getElementById("registerButton");

const registerMessage =
  document.getElementById("registerMessage");

const companyField =
  document.getElementById("companyField");

const showRegisterButton =
  document.getElementById("showRegisterButton");

const showLoginButton =
  document.getElementById("showLoginButton");

const logoutButton =
  document.getElementById("logoutButton");


// ============================================================
// MENSAGENS
// ============================================================

function mostrarMensagem(
  elemento,
  mensagem,
  sucesso = false
) {

  if (!elemento) return;

  elemento.textContent =
    mensagem;

  elemento.style.color =
    sucesso
      ? "#1f513d"
      : "#d94b4b";
}


// ============================================================
// FORMATAÇÃO DE DINHEIRO
// ============================================================

function dinheiro(valor) {

  return Number(valor || 0)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
}


// ============================================================
// FORMATAÇÃO DE DATA
// ============================================================

function formatarData(data) {

  if (!data) return "";

  const partes =
    String(data).split("-");

  if (partes.length !== 3) {
    return data;
  }

  return (
    partes[2] +
    "/" +
    partes[1] +
    "/" +
    partes[0]
  );
}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(texto) {

  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// CATEGORIAS
// ============================================================

const categorias = {

  salario: "Salário",

  alimentacao: "Alimentação",

  moradia: "Moradia",

  transporte: "Transporte",

  saude: "Saúde",

  educacao: "Educação",

  lazer: "Lazer",

  contas: "Contas",

  compras: "Compras",

  empresa: "Empresa",

  outros: "Outros"
};


function nomeCategoria(categoria) {

  return (
    categorias[categoria] ||
    categoria ||
    "Outros"
  );
}


// ============================================================
// MOSTRAR / ESCONDER LOGIN
// ============================================================

function mostrarLogin() {

  authScreen?.classList.remove(
    "hidden"
  );

  appScreen?.classList.add(
    "hidden"
  );

  registerForm?.classList.add(
    "hidden"
  );

  loginForm?.classList.remove(
    "hidden"
  );
}


function mostrarAplicacao() {

  authScreen?.classList.add(
    "hidden"
  );

  appScreen?.classList.remove(
    "hidden"
  );
}


// ============================================================
// TROCAR LOGIN / CADASTRO
// ============================================================

showRegisterButton?.addEventListener(
  "click",
  function () {

    loginForm?.classList.add(
      "hidden"
    );

    registerForm?.classList.remove(
      "hidden"
    );

    mostrarMensagem(
      registerMessage,
      ""
    );
  }
);


showLoginButton?.addEventListener(
  "click",
  function () {

    registerForm?.classList.add(
      "hidden"
    );

    loginForm?.classList.remove(
      "hidden"
    );

    mostrarMensagem(
      loginMessage,
      ""
    );
  }
);


// ============================================================
// CAMPO EMPRESA
// ============================================================

registerAccountType?.addEventListener(
  "change",
  function () {

    if (!companyField) {
      return;
    }

    if (
      registerAccountType.value ===
      "empresa" ||
      registerAccountType.value ===
      "ambos"
    ) {

      companyField.classList.remove(
        "hidden"
      );

    } else {

      companyField.classList.add(
        "hidden"
      );
    }
  }
);


// ============================================================
// CRIAR / ATUALIZAR PERFIL
// ============================================================

async function salvarPerfil(usuario) {

  const dados = {

    id: usuario.id,

    email:
      usuario.email || "",

    nome:
      usuario.nome || "",

    tipo:
      usuario.tipo || "pessoal",

    empresa:
      usuario.empresa || ""
  };


  const {
    error
  } =
    await supabaseClient
      .from("profiles")
      .upsert(
        dados,
        {
          onConflict: "id"
        }
      );


  if (error) {

    console.error(
      "Erro ao salvar perfil:",
      error
    );

    throw error;
  }
}


// ============================================================
// PEGAR PERFIL
// ============================================================

async function pegarPerfil(user) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();


  if (error) {

    console.error(
      "Erro ao buscar perfil:",
      error
    );

    throw error;
  }


  if (data) {

    return {

      id:
        user.id,

      email:
        user.email,

      nome:
        data.nome ||
        user.user_metadata?.nome ||
        "Usuário",

      tipo:
        data.tipo ||
        user.user_metadata?.tipo ||
        "pessoal",

      empresa:
        data.empresa ||
        user.user_metadata?.empresa ||
        ""
    };
  }


  const novoPerfil = {

    id:
      user.id,

    email:
      user.email,

    nome:
      user.user_metadata?.nome ||
      "Usuário",

    tipo:
      user.user_metadata?.tipo ||
      "pessoal",

    empresa:
      user.user_metadata?.empresa ||
      ""
  };


  await salvarPerfil(
    novoPerfil
  );


  return novoPerfil;
}


// ============================================================
// CADASTRO
// ============================================================

registerButton?.addEventListener(
  "click",
  async function () {

    const nome =
      registerName?.value.trim();

    const email =
      registerEmail?.value.trim();

    const senha =
      registerPassword?.value;

    const tipo =
      registerAccountType?.value ||
      "pessoal";

    const empresa =
      registerCompany?.value.trim() ||
      "";


    if (!nome) {

      mostrarMensagem(
        registerMessage,
        "Digite seu nome."
      );

      return;
    }


    if (
      !email ||
      !email.includes("@")
    ) {

      mostrarMensagem(
        registerMessage,
        "Digite um e-mail válido."
      );

      return;
    }


    if (
      !senha ||
      senha.length < 6
    ) {

      mostrarMensagem(
        registerMessage,
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }


    registerButton.disabled =
      true;

    registerButton.textContent =
      "Criando...";


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.signUp({

          email:
            email,

          password:
            senha,

          options: {

            emailRedirectTo:
              APP_URL,

            data: {

              nome:
                nome,

              tipo:
                tipo,

              empresa:
                empresa
            }
          }
        });


      if (error) {
        throw error;
      }


      // --------------------------------------------------------
      // CONTA JÁ LOGADA
      // --------------------------------------------------------

      if (
        data.session &&
        data.user
      ) {

        usuarioAtual = {

          id:
            data.user.id,

          email:
            data.user.email,

          nome:
            nome,

          tipo:
            tipo,

          empresa:
            empresa
        };


       

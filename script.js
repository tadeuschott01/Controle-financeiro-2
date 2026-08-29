// ============================================================
// CONTROLES - SCRIPT COMPLETO ATUALIZADO
// Supabase + Login + Cadastro + Confirmação de E-mail + Finanças
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


// IMPORTANTE:
// URL para onde o Supabase deve mandar o usuário
// depois da confirmação do e-mail.
const REDIRECT_URL =
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

    const script =
      document.createElement("script");

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
// VARIÁVEIS
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
// DINHEIRO
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
// DATA
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
// LOGIN / APP
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
      registerAccountType.value === "empresa" ||
      registerAccountType.value === "ambos"
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
// SALVAR PERFIL
// ============================================================

async function salvarPerfil(usuario) {

  if (!usuario || !usuario.id) {

    throw new Error(
      "Usuário inválido para salvar o perfil."
    );
  }

  const dados = {

    id:
      usuario.id,

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

  if (!user) {

    throw new Error(
      "Usuário não encontrado."
    );
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
        user.id
      )
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
        user.email || "",

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
      user.email || "",

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

      console.log(
        "Criando usuário no Supabase..."
      );


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
              REDIRECT_URL,

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


      console.log(
        "Resultado cadastro:",
        data,
        error
      );


      if (error) {

        throw error;
      }


      if (!data || !data.user) {

        throw new Error(
          "O Supabase não retornou o usuário criado."
        );
      }


      // ======================================================
      // CASO O SUPABASE JÁ TENHA CRIADO UMA SESSÃO
      // ======================================================

      if (data.session) {

        usuarioAtual = {

          id:
            data.user.id,

          email:
            data.user.email || email,

          nome:
            nome,

          tipo:
            tipo,

          empresa:
            empresa
        };


        try {

          await salvarPerfil(
            usuarioAtual
          );

        } catch (perfilErro) {

          console.error(
            "Erro ao criar perfil:",
            perfilErro
          );
        }


        mostrarMensagem(
          registerMessage,
          "Conta criada com sucesso!",
          true
        );


        mostrarAplicacao();

        atualizarPerfilTela();

        await atualizarTudo();

        return;
      }


      // ======================================================
      // CONFIRMAÇÃO DE E-MAIL
      // ======================================================

      mostrarMensagem(
        registerMessage,
        "Conta criada! Verifique seu e-mail e clique no link de confirmação.",
        true
      );


      if (loginEmail) {

        loginEmail.value =
          email;
      }


      if (loginPassword) {

        loginPassword.value =
          "";
      }


      setTimeout(
        function () {

          registerForm?.classList.add(
            "hidden"
          );

          loginForm?.classList.remove(
            "hidden"
          );

        },
        2000
      );


    } catch (erro) {

      console.error(
        "ERRO AO CRIAR CONTA:",
        erro
      );


      let mensagem =
        erro?.message ||
        "Não foi possível criar a conta.";


      if (
        mensagem.toLowerCase().includes(
          "already registered"
        )
      ) {

        mensagem =
          "Este e-mail já possui uma conta.";
      }


      mostrarMensagem(
        registerMessage,
        mensagem
      );


    } finally {

      registerButton.disabled =
        false;

      registerButton.textContent =
        "Criar minha conta";
    }
  }
);


// ============================================================
// LOGIN
// ============================================================

loginButton?.addEventListener(
  "click",
  async function () {

    const email =
      loginEmail?.value.trim();

    const senha =
      loginPassword?.value;


    if (!email || !senha) {

      mostrarMensagem(
        loginMessage,
        "Digite seu e-mail e sua senha."
      );

      return;
    }


    loginButton.disabled =
      true;

    loginButton.textContent =
      "Entrando...";


    mostrarMensagem(
      loginMessage,
      ""
    );


    try {

      console.log(
        "Iniciando login..."
      );


      const {
        data,
        error
      } =
        await supabaseClient.auth.signInWithPassword({

          email:
            email,

          password:
            senha
        });


      if (error) {

        console.error(
          "Erro login:",
          error
        );

        throw error;
      }


      if (
        !data ||
        !data.user
      ) {

        throw new Error(
          "O Supabase não retornou o usuário."
        );
      }


      usuarioAtual =
        await pegarPerfil(
          data.user
        );


      mostrarAplicacao();

      atualizarPerfilTela();

      await atualizarTudo();


    } catch (erro) {

      console.error(
        "ERRO COMPLETO NO LOGIN:",
        erro
      );


      let mensagem =
        erro?.message ||
        "Não foi possível fazer login.";


      if (
        mensagem.toLowerCase().includes(
          "email not confirmed"
        )
      ) {

        mensagem =
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
      }


      if (
        mensagem.toLowerCase().includes(
          "invalid login credentials"
        )
      ) {

        mensagem =
          "E-mail ou senha incorretos.";
      }


      mostrarMensagem(
        loginMessage,
        mensagem
      );


    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        "Entrar";
    }
  }
);


// ============================================================
// ENTER LOGIN
// ============================================================

loginPassword?.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Enter"
    ) {

      loginButton?.click();
    }
  }
);


// ============================================================
// ATUALIZAR PERFIL NA TELA
// ============================================================

function atualizarPerfilTela() {

  if (!usuarioAtual) {
    return;
  }


  const userName =
    document.getElementById(
      "userName"
    );


  const profileName =
    document.getElementById(
      "profileName"
    );


  const profileEmail =
    document.getElementById(
      "profileEmail"
    );


  const profileAccountType =
    document.getElementById(
      "profileAccountType"
    );


  const profileCompany =
    document.getElementById(
      "profileCompany"
    );


  if (userName) {

    userName.textContent =
      usuarioAtual.nome ||
      "Usuário";
  }


  if (profileName) {

    profileName.textContent =
      usuarioAtual.nome ||
      "Usuário";
  }


  if (profileEmail) {

    profileEmail.textContent =
      usuarioAtual.email ||
      "—";
  }


  if (profileAccountType) {

    const tipos = {

      pessoal:
        "Pessoal",

      empresa:
        "Empresa",

      ambos:
        "Pessoal + Empresa"
    };


    profileAccountType.textContent =
      tipos[
        usuarioAtual.tipo
      ] ||
      "Pessoal";
  }


  if (profileCompany) {

    profileCompany.textContent =
      usuarioAtual.empresa ||
      "—";
  }
}


// ============================================================
// LOGOUT
// ============================================================

logoutButton?.addEventListener(
  "click",
  async function () {

    try {

      await supabaseClient.auth.signOut();

    } catch (erro) {

      console.error(
        "Erro ao sair:",
        erro
      );
    }


    usuarioAtual =
      null;


    mostrarLogin();
  }
);


// ============================================================
// LANÇAMENTOS
// ============================================================

async function pegarLancamentos() {

  if (!usuarioAtual) {

    return [];
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
        usuarioAtual.id
      )
      .order(
        "data",
        {
          ascending: false
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Erro ao buscar lançamentos:",
      error
    );

    throw error;
  }


  return (
    data || []
  ).map(
    function (item) {

      return {

        id:
          item.id,

        tipo:
          item.tipo,

        descricao:
          item.descricao,

        valor:
          Number(item.valor) || 0,

        categoria:
          item.categoria,

        dataISO:
          item.data,

        data:
          formatarData(
            item.data
          ),

        criadoEm:
          item.created_at
      };
    }
  );
}


// ============================================================
// SALVAR LANÇAMENTO
// ============================================================

async function salvarLancamento(
  dados
) {

  if (!usuarioAtual) {

    throw new Error(
      "Usuário não autenticado."
    );
  }


  const {
    error
  } =
    await supabaseClient
      .from("transactions")
      .insert({

        user_id:
          usuarioAtual.id,

        tipo:
          dados.tipo,

        descricao:
          dados.descricao,

        valor:
          dados.valor,

        categoria:
          dados.categoria,

        data:
          dados.data
      });


  if (error) {

    console.error(
      "Erro ao salvar lançamento:",
      error
    );

    throw error;
  }
}


// ============================================================
// EDITAR LANÇAMENTO
// ============================================================

async function editarLancamento(
  id,
  dados
) {

  const {
    error
  } =
    await supabaseClient
      .from("transactions")
      .update({

        tipo:
          dados.tipo,

        descricao:
          dados.descricao,

        valor:
          dados.valor,

        categoria:
          dados.categoria,

        data:
          dados.data
      })
      .eq(
        "id",
        id
      )
      .eq(
        "user_id",
        usuarioAtual.id
      );


  if (error) {

    console.error(
      "Erro ao editar lançamento:",
      error
    );

    throw error;
  }
}


// ============================================================
// EXCLUIR LANÇAMENTO
// ============================================================

async function excluirLancamento(
  id
) {

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
        usuarioAtual.id
      );


  if (error) {

    console.error(
      "Erro ao excluir lançamento:",
      error
    );

    throw error;
  }
}


// ============================================================
// MODAL
// ============================================================

const transactionModal =
  document.getElementById(
    "transactionModal"
  );


const closeTransactionModal =
  document.getElementById(
    "closeTransactionModal"
  );


const cancelTransactionButton =
  document.getElementById(
    "cancelTransactionButton"
  );


const saveTransactionButton =
  document.getElementById(
    "saveTransactionButton"
  );


function fecharModal() {

  transactionModal?.classList.add(
    "hidden"
  );

  idEditando =
    null;

  const message =
    document.getElementById(
      "transactionMessage"
    );

  if (message) {

    message.textContent = "";
  }
}


function abrirModal(
  tipo = "income",
  id = null
) {

  idEditando =
    id;


  const type =
    document.getElementById(
      "transactionType"
    );


  const description =
    document.getElementById(
      "transactionDescription"
    );


  const amount =
    document.getElementById(
      "transactionAmount"
    );


  const category =
    document.getElementById(
      "transactionCategory"
    );


  const date =
    document.getElementById(
      "transactionDate"
    );


  if (type) {

    type.value =
      tipo;
  }


  if (description) {

    description.value =
      "";
  }


  if (amount) {

    amount.value =
      "";
  }


  if (category) {

    category.value =
      "outros";
  }


  if (date) {

    const hoje =
      new Date()
        .toISOString()
        .split("T")[0];

    date.value =
      hoje;
  }


  if (id !== null) {

    pegarLancamentos()
      .then(
        function (lancamentos) {

          const item =
            lancamentos.find(
              function (l) {

                return String(l.id) ===
                  String(id);
              }
            );


          if (!item) {

            alert(
              "Lançamento não encontrado."
            );

            fecharModal();

            return;
          }


          if (type) {

            type.value =
              item.tipo;
          }


          if (description) {

            description.value =
              item.descricao || "";
          }


          if (amount) {

            amount.value =
              item.valor
                .toFixed(2)
                .replace(".", ",");
          }


          if (category) {

            category.value =
              item.categoria ||
              "outros";
          }


          if (date) {

            date.value =
              item.data

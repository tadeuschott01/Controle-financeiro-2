// ============================================================
// CONTROLES - SCRIPT COMPLETO
// Supabase + Login + Cadastro + Finanças
// ============================================================

const SUPABASE_URL =
  "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";


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

      if (data.session && data.user) {

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


        await salvarPerfil(
          usuarioAtual
        );


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


      // --------------------------------------------------------
      // CONFIRMAÇÃO DE E-MAIL
      // --------------------------------------------------------

      mostrarMensagem(

        registerMessage,

        "Conta criada! Verifique seu e-mail para confirmar a conta.",

        true
      );


      if (loginEmail) {

        loginEmail.value =
          email;
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
        1500
      );


    } catch (erro) {

      console.error(
        "ERRO AO CRIAR CONTA:",
        erro
      );


      mostrarMensagem(

        registerMessage,

        erro.message ||
        "Não foi possível criar a conta."
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
        "Iniciando login Supabase..."
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
          "ERRO SUPABASE LOGIN:",
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


      console.log(
        "Login realizado:",
        data.user.email
      );


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


      mostrarMensagem(

        loginMessage,

        erro.message ||
        "Não foi possível fazer login."
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
// ENTER NO LOGIN
// ============================================================

loginPassword?.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Enter"
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
// PEGAR LANÇAMENTOS
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
              item.dataISO || "";
          }


          const titulo =
            document.getElementById(
              "transactionModalTitle"
            );


          if (titulo) {

            titulo.textContent =
              "Editar lançamento";
          }


          transactionModal?.classList.remove(
            "hidden"
          );
        }
      )
      .catch(
        function (erro) {

          console.error(
            erro
          );

          alert(
            erro.message
          );
        }
      );


    return;
  }


  const titulo =
    document.getElementById(
      "transactionModalTitle"
    );


  if (titulo) {

    titulo.textContent =
      "Novo lançamento";
  }


  transactionModal?.classList.remove(
    "hidden"
  );
}


closeTransactionModal?.addEventListener(
  "click",
  fecharModal
);


cancelTransactionButton?.addEventListener(
  "click",
  fecharModal
);


// ============================================================
// BOTÕES DE RECEITA / DESPESA
// ============================================================

document
  .getElementById(
    "quickIncomeButton"
  )
  ?.addEventListener(
    "click",
    function () {

      abrirModal(
        "income"
      );
    }
  );


document
  .getElementById(
    "quickExpenseButton"
  )
  ?.addEventListener(
    "click",
    function () {

      abrirModal(
        "expense"
      );
    }
  );


document
  .getElementById(
    "newTransactionButton"
  )
  ?.addEventListener(
    "click",
    function () {

      abrirModal(
        "income"
      );
    }
  );


// ============================================================
// SALVAR / EDITAR
// ============================================================

saveTransactionButton?.addEventListener(
  "click",
  async function () {

    if (!usuarioAtual) {

      alert(
        "Sua sessão expirou. Faça login novamente."
      );

      return;
    }


    const tipo =
      document.getElementById(
        "transactionType"
      )?.value;


    const descricao =
      document.getElementById(
        "transactionDescription"
      )?.value.trim();


    const valorCampo =
      document.getElementById(
        "transactionAmount"
      )?.value;


    const categoria =
      document.getElementById(
        "transactionCategory"
      )?.value;


    const data =
      document.getElementById(
        "transactionDate"
      )?.value;


    let valorTexto =
      String(
        valorCampo || ""
      )
      .trim();


    valorTexto =
      valorTexto
        .replace(/\./g, "")
        .replace(",", ".");


    const valor =
      Number(valorTexto);


    if (!descricao) {

      alert(
        "Digite uma descrição."
      );

      return;
    }


    if (
      !valor ||
      valor <= 0
    ) {

      alert(
        "Digite um valor válido."
      );

      return;
    }


    if (!data) {

      alert(
        "Escolha uma data."
      );

      return;
    }


    const dados = {

      tipo:
        tipo,

      descricao:
        descricao,

      valor:
        valor,

      categoria:
        categoria,

      data:
        data
    };


    saveTransactionButton.disabled =
      true;


    saveTransactionButton.textContent =
      "Salvando...";


    try {

      if (
        idEditando !== null
      ) {

        await editarLancamento(
          idEditando,
          dados
        );

      } else {

        await salvarLancamento(
          dados
        );
      }


      fecharModal();

      await atualizarTudo();


    } catch (erro) {

      console.error(
        "Erro:",
        erro
      );


      alert(
        "Erro ao salvar: " +
        (
          erro.message ||
          "Erro desconhecido."
        )
      );


    } finally {

      saveTransactionButton.disabled =
        false;

      saveTransactionButton.textContent =
        "Salvar lançamento";
    }
  }
);


// ============================================================
// TABELA
// ============================================================

async function renderizarTabela() {

  const tbody =
    document.getElementById(
      "transactionsTableBody"
    );


  if (!tbody) {
    return;
  }


  let lancamentos = [];


  try {

    lancamentos =
      await pegarLancamentos();

  } catch (erro) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          style="
            text-align:center;
            padding:30px;
          "
        >

          Não foi possível carregar os lançamentos.

        </td>

      </tr>
    `;

    return;
  }


  const pesquisa =
    document.getElementById(
      "transactionSearch"
    )?.value
    .toLowerCase()
    .trim() ||
    "";


  const filtroTipo =
    document.getElementById(
      "transactionTypeFilter"
    )?.value ||
    "all";


  const filtroCategoria =
    document.getElementById(
      "transactionCategoryFilter"
    )?.value ||
    "all";


  lancamentos =
    lancamentos.filter(
      function (item) {

        const texto =
          (
            item.descricao ||
            ""
          )
          .toLowerCase();


        const categoria =
          (
            item.categoria ||
            ""
          )
          .toLowerCase();


        if (
          pesquisa &&
          !(
            texto.includes(
              pesquisa
            ) ||
            categoria.includes(
              pesquisa
            )
          )
        ) {

          return false;
        }


        if (
          filtroTipo !==
          "all" &&
          item.tipo !==
          filtroTipo
        ) {

          return false;
        }


        if (
          filtroCategoria !==
          "all" &&
          item.categoria !==
          filtroCategoria
        ) {

          return false;
        }


        return true;
      }
    );


  if (
    lancamentos.length ===
    0
  ) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          style="
            text-align:center;
            padding:30px;
          "
        >

          Nenhum lançamento encontrado.

        </td>

      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    lancamentos
      .map(
        function (item) {

          const receita =
            item.tipo ===
            "income";


          return `

            <tr>

              <td>
                ${
                  item.data ||
                  formatarData(
                    item.dataISO
                  )
                }
              </td>

              <td>
                ${
                  escaparHTML(
                    item.descricao
                  )
                }
              </td>

              <td>
                ${
                  nomeCategoria(
                    item.categoria
                  )
                }
              </td>

              <td>
                ${
                  receita
                    ? "Receita"
                    : "Despesa"
                }
              </td>

              <td
                class="${
                  receita
                    ? "income"
                    : "expense"
                }"
              >

                ${
                  receita
                    ? "+"
                    : "-"
                }

                ${
                  dinheiro(
                    item.valor
                  )
                }

              </td>

              <td>

                <button
                  type="button"
                  class="edit-transaction-button"
                  data-id="${item.id}"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  class="delete-transaction-button"
                  data-id="${item.id}"
                  title="Excluir"
                >
                  🗑️
                </button>

              </td>

            </tr>

          `;
        }
      )
      .join("");
}


// ============================================================
// EDITAR / EXCLUIR
// ============================================================

document
  .getElementById(
    "transactionsTableBody"
  )
  ?.addEventListener(
    "click",
    async function (event) {

      const botaoEditar =
        event.target.closest(
          ".edit-transaction-button"
        );


      const botaoExcluir =
        event.target.closest(
          ".delete-transaction-button"
        );


      if (botaoEditar) {

        const id =
          botaoEditar.getAttribute(
            "data-id"
          );


        abrirModal(
          "income",
          id
        );


        return;
      }


      if (botaoExcluir) {

        const id =
          botaoExcluir.getAttribute(
            "data-id"
          );


        if (!id) {
          return;
        }


        const confirmar =
          confirm(
            "Tem certeza que deseja excluir este lançamento?"
          );


        if (!confirmar) {
          return;
        }


        try {

          await excluirLancamento(
            id
          );


          await atualizarTudo();


        } catch (erro) {

          console.error(
            erro
          );


          alert(
            "Erro ao excluir: " +
            erro.message
          );
        }
      }
    }
  );


// ============================================================
// FILTROS
// ============================================================

document
  .getElementById(
    "transactionSearch"
  )
  ?.addEventListener(
    "input",
    renderizarTabela
  );


document
  .getElementById(
    "transactionTypeFilter"
  )
  ?.addEventListener(
    "change",
    renderizarTabela
  );


document
  .getElementById(
    "transactionCategoryFilter"
  )
  ?.addEventListener(
    "change",
    renderizarTabela
  );


// ============================================================
// FILTRO DE CATEGORIAS
// ============================================================

function atualizarFiltroCategorias() {

  const select =
    document.getElementById(
      "transactionCategoryFilter"
    );


  if (!select) {
    return;
  }


  const valorAtual =
    select.value;


  select.innerHTML = `

    <option value="all">
      Todas as categorias
    </option>

  `;


  Object.entries(
    categorias
  ).forEach(
    function ([valor, texto]) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        valor;


      option.textContent =
        texto;


      select.appendChild(
        option
      );
    }
  );


  select.value =
    valorAtual ||
    "all";
}


// ============================================================
// DASHBOARD
// ============================================================

async function atualizarDashboard() {

  if (!usuarioAtual) {
    return;
  }


  const lancamentos =
    await pegarLancamentos();


  let receitas = 0;

  let despesas = 0;


  lancamentos.forEach(
    function (item) {

      const valor =
        Number(
          item.valor
        ) || 0;


      if (
        item.tipo ===
        "income"
      ) {

        receitas +=
          valor;
      }


      if (
        item.tipo ===
        "expense"
      ) {

        despesas +=
          valor;
      }
    }
  );


  const saldo =
    receitas -
    despesas;


  const totalIncome =
    document.getElementById(
      "totalIncome"
    );


  const totalExpense =
    document.getElementById(
      "totalExpense"
    );


  const totalBalance =
    document.getElementById(
      "totalBalance"
    );


  const totalTransactions =
    document.getElementById(
      "totalTransactions"
    );


  if (totalIncome) {

    totalIncome.textContent =
      dinheiro(
        receitas
      );
  }


  if (totalExpense) {

    totalExpense.textContent =
      dinheiro(
        despesas
      );
  }


  if (totalBalance) {

    totalBalance.textContent =
      dinheiro(
        saldo
      );
  }


  if (totalTransactions) {

    totalTransactions.textContent =
      lancamentos.length;
  }


  await atualizarLancamentosRecentes();
}


// ============================================================
// LANÇAMENTOS RECENTES
// ============================================================

async function atualizarLancamentosRecentes() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  if (!container) {
    return;
  }


  const lancamentos =
    await pegarLancamentos();


  if (
    lancamentos.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div>📋</div>

        <p>
          Nenhum lançamento cadastrado.
        </p>

        <span>
          Adicione sua primeira receita ou despesa.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML =
    lancamentos
      .slice(0, 5)
      .map(
        function (item) {

          const receita =
            item.tipo ===
            "income";


          return `

            <div class="transaction-row">

              <div class="transaction-info">

                <div
                  class="transaction-icon ${
                    receita
                      ? "income"
                      : "expense"
                  }"
                >

                  ${
                    receita
                      ? "↑"
                      : "↓"
                  }

                </div>


                <div>

                  <div
                    class="transaction-description"
                  >

                    ${
                      escaparHTML(
                        item.descricao
                      )
                    }

                  </div>


                  <div
                    class="transaction-date"
                  >

                    ${
                      item.data ||
                      ""
                    }

                  </div>

                </div>

              </div>


              <div
                class="transaction-value ${
                  receita
                    ? "income"
                    : "expense"
                }"
              >

                ${
                  receita
                    ? "+"
                    : "-"
                }

                ${
                  dinheiro(
                    item.valor
                  )
                }

              </div>

            </div>

          `;
        }
      )
      .join("");
}


// ============================================================
// RELATÓRIO
// ============================================================

async function atualizarRelatorio() {

  const container =
    document.getElementById(
      "reportSummary"
    );


  if (!container) {
    return;
  }


  const lancamentos =
    await pegarLancamentos();


  let receitas = 0;

  let despesas = 0;


  lancamentos.forEach(
    function (item) {

      const valor =
        Number(
          item.valor
        ) || 0;


      if (
        item.tipo ===
        "income"
      ) {

        receitas +=
          valor;
      }


      if (
        item.tipo ===
        "expense"
      ) {

        despesas +=
          valor;
      }
    }
  );


  const saldo =
    receitas -
    despesas;


  container.innerHTML = `

    <div
      style="
        padding:10px 0;
      "
    >

      <p>
        <strong>Receitas:</strong>
        ${dinheiro(receitas)}
      </p>

      <p>
        <strong>Despesas:</strong>
        ${dinheiro(despesas)}
      </p>

      <p>
        <strong>Saldo:</strong>
        ${dinheiro(saldo)}
      </p>

      <p>
        <strong>Lançamentos:</strong>
        ${lancamentos.length}
      </p>

    </div>

  `;
}


// ============================================================
// ATUALIZAR TUDO
// ============================================================

async function atualizarTudo() {

  try {

    atualizarFiltroCategorias();

    await atualizarDashboard();

    await renderizarTabela();

    await atualizarRelatorio();

  } catch (erro) {

    console.error(
      "Erro ao atualizar sistema:",
      erro
    );
  }
}


// ============================================================
// MENU
// ============================================================

document
  .querySelectorAll(
    ".menu-item"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const sectionName =
            button.dataset.section;


          document
            .querySelectorAll(
              ".menu-item"
            )
            .forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );
              }
            );


          button.classList.add(
            "active"
          );


          document
            .querySelectorAll(
              ".content-section"
            )
            .forEach(
              function (section) {

                section.classList.remove(
                  "active-section"
                );
              }
            );


          const section =
            document.getElementById(
              sectionName
            );


          section?.classList.add(
            "active-section"
          );


          document
            .querySelector(
              ".sidebar"
            )
            ?.classList.remove(
              "mobile-open"
            );


          if (
            sectionName ===
            "transactions"
          ) {

            renderizarTabela();
          }


          if (
            sectionName ===
            "reports"
          ) {

            atualizarRelatorio();
          }
        }
      );
    }
  );


// ============================================================
// MENU MOBILE
// ============================================================

document
  .getElementById(
    "mobileMenuButton"
  )
  ?.addEventListener(
    "click",
    function () {

      document
        .querySelector(
          ".sidebar"
        )
        ?.classList.toggle(
          "mobile-open"
        );
    }
  );


// ============================================================
// VER TODOS
// ============================================================

document
  .getElementById(
    "viewTransactionsButton"
  )
  ?.addEventListener(
    "click",
    function () {

      document
        .querySelector(
          '.menu-item[data-section="transactions"]'
        )
        ?.click();
    }
  );


// ============================================================
// INICIALIZAÇÃO DO SUPABASE
// ============================================================

async function iniciarSistema() {

  console.log(
    "ControleS iniciando..."
  );


  try {

    const supabase =
      await carregarSupabase();


    supabaseClient =
      supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {

          auth: {

            persistSession:
              true,

            autoRefreshToken:
              true,

            detectSessionInUrl:
              true
          }
        }
      );


    console.log(
      "Supabase conectado."
    );


    // --------------------------------------------------------
    // VERIFICAR SESSÃO EXISTENTE
    // --------------------------------------------------------

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Erro ao recuperar sessão:",
        error
      );

      mostrarLogin();

      return;
    }


    const session =
      data?.session;


    if (
      session?.user
    ) {

      try {

        usuarioAtual =
          await pegarPerfil(
            session.user
          );


        mostrarAplicacao();

        atualizarPerfilTela();

        await atualizarTudo();


      } catch (erro) {

        console.error(
          "Erro ao carregar usuário:",
          erro
        );

        await supabaseClient.auth.signOut();

        mostrarLogin();
      }


    } else {

      mostrarLogin();
    }


    // --------------------------------------------------------
    // OBSERVAR ALTERAÇÕES DA SESSÃO
    // --------------------------------------------------------

    supabaseClient.auth.onAuthStateChange(
      async function (
        event,
        sessionAtual
      ) {

        console.log(
          "Auth:",
          event
        );


        if (
          event ===
          "SIGNED_OUT"
        ) {

          usuarioAtual =
            null;

          mostrarLogin();

          return;
        }


        if (
          (
            event ===
            "SIGNED_IN" ||
            event ===
            "TOKEN_REFRESHED"
          ) &&
          sessionAtual?.user
        ) {

          try {

            usuarioAtual =
              await pegarPerfil(
                sessionAtual.user
              );


            mostrarAplicacao();

            atualizarPerfilTela();

            await atualizarTudo();

          } catch (erro) {

            console.error(
              "Erro após autenticação:",
              erro
            );
          }
        }
      }
    );


  } catch (erro) {

    console.error(
      "ERRO FATAL:",
      erro
    );


    mostrarMensagem(

      loginMessage,

      "Não foi possível conectar ao sistema de autenticação: " +
      (
        erro.message ||
        "erro desconhecido"
      )
    );
  }
}


// ============================================================
// INICIAR
// ============================================================

iniciarSistema();

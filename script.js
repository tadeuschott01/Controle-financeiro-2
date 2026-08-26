document.addEventListener("DOMContentLoaded", function () {

  // ==========================================================
  // SUPABASE
  // ==========================================================

  const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
  const SUPABASE_KEY = "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

  let accessToken = localStorage.getItem("controleFinanceiroAccessToken");
  let currentUser = null;

  async function supabaseFetch(path, options = {}) {
    const headers = {
      "apikey": SUPABASE_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (accessToken) {
      headers["Authorization"] = "Bearer " + accessToken;
    }

    const response = await fetch(SUPABASE_URL + path, {
      ...options,
      headers
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = text;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error_description ||
        data?.error ||
        "Erro ao comunicar com o Supabase.";

      throw new Error(message);
    }

    return data;
  }

  // ==========================================================
  // ELEMENTOS
  // ==========================================================

  const authScreen = document.getElementById("authScreen");
  const appScreen = document.getElementById("appScreen");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const showRegisterButton =
    document.getElementById("showRegisterButton");

  const showLoginButton =
    document.getElementById("showLoginButton");

  const registerButton =
    document.getElementById("registerButton");

  const loginButton =
    document.getElementById("loginButton");

  const logoutButton =
    document.getElementById("logoutButton");

  const loginMessage =
    document.getElementById("loginMessage");

  const registerMessage =
    document.getElementById("registerMessage");

  // ==========================================================
  // AUXILIARES
  // ==========================================================

  function mostrarMensagem(elemento, mensagem, sucesso = false) {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.style.color = sucesso ? "#1f513d" : "#d94b4b";
  }

  function dinheiro(valor) {
    const numero = Number(valor);

    if (isNaN(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nomeCategoria(categoria) {
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

    return categorias[categoria] || categoria || "Outros";
  }

  // ==========================================================
  // USUÁRIO
  // ==========================================================

  async function pegarUsuarioAtual() {

    if (!accessToken) {
      return null;
    }

    try {

      const authUser =
        await supabaseFetch("/auth/v1/user");

      if (!authUser?.id) {
        return null;
      }

      const profiles =
        await supabaseFetch(
          "/rest/v1/profiles?id=eq." +
          encodeURIComponent(authUser.id) +
          "&select=*"
        );

      const profile =
        Array.isArray(profiles)
          ? profiles[0]
          : null;

      currentUser = {
        id: authUser.id,

        email:
          authUser.email ||
          profile?.email ||
          "",

        nome:
          profile?.nome ||
          authUser.user_metadata?.nome ||
          "Usuário",

        tipo:
          profile?.tipo ||
          authUser.user_metadata?.tipo ||
          "pessoal",

        empresa:
          profile?.empresa ||
          authUser.user_metadata?.empresa ||
          ""
      };

      return currentUser;

    } catch (erro) {

      console.error(
        "Erro ao recuperar usuário:",
        erro
      );

      accessToken = null;

      localStorage.removeItem(
        "controleFinanceiroAccessToken"
      );

      localStorage.removeItem(
        "controleFinanceiroLogado"
      );

      currentUser = null;

      return null;
    }
  }

  // ==========================================================
  // LANÇAMENTOS
  // ==========================================================

  async function pegarLancamentos() {

    if (!currentUser) {
      return [];
    }

    try {

      const dados =
        await supabaseFetch(
          "/rest/v1/transactions?user_id=eq." +
          encodeURIComponent(currentUser.id) +
          "&select=*&order=data.desc,created_at.desc"
        );

      return (
        Array.isArray(dados)
          ? dados
          : []
      ).map(function (item) {

        return {

          id: item.id,

          tipo: item.tipo,

          descricao: item.descricao,

          valor:
            Number(item.valor) || 0,

          categoria:
            item.categoria,

          dataISO:
            item.data_iso || item.data,

          data:
            item.data
              ? formatarData(item.data)
              : formatarData(item.data_iso),

          criadoEm:
            item.created_at
        };

      });

    } catch (erro) {

      console.error(
        "Erro ao buscar lançamentos:",
        erro
      );

      return [];
    }
  }

  async function salvarLancamento(dados) {

    return supabaseFetch(
      "/rest/v1/transactions",
      {
        method: "POST",

        headers: {
          "Prefer": "return=representation"
        },

        body: JSON.stringify({

          user_id:
            currentUser.id,

          tipo:
            dados.tipo,

          descricao:
            dados.descricao,

          valor:
            dados.valor,

          categoria:
            dados.categoria,

          data:
            dados.dataISO
        })
      }
    );
  }

  async function atualizarLancamento(
    id,
    dados
  ) {

    return supabaseFetch(
      "/rest/v1/transactions?id=eq." +
      encodeURIComponent(id),

      {
        method: "PATCH",

        headers: {
          "Prefer":
            "return=representation"
        },

        body: JSON.stringify({

          tipo:
            dados.tipo,

          descricao:
            dados.descricao,

          valor:
            dados.valor,

          categoria:
            dados.categoria,

          data:
            dados.dataISO
        })
      }
    );
  }

  async function excluirLancamento(id) {

    return supabaseFetch(
      "/rest/v1/transactions?id=eq." +
      encodeURIComponent(id),

      {
        method: "DELETE"
      }
    );
  }

  // ==========================================================
  // MOSTRAR CADASTRO
  // ==========================================================

  showRegisterButton?.addEventListener(
    "click",
    function () {

      loginForm?.classList.add("hidden");

      registerForm?.classList.remove("hidden");

      if (registerMessage) {
        registerMessage.textContent = "";
      }
    }
  );

  // ==========================================================
  // MOSTRAR LOGIN
  // ==========================================================

  showLoginButton?.addEventListener(
    "click",
    function () {

      registerForm?.classList.add("hidden");

      loginForm?.classList.remove("hidden");

      if (loginMessage) {
        loginMessage.textContent = "";
      }
    }
  );

  // ==========================================================
  // CADASTRO
  // ==========================================================

  registerButton?.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();

      const nome =
        document
          .getElementById("registerName")
          ?.value
          .trim();

      const email =
        document
          .getElementById("registerEmail")
          ?.value
          .trim();

      const senha =
        document
          .getElementById("registerPassword")
          ?.value;

      const tipo =
        document
          .getElementById("registerAccountType")
          ?.value ||
        "pessoal";

      const empresa =
        document
          .getElementById("registerCompany")
          ?.value
          .trim() ||
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

      registerButton.disabled = true;

      registerButton.textContent =
        "Criando...";

      try {

        const resultado =
          await supabaseFetch(
            "/auth/v1/signup",
            {
              method: "POST",

              body: JSON.stringify({

                email:
                  email,

                password:
                  senha,

                data: {

                  nome:
                    nome,

                  tipo:
                    tipo,

                  empresa:
                    empresa
                }
              })
            }
          );

        if (!resultado?.user?.id) {

          throw new Error(
            "Não foi possível criar a conta."
          );
        }

        if (resultado.access_token) {

          accessToken =
            resultado.access_token;

          localStorage.setItem(
            "controleFinanceiroAccessToken",
            accessToken
          );

          localStorage.setItem(
            "controleFinanceiroLogado",
            "true"
          );

          currentUser = {

            id:
              resultado.user.id,

            email:
              resultado.user.email ||
              email,

            nome:
              nome,

            tipo:
              tipo,

            empresa:
              empresa
          };

          await criarOuAtualizarPerfil(
            currentUser
          );

          mostrarMensagem(
            registerMessage,
            "Conta criada com sucesso!",
            true
          );

          authScreen?.classList.add(
            "hidden"
          );

          appScreen?.classList.remove(
            "hidden"
          );

          abrirSistema(
            currentUser
          );

        } else {

          mostrarMensagem(
            registerMessage,

            "Conta criada! Verifique seu e-mail para confirmar a conta.",

            true
          );

          const loginEmail =
            document.getElementById(
              "loginEmail"
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

              if (registerMessage) {
                registerMessage.textContent =
                  "";
              }

            },
            1500
          );
        }

      } catch (erro) {

        console.error(erro);

        mostrarMensagem(
          registerMessage,

          "Não foi possível criar a conta: " +
          erro.message
        );

      } finally {

        registerButton.disabled = false;

        registerButton.textContent =
          "Criar minha conta";
      }
    }
  );

  // ==========================================================
  // PERFIL
  // ==========================================================

  async function criarOuAtualizarPerfil(
    usuario
  ) {

    try {

      await supabaseFetch(
        "/rest/v1/profiles?on_conflict=id",
        {
          method: "POST",

          headers: {

            "Prefer":
              "resolution=merge-duplicates,return=representation"
          },

          body: JSON.stringify({

            id:
              usuario.id,

            email:
              usuario.email,

            nome:
              usuario.nome,

            tipo:
              usuario.tipo,

            empresa:
              usuario.empresa || ""
          })
        }
      );

    } catch (erro) {

      console.error(
        "Erro ao salvar perfil:",
        erro
      );

      throw erro;
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  loginButton?.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();

      const email =
        document
          .getElementById("loginEmail")
          ?.value
          .trim();

      const senha =
        document
          .getElementById("loginPassword")
          ?.value;

      if (!email || !senha) {

        mostrarMensagem(
          loginMessage,
          "Digite seu e-mail e sua senha."
        );

        return;
      }

      loginButton.disabled = true;

      loginButton.textContent =
        "Entrando...";

      try {

        const resultado =
          await supabaseFetch(
            "/auth/v1/token?grant_type=password",
            {
              method: "POST",

              body: JSON.stringify({

                email:
                  email,

                password:
                  senha
              })
            }
          );

        if (
          !resultado?.access_token
        ) {

          throw new Error(
            "E-mail ou senha incorretos."
          );
        }

        accessToken =
          resultado.access_token;

        localStorage.setItem(
          "controleFinanceiroAccessToken",
          accessToken
        );

        localStorage.setItem(
          "controleFinanceiroLogado",
          "true"
        );

        const usuario =
          await pegarUsuarioAtual();

        if (!usuario) {

          throw new Error(
            "Não foi possível carregar sua conta."
          );
        }

        authScreen?.classList.add(
          "hidden"
        );

        appScreen?.classList.remove(
          "hidden"
        );

        abrirSistema(
          usuario
        );

      } catch (erro) {

        console.error(erro);

        mostrarMensagem(
          loginMessage,

          erro.message ||
          "E-mail ou senha incorretos."
        );

      } finally {

        loginButton.disabled = false;

        loginButton.textContent =
          "Entrar";
      }
    }
  );

  // ==========================================================
  // ABRIR SISTEMA
  // ==========================================================

  function abrirSistema(usuario) {

    const userName =
      document.getElementById(
        "userName"
      );

    if (userName) {
      userName.textContent =
        usuario.nome;
    }

    const profileName =
      document.getElementById(
        "profileName"
      );

    if (profileName) {
      profileName.textContent =
        usuario.nome;
    }

    const profileEmail =
      document.getElementById(
        "profileEmail"
      );

    if (profileEmail) {
      profileEmail.textContent =
        usuario.email;
    }

    const profileAccountType =
      document.getElementById(
        "profileAccountType"
      );

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
        tipos[usuario.tipo] ||
        "Pessoal";
    }

    const profileCompany =
      document.getElementById(
        "profileCompany"
      );

    if (profileCompany) {

      profileCompany.textContent =
        usuario.empresa ||
        "—";
    }

    atualizarTudo();
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logoutButton?.addEventListener(
    "click",
    async function () {

      try {

        if (accessToken) {

          await supabaseFetch(
            "/auth/v1/logout",
            {
              method: "POST"
            }
          );
        }

      } catch (erro) {

        console.error(
          "Erro ao sair:",
          erro
        );
      }

      accessToken = null;

      currentUser = null;

      localStorage.removeItem(
        "controleFinanceiroAccessToken"
      );

      localStorage.removeItem(
        "controleFinanceiroLogado"
      );

      appScreen?.classList.add(
        "hidden"
      );

      authScreen?.classList.remove(
        "hidden"
      );

      registerForm?.classList.add(
        "hidden"
      );

      loginForm?.classList.remove(
        "hidden"
      );
    }
  );

  // ==========================================================
  // MENU
  // ==========================================================

  const menuItems =
    document.querySelectorAll(
      ".menu-item"
    );

  const sections =
    document.querySelectorAll(
      ".content-section"
    );

  menuItems.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const sectionName =
            button.dataset.section;

          menuItems.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );

          sections.forEach(
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

          if (section) {

            section.classList.add(
              "active-section"
            );
          }

          const sidebar =
            document.querySelector(
              ".sidebar"
            );

          sidebar?.classList.remove(
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

  // ==========================================================
  // MENU MOBILE
  // ==========================================================

  const mobileMenuButton =
    document.getElementById(
      "mobileMenuButton"
    );

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  mobileMenuButton?.addEventListener(
    "click",
    function () {

      sidebar?.classList.toggle(
        "mobile-open"
      );
    }
  );

  // ==========================================================
  // MODAL
  // ==========================================================

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

  let idEditando = null;

  async function abrirModal(
    tipo = "income",
    id = null
  ) {

    idEditando = id;

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

    if (id) {

      const lancamentos =
        await pegarLancamentos();

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
          item.valor || "";
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

    } else {

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
          "salario";
      }

      if (date) {

        const hoje =
          new Date()
            .toISOString()
            .split("T")[0];

        date.value =
          hoje;
      }
    }

    const titulo =
      transactionModal?.querySelector(
        "h2"
      );

    if (titulo) {

      titulo.textContent =
        id
          ? "Editar lançamento"
          : "Novo lançamento";
    }

    transactionModal?.classList.remove(
      "hidden"
    );
  }

  function fecharModal() {

    transactionModal?.classList.add(
      "hidden"
    );

    idEditando = null;
  }

  closeTransactionModal?.addEventListener(
    "click",
    fecharModal
  );

  cancelTransactionButton?.addEventListener(
    "click",
    fecharModal
  );

  // ==========================================================
  // BOTÕES DE LANÇAMENTO
  // ==========================================================

  document
    .getElementById(
      "quickIncomeButton"
    )
    ?.addEventListener(
      "click",
      function () {

        abrirModal("income");
      }
    );

  document
    .getElementById(
      "quickExpenseButton"
    )
    ?.addEventListener(
      "click",
      function () {

        abrirModal("expense");
      }
    );

  document
    .getElementById(
      "newTransactionButton"
    )
    ?.addEventListener(
      "click",
      function () {

        abrirModal("income");
      }
    );

  // ==========================================================
  // SALVAR LANÇAMENTO
  // ==========================================================

  saveTransactionButton?.addEventListener(
    "click",
    async function () {

      if (!currentUser) {

        alert(
          "Faça login novamente."
        );

        return;
      }

      const tipo =
        document
          .getElementById(
            "transactionType"
          )
          ?.value;

      const descricao =
        document
          .getElementById(
            "transactionDescription"
          )
          ?.value
          .trim();

      const valorCampo =
        document
          .getElementById(
            "transactionAmount"
          )
          ?.value;

      const categoria =
        document
          .getElementById(
            "transactionCategory"
          )
          ?.value;

      const data =
        document
          .getElementById(
            "transactionDate"
          )
          ?.value;

      const valor =
        Number(
          String(valorCampo || "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

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

        dataISO:
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

          await atualizarLancamento(
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

        console.error(erro);

        alert(
          "Não foi possível salvar: " +
          erro.message
        );

      } finally {

        saveTransactionButton.disabled =
          false;

        saveTransactionButton.textContent =
          "Salvar lançamento";
      }
    }
  );

  // ==========================================================
  // TABELA
  // ==========================================================

  async function renderizarTabela() {

    const tbody =
      document.getElementById(
        "transactionsTableBody"
      );

    if (!tbody) {
      return;
    }

    let lancamentos =
      await pegarLancamentos();

    const pesquisa =
      document
        .getElementById(
          "transactionSearch"
        )
        ?.value
        .toLowerCase()
        .trim() ||
      "";

    const filtroTipo =
      document
        .getElementById(
          "transactionTypeFilter"
        )
        ?.value ||
      "all";

    const filtroCategoria =
      document
        .getElementById(
          "transactionCategoryFilter"
        )
        ?.value ||
      "all";

    lancamentos =
      lancamentos.filter(
        function (item) {

          const texto =
            (
              String(
                item.descricao ||
                ""
              ) +
              " " +
              String(
                item.categoria ||
                ""
              )
            ).toLowerCase();

          if (
            pesquisa &&
            !texto.includes(
              pesquisa
            )
          ) {

            return false;
          }

          if (
            filtroTipo !== "all" &&
            item.tipo !== filtroTipo
          ) {

            return false;
          }

          if (
            filtroCategoria !== "all" &&
            item.categoria !==
              filtroCategoria
          ) {

            return false;
          }

          return true;
        }
      );

    if (
      lancamentos.length === 0
    ) {

      tbody.innerHTML = `
        <tr>
          <td
            colspan="6"
            style="text-align:center;padding:30px;"
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

            const tipoTexto =
              item.tipo === "income"
                ? "Receita"
                : "Despesa";

            const sinal =
              item.tipo === "income"
                ? "+"
                : "-";

            const valor =
              dinheiro(
                item.valor
              );

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
                  ${tipoTexto}
                </td>

                <td
                  class="${item.tipo}"
                >
                  ${sinal}
                  ${valor}
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

  // ==========================================================
  // EDITAR / EXCLUIR
  // ==========================================================

  const transactionsTableBody =
    document.getElementById(
      "transactionsTableBody"
    );

  transactionsTableBody?.addEventListener(
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

        if (!id) {

          alert(
            "ID do lançamento não encontrado."
          );

          return;
        }

        await abrirModal(
          null,
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

          alert(
            "ID do lançamento não encontrado."
          );

          return;
        }

        const confirmou =
          confirm(
            "Tem certeza que deseja excluir este lançamento?"
          );

        if (!confirmou) {
          return;
        }

        try {

          await excluirLancamento(
            id
          );

          await atualizarTudo();

          alert(
            "Lançamento excluído com sucesso."
          );

        } catch (erro) {

          console.error(erro);

          alert(
            "Não foi possível excluir: " +
            erro.message
          );
        }
      }
    }
  );

  // ==========================================================
  // FILTROS
  // ==========================================================

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

  // ==========================================================
  // CATEGORIAS
  // ==========================================================

  function atualizarFiltroCategorias() {

    const select =
      document.getElementById(
        "transactionCategoryFilter"
      );

    if (!select) {
      return;
    }

    const categorias = [

      ["salario", "Salário"],

      [
        "alimentacao",
        "Alimentação"
      ],

      ["moradia", "Moradia"],

      [
        "transporte",
        "Transporte"
      ],

      ["saude", "Saúde"],

      [
        "educacao",
        "Educação"
      ],

      ["lazer", "Lazer"],

      ["contas", "Contas"],

      ["compras", "Compras"],

      ["empresa", "Empresa"],

      ["outros", "Outros"]
    ];

    const valorAtual =
      select.value;

    select.innerHTML = `
      <option value="all">
        Todas as categorias
      </option>
    `;

    categorias.forEach(
      function (categoria) {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          categoria[0];

        option.textContent =
          categoria[1];

        select.appendChild(
          option
        );
      }
    );

    select.value =
      valorAtual ||
      "all";
  }

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  async function atualizarDashboard() {

    const lancamentos =
      await pegarLancamentos();

    let receitas = 0;
    let despesas = 0;

    lancamentos.forEach(
      function (item) {

        const valor =
          Number(item.valor) ||
          0;

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

  // ==========================================================
  // LANÇAMENTOS RECENTES
  // ==========================================================

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

    const recentes =
      lancamentos
        .slice()
        .slice(0, 5);

    container.innerHTML =
      recentes
        .map(
          function (item) {

            const classe =
              item.tipo === "income"
                ? "income"
                : "expense";

            const sinal =
              item.tipo === "income"
                ? "+"
                : "-";

            return `
              <div
                class="transaction-row"
              >

                <div
                  class="transaction-info"
                >

                  <div
                    class="transaction-icon ${classe}"
                  >
                    ${
                      item.tipo ===
                      "income"
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
                  class="transaction-value ${classe}"
                >
                  ${sinal}
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

  // ==========================================================
  // RELATÓRIO
  // ==========================================================

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
          Number(item.valor) ||
          0;

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
        style="padding:10px 0;"
      >

        <p>
          <strong>
            Receitas:
          </strong>

          ${
            dinheiro(
              receitas
            )
          }
        </p>

        <p>
          <strong>
            Despesas:
          </strong>

          ${
            dinheiro(
              despesas
            )
          }
        </p>

        <p>
          <strong>
            Saldo:
          </strong>

          ${
            dinheiro(
              saldo
            )
          }
        </p>

        <p>
          <strong>
            Lançamentos:
          </strong>

          ${
            lancamentos.length
          }
        </p>

      </div>
    `;
  }

  // ==========================================================
  // ATUALIZAR TUDO
  // ==========================================================

  async function atualizarTudo() {

    atualizarFiltroCategorias();

    await atualizarDashboard();

    await renderizarTabela();

    await atualizarRelatorio();
  }

  // ==========================================================
  // VER TODOS
  // ==========================================================

  document
    .getElementById(
      "viewTransactionsButton"
    )
    ?.addEventListener(
      "click",
      function () {

        const menu =
          document.querySelector(
            '.menu-item[data-section="transactions"]'
          );

        menu?.click();
      }
    );

  // ==========================================================
  // INICIALIZAÇÃO
  // ==========================================================

  async function iniciar() {

    if (
      !SUPABASE_URL ||
      !SUPABASE_KEY
    ) {

      console.error(
        "Supabase não configurado."
      );

      mostrarMensagem(
        loginMessage,
        "Supabase não configurado."
      );

      return;
    }

    if (accessToken) {

      const usuario =
        await pegarUsuarioAtual();

      if (usuario) {

        authScreen?.classList.add(
          "hidden"
        );

        appScreen?.classList.remove(
          "hidden"
        );

        abrirSistema(
          usuario
        );

        return;
      }
    }

    authScreen?.classList.remove(
      "hidden"
    );

    appScreen?.classList.add(
      "hidden"
    );
  }

  iniciar();

});

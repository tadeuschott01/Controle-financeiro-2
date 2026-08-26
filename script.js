document.addEventListener("DOMContentLoaded", function () {

  // =========================================================
  // CONTROLE FINANCEIRO
  // SCRIPT COMPLETO
  // =========================================================

  // =========================================================
  // ELEMENTOS PRINCIPAIS
  // =========================================================

  const authScreen = document.getElementById("authScreen");
  const appScreen = document.getElementById("appScreen");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const showRegisterButton =
    document.getElementById("showRegisterButton");

  const showLoginButton =
    document.getElementById("showLoginButton");

  const loginButton =
    document.getElementById("loginButton");

  const registerButton =
    document.getElementById("registerButton");

  const logoutButton =
    document.getElementById("logoutButton");

  const registerAccountType =
    document.getElementById("registerAccountType");

  const companyField =
    document.getElementById("companyField");

  const loginMessage =
    document.getElementById("loginMessage");

  const registerMessage =
    document.getElementById("registerMessage");


  // =========================================================
  // CHAVES DO LOCALSTORAGE
  // =========================================================

  const USER_KEY = "controleFinanceiroUsuario";
  const TRANSACTIONS_KEY = "controleFinanceiroLancamentos";
  const LOGGED_KEY = "controleFinanceiroLogado";


  // =========================================================
  // MENSAGEM
  // =========================================================

  function mostrarMensagem(elemento, mensagem, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";
  }


  // =========================================================
  // UTILIDADES
  // =========================================================

  function escaparHTML(valor) {

    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

  }


  function pegarUsuario() {

    const dados = localStorage.getItem(USER_KEY);

    if (!dados) {
      return null;
    }

    try {

      return JSON.parse(dados);

    } catch (erro) {

      localStorage.removeItem(USER_KEY);

      return null;

    }

  }


  function pegarLancamentos() {

    const dados =
      localStorage.getItem(TRANSACTIONS_KEY);

    if (!dados) {
      return [];
    }

    try {

      const lista = JSON.parse(dados);

      return Array.isArray(lista)
        ? lista
        : [];

    } catch (erro) {

      return [];

    }

  }


  function salvarLancamentos(lancamentos) {

    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(lancamentos)
    );

  }


  // =========================================================
  // LOGIN / CADASTRO
  // =========================================================

  function mostrarLogin() {

    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    if (registerMessage) {
      registerMessage.textContent = "";
    }

  }


  function mostrarCadastro() {

    loginForm?.classList.add("hidden");
    registerForm?.classList.remove("hidden");

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    if (registerMessage) {
      registerMessage.textContent = "";
    }

  }


  showRegisterButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      mostrarCadastro();

    }
  );


  showLoginButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      mostrarLogin();

    }
  );


  // =========================================================
  // TIPO DE CONTA
  // =========================================================

  function atualizarCampoEmpresa() {

    const tipo =
      registerAccountType?.value || "pessoal";

    if (!companyField) return;

    if (
      tipo === "empresa" ||
      tipo === "ambos"
    ) {

      companyField.classList.remove("hidden");

    } else {

      companyField.classList.add("hidden");

    }

  }


  registerAccountType?.addEventListener(
    "change",
    atualizarCampoEmpresa
  );


  // =========================================================
  // CADASTRO
  // =========================================================

  registerButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const nome =
        document.getElementById("registerName")
          ?.value.trim();

      const email =
        document.getElementById("registerEmail")
          ?.value.trim();

      const senha =
        document.getElementById("registerPassword")
          ?.value;

      const tipo =
        document.getElementById("registerAccountType")
          ?.value || "pessoal";

      const empresa =
        document.getElementById("registerCompany")
          ?.value.trim() || "";


      if (!nome) {

        mostrarMensagem(
          registerMessage,
          "Digite seu nome."
        );

        return;

      }


      if (!email) {

        mostrarMensagem(
          registerMessage,
          "Digite seu e-mail."
        );

        return;

      }


      if (!email.includes("@") || !email.includes(".")) {

        mostrarMensagem(
          registerMessage,
          "Digite um e-mail válido."
        );

        return;

      }


      if (!senha) {

        mostrarMensagem(
          registerMessage,
          "Digite uma senha."
        );

        return;

      }


      if (senha.length < 6) {

        mostrarMensagem(
          registerMessage,
          "A senha precisa ter pelo menos 6 caracteres."
        );

        return;

      }


      const usuarioExistente = pegarUsuario();

      if (
        usuarioExistente &&
        usuarioExistente.email.toLowerCase() ===
        email.toLowerCase()
      ) {

        mostrarMensagem(
          registerMessage,
          "Este e-mail já possui uma conta."
        );

        return;

      }


      const usuario = {

        nome: nome,

        email: email,

        senha: senha,

        tipo: tipo,

        empresa: empresa,

        criadoEm:
          new Date().toISOString()

      };


      try {

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(usuario)
        );

        localStorage.setItem(
          TRANSACTIONS_KEY,
          JSON.stringify([])
        );

      } catch (erro) {

        console.error(erro);

        mostrarMensagem(
          registerMessage,
          "Não foi possível salvar a conta neste navegador."
        );

        return;

      }


      mostrarMensagem(
        registerMessage,
        "Conta criada com sucesso!",
        true
      );


      const loginEmail =
        document.getElementById("loginEmail");

      if (loginEmail) {
        loginEmail.value = email;
      }


      setTimeout(function () {

        mostrarLogin();

        if (loginEmail) {
          loginEmail.value = email;
        }

      }, 1000);

    }
  );


  // =========================================================
  // LOGIN
  // =========================================================

  loginButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const email =
        document.getElementById("loginEmail")
          ?.value.trim();

      const senha =
        document.getElementById("loginPassword")
          ?.value;


      if (!email || !senha) {

        mostrarMensagem(
          loginMessage,
          "Digite seu e-mail e sua senha."
        );

        return;

      }


      const usuario = pegarUsuario();


      if (!usuario) {

        mostrarMensagem(
          loginMessage,
          "Nenhuma conta cadastrada. Clique em Criar conta."
        );

        return;

      }


      if (
        email.toLowerCase() !==
        usuario.email.toLowerCase() ||
        senha !== usuario.senha
      ) {

        mostrarMensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;

      }


      localStorage.setItem(
        LOGGED_KEY,
        "true"
      );


      abrirSistema(usuario);

    }
  );


  // =========================================================
  // ABRIR SISTEMA
  // =========================================================

  function abrirSistema(usuario) {

    if (!usuario) return;

    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


    const userName =
      document.getElementById("userName");

    if (userName) {
      userName.textContent =
        usuario.nome;
    }


    const profileName =
      document.getElementById("profileName");

    if (profileName) {
      profileName.textContent =
        usuario.nome;
    }


    const profileEmail =
      document.getElementById("profileEmail");

    if (profileEmail) {
      profileEmail.textContent =
        usuario.email;
    }


    const profileAccountType =
      document.getElementById("profileAccountType");


    if (profileAccountType) {

      const tipos = {

        pessoal: "Pessoal",

        empresa: "Empresa",

        ambos: "Pessoal + Empresa"

      };

      profileAccountType.textContent =
        tipos[usuario.tipo] || "Pessoal";

    }


    const profileCompany =
      document.getElementById("profileCompany");


    if (profileCompany) {

      profileCompany.textContent =
        usuario.empresa || "—";

    }


    atualizarDashboard();
    atualizarTabela();
    atualizarRelatorio();
    atualizarGraficos();

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logoutButton?.addEventListener(
    "click",
    function () {

      localStorage.removeItem(LOGGED_KEY);

      appScreen?.classList.add("hidden");
      authScreen?.classList.remove("hidden");

      mostrarLogin();

    }
  );


  // =========================================================
  // MENU
  // =========================================================

  const menuItems =
    document.querySelectorAll(".menu-item");

  const sections =
    document.querySelectorAll(".content-section");


  menuItems.forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const sectionName =
          button.dataset.section;


        menuItems.forEach(function (item) {

          item.classList.remove("active");

        });


        button.classList.add("active");


        sections.forEach(function (section) {

          section.classList.remove(
            "active-section"
          );

        });


        const section =
          document.getElementById(sectionName);


        if (section) {

          section.classList.add(
            "active-section"
          );

        }


        if (sectionName === "reports") {

          atualizarRelatorio();
          atualizarGraficos();

        }


        if (sectionName === "transactions") {

          atualizarTabela();

        }

      }
    );

  });


  // =========================================================
  // MENU MOBILE
  // =========================================================

  const mobileMenuButton =
    document.getElementById("mobileMenuButton");

  const sidebar =
    document.querySelector(".sidebar");


  mobileMenuButton?.addEventListener(
    "click",
    function () {

      sidebar?.classList.toggle(
        "mobile-open"
      );

    }
  );


  // =========================================================
  // MODAL
  // =========================================================

  const transactionModal =
    document.getElementById("transactionModal");

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


  let editandoId = null;


  function abrirModal(tipo = "income", id = null) {

    if (!transactionModal) return;

    editandoId = id;

    const typeField =
      document.getElementById("transactionType");

    const descriptionField =
      document.getElementById(
        "transactionDescription"
      );

    const amountField =
      document.getElementById(
        "transactionAmount"
      );

    const categoryField =
      document.getElementById(
        "transactionCategory"
      );

    const dateField =
      document.getElementById(
        "transactionDate"
      );

    const message =
      document.getElementById(
        "transactionMessage"
      );


    if (message) {
      message.textContent = "";
    }


    if (id !== null) {

      const lancamentos =
        pegarLancamentos();

      const item =
        lancamentos.find(
          function (lancamento) {
            return lancamento.id === id;
          }
        );


      if (!item) return;


      if (typeField) {
        typeField.value = item.tipo;
      }

      if (descriptionField) {
        descriptionField.value =
          item.descricao;
      }

      if (amountField) {
        amountField.value =
          item.valor;
      }

      if (categoryField) {
        categoryField.value =
          item.categoria;
      }

      if (dateField) {
        dateField.value =
          item.data;
      }

      const titulo =
        transactionModal.querySelector(
          ".modal-header h2"
        );

      if (titulo) {
        titulo.textContent =
          "Editar lançamento";
      }


      if (saveTransactionButton) {
        saveTransactionButton.textContent =
          "Salvar alterações";
      }

    } else {

      if (typeField) {
        typeField.value = tipo;
      }

      if (descriptionField) {
        descriptionField.value = "";
      }

      if (amountField) {
        amountField.value = "";
      }

      if (categoryField) {
        categoryField.value =
          tipo === "income"
            ? "salario"
            : "alimentacao";
      }

      if (dateField) {

        const hoje =
          new Date()
            .toISOString()
            .split("T")[0];

        dateField.value = hoje;

      }


      const titulo =
        transactionModal.querySelector(
          ".modal-header h2"
        );

      if (titulo) {
        titulo.textContent =
          "Novo lançamento";
      }


      if (saveTransactionButton) {
        saveTransactionButton.textContent =
          "Salvar lançamento";
      }

    }


    transactionModal.classList.remove("hidden");

  }


  function fecharModal() {

    transactionModal?.classList.add(
      "hidden"
    );

    editandoId = null;

  }


  closeTransactionModal?.addEventListener(
    "click",
    fecharModal
  );


  cancelTransactionButton?.addEventListener(
    "click",
    fecharModal
  );


  // =========================================================
  // BOTÕES DE RECEITA / DESPESA
  // =========================================================

  document
    .getElementById("quickIncomeButton")
    ?.addEventListener(
      "click",
      function () {
        abrirModal("income");
      }
    );


  document
    .getElementById("quickExpenseButton")
    ?.addEventListener(
      "click",
      function () {
        abrirModal("expense");
      }
    );


  document
    .getElementById("newTransactionButton")
    ?.addEventListener(
      "click",
      function () {
        abrirModal("income");
      }
    );


  // =========================================================
  // SALVAR LANÇAMENTO
  // =========================================================

  saveTransactionButton?.addEventListener(
    "click",
    function () {

      const tipo =
        document.getElementById(
          "transactionType"
        )?.value;


      const descricao =
        document.getElementById(
          "transactionDescription"
        )?.value.trim();


      const valorTexto =
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


      const mensagem =
        document.getElementById(
          "transactionMessage"
        );


      const valor =
        Number(
          String(valorTexto || "")
            .replace(",", ".")
        );


      if (!descricao) {

        mostrarMensagem(
          mensagem,
          "Digite uma descrição."
        );

        return;

      }


      if (!valor || valor <= 0) {

        mostrarMensagem(
          mensagem,
          "Digite um valor válido."
        );

        return;

      }


      if (!data) {

        mostrarMensagem(
          mensagem,
          "Escolha uma data."
        );

        return;

      }


      let lancamentos =
        pegarLancamentos();


      if (editandoId !== null) {

        const indice =
          lancamentos.findIndex(
            function (item) {
              return item.id === editandoId;
            }
          );


        if (indice !== -1) {

          lancamentos[indice] = {

            ...lancamentos[indice],

            tipo: tipo,

            descricao: descricao,

            valor: valor,

            categoria: categoria,

            data: data

          };

        }

      } else {

        const novoLancamento = {

          id:
            Date.now() +
            Math.floor(
              Math.random() * 10000
            ),

          tipo: tipo,

          descricao: descricao,

          valor: valor,

          categoria: categoria,

          data: data,

          criadoEm:
            new Date().toISOString()

        };


        lancamentos.push(
          novoLancamento
        );

      }


      salvarLancamentos(
        lancamentos
      );


      fecharModal();


      atualizarDashboard();
      atualizarTabela();
      atualizarRelatorio();
      atualizarGraficos();

    }
  );


  // =========================================================
  // BOTÃO VER TODOS
  // =========================================================

  document
    .getElementById("viewTransactionsButton")
    ?.addEventListener(
      "click",
      function () {

        menuItems.forEach(function (item) {
          item.classList.remove("active");
        });


        const transactionMenu =
          document.querySelector(
            '[data-section="transactions"]'
          );


        transactionMenu?.classList.add(
          "active"
        );


        sections.forEach(function (section) {
          section.classList.remove(
            "active-section"
          );
        });


        document
          .getElementById("transactions")
          ?.classList.add(
            "active-section"
          );


        atualizarTabela();

      }
    );


  // =========================================================
  // DASHBOARD
  // =========================================================

  function atualizarDashboard() {

    const lancamentos =
      pegarLancamentos();


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(
      function (item) {

        const valor =
          Number(item.valor) || 0;


        if (item.tipo === "income") {

          receitas += valor;

        }


        if (item.tipo === "expense") {

          despesas += valor;

        }

      }
    );


    const saldo =
      receitas - despesas;


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
        dinheiro(receitas);
    }


    if (totalExpense) {
      totalExpense.textContent =
        dinheiro(despesas);
    }


    if (totalBalance) {
      totalBalance.textContent =
        dinheiro(saldo);
    }


    if (totalTransactions) {
      totalTransactions.textContent =
        lancamentos.length;
    }


    atualizarLancamentosRecentes();

  }


  // =========================================================
  // LANÇAMENTOS RECENTES
  // =========================================================

  function atualizarLancamentosRecentes() {

    const container =
      document.getElementById(
        "recentTransactions"
      );


    if (!container) return;


    const lancamentos =
      pegarLancamentos();


    if (lancamentos.length === 0) {

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
        .sort(
          function (a, b) {
            return Number(b.id) - Number(a.id);
          }
        )
        .slice(0, 5);


    container.innerHTML =
      recentes.map(
        function (item) {

          const receita =
            item.tipo === "income";


          const sinal =
            receita ? "+" : "-";


          const classe =
            receita
              ? "income"
              : "expense";


          return `

            <div class="transaction-row">

              <div class="transaction-info">

                <div class="transaction-icon ${classe}">
                  ${receita ? "↑" : "↓"}
                </div>

                <div>

                  <div class="transaction-description">
                    ${escaparHTML(item.descricao)}
                  </div>

                  <div class="transaction-date">
                    ${formatarData(item.data)}
                  </div>

                </div>

              </div>

              <div class="transaction-value ${classe}">
                ${sinal} ${dinheiro(item.valor)}
              </div>

            </div>

          `;

        }
      ).join("");

  }


  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatarData(data) {

    if (!data) return "—";


    const partes =
      data.split("-");


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


  // =========================================================
  // TABELA DE LANÇAMENTOS
  // =========================================================

  const transactionSearch =
    document.getElementById(
      "transactionSearch"
    );


  const transactionTypeFilter =
    document.getElementById(
      "transactionTypeFilter"
    );


  const transactionCategoryFilter =
    document.getElementById(
      "transactionCategoryFilter"
    );


  function atualizarCategoriasFiltro() {

    if (!transactionCategoryFilter) {
      return;
    }


    const lancamentos =
      pegarLancamentos();


    const categorias =
      [...new Set(
        lancamentos
          .map(
            function (item) {
              return item.categoria;
            }
          )
          .filter(Boolean)
      )];


    const nomes = {

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


    transactionCategoryFilter.innerHTML =
      `<option value="all">Todas as categorias</option>`;


    categorias
      .sort()
      .forEach(
        function (categoria) {

          const option =
            document.createElement("option");


          option.value =
            categoria;


          option.textContent =
            nomes[categoria] ||
            categoria;


          transactionCategoryFilter.appendChild(
            option
          );

        }
      );

  }


  function atualizarTabela() {

    const tbody =
      document.getElementById(
        "transactionsTableBody"
      );


    if (!tbody) return;


    atualizarCategoriasFiltro();


    const busca =
      transactionSearch
        ?.value
        .trim()
        .toLowerCase() || "";


    const tipoFiltro =
      transactionTypeFilter
        ?.value || "all";


    const categoriaFiltro =
      transactionCategoryFilter
        ?.value || "all";


    let lancamentos =
      pegarLancamentos();


    lancamentos =
      lancamentos
        .slice()
        .sort(
          function (a, b) {
            return Number(b.id) - Number(a.id);
          }
        );


    lancamentos =
      lancamentos.filter(
        function (item) {

          const correspondeBusca =
            !busca ||
            String(item.descricao || "")
              .toLowerCase()
              .includes(busca);


          const correspondeTipo =
            tipoFiltro === "all" ||
            item.tipo === tipoFiltro;


          const correspondeCategoria =
            categoriaFiltro === "all" ||
            item.categoria === categoriaFiltro;


          return (
            correspondeBusca &&
            correspondeTipo &&
            correspondeCategoria
          );

        }
      );


    if (lancamentos.length === 0) {

      tbody.innerHTML = `

        <tr>

          <td colspan="6" style="text-align:center;">
            Nenhum lançamento encontrado.
          </td>

        </tr>

      `;

      return;

    }


    const nomesCategorias = {

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


    tbody.innerHTML =
      lancamentos.map(
        function (item) {

          const receita =
            item.tipo === "income";


          const tipoTexto =
            receita
              ? "Receita"
              : "Despesa";


          const classe =
            receita
              ? "income"
              : "expense";


          return `

            <tr>

              <td>
                ${formatarData(item.data)}
              </td>

              <td>
                ${escaparHTML(item.descricao)}
              </td>

              <td>
                ${escaparHTML(
                  nomesCategorias[item.categoria] ||
                  item.categoria ||
                  "Outros"
                )}
              </td>

              <td>
                <span class="${classe}">
                  ${tipoTexto}
                </span>
              </td>

              <td>
                <strong class="${classe}">
                  ${receita ? "+" : "-"}
                  ${dinheiro(item.valor)}
                </strong>
              </td>

              <td>

                <button
                  type="button"
                  class="edit-transaction-button"
                  data-id="${item.id}"
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="delete-transaction-button"
                  data-id="${item.id}"
                >
                  Excluir
                </button>

              </td>

            </tr>

          `;

        }
      ).join("");


    // =======================================================
    // BOTÕES EDITAR
    // =======================================================

    tbody
      .querySelectorAll(
        ".edit-transaction-button"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const id =
                Number(
                  button.dataset.id
                );


              abrirModal(
                "income",
                id
              );

            }
          );

        }
      );


    // =======================================================
    // BOTÕES EXCLUIR
    // =======================================================

    tbody
      .querySelectorAll(
        ".delete-transaction-button"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const id =
                Number(
                  button.dataset.id
                );


              const confirmar =
                confirm(
                  "Deseja realmente excluir este lançamento?"
                );


              if (!confirmar) {
                return;
              }


              let dados =
                pegarLancamentos();


              dados =
                dados.filter(
                  function (item) {
                    return item.id !== id;
                  }
                );


              salvarLancamentos(dados);


              atualizarDashboard();
              atualizarTabela();
              atualizarRelatorio();
              atualizarGraficos();

            }
          );

        }
      );

  }


  transactionSearch?.addEventListener(
    "input",
    atualizarTabela
  );


  transactionTypeFilter?.addEventListener(
    "change",
    atualizarTabela
  );


  transactionCategoryFilter?.addEventListener(
    "change",
    atualizarTabela
  );


  // =========================================================
  // RELATÓRIO
  // =========================================================

  function atualizarRelatorio() {

    const container =
      document.getElementById(
        "reportSummary"
      );


    if (!container) return;


    const lancamentos =
      pegarLancamentos();


    if (lancamentos.length === 0) {

      container.innerHTML = `

        <p>
          Ainda não existem dados suficientes para gerar o relatório.
        </p>

      `;

      return;

    }


    let receitas = 0;
    let despesas = 0;


    const categorias = {};


    lancamentos.forEach(
      function (item) {

        const valor =
          Number(item.valor) || 0;


        if (item.tipo === "income") {

          receitas += valor;

        }


        if (item.tipo === "expense") {

          despesas += valor;


          const categoria =
            item.categoria || "outros";


          categorias[categoria] =
            (categorias[categoria] || 0) +
            valor;

        }

      }
    );


    const saldo =
      receitas - despesas;


    const maiorCategoria =
      Object.entries(categorias)
        .sort(
          function (a, b) {
            return b[1] - a[1];
          }
        )[0];


    const nomes = {

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


    container.innerHTML = `

      <div class="report-item">

        <span>Total de receitas</span>

        <strong>
          ${dinheiro(receitas)}
        </strong>

      </div>


      <div class="report-item">

        <span>Total de despesas</span>

        <strong>
          ${dinheiro(despesas)}
        </strong>

      </div>


      <div class="report-item">

        <span>Saldo</span>

        <strong>
          ${dinheiro(saldo)}
        </strong>

      </div>


      <div class="report-item">

        <span>Maior categoria de despesa</span>

        <strong>
          ${
            maiorCategoria
              ? nomes[maiorCategoria[0]] ||
                maiorCategoria[0]
              : "—"
          }
        </strong>

      </div>

    `;

  }


  // =========================================================
  // GRÁFICOS
  // =========================================================

  let financeChart = null;
  let categoryChart = null;


  function atualizarGraficos() {

    if (
      typeof Chart === "undefined"
    ) {

      console.warn(
        "Chart.js não foi carregado."
      );

      return;

    }


    criarGraficoFinanceiro();
    criarGraficoCategorias();

  }


  function criarGraficoFinanceiro() {

    const canvas =
      document.getElementById(
        "financeChart"
      );


    if (!canvas) return;


    const lancamentos =
      pegarLancamentos();


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(
      function (item) {

        const valor =
          Number(item.valor) || 0;


        if (item.tipo === "income") {
          receitas += valor;
        }


        if (item.tipo === "expense") {
          despesas += valor;
        }

      }
    );


    if (financeChart) {
      financeChart.destroy();
    }


    financeChart =
      new Chart(
        canvas.getContext("2d"),
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
                  receitas,
                  despesas
                ]

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: false
              }

            }

          }

        }
      );

  }


  function criarGraficoCategorias() {

    const canvas =
      document.getElementById(
        "categoryChart"
      );


    if (!canvas) return;


    const lancamentos =
      pegarLancamentos();


    const categorias = {};


    lancamentos.forEach(
      function (item) {

        if (item.tipo !== "expense") {
          return;
        }


        const categoria =
          item.categoria || "outros";


        categorias[categoria] =
          (categorias[categoria] || 0) +
          Number(item.valor || 0);

      }
    );


    const nomes = {

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


    const labels =
      Object.keys(categorias)
        .map(
          function (categoria) {
            return nomes[categoria] ||
              categoria;
          }
        );


    const valores =
      Object.values(categorias);


    if (categoryChart) {
      categoryChart.destroy();
    }


    categoryChart =
      new Chart(
        canvas.getContext("2d"),
        {

          type: "doughnut",

          data: {

            labels: labels,

            datasets: [

              {

                data: valores

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false

          }

        }
      );

  }


  // =========================================================
  // PERÍODO DO DASHBOARD
  // =========================================================

  const dashboardPeriod =
    document.getElementById(
      "dashboardPeriod"
    );


  dashboardPeriod?.addEventListener(
    "change",
    function () {

      atualizarDashboard();

    }
  );


  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  atualizarCampoEmpresa();


  const usuarioInicial =
    pegarUsuario();


  const estaLogado =
    localStorage.getItem(
      LOGGED_KEY
    ) === "true";


  if (
    usuarioInicial &&
    estaLogado
  ) {

    abrirSistema(
      usuarioInicial
    );

  } else {

    authScreen?.classList.remove(
      "hidden"
    );

    appScreen?.classList.add(
      "hidden"
    );

    mostrarLogin();

  }


});

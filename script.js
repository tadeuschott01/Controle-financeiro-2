document.addEventListener("DOMContentLoaded", function () {

  // ==========================================================
  // AUTENTICAÇÃO
  // ==========================================================

  const authScreen = document.getElementById("authScreen");
  const appScreen = document.getElementById("appScreen");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const showRegisterButton = document.getElementById("showRegisterButton");
  const showLoginButton = document.getElementById("showLoginButton");

  const registerButton = document.getElementById("registerButton");
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");


  // ==========================================================
  // FUNÇÕES AUXILIARES
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


  function gerarId() {

    return Date.now().toString() +
      Math.random().toString(36).substring(2, 9);
  }


  // ==========================================================
  // USUÁRIO
  // ==========================================================

  function pegarUsuario() {

    const dados = localStorage.getItem(
      "controleFinanceiroUsuario"
    );

    if (!dados) return null;

    try {

      return JSON.parse(dados);

    } catch (erro) {

      console.error("Erro ao ler usuário:", erro);

      return null;
    }
  }


  // ==========================================================
  // LANÇAMENTOS
  // ==========================================================

  function pegarLancamentos() {

    const dados = localStorage.getItem(
      "controleFinanceiroLancamentos"
    );

    if (!dados) return [];

    try {

      const lista = JSON.parse(dados);

      if (!Array.isArray(lista)) {
        return [];
      }

      return lista;

    } catch (erro) {

      console.error("Erro ao ler lançamentos:", erro);

      return [];
    }
  }


  function salvarLancamentos(lancamentos) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(lancamentos)
    );
  }


  // ==========================================================
  // LOGIN / CADASTRO
  // ==========================================================

  showRegisterButton?.addEventListener("click", function () {

    loginForm?.classList.add("hidden");
    registerForm?.classList.remove("hidden");

    if (registerMessage) {
      registerMessage.textContent = "";
    }
  });


  showLoginButton?.addEventListener("click", function () {

    registerForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");

    if (loginMessage) {
      loginMessage.textContent = "";
    }
  });


  registerButton?.addEventListener("click", function (event) {

    event.preventDefault();

    const nome =
      document.getElementById("registerName")?.value.trim();

    const email =
      document.getElementById("registerEmail")?.value.trim();

    const senha =
      document.getElementById("registerPassword")?.value;

    const tipo =
      document.getElementById("registerAccountType")?.value ||
      "pessoal";

    const empresa =
      document.getElementById("registerCompany")?.value.trim() ||
      "";


    if (!nome) {
      mostrarMensagem(
        registerMessage,
        "Digite seu nome."
      );
      return;
    }


    if (!email || !email.includes("@")) {
      mostrarMensagem(
        registerMessage,
        "Digite um e-mail válido."
      );
      return;
    }


    if (!senha || senha.length < 6) {
      mostrarMensagem(
        registerMessage,
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }


    const usuario = {
      nome,
      email,
      senha,
      tipo,
      empresa,
      criadoEm: new Date().toISOString()
    };


    try {

      localStorage.setItem(
        "controleFinanceiroUsuario",
        JSON.stringify(usuario)
      );

      localStorage.setItem(
        "controleFinanceiroLancamentos",
        JSON.stringify([])
      );

    } catch (erro) {

      console.error(erro);

      mostrarMensagem(
        registerMessage,
        "Não foi possível salvar a conta."
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

      registerForm?.classList.add("hidden");
      loginForm?.classList.remove("hidden");

      if (registerMessage) {
        registerMessage.textContent = "";
      }

    }, 1000);

  });


  loginButton?.addEventListener("click", function (event) {

    event.preventDefault();

    const email =
      document.getElementById("loginEmail")?.value.trim();

    const senha =
      document.getElementById("loginPassword")?.value;


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
        "Nenhuma conta cadastrada."
      );

      return;
    }


    if (
      email.toLowerCase() !==
      String(usuario.email).toLowerCase() ||
      senha !== usuario.senha
    ) {

      mostrarMensagem(
        loginMessage,
        "E-mail ou senha incorretos."
      );

      return;
    }


    localStorage.setItem(
      "controleFinanceiroLogado",
      "true"
    );


    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


    abrirSistema(usuario);

  });


  // ==========================================================
  // ABRIR SISTEMA
  // ==========================================================

  function abrirSistema(usuario) {

    const userName =
      document.getElementById("userName");

    if (userName) {
      userName.textContent = usuario.nome;
    }


    const profileName =
      document.getElementById("profileName");

    if (profileName) {
      profileName.textContent = usuario.nome;
    }


    const profileEmail =
      document.getElementById("profileEmail");

    if (profileEmail) {
      profileEmail.textContent = usuario.email;
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


    atualizarTudo();
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  logoutButton?.addEventListener("click", function () {

    localStorage.removeItem(
      "controleFinanceiroLogado"
    );

    appScreen?.classList.add("hidden");
    authScreen?.classList.remove("hidden");

    registerForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");

  });


  // ==========================================================
  // MENU
  // ==========================================================

  const menuItems =
    document.querySelectorAll(".menu-item");

  const sections =
    document.querySelectorAll(".content-section");


  menuItems.forEach(function (button) {

    button.addEventListener("click", function () {

      const sectionName =
        button.dataset.section;


      menuItems.forEach(function (item) {
        item.classList.remove("active");
      });


      button.classList.add("active");


      sections.forEach(function (section) {
        section.classList.remove("active-section");
      });


      const section =
        document.getElementById(sectionName);


      if (section) {
        section.classList.add("active-section");
      }


      // Fecha menu no celular
      const sidebar =
        document.querySelector(".sidebar");

      sidebar?.classList.remove("mobile-open");


      if (sectionName === "transactions") {
        renderizarTabela();
      }

      if (sectionName === "reports") {
        atualizarRelatorio();
      }

    });

  });


  // ==========================================================
  // MENU MOBILE
  // ==========================================================

  const mobileMenuButton =
    document.getElementById("mobileMenuButton");

  const sidebar =
    document.querySelector(".sidebar");


  mobileMenuButton?.addEventListener("click", function () {

    sidebar?.classList.toggle("mobile-open");

  });


  // ==========================================================
  // MODAL
  // ==========================================================

  const transactionModal =
    document.getElementById("transactionModal");

  const closeTransactionModal =
    document.getElementById("closeTransactionModal");

  const cancelTransactionButton =
    document.getElementById("cancelTransactionButton");

  const saveTransactionButton =
    document.getElementById("saveTransactionButton");


  let idEditando = null;


  function abrirModal(tipo = "income", id = null) {

    idEditando = id;


    const type =
      document.getElementById("transactionType");

    const description =
      document.getElementById("transactionDescription");

    const amount =
      document.getElementById("transactionAmount");

    const category =
      document.getElementById("transactionCategory");

    const date =
      document.getElementById("transactionDate");


    if (id) {

      const lancamentos =
        pegarLancamentos();

      const item =
        lancamentos.find(function (l) {
          return String(l.id) === String(id);
        });


      if (!item) {
        alert("Lançamento não encontrado.");
        return;
      }


      if (type) {
        type.value = item.tipo;
      }

      if (description) {
        description.value = item.descricao || "";
      }

      if (amount) {
        amount.value = item.valor || "";
      }

      if (category) {
        category.value = item.categoria || "outros";
      }

      if (date) {
        date.value = item.dataISO || "";
      }

    } else {

      if (type) {
        type.value = tipo;
      }

      if (description) {
        description.value = "";
      }

      if (amount) {
        amount.value = "";
      }

      if (category) {
        category.value = "salario";
      }

      if (date) {

        const hoje =
          new Date().toISOString().split("T")[0];

        date.value = hoje;
      }

    }


    const titulo =
      transactionModal?.querySelector("h2");

    if (titulo) {
      titulo.textContent =
        id ? "Editar lançamento" : "Novo lançamento";
    }


    if (transactionModal) {
      transactionModal.classList.remove("hidden");
    }

  }


  function fecharModal() {

    transactionModal?.classList.add("hidden");

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
  // BOTÕES NOVO LANÇAMENTO
  // ==========================================================

  document
    .getElementById("quickIncomeButton")
    ?.addEventListener("click", function () {

      abrirModal("income");

    });


  document
    .getElementById("quickExpenseButton")
    ?.addEventListener("click", function () {

      abrirModal("expense");

    });


  document
    .getElementById("newTransactionButton")
    ?.addEventListener("click", function () {

      abrirModal("income");

    });


  // ==========================================================
  // SALVAR / EDITAR LANÇAMENTO
  // ==========================================================

  saveTransactionButton?.addEventListener(
    "click",
    function () {

      const tipo =
        document.getElementById("transactionType")?.value;

      const descricao =
        document
          .getElementById("transactionDescription")
          ?.value.trim();

      const valorCampo =
        document
          .getElementById("transactionAmount")
          ?.value;

      const categoria =
        document.getElementById("transactionCategory")?.value;

      const data =
        document.getElementById("transactionDate")?.value;


      const valor =
        Number(
          String(valorCampo || "")
            .replace(",", ".")
        );


      if (!descricao) {

        alert("Digite uma descrição.");

        return;
      }


      if (!valor || valor <= 0) {

        alert("Digite um valor válido.");

        return;
      }


      if (!data) {

        alert("Escolha uma data.");

        return;
      }


      let lancamentos =
        pegarLancamentos();


      // ======================================================
      // EDITAR
      // ======================================================

      if (idEditando !== null) {

        const indice =
          lancamentos.findIndex(function (item) {

            return String(item.id) ===
              String(idEditando);

          });


        if (indice === -1) {

          alert("Lançamento não encontrado.");

          return;
        }


        lancamentos[indice] = {

          ...lancamentos[indice],

          tipo: tipo,

          descricao: descricao,

          valor: valor,

          categoria: categoria,

          dataISO: data,

          data: formatarData(data)

        };


      } else {

        // ====================================================
        // NOVO
        // ====================================================

        lancamentos.push({

          id: gerarId(),

          tipo: tipo,

          descricao: descricao,

          valor: valor,

          categoria: categoria,

          dataISO: data,

          data: formatarData(data),

          criadoEm: new Date().toISOString()

        });

      }


      salvarLancamentos(lancamentos);


      fecharModal();


      atualizarTudo();

    }
  );


  // ==========================================================
  // FORMATAR DATA
  // ==========================================================

  function formatarData(data) {

    if (!data) return "";

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


  // ==========================================================
  // TABELA
  // ==========================================================

  function renderizarTabela() {

    const tbody =
      document.getElementById(
        "transactionsTableBody"
      );


    if (!tbody) return;


    let lancamentos =
      pegarLancamentos();


    const pesquisa =
      document
        .getElementById("transactionSearch")
        ?.value
        .toLowerCase()
        .trim() || "";


    const filtroTipo =
      document
        .getElementById("transactionTypeFilter")
        ?.value || "all";


    const filtroCategoria =
      document
        .getElementById("transactionCategoryFilter")
        ?.value || "all";


    lancamentos =
      lancamentos.filter(function (item) {

        const texto =
          (
            String(item.descricao || "") +
            " " +
            String(item.categoria || "")
          ).toLowerCase();


        if (
          pesquisa &&
          !texto.includes(pesquisa)
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
          item.categoria !== filtroCategoria
        ) {
          return false;
        }


        return true;

      });


    if (lancamentos.length === 0) {

      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:30px;">
            Nenhum lançamento encontrado.
          </td>
        </tr>
      `;

      return;
    }


    tbody.innerHTML =
      lancamentos.map(function (item) {

        const tipoTexto =
          item.tipo === "income"
            ? "Receita"
            : "Despesa";


        const sinal =
          item.tipo === "income"
            ? "+"
            : "-";


        const valor =
          dinheiro(item.valor);


        return `
          <tr>

            <td>
              ${item.data || formatarData(item.dataISO)}
            </td>

            <td>
              ${escaparHTML(item.descricao)}
            </td>

            <td>
              ${nomeCategoria(item.categoria)}
            </td>

            <td>
              ${tipoTexto}
            </td>

            <td class="${item.tipo}">
              ${sinal} ${valor}
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

      }).join("");

  }


  // ==========================================================
  // ESCAPAR HTML
  // ==========================================================

  function escaparHTML(texto) {

    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  // ==========================================================
  // CATEGORIAS
  // ==========================================================

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


    return categorias[categoria] ||
      categoria ||
      "Outros";

  }


  // ==========================================================
  // EDITAR E EXCLUIR
  // ==========================================================
  //
  // IMPORTANTE:
  // Usamos EVENT DELEGATION.
  // Isso faz os botões funcionarem mesmo depois
  // que a tabela é recriada pelo JavaScript.
  // ==========================================================

  const transactionsTableBody =
    document.getElementById(
      "transactionsTableBody"
    );


  transactionsTableBody?.addEventListener(
    "click",
    function (event) {

      const botaoEditar =
        event.target.closest(
          ".edit-transaction-button"
        );


      const botaoExcluir =
        event.target.closest(
          ".delete-transaction-button"
        );


      // ======================================================
      // EDITAR
      // ======================================================

      if (botaoEditar) {

        const id =
          botaoEditar.getAttribute("data-id");


        if (!id) {
          alert("ID do lançamento não encontrado.");
          return;
        }


        abrirModal(null, id);

        return;
      }


      // ======================================================
      // EXCLUIR
      // ======================================================

      if (botaoExcluir) {

        const id =
          botaoExcluir.getAttribute("data-id");


        if (!id) {
          alert("ID do lançamento não encontrado.");
          return;
        }


        const confirmou =
          confirm(
            "Tem certeza que deseja excluir este lançamento?"
          );


        if (!confirmou) {
          return;
        }


        let lancamentos =
          pegarLancamentos();


        const quantidadeAntes =
          lancamentos.length;


        lancamentos =
          lancamentos.filter(function (item) {

            return String(item.id) !==
              String(id);

          });


        if (
          lancamentos.length ===
          quantidadeAntes
        ) {

          alert(
            "Não foi possível encontrar o lançamento para excluir."
          );

          return;
        }


        salvarLancamentos(lancamentos);


        atualizarTudo();


        alert("Lançamento excluído com sucesso.");

      }

    }
  );


  // ==========================================================
  // FILTROS
  // ==========================================================

  document
    .getElementById("transactionSearch")
    ?.addEventListener(
      "input",
      renderizarTabela
    );


  document
    .getElementById("transactionTypeFilter")
    ?.addEventListener(
      "change",
      renderizarTabela
    );


  document
    .getElementById("transactionCategoryFilter")
    ?.addEventListener(
      "change",
      renderizarTabela
    );


  // ==========================================================
  // CATEGORIAS DO FILTRO
  // ==========================================================

  function atualizarFiltroCategorias() {

    const select =
      document.getElementById(
        "transactionCategoryFilter"
      );


    if (!select) return;


    const categorias = [

      ["salario", "Salário"],
      ["alimentacao", "Alimentação"],
      ["moradia", "Moradia"],
      ["transporte", "Transporte"],
      ["saude", "Saúde"],
      ["educacao", "Educação"],
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


    categorias.forEach(function (categoria) {

      const option =
        document.createElement("option");

      option.value =
        categoria[0];

      option.textContent =
        categoria[1];

      select.appendChild(option);

    });


    select.value =
      valorAtual || "all";

  }


  // ==========================================================
  // DASHBOARD
  // ==========================================================

  function atualizarDashboard() {

    const lancamentos =
      pegarLancamentos();


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {
        receitas += valor;
      }


      if (item.tipo === "expense") {
        despesas += valor;
      }

    });


    const saldo =
      receitas - despesas;


    const totalIncome =
      document.getElementById("totalIncome");

    const totalExpense =
      document.getElementById("totalExpense");

    const totalBalance =
      document.getElementById("totalBalance");

    const totalTransactions =
      document.getElementById("totalTransactions");


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


  // ==========================================================
  // LANÇAMENTOS RECENTES
  // ==========================================================

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
          <p>Nenhum lançamento cadastrado.</p>
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
        .reverse()
        .slice(0, 5);


    container.innerHTML =
      recentes.map(function (item) {

        const classe =
          item.tipo === "income"
            ? "income"
            : "expense";


        const sinal =
          item.tipo === "income"
            ? "+"
            : "-";


        return `
          <div class="transaction-row">

            <div class="transaction-info">

              <div class="transaction-icon ${classe}">
                ${item.tipo === "income" ? "↑" : "↓"}
              </div>

              <div>

                <div class="transaction-description">
                  ${escaparHTML(item.descricao)}
                </div>

                <div class="transaction-date">
                  ${item.data || ""}
                </div>

              </div>

            </div>

            <div class="transaction-value ${classe}">
              ${sinal} ${dinheiro(item.valor)}
            </div>

          </div>
        `;

      }).join("");

  }


  // ==========================================================
  // RELATÓRIO
  // ==========================================================

  function atualizarRelatorio() {

    const container =
      document.getElementById(
        "reportSummary"
      );


    if (!container) return;


    const lancamentos =
      pegarLancamentos();


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {
        receitas += valor;
      }


      if (item.tipo === "expense") {
        despesas += valor;
      }

    });


    const saldo =
      receitas - despesas;


    container.innerHTML = `
      <div style="padding:10px 0;">
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


  // ==========================================================
  // ATUALIZAR TUDO
  // ==========================================================

  function atualizarTudo() {

    atualizarDashboard();

    atualizarFiltroCategorias();

    renderizarTabela();

    atualizarRelatorio();

  }


  // ==========================================================
  // BOTÃO "VER TODOS"
  // ==========================================================

  document
    .getElementById("viewTransactionsButton")
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

  const usuario =
    pegarUsuario();


  const logado =
    localStorage.getItem(
      "controleFinanceiroLogado"
    );


  if (usuario && logado === "true") {

    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");

    abrirSistema(usuario);

  } else {

    authScreen?.classList.remove("hidden");
    appScreen?.classList.add("hidden");

  }


  atualizarTudo();

});

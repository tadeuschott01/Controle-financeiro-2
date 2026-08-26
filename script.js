/* =========================================================
   CONTROLE FINANCEIRO
   SCRIPT PRINCIPAL COMPLETO
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =======================================================
     ELEMENTOS PRINCIPAIS
     ======================================================= */

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

  const loginMessage =
    document.getElementById("loginMessage");

  const registerMessage =
    document.getElementById("registerMessage");

  const transactionMessage =
    document.getElementById("transactionMessage");


  /* =======================================================
     UTILIDADES
     ======================================================= */

  function mostrarMensagem(elemento, mensagem, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";
  }


  function dinheiro(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }


  function escaparHTML(texto) {

    if (texto === null || texto === undefined) {
      return "";
    }

    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function gerarId() {

    return Date.now() + Math.floor(Math.random() * 1000);
  }


  /* =======================================================
     USUÁRIO
     ======================================================= */

  function pegarUsuario() {

    const dados =
      localStorage.getItem(
        "controleFinanceiroUsuario"
      );

    if (!dados) {
      return null;
    }

    try {

      return JSON.parse(dados);

    } catch (erro) {

      console.error(
        "Erro ao ler usuário:",
        erro
      );

      localStorage.removeItem(
        "controleFinanceiroUsuario"
      );

      return null;
    }
  }


  function salvarUsuario(usuario) {

    localStorage.setItem(
      "controleFinanceiroUsuario",
      JSON.stringify(usuario)
    );
  }


  /* =======================================================
     LANÇAMENTOS
     ======================================================= */

  function pegarLancamentos() {

    const dados =
      localStorage.getItem(
        "controleFinanceiroLancamentos"
      );

    if (!dados) {
      return [];
    }

    try {

      const lista = JSON.parse(dados);

      if (!Array.isArray(lista)) {
        return [];
      }

      return lista;

    } catch (erro) {

      console.error(
        "Erro ao ler lançamentos:",
        erro
      );

      return [];
    }
  }


  function salvarLancamentos(lancamentos) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(lancamentos)
    );
  }


  /* =======================================================
     LOGIN / CADASTRO
     ======================================================= */

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


  /* =======================================================
     TIPO DE CONTA
     ======================================================= */

  const registerAccountType =
    document.getElementById(
      "registerAccountType"
    );

  const companyField =
    document.getElementById(
      "companyField"
    );


  registerAccountType?.addEventListener(
    "change",
    function () {

      if (
        this.value === "empresa" ||
        this.value === "ambos"
      ) {

        companyField?.classList.remove("hidden");

      } else {

        companyField?.classList.add("hidden");

      }

    }
  );


  /* =======================================================
     CADASTRAR CONTA
     ======================================================= */

  registerButton?.addEventListener(
    "click",
    function (event) {

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
          ?.value || "pessoal";

      const empresa =
        document
          .getElementById("registerCompany")
          ?.value
          .trim() || "";


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


      if (!email.includes("@")) {

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


      const usuarioExistente =
        pegarUsuario();


      if (
        usuarioExistente &&
        usuarioExistente.email &&
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

        salvarUsuario(usuario);

        salvarLancamentos([]);

      } catch (erro) {

        console.error(
          "Erro ao criar conta:",
          erro
        );

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
        document.getElementById(
          "loginEmail"
        );

      if (loginEmail) {
        loginEmail.value = email;
      }


      setTimeout(
        function () {

          mostrarLogin();

          if (loginEmail) {
            loginEmail.value = email;
          }

        },
        1000
      );

    }
  );


  /* =======================================================
     LOGIN
     ======================================================= */

  loginButton?.addEventListener(
    "click",
    function (event) {

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


      const usuario =
        pegarUsuario();


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
        "controleFinanceiroLogado",
        "true"
      );


      abrirSistema(usuario);

    }
  );


  /* =======================================================
     ABRIR SISTEMA
     ======================================================= */

  function abrirSistema(usuario) {

    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


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


    const tipos = {

      pessoal: "Pessoal",

      empresa: "Empresa",

      ambos: "Pessoal + Empresa"

    };


    const profileAccountType =
      document.getElementById(
        "profileAccountType"
      );

    if (profileAccountType) {

      profileAccountType.textContent =
        tipos[usuario.tipo] || "Pessoal";
    }


    const profileCompany =
      document.getElementById(
        "profileCompany"
      );

    if (profileCompany) {

      profileCompany.textContent =
        usuario.empresa || "—";
    }


    atualizarTudo();
  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  logoutButton?.addEventListener(
    "click",
    function () {

      localStorage.removeItem(
        "controleFinanceiroLogado"
      );

      appScreen?.classList.add("hidden");
      authScreen?.classList.remove("hidden");

      mostrarLogin();

    }
  );


  /* =======================================================
     MENU
     ======================================================= */

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


          /* Fecha menu no celular */

          const sidebar =
            document.querySelector(
              ".sidebar"
            );

          sidebar?.classList.remove(
            "mobile-open"
          );


          if (
            sectionName === "transactions"
          ) {

            atualizarTabela();

          }


          if (
            sectionName === "reports"
          ) {

            atualizarRelatorios();

          }

        }
      );

    }
  );


  /* =======================================================
     MENU MOBILE
     ======================================================= */

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


  /* =======================================================
     MODAL
     ======================================================= */

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


  let editandoId = null;


  function abrirModal(tipo = "income", id = null) {

    if (!transactionModal) {
      return;
    }


    editandoId =
      id !== null
        ? Number(id)
        : null;


    const titulo =
      transactionModal.querySelector(
        "h2"
      );


    if (titulo) {

      titulo.textContent =
        editandoId !== null
          ? "Editar lançamento"
          : "Novo lançamento";

    }


    const transactionType =
      document.getElementById(
        "transactionType"
      );

    const transactionDescription =
      document.getElementById(
        "transactionDescription"
      );

    const transactionAmount =
      document.getElementById(
        "transactionAmount"
      );

    const transactionCategory =
      document.getElementById(
        "transactionCategory"
      );

    const transactionDate =
      document.getElementById(
        "transactionDate"
      );


    if (editandoId === null) {

      if (transactionType) {
        transactionType.value =
          tipo || "income";
      }

      if (transactionDescription) {
        transactionDescription.value = "";
      }

      if (transactionAmount) {
        transactionAmount.value = "";
      }

      if (transactionCategory) {
        transactionCategory.value = "salario";
      }

      if (transactionDate) {

        transactionDate.value =
          new Date()
            .toISOString()
            .split("T")[0];

      }

    } else {

      const lancamentos =
        pegarLancamentos();

      const item =
        lancamentos.find(
          function (lancamento) {

            return Number(lancamento.id) ===
              editandoId;

          }
        );


      if (!item) {

        alert(
          "Lançamento não encontrado."
        );

        return;
      }


      if (transactionType) {
        transactionType.value =
          item.tipo;
      }

      if (transactionDescription) {
        transactionDescription.value =
          item.descricao || "";
      }

      if (transactionAmount) {

        transactionAmount.value =
          Number(item.valor);

      }

      if (transactionCategory) {
        transactionCategory.value =
          item.categoria || "outros";
      }

      if (transactionDate) {
        transactionDate.value =
          item.data || "";
      }

    }


    if (transactionMessage) {
      transactionMessage.textContent = "";
    }


    transactionModal.classList.remove(
      "hidden"
    );

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


  /* =======================================================
     BOTÕES DE RECEITA / DESPESA
     ======================================================= */

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


  /* =======================================================
     SALVAR / EDITAR LANÇAMENTO
     ======================================================= */

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
        )?.value
        .trim();


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


      if (!descricao) {

        mostrarMensagem(
          transactionMessage,
          "Digite uma descrição."
        );

        return;
      }


      if (
        valorCampo === "" ||
        valorCampo === null ||
        valorCampo === undefined
      ) {

        mostrarMensagem(
          transactionMessage,
          "Digite um valor."
        );

        return;
      }


      /*
       * Corrige valores digitados.
       * Exemplo:
       * 2200 -> R$ 2.200,00
       * 2.2  -> R$ 2,20
       */

      const valor =
        Number(
          String(valorCampo)
            .replace(",", ".")
        );


      if (
        !Number.isFinite(valor) ||
        valor <= 0
      ) {

        mostrarMensagem(
          transactionMessage,
          "Digite um valor válido maior que zero."
        );

        return;
      }


      if (!data) {

        mostrarMensagem(
          transactionMessage,
          "Informe a data."
        );

        return;
      }


      let lancamentos =
        pegarLancamentos();


      /* ===================================================
         EDITAR
         =================================================== */

      if (editandoId !== null) {

        const indice =
          lancamentos.findIndex(
            function (item) {

              return Number(item.id) ===
                Number(editandoId);

            }
          );


        if (indice === -1) {

          mostrarMensagem(
            transactionMessage,
            "Lançamento não encontrado."
          );

          return;
        }


        lancamentos[indice] = {

          ...lancamentos[indice],

          tipo: tipo,

          descricao: descricao,

          valor: valor,

          categoria: categoria,

          data: data

        };


        salvarLancamentos(
          lancamentos
        );


        fecharModal();

        atualizarTudo();

        return;
      }


      /* ===================================================
         NOVO LANÇAMENTO
         =================================================== */

      const novoLancamento = {

        id: gerarId(),

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


      salvarLancamentos(
        lancamentos
      );


      fecharModal();

      atualizarTudo();

    }
  );


  /* =======================================================
     EXCLUIR LANÇAMENTO
     ======================================================= */

  window.excluirLancamento =
    function (id) {

      const idNumerico =
        Number(id);


      if (!Number.isFinite(idNumerico)) {

        alert(
          "ID do lançamento inválido."
        );

        return;
      }


      const confirmar =
        window.confirm(
          "Tem certeza que deseja excluir este lançamento?"
        );


      if (!confirmar) {
        return;
      }


      try {

        const lancamentos =
          pegarLancamentos();


        const quantidadeAntes =
          lancamentos.length;


        const novosLancamentos =
          lancamentos.filter(
            function (item) {

              return Number(item.id) !==
                idNumerico;

            }
          );


        if (
          novosLancamentos.length ===
          quantidadeAntes
        ) {

          alert(
            "Não foi possível encontrar este lançamento."
          );

          return;
        }


        salvarLancamentos(
          novosLancamentos
        );


        atualizarTudo();

      } catch (erro) {

        console.error(
          "Erro ao excluir:",
          erro
        );

        alert(
          "Erro ao excluir o lançamento."
        );

      }

    };


  /* =======================================================
     EDITAR LANÇAMENTO
     ======================================================= */

  window.editarLancamento =
    function (id) {

      abrirModal(
        "income",
        Number(id)
      );

    };


  /* =======================================================
     TABELA DE LANÇAMENTOS
     ======================================================= */

  function atualizarTabela() {

    const tbody =
      document.getElementById(
        "transactionsTableBody"
      );


    if (!tbody) {
      return;
    }


    const busca =
      document.getElementById(
        "transactionSearch"
      )?.value
      .trim()
      .toLowerCase() || "";


    const filtroTipo =
      document.getElementById(
        "transactionTypeFilter"
      )?.value || "all";


    const filtroCategoria =
      document.getElementById(
        "transactionCategoryFilter"
      )?.value || "all";


    let lancamentos =
      pegarLancamentos();


    lancamentos =
      lancamentos.filter(
        function (item) {

          const correspondeBusca =
            !busca ||
            String(item.descricao || "")
              .toLowerCase()
              .includes(busca) ||
            String(item.categoria || "")
              .toLowerCase()
              .includes(busca);


          const correspondeTipo =
            filtroTipo === "all" ||
            item.tipo === filtroTipo;


          const correspondeCategoria =
            filtroCategoria === "all" ||
            item.categoria === filtroCategoria;


          return (
            correspondeBusca &&
            correspondeTipo &&
            correspondeCategoria
          );

        }
      );


    lancamentos.sort(
      function (a, b) {

        return Number(b.id) -
          Number(a.id);

      }
    );


    if (lancamentos.length === 0) {

      tbody.innerHTML = `

        <tr>

          <td colspan="6"
              style="text-align:center;padding:30px;">

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


            const classe =
              item.tipo === "income"
                ? "income"
                : "expense";


            return `

              <tr>

                <td>
                  ${escaparHTML(
                    formatarData(item.data)
                  )}
                </td>

                <td>
                  ${escaparHTML(
                    item.descricao
                  )}
                </td>

                <td>
                  ${escaparHTML(
                    nomeCategoria(
                      item.categoria
                    )
                  )}
                </td>

                <td>
                  ${tipoTexto}
                </td>

                <td class="${classe}">
                  ${sinal} ${dinheiro(item.valor)}
                </td>

                <td>

                  <button
                    type="button"
                    title="Editar"
                    onclick="editarLancamento(${Number(item.id)})"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    title="Excluir"
                    onclick="excluirLancamento(${Number(item.id)})"
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


  function formatarData(data) {

    if (!data) {
      return "";
    }


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


  /* =======================================================
     FILTROS
     ======================================================= */

  document
    .getElementById(
      "transactionSearch"
    )
    ?.addEventListener(
      "input",
      atualizarTabela
    );


  document
    .getElementById(
      "transactionTypeFilter"
    )
    ?.addEventListener(
      "change",
      atualizarTabela
    );


  document
    .getElementById(
      "transactionCategoryFilter"
    )
    ?.addEventListener(
      "change",
      atualizarTabela
    );


  /* =======================================================
     ATUALIZAR FILTRO DE CATEGORIAS
     ======================================================= */

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


    const categorias =
      [...new Set(
        pegarLancamentos()
          .map(
            function (item) {
              return item.categoria;
            }
          )
          .filter(Boolean)
      )];


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
          categoria;

        option.textContent =
          nomeCategoria(categoria);

        select.appendChild(
          option
        );

      }
    );


    if (
      categorias.includes(
        valorAtual
      )
    ) {

      select.value =
        valorAtual;

    } else {

      select.value =
        "all";

    }

  }


  /* =======================================================
     DASHBOARD
     ======================================================= */

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

    atualizarGraficoFinanceiro();

  }


  /* =======================================================
     LANÇAMENTOS RECENTES
     ======================================================= */

  function atualizarLancamentosRecentes() {

    const container =
      document.getElementById(
        "recentTransactions"
      );


    if (!container) {
      return;
    }


    const lancamentos =
      pegarLancamentos()
        .slice()
        .sort(
          function (a, b) {

            return Number(b.id) -
              Number(a.id);

          }
        )
        .slice(0, 5);


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


    container.innerHTML =
      lancamentos
        .map(
          function (item) {

            const income =
              item.tipo === "income";


            const sinal =
              income ? "+" : "-";


            const classe =
              income
                ? "income"
                : "expense";


            return `

              <div class="transaction-row">

                <div class="transaction-info">

                  <div class="transaction-icon ${classe}">
                    ${income ? "↑" : "↓"}
                  </div>

                  <div>

                    <div class="transaction-description">
                      ${escaparHTML(
                        item.descricao
                      )}
                    </div>

                    <div class="transaction-date">
                      ${escaparHTML(
                        formatarData(item.data)
                      )}
                    </div>

                  </div>

                </div>

                <div class="transaction-value ${classe}">
                  ${sinal} ${dinheiro(item.valor)}
                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     GRÁFICO FINANCEIRO
     ======================================================= */

  let financeChart = null;
  let categoryChart = null;


  function atualizarGraficoFinanceiro() {

    const canvas =
      document.getElementById(
        "financeChart"
      );


    if (!canvas) {
      return;
    }


    if (
      typeof Chart ===
      "undefined"
    ) {

      return;
    }


    const lancamentos =
      pegarLancamentos();


    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez"
    ];


    const receitas =
      new Array(12).fill(0);

    const despesas =
      new Array(12).fill(0);


    lancamentos.forEach(
      function (item) {

        if (!item.data) {
          return;
        }


        const data =
          new Date(
            item.data + "T12:00:00"
          );


        const mes =
          data.getMonth();


        const valor =
          Number(item.valor) || 0;


        if (
          item.tipo ===
          "income"
        ) {

          receitas[mes] +=
            valor;

        } else {

          despesas[mes] +=
            valor;

        }

      }
    );


    if (financeChart) {

      financeChart.destroy();

    }


    financeChart =
      new Chart(
        canvas,
        {
          type: "line",

          data: {

            labels: meses,

            datasets: [

              {
                label: "Receitas",
                data: receitas,
                tension: 0.3
              },

              {
                label: "Despesas",
                data: despesas,
                tension: 0.3
              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: true
              }

            },

            scales: {

              y: {

                beginAtZero: true,

                ticks: {

                  callback:
                    function (value) {

                      return dinheiro(
                        value
                      );

                    }

                }

              }

            }

          }

        }
      );

  }


  /* =======================================================
     RELATÓRIOS
     ======================================================= */

  function atualizarRelatorios() {

    const lancamentos =
      pegarLancamentos();


    const despesasPorCategoria = {};


    let totalReceitas = 0;
    let totalDespesas = 0;


    lancamentos.forEach(
      function (item) {

        const valor =
          Number(item.valor) || 0;


        if (
          item.tipo ===
          "income"
        ) {

          totalReceitas +=
            valor;

        }


        if (
          item.tipo ===
          "expense"
        ) {

          totalDespesas +=
            valor;


          const categoria =
            item.categoria ||
            "outros";


          if (
            !despesasPorCategoria[
              categoria
            ]
          ) {

            despesasPorCategoria[
              categoria
            ] = 0;

          }


          despesasPorCategoria[
            categoria
          ] += valor;

        }

      }
    );


    const saldo =
      totalReceitas -
      totalDespesas;


    const reportSummary =
      document.getElementById(
        "reportSummary"
      );


    if (reportSummary) {

      reportSummary.innerHTML = `

        <div style="display:grid;gap:15px;">

          <div>
            <strong>Receitas</strong>
            <p>${dinheiro(totalReceitas)}</p>
          </div>

          <div>
            <strong>Despesas</strong>
            <p>${dinheiro(totalDespesas)}</p>
          </div>

          <div>
            <strong>Saldo</strong>
            <p>${dinheiro(saldo)}</p>
          </div>

          <div>
            <strong>Total de lançamentos</strong>
            <p>${lancamentos.length}</p>
          </div>

        </div>

      `;

    }


    atualizarGraficoCategorias(
      despesasPorCategoria
    );

  }


  function atualizarGraficoCategorias(
    dados
  ) {

    const canvas =
      document.getElementById(
        "categoryChart"
      );


    if (!canvas) {
      return;
    }


    if (
      typeof Chart ===
      "undefined"
    ) {

      return;
    }


    const labels =
      Object.keys(dados)
        .map(
          function (categoria) {
            return nomeCategoria(
              categoria
            );
          }
        );


    const valores =
      Object.values(dados);


    if (categoryChart) {

      categoryChart.destroy();

    }


    categoryChart =
      new Chart(
        canvas,
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

            maintainAspectRatio: false,

            plugins: {

              legend: {
                position: "bottom"
              }

            }

          }

        }
      );

  }


  /* =======================================================
     BOTÃO "VER TODOS"
     ======================================================= */

  document
    .getElementById(
      "viewTransactionsButton"
    )
    ?.addEventListener(
      "click",
      function () {

        menuItems.forEach(
          function (item) {

            item.classList.remove(
              "active"
            );

          }
        );


        sections.forEach(
          function (section) {

            section.classList.remove(
              "active-section"
            );

          }
        );


        const transactions =
          document.getElementById(
            "transactions"
          );


        if (transactions) {

          transactions.classList.add(
            "active-section"
          );

        }


        const menu =
          document.querySelector(
            '[data-section="transactions"]'
          );


        menu?.classList.add(
          "active"
        );


        atualizarTabela();

      }
    );


  /* =======================================================
     ATUALIZAR TUDO
     ======================================================= */

  function atualizarTudo() {

    atualizarDashboard();

    atualizarTabela();

    atualizarFiltroCategorias();

    atualizarRelatorios();

  }


  /* =======================================================
     FECHAR MODAL CLICANDO FORA
     ======================================================= */

  transactionModal?.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        transactionModal
      ) {

        fecharModal();

      }

    }
  );


  /* =======================================================
     TECLA ESC FECHA MODAL
     ======================================================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        fecharModal();

      }

    }
  );


  /* =======================================================
     INICIALIZAÇÃO
     ======================================================= */

  const logado =
    localStorage.getItem(
      "controleFinanceiroLogado"
    );


  const usuario =
    pegarUsuario();


  if (
    logado === "true" &&
    usuario
  ) {

    abrirSistema(
      usuario
    );

  } else {

    mostrarLogin();

  }

});

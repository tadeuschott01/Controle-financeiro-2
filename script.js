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
     FUNÇÕES AUXILIARES
     ======================================================= */

  function mensagem(elemento, texto, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = texto;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";
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


  function hoje() {

    const data = new Date();

    const ano = data.getFullYear();

    const mes =
      String(data.getMonth() + 1).padStart(2, "0");

    const dia =
      String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

  }


  function escaparHTML(texto) {

    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =======================================================
     USUÁRIO
     ======================================================= */

  function pegarUsuario() {

    const dados =
      localStorage.getItem(
        "controleFinanceiroUsuario"
      );

    if (!dados) return null;

    try {

      return JSON.parse(dados);

    } catch (erro) {

      console.error(erro);

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

    if (!dados) return [];

    try {

      const lista = JSON.parse(dados);

      return Array.isArray(lista)
        ? lista
        : [];

    } catch (erro) {

      console.error(erro);

      return [];

    }

  }


  function salvarLancamentos(lista) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(lista)
    );

  }


  /* =======================================================
     MOSTRAR LOGIN / CADASTRO
     ======================================================= */

  function mostrarLogin() {

    loginForm?.classList.remove("hidden");

    registerForm?.classList.add("hidden");

    mensagem(loginMessage, "");

    mensagem(registerMessage, "");

  }


  function mostrarCadastro() {

    loginForm?.classList.add("hidden");

    registerForm?.classList.remove("hidden");

    mensagem(loginMessage, "");

    mensagem(registerMessage, "");

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
     CADASTRO
     ======================================================= */

  registerButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const nome =
        document.getElementById(
          "registerName"
        )?.value.trim();

      const email =
        document.getElementById(
          "registerEmail"
        )?.value.trim();

      const senha =
        document.getElementById(
          "registerPassword"
        )?.value;

      const tipo =
        document.getElementById(
          "registerAccountType"
        )?.value || "pessoal";

      const empresa =
        document.getElementById(
          "registerCompany"
        )?.value.trim() || "";


      if (!nome) {

        mensagem(
          registerMessage,
          "Digite seu nome."
        );

        return;

      }


      if (!email) {

        mensagem(
          registerMessage,
          "Digite seu e-mail."
        );

        return;

      }


      if (!email.includes("@")) {

        mensagem(
          registerMessage,
          "Digite um e-mail válido."
        );

        return;

      }


      if (!senha) {

        mensagem(
          registerMessage,
          "Digite uma senha."
        );

        return;

      }


      if (senha.length < 6) {

        mensagem(
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
        criadoEm:
          new Date().toISOString()

      };


      try {

        salvarUsuario(usuario);

        salvarLancamentos([]);

        localStorage.setItem(
          "controleFinanceiroLogado",
          "false"
        );

      } catch (erro) {

        console.error(erro);

        mensagem(
          registerMessage,
          "Não foi possível salvar a conta."
        );

        return;

      }


      mensagem(
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


      document.getElementById(
        "registerName"
      ).value = "";

      document.getElementById(
        "registerEmail"
      ).value = "";

      document.getElementById(
        "registerPassword"
      ).value = "";

      const empresaInput =
        document.getElementById(
          "registerCompany"
        );

      if (empresaInput) {

        empresaInput.value = "";

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
        document.getElementById(
          "loginEmail"
        )?.value.trim();

      const senha =
        document.getElementById(
          "loginPassword"
        )?.value;


      if (!email || !senha) {

        mensagem(
          loginMessage,
          "Digite seu e-mail e sua senha."
        );

        return;

      }


      const usuario = pegarUsuario();


      if (!usuario) {

        mensagem(
          loginMessage,
          "Nenhuma conta cadastrada. Clique em Criar conta."
        );

        return;

      }


      if (
        email.toLowerCase() !==
        String(usuario.email).toLowerCase()
        ||
        senha !== usuario.senha
      ) {

        mensagem(
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


    const profileAccountType =
      document.getElementById(
        "profileAccountType"
      );

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

      localStorage.setItem(
        "controleFinanceiroLogado",
        "false"
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
    function (botao) {

      botao.addEventListener(
        "click",
        function () {

          const nomeSecao =
            botao.dataset.section;


          menuItems.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );


          botao.classList.add(
            "active"
          );


          sections.forEach(
            function (secao) {

              secao.classList.remove(
                "active-section"
              );

            }
          );


          const secao =
            document.getElementById(
              nomeSecao
            );

          secao?.classList.add(
            "active-section"
          );


          const sidebar =
            document.querySelector(
              ".sidebar"
            );

          sidebar?.classList.remove(
            "mobile-open"
          );


          if (nomeSecao === "reports") {

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

  const transactionType =
    document.getElementById(
      "transactionType"
    );

  const transactionDate =
    document.getElementById(
      "transactionDate"
    );


  function abrirModal(tipo = "income") {

    if (!transactionModal) return;

    transactionType.value = tipo;

    transactionDate.value = hoje();

    mensagem(
      transactionMessage,
      ""
    );

    transactionModal.classList.remove(
      "hidden"
    );

  }


  function fecharModal() {

    transactionModal?.classList.add(
      "hidden"
    );

    mensagem(
      transactionMessage,
      ""
    );

  }


  document.getElementById(
    "quickIncomeButton"
  )?.addEventListener(
    "click",
    function () {

      abrirModal("income");

    }
  );


  document.getElementById(
    "quickExpenseButton"
  )?.addEventListener(
    "click",
    function () {

      abrirModal("expense");

    }
  );


  document.getElementById(
    "newTransactionButton"
  )?.addEventListener(
    "click",
    function () {

      abrirModal("income");

    }
  );


  document.getElementById(
    "closeTransactionModal"
  )?.addEventListener(
    "click",
    fecharModal
  );


  document.getElementById(
    "cancelTransactionButton"
  )?.addEventListener(
    "click",
    fecharModal
  );


  /* =======================================================
     SALVAR LANÇAMENTO
     ======================================================= */

  document.getElementById(
    "saveTransactionButton"
  )?.addEventListener(
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

      const valor =
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

        mensagem(
          transactionMessage,
          "Digite uma descrição."
        );

        return;

      }


      if (!valor || Number(valor) <= 0) {

        mensagem(
          transactionMessage,
          "Digite um valor maior que zero."
        );

        return;

      }


      if (!data) {

        mensagem(
          transactionMessage,
          "Escolha uma data."
        );

        return;

      }


      const lista =
        pegarLancamentos();


      const novoLancamento = {

        id:
          Date.now().toString(),

        tipo:
          tipo || "income",

        descricao:
          descricao,

        valor:
          Number(valor),

        categoria:
          categoria || "outros",

        data:
          data,

        criadoEm:
          new Date().toISOString()

      };


      lista.push(
        novoLancamento
      );


      salvarLancamentos(
        lista
      );


      mensagem(
        transactionMessage,
        "Lançamento salvo com sucesso!",
        true
      );


      limparFormularioLancamento();


      setTimeout(
        function () {

          fecharModal();

          atualizarTudo();

        },
        500
      );

    }
  );


  function limparFormularioLancamento() {

    const descricao =
      document.getElementById(
        "transactionDescription"
      );

    const valor =
      document.getElementById(
        "transactionAmount"
      );

    if (descricao) {

      descricao.value = "";

    }

    if (valor) {

      valor.value = "";

    }

    if (transactionDate) {

      transactionDate.value = hoje();

    }

  }


  /* =======================================================
     ATUALIZAR DASHBOARD
     ======================================================= */

  function atualizarDashboard() {

    const lista =
      pegarLancamentos();


    let receitas = 0;

    let despesas = 0;


    lista.forEach(
      function (item) {

        if (item.tipo === "income") {

          receitas +=
            Number(item.valor) || 0;

        }

        if (item.tipo === "expense") {

          despesas +=
            Number(item.valor) || 0;

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
        lista.length;

    }


    atualizarLancamentosRecentes();

    atualizarTabela();

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

    if (!container) return;


    const lista =
      pegarLancamentos()
        .slice()
        .sort(
          function (a, b) {

            return String(b.data)
              .localeCompare(
                String(a.data)
              );

          }
        )
        .slice(0, 5);


    if (lista.length === 0) {

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
      lista.map(
        function (item) {

          const receita =
            item.tipo === "income";

          const sinal =
            receita ? "+" : "-";

          const classe =
            receita ? "income" : "expense";


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


  function formatarData(data) {

    if (!data) return "";

    const partes =
      String(data).split("-");

    if (partes.length !== 3) {

      return data;

    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

  }


  /* =======================================================
     TABELA DE LANÇAMENTOS
     ======================================================= */

  function atualizarTabela() {

    const tabela =
      document.getElementById(
        "transactionsTableBody"
      );

    if (!tabela) return;


    const pesquisa =
      document.getElementById(
        "transactionSearch"
      )?.value
        .toLowerCase()
        .trim() || "";


    const filtroTipo =
      document.getElementById(
        "transactionTypeFilter"
      )?.value || "all";


    const filtroCategoria =
      document.getElementById(
        "transactionCategoryFilter"
      )?.value || "all";


    let lista =
      pegarLancamentos();


    lista =
      lista.filter(
        function (item) {

          const correspondePesquisa =
            !pesquisa ||
            String(item.descricao)
              .toLowerCase()
              .includes(pesquisa);


          const correspondeTipo =
            filtroTipo === "all" ||
            item.tipo === filtroTipo;


          const correspondeCategoria =
            filtroCategoria === "all" ||
            item.categoria === filtroCategoria;


          return (
            correspondePesquisa &&
            correspondeTipo &&
            correspondeCategoria
          );

        }
      );


    lista.sort(
      function (a, b) {

        return String(b.data)
          .localeCompare(
            String(a.data)
          );

      }
    );


    if (lista.length === 0) {

      tabela.innerHTML = `

        <tr>

          <td colspan="6"
              style="text-align:center;padding:30px;">

            Nenhum lançamento encontrado.

          </td>

        </tr>

      `;

      return;

    }


    tabela.innerHTML =
      lista.map(
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
                ${nomeCategoria(item.categoria)}
              </td>

              <td>
                <span class="${classe}">
                  ${tipoTexto}
                </span>
              </td>

              <td>
                ${dinheiro(item.valor)}
              </td>

              <td>

                <button
                  type="button"
                  onclick="editarLancamento('${item.id}')"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onclick="excluirLancamento('${item.id}')"
                >
                  🗑️
                </button>

              </td>

            </tr>

          `;

        }
      ).join("");

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

  document.getElementById(
    "transactionSearch"
  )?.addEventListener(
    "input",
    atualizarTabela
  );


  document.getElementById(
    "transactionTypeFilter"
  )?.addEventListener(
    "change",
    atualizarTabela
  );


  document.getElementById(
    "transactionCategoryFilter"
  )?.addEventListener(
    "change",
    atualizarTabela
  );


  /* =======================================================
     PREENCHER CATEGORIAS DO FILTRO
     ======================================================= */

  function preencherFiltroCategorias() {

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

  }


  /* =======================================================
     EDITAR LANÇAMENTO
     ======================================================= */

  window.editarLancamento =
    function (id) {

      const lista =
        pegarLancamentos();


      const item =
        lista.find(
          function (lancamento) {

            return lancamento.id === id;

          }
        );


      if (!item) {

        alert(
          "Lançamento não encontrado."
        );

        return;

      }


      const novaDescricao =
        prompt(
          "Descrição:",
          item.descricao
        );


      if (novaDescricao === null) {

        return;

      }


      const novoValor =
        prompt(
          "Valor:",
          item.valor
        );


      if (novoValor === null) {

        return;

      }


      const valorNumerico =
        Number(
          String(novoValor)
            .replace(",", ".")
        );


      if (
        !novaDescricao.trim() ||
        !valorNumerico ||
        valorNumerico <= 0
      ) {

        alert(
          "Dados inválidos."
        );

        return;

      }


      item.descricao =
        novaDescricao.trim();

      item.valor =
        valorNumerico;


      salvarLancamentos(
        lista
      );


      atualizarTudo();

      alert(
        "Lançamento atualizado!"
      );

    };


  /* =======================================================
     EXCLUIR LANÇAMENTO
     ======================================================= */

  window.excluirLancamento =
    function (id) {

      const confirmar =
        confirm(
          "Deseja realmente excluir este lançamento?"
        );


      if (!confirmar) return;


      let lista =
        pegarLancamentos();


      lista =
        lista.filter(
          function (item) {

            return item.id !== id;

          }
        );


      salvarLancamentos(
        lista
      );


      atualizarTudo();

    };


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

    if (!canvas || typeof Chart === "undefined") {

      return;

    }


    const lista =
      pegarLancamentos();


    let receitas = 0;

    let despesas = 0;


    lista.forEach(
      function (item) {

        if (item.tipo === "income") {

          receitas +=
            Number(item.valor) || 0;

        }

        if (item.tipo === "expense") {

          despesas +=
            Number(item.valor) || 0;

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


  /* =======================================================
     RELATÓRIOS
     ======================================================= */

  function atualizarRelatorios() {

    const lista =
      pegarLancamentos();


    let despesasTotal = 0;

    const categorias = {};


    lista.forEach(
      function (item) {

        if (item.tipo !== "expense") {

          return;

        }


        const valor =
          Number(item.valor) || 0;


        despesasTotal +=
          valor;


        const categoria =
          item.categoria || "outros";


        categorias[categoria] =
          (categorias[categoria] || 0)
          + valor;

      }
    );


    const resumo =
      document.getElementById(
        "reportSummary"
      );


    if (resumo) {

      resumo.innerHTML = `

        <div style="padding:10px 0;">

          <p>
            Total de despesas
          </p>

          <strong style="font-size:24px;">
            ${dinheiro(despesasTotal)}
          </strong>

        </div>

      `;

    }


    const canvas =
      document.getElementById(
        "categoryChart"
      );


    if (
      !canvas ||
      typeof Chart === "undefined"
    ) {

      return;

    }


    const labels =
      Object.keys(categorias)
        .map(nomeCategoria);


    const valores =
      Object.values(categorias);


    if (categoryChart) {

      categoryChart.destroy();

    }


    if (labels.length === 0) {

      return;

    }


    categoryChart =
      new Chart(
        canvas,
        {

          type: "doughnut",

          data: {

            labels,

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


  /* =======================================================
     BOTÃO VER TODOS
     ======================================================= */

  document.getElementById(
    "viewTransactionsButton"
  )?.addEventListener(
    "click",
    function () {

      const botao =
        document.querySelector(
          '.menu-item[data-section="transactions"]'
        );

      botao?.click();

    }
  );


  /* =======================================================
     ATUALIZAR TUDO
     ======================================================= */

  function atualizarTudo() {

    preencherFiltroCategorias();

    atualizarDashboard();

    atualizarTabela();

    atualizarRelatorios();

  }


  /* =======================================================
     PERÍODO DO DASHBOARD
     ======================================================= */

  document.getElementById(
    "dashboardPeriod"
  )?.addEventListener(
    "change",
    function () {

      atualizarDashboard();

    }
  );


  /* =======================================================
     DATA PADRÃO DO MODAL
     ======================================================= */

  if (transactionDate) {

    transactionDate.value = hoje();

  }


  /* =======================================================
     VERIFICAR LOGIN AUTOMÁTICO
     ======================================================= */

  const usuario =
    pegarUsuario();


  const logado =
    localStorage.getItem(
      "controleFinanceiroLogado"
    );


  if (
    usuario &&
    logado === "true"
  ) {

    abrirSistema(
      usuario
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


  /* =======================================================
     FINALIZAÇÃO
     ======================================================= */

  console.log(
    "Controle Financeiro carregado com sucesso."
  );

});

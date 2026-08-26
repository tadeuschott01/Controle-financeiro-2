document.addEventListener("DOMContentLoaded", function () {

  // =========================================================
  // CONTROLE FINANCEIRO
  // SCRIPT COMPLETO
  // =========================================================

  const $ = (id) => document.getElementById(id);

  const authScreen = $("authScreen");
  const appScreen = $("appScreen");

  const loginForm = $("loginForm");
  const registerForm = $("registerForm");

  const loginButton = $("loginButton");
  const registerButton = $("registerButton");

  const showRegisterButton = $("showRegisterButton");
  const showLoginButton = $("showLoginButton");

  const logoutButton = $("logoutButton");

  const loginMessage = $("loginMessage");
  const registerMessage = $("registerMessage");
  const transactionMessage = $("transactionMessage");


  // =========================================================
  // MENSAGENS
  // =========================================================

  function mensagem(elemento, texto, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = texto;
    elemento.style.color = sucesso ? "#1f513d" : "#d94b4b";
  }


  // =========================================================
  // USUÁRIO
  // =========================================================

  function pegarUsuario() {

    const dados = localStorage.getItem(
      "controleFinanceiroUsuario"
    );

    if (!dados) return null;

    try {
      return JSON.parse(dados);
    } catch (erro) {
      localStorage.removeItem(
        "controleFinanceiroUsuario"
      );
      return null;
    }
  }


  // =========================================================
  // LANÇAMENTOS
  // =========================================================

  function pegarLancamentos() {

    const dados = localStorage.getItem(
      "controleFinanceiroLancamentos"
    );

    if (!dados) return [];

    try {

      const lista = JSON.parse(dados);

      return Array.isArray(lista) ? lista : [];

    } catch (erro) {

      return [];
    }
  }


  function salvarLancamentos(lista) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(lista)
    );
  }


  // =========================================================
  // FORMATAÇÃO
  // =========================================================

  function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
  }


  function escaparHTML(texto) {

    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }


  function dataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }


  // =========================================================
  // MOSTRAR LOGIN / CADASTRO
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
  // CAMPO EMPRESA
  // =========================================================

  $("registerAccountType")?.addEventListener(
    "change",
    function () {

      const empresaField = $("companyField");

      if (!empresaField) return;

      if (
        this.value === "empresa" ||
        this.value === "ambos"
      ) {

        empresaField.classList.remove("hidden");

      } else {

        empresaField.classList.add("hidden");
      }
    }
  );


  // =========================================================
  // CADASTRO
  // =========================================================

  registerButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const nome =
        $("registerName")?.value.trim();

      const email =
        $("registerEmail")?.value.trim();

      const senha =
        $("registerPassword")?.value;

      const tipo =
        $("registerAccountType")?.value ||
        "pessoal";

      const empresa =
        $("registerCompany")?.value.trim() ||
        "";


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


      if (
        !email.includes("@") ||
        !email.includes(".")
      ) {

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

        mensagem(
          registerMessage,
          "Não foi possível salvar a conta neste navegador."
        );

        return;
      }


      mensagem(
        registerMessage,
        "Conta criada com sucesso!",
        true
      );


      const loginEmail = $("loginEmail");

      if (loginEmail) {
        loginEmail.value = email;
      }


      $("registerName").value = "";
      $("registerEmail").value = "";
      $("registerPassword").value = "";

      if ($("registerCompany")) {
        $("registerCompany").value = "";
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
        $("loginEmail")?.value.trim();

      const senha =
        $("loginPassword")?.value;


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
        String(usuario.email).toLowerCase() ||
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


  // =========================================================
  // ABRIR SISTEMA
  // =========================================================

  function abrirSistema(usuario) {

    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


    if ($("userName")) {
      $("userName").textContent = usuario.nome;
    }


    if ($("profileName")) {
      $("profileName").textContent = usuario.nome;
    }


    if ($("profileEmail")) {
      $("profileEmail").textContent = usuario.email;
    }


    const tipos = {

      pessoal: "Pessoal",
      empresa: "Empresa",
      ambos: "Pessoal + Empresa"

    };


    if ($("profileAccountType")) {

      $("profileAccountType").textContent =
        tipos[usuario.tipo] || "Pessoal";
    }


    if ($("profileCompany")) {

      $("profileCompany").textContent =
        usuario.empresa || "—";
    }


    atualizarTudo();
  }


  // =========================================================
  // LOGOUT
  // =========================================================

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


  // =========================================================
  // MENU
  // =========================================================

  const menuItems =
    document.querySelectorAll(".menu-item");

  const sections =
    document.querySelectorAll(".content-section");


  menuItems.forEach(function (botao) {

    botao.addEventListener(
      "click",
      function () {

        const nomeSecao =
          botao.dataset.section;


        menuItems.forEach(function (item) {

          item.classList.remove("active");
        });


        botao.classList.add("active");


        sections.forEach(function (secao) {

          secao.classList.remove(
            "active-section"
          );
        });


        const secao =
          $(nomeSecao);

        if (secao) {

          secao.classList.add(
            "active-section"
          );
        }


        if (nomeSecao === "reports") {
          atualizarRelatorios();
        }

        if (nomeSecao === "transactions") {
          atualizarTabela();
        }
      }
    );
  });


  // =========================================================
  // MENU MOBILE
  // =========================================================

  const mobileMenuButton =
    $("mobileMenuButton");

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

  const modal =
    $("transactionModal");


  function abrirModal(tipo = "income", id = null) {

    if (!modal) return;


    modal.classList.remove("hidden");


    if ($("transactionType")) {
      $("transactionType").value = tipo;
    }


    if ($("transactionMessage")) {
      $("transactionMessage").textContent = "";
    }


    if (id) {

      const item =
        pegarLancamentos().find(
          x => x.id === id
        );

      if (!item) return;


      $("transactionType").value =
        item.tipo;

      $("transactionDescription").value =
        item.descricao;

      $("transactionAmount").value =
        item.valor;

      $("transactionCategory").value =
        item.categoria;

      $("transactionDate").value =
        item.data;

      modal.dataset.editingId = id;


      const titulo =
        modal.querySelector(".modal-header h2");

      if (titulo) {
        titulo.textContent =
          "Editar lançamento";
      }


      if ($("saveTransactionButton")) {
        $("saveTransactionButton").textContent =
          "Salvar alterações";
      }

    } else {

      delete modal.dataset.editingId;

      if ($("transactionDescription")) {
        $("transactionDescription").value = "";
      }

      if ($("transactionAmount")) {
        $("transactionAmount").value = "";
      }

      if ($("transactionDate")) {
        $("transactionDate").value = dataHoje();
      }


      const titulo =
        modal.querySelector(".modal-header h2");

      if (titulo) {
        titulo.textContent =
          "Novo lançamento";
      }


      if ($("saveTransactionButton")) {
        $("saveTransactionButton").textContent =
          "Salvar lançamento";
      }
    }
  }


  function fecharModal() {

    modal?.classList.add("hidden");

    if (transactionMessage) {
      transactionMessage.textContent = "";
    }
  }


  $("quickIncomeButton")?.addEventListener(
    "click",
    function () {

      abrirModal("income");
    }
  );


  $("quickExpenseButton")?.addEventListener(
    "click",
    function () {

      abrirModal("expense");
    }
  );


  $("newTransactionButton")?.addEventListener(
    "click",
    function () {

      abrirModal("income");
    }
  );


  $("closeTransactionModal")?.addEventListener(
    "click",
    fecharModal
  );


  $("cancelTransactionButton")?.addEventListener(
    "click",
    fecharModal
  );


  // =========================================================
  // SALVAR / EDITAR LANÇAMENTO
  // =========================================================

  $("saveTransactionButton")?.addEventListener(
    "click",
    function () {

      const tipo =
        $("transactionType")?.value;

      const descricao =
        $("transactionDescription")?.value.trim();

      const valor =
        Number(
          $("transactionAmount")?.value
        );

      const categoria =
        $("transactionCategory")?.value;

      const data =
        $("transactionDate")?.value;


      if (!descricao) {

        mensagem(
          transactionMessage,
          "Digite uma descrição."
        );

        return;
      }


      if (!valor || valor <= 0) {

        mensagem(
          transactionMessage,
          "Digite um valor maior que zero."
        );

        return;
      }


      if (!data) {

        mensagem(
          transactionMessage,
          "Informe a data."
        );

        return;
      }


      let lancamentos =
        pegarLancamentos();


      const editingId =
        modal?.dataset.editingId;


      if (editingId) {

        const index =
          lancamentos.findIndex(
            item => item.id === editingId
          );


        if (index !== -1) {

          lancamentos[index] = {

            ...lancamentos[index],

            tipo,
            descricao,
            valor,
            categoria,
            data

          };
        }

      } else {

        lancamentos.push({

          id:
            Date.now().toString(),

          tipo,
          descricao,
          valor,
          categoria,
          data,

          criadoEm:
            new Date().toISOString()

        });
      }


      salvarLancamentos(lancamentos);


      mensagem(
        transactionMessage,
        editingId
          ? "Lançamento atualizado!"
          : "Lançamento salvo!",
        true
      );


      atualizarTudo();


      setTimeout(function () {

        fecharModal();

      }, 500);

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


    lancamentos.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {

        receitas += valor;

      } else if (item.tipo === "expense") {

        despesas += valor;
      }
    });


    const saldo =
      receitas - despesas;


    if ($("totalIncome")) {
      $("totalIncome").textContent =
        dinheiro(receitas);
    }


    if ($("totalExpense")) {
      $("totalExpense").textContent =
        dinheiro(despesas);
    }


    if ($("totalBalance")) {
      $("totalBalance").textContent =
        dinheiro(saldo);
    }


    if ($("totalTransactions")) {
      $("totalTransactions").textContent =
        lancamentos.length;
    }


    atualizarLancamentosRecentes();
    atualizarGraficoFinanceiro();
  }


  // =========================================================
  // LANÇAMENTOS RECENTES
  // =========================================================

  function atualizarLancamentosRecentes() {

    const container =
      $("recentTransactions");

    if (!container) return;


    const lancamentos =
      pegarLancamentos()
        .slice()
        .sort(
          (a, b) =>
            new Date(b.data || b.criadoEm) -
            new Date(a.data || a.criadoEm)
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
      lancamentos.map(function (item) {

        const receita =
          item.tipo === "income";

        return `

          <div class="transaction-row">

            <div class="transaction-info">

              <div class="transaction-icon ${receita ? "income" : "expense"}">
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

            <div class="transaction-value ${receita ? "income" : "expense"}">
              ${receita ? "+" : "-"} ${dinheiro(item.valor)}
            </div>

          </div>

        `;

      }).join("");
  }


  // =========================================================
  // TABELA DE LANÇAMENTOS
  // =========================================================

  function atualizarTabela() {

    const tbody =
      $("transactionsTableBody");

    if (!tbody) return;


    let lista =
      pegarLancamentos();


    const pesquisa =
      $("transactionSearch")?.value
        .trim()
        .toLowerCase() || "";


    const filtroTipo =
      $("transactionTypeFilter")?.value ||
      "all";


    const filtroCategoria =
      $("transactionCategoryFilter")?.value ||
      "all";


    lista =
      lista.filter(function (item) {

        const texto =
          `${item.descricao} ${item.categoria}`
            .toLowerCase();


        const combinaPesquisa =
          !pesquisa ||
          texto.includes(pesquisa);


        const combinaTipo =
          filtroTipo === "all" ||
          item.tipo === filtroTipo;


        const combinaCategoria =
          filtroCategoria === "all" ||
          item.categoria === filtroCategoria;


        return (
          combinaPesquisa &&
          combinaTipo &&
          combinaCategoria
        );
      });


    lista.sort(function (a, b) {

      return new Date(b.data) -
        new Date(a.data);
    });


    if (lista.length === 0) {

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
      lista.map(function (item) {

        const receita =
          item.tipo === "income";


        return `

          <tr>

            <td>
              ${formatarData(item.data)}
            </td>

            <td>
              ${escaparHTML(item.descricao)}
            </td>

            <td>
              ${nomesCategorias[item.categoria] ||
              item.categoria ||
              "Outros"}
            </td>

            <td>
              ${receita ? "Receita" : "Despesa"}
            </td>

            <td class="${receita ? "income" : "expense"}">
              ${receita ? "+" : "-"} ${dinheiro(item.valor)}
            </td>

            <td>

              <button
                type="button"
                class="edit-transaction-button"
                data-id="${item.id}"
              >
                ✏️
              </button>

              <button
                type="button"
                class="delete-transaction-button"
                data-id="${item.id}"
              >
                🗑️
              </button>

            </td>

          </tr>

        `;

      }).join("");


    document
      .querySelectorAll(".edit-transaction-button")
      .forEach(function (botao) {

        botao.addEventListener(
          "click",
          function () {

            abrirModal(
              "income",
              this.dataset.id
            );
          }
        );
      });


    document
      .querySelectorAll(".delete-transaction-button")
      .forEach(function (botao) {

        botao.addEventListener(
          "click",
          function () {

            excluirLancamento(
              this.dataset.id
            );
          }
        );
      });
  }


  // =========================================================
  // EXCLUIR
  // =========================================================

  function excluirLancamento(id) {

    const confirmar =
      window.confirm(
        "Deseja realmente excluir este lançamento?"
      );


    if (!confirmar) return;


    const lista =
      pegarLancamentos()
        .filter(
          item => item.id !== id
        );


    salvarLancamentos(lista);


    atualizarTudo();
    atualizarTabela();
  }


  // =========================================================
  // FILTROS
  // =========================================================

  $("transactionSearch")?.addEventListener(
    "input",
    atualizarTabela
  );


  $("transactionTypeFilter")?.addEventListener(
    "change",
    atualizarTabela
  );


  $("transactionCategoryFilter")?.addEventListener(
    "change",
    atualizarTabela
  );


  function atualizarCategoriasFiltro() {

    const select =
      $("transactionCategoryFilter");

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


    categorias.forEach(function (categoria) {

      const option =
        document.createElement("option");

      option.value =
        categoria[0];

      option.textContent =
        categoria[1];

      select.appendChild(option);
    });
  }


  // =========================================================
  // GRÁFICO FINANCEIRO
  // =========================================================

  let financeChart = null;


  function atualizarGraficoFinanceiro() {

    const canvas =
      $("financeChart");

    if (!canvas) return;


    if (
      typeof Chart === "undefined"
    ) {
      return;
    }


    const lista =
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
      Array(12).fill(0);

    const despesas =
      Array(12).fill(0);


    lista.forEach(function (item) {

      if (!item.data) return;


      const data =
        new Date(
          item.data + "T12:00:00"
        );


      const mes =
        data.getMonth();


      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {

        receitas[mes] += valor;

      } else {

        despesas[mes] += valor;
      }
    });


    if (financeChart) {
      financeChart.destroy();
    }


    financeChart =
      new Chart(
        canvas.getContext("2d"),
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

                  callback: function (valor) {

                    return dinheiro(valor);
                  }
                }
              }
            }
          }
        }
      );
  }


  // =========================================================
  // RELATÓRIOS
  // =========================================================

  let categoryChart = null;


  function atualizarRelatorios() {

    const lista =
      pegarLancamentos();


    const categorias = {};


    let receitas = 0;
    let despesas = 0;


    lista.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {

        receitas += valor;

      } else {

        despesas += valor;


        if (!categorias[item.categoria]) {
          categorias[item.categoria] = 0;
        }

        categorias[item.categoria] += valor;
      }
    });


    const canvas =
      $("categoryChart");


    if (
      canvas &&
      typeof Chart !== "undefined"
    ) {

      if (categoryChart) {
        categoryChart.destroy();
      }


      const labels =
        Object.keys(categorias);


      const valores =
        Object.values(categorias);


      categoryChart =
        new Chart(
          canvas.getContext("2d"),
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


    if ($("reportSummary")) {

      const saldo =
        receitas - despesas;


      $("reportSummary").innerHTML = `

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

          <span>Total de lançamentos</span>

          <strong>
            ${lista.length}
          </strong>

        </div>

      `;
    }
  }


  // =========================================================
  // BOTÃO VER TODOS
  // =========================================================

  $("viewTransactionsButton")?.addEventListener(
    "click",
    function () {

      menuItems.forEach(function (item) {

        item.classList.remove("active");

        if (
          item.dataset.section ===
          "transactions"
        ) {
          item.classList.add("active");
        }
      });


      sections.forEach(function (section) {

        section.classList.remove(
          "active-section"
        );
      });


      $("transactions")?.classList.add(
        "active-section"
      );


      atualizarTabela();
    }
  );


  // =========================================================
  // PERÍODO DO DASHBOARD
  // =========================================================

  $("dashboardPeriod")?.addEventListener(
    "change",
    function () {

      atualizarDashboard();
    }
  );


  // =========================================================
  // ATUALIZAR TUDO
  // =========================================================

  function atualizarTudo() {

    atualizarCategoriasFiltro();

    atualizarDashboard();

    atualizarTabela();

    atualizarRelatorios();
  }


  // =========================================================
  // VERIFICAR LOGIN AO ABRIR
  // =========================================================

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

    abrirSistema(usuario);

  } else {

    authScreen?.classList.remove("hidden");
    appScreen?.classList.add("hidden");

    mostrarLogin();
  }


  // =========================================================
  // DATA PADRÃO DO MODAL
  // =========================================================

  if ($("transactionDate")) {

    $("transactionDate").value =
      dataHoje();
  }


  // =========================================================
  // TECLA ESC FECHA MODAL
  // =========================================================

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        !modal?.classList.contains("hidden")
      ) {

        fecharModal();
      }
    }
  );

});

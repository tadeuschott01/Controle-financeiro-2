document.addEventListener("DOMContentLoaded", function () {

  // =====================================================
  // CONTROLE FINANCEIRO
  // SCRIPT COMPLETO
  // =====================================================

  const $ = (id) => document.getElementById(id);

  const authScreen = $("authScreen");
  const appScreen = $("appScreen");

  const loginForm = $("loginForm");
  const registerForm = $("registerForm");

  const loginButton = $("loginButton");
  const registerButton = $("registerButton");

  const showLoginButton = $("showLoginButton");
  const showRegisterButton = $("showRegisterButton");

  const loginMessage = $("loginMessage");
  const registerMessage = $("registerMessage");

  const logoutButton = $("logoutButton");

  let usuarioAtual = null;

  let financeChart = null;
  let categoryChart = null;

  // =====================================================
  // UTILIDADES
  // =====================================================

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
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

  }


  function escaparHTML(texto) {

    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function gerarId() {

    return Date.now().toString(36) +
      Math.random().toString(36).substring(2);

  }


  // =====================================================
  // USUÁRIO
  // =====================================================

  function pegarUsuario() {

    const dados =
      localStorage.getItem(
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


  function salvarUsuario(usuario) {

    localStorage.setItem(
      "controleFinanceiroUsuario",
      JSON.stringify(usuario)
    );

  }


  // =====================================================
  // LANÇAMENTOS
  // =====================================================

  function chaveLancamentos() {

    if (!usuarioAtual) {
      return "controleFinanceiroLancamentos";
    }

    const email =
      String(usuarioAtual.email)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");

    return "controleFinanceiroLancamentos_" + email;

  }


  function pegarLancamentos() {

    const chave = chaveLancamentos();

    let dados =
      localStorage.getItem(chave);


    // Compatibilidade com versão antiga
    if (
      !dados &&
      localStorage.getItem(
        "controleFinanceiroLancamentos"
      )
    ) {

      dados =
        localStorage.getItem(
          "controleFinanceiroLancamentos"
        );

      localStorage.setItem(
        chave,
        dados
      );

    }


    if (!dados) return [];


    try {

      const lista = JSON.parse(dados);

      return Array.isArray(lista)
        ? lista
        : [];

    } catch (erro) {

      return [];

    }

  }


  function salvarLancamentos(lista) {

    localStorage.setItem(
      chaveLancamentos(),
      JSON.stringify(lista)
    );

  }


  // =====================================================
  // CADASTRO
  // =====================================================

  if (showRegisterButton) {

    showRegisterButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        loginForm?.classList.add("hidden");
        registerForm?.classList.remove("hidden");

        if (loginMessage) {
          loginMessage.textContent = "";
        }

        if (registerMessage) {
          registerMessage.textContent = "";
        }

      }
    );

  }


  if (showLoginButton) {

    showLoginButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        registerForm?.classList.add("hidden");
        loginForm?.classList.remove("hidden");

        if (loginMessage) {
          loginMessage.textContent = "";
        }

        if (registerMessage) {
          registerMessage.textContent = "";
        }

      }
    );

  }


  if (registerButton) {

    registerButton.addEventListener(
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

          email:
            email.toLowerCase(),

          senha,

          tipo,

          empresa,

          criadoEm:
            new Date().toISOString()

        };


        try {

          salvarUsuario(usuario);

          usuarioAtual = usuario;

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


        if ($("loginEmail")) {
          $("loginEmail").value =
            usuario.email;
        }


        if ($("registerName")) {
          $("registerName").value = "";
        }

        if ($("registerEmail")) {
          $("registerEmail").value = "";
        }

        if ($("registerPassword")) {
          $("registerPassword").value = "";
        }

        if ($("registerCompany")) {
          $("registerCompany").value = "";
        }


        setTimeout(function () {

          registerForm?.classList.add("hidden");
          loginForm?.classList.remove("hidden");

          if (registerMessage) {
            registerMessage.textContent = "";
          }

        }, 1200);

      }
    );

  }


  // =====================================================
  // LOGIN
  // =====================================================

  if (loginButton) {

    loginButton.addEventListener(
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


        const dados =
          localStorage.getItem(
            "controleFinanceiroUsuario"
          );


        if (!dados) {

          mensagem(
            loginMessage,
            "Nenhuma conta cadastrada."
          );

          return;
        }


        let usuario;

        try {

          usuario = JSON.parse(dados);

        } catch (erro) {

          mensagem(
            loginMessage,
            "Erro ao carregar a conta."
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


        usuarioAtual = usuario;


        localStorage.setItem(
          "controleFinanceiroLogado",
          "true"
        );


        mensagem(
          loginMessage,
          "Login realizado com sucesso!",
          true
        );


        abrirSistema();

      }
    );

  }


  // =====================================================
  // ABRIR SISTEMA
  // =====================================================

  function abrirSistema() {

    if (!usuarioAtual) return;

    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


    if ($("userName")) {

      $("userName").textContent =
        usuarioAtual.nome;

    }


    if ($("profileName")) {

      $("profileName").textContent =
        usuarioAtual.nome;

    }


    if ($("profileEmail")) {

      $("profileEmail").textContent =
        usuarioAtual.email;

    }


    if ($("profileAccountType")) {

      const tipos = {

        pessoal: "Pessoal",

        empresa: "Empresa",

        ambos: "Pessoal + Empresa"

      };

      $("profileAccountType").textContent =
        tipos[usuarioAtual.tipo] ||
        "Pessoal";

    }


    if ($("profileCompany")) {

      $("profileCompany").textContent =
        usuarioAtual.empresa ||
        "—";

    }


    atualizarTudo();

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      function () {

        localStorage.setItem(
          "controleFinanceiroLogado",
          "false"
        );

        usuarioAtual = null;

        appScreen?.classList.add("hidden");
        authScreen?.classList.remove("hidden");

        registerForm?.classList.add("hidden");
        loginForm?.classList.remove("hidden");

      }
    );

  }


  // =====================================================
  // TIPO DE CONTA
  // =====================================================

  const registerAccountType =
    $("registerAccountType");

  const companyField =
    $("companyField");


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


  // =====================================================
  // MENU
  // =====================================================

  const menuItems =
    document.querySelectorAll(".menu-item");

  const sections =
    document.querySelectorAll(".content-section");


  menuItems.forEach(function (item) {

    item.addEventListener(
      "click",
      function () {

        const nome =
          item.dataset.section;

        menuItems.forEach(function (botao) {

          botao.classList.remove("active");

        });

        item.classList.add("active");


        sections.forEach(function (section) {

          section.classList.remove(
            "active-section"
          );

        });


        const section =
          $(nome);

        section?.classList.add(
          "active-section"
        );


        document
          .querySelector(".sidebar")
          ?.classList.remove("mobile-open");


        if (nome === "dashboard") {
          atualizarDashboard();
        }

        if (nome === "transactions") {
          atualizarTabela();
        }

        if (nome === "reports") {
          atualizarRelatorios();
        }

      }
    );

  });


  // =====================================================
  // MENU MOBILE
  // =====================================================

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


  // =====================================================
  // MODAL
  // =====================================================

  const transactionModal =
    $("transactionModal");

  const saveTransactionButton =
    $("saveTransactionButton");

  const closeTransactionModal =
    $("closeTransactionModal");

  const cancelTransactionButton =
    $("cancelTransactionButton");

  let editandoId = null;


  function abrirModal(tipo = "income", item = null) {

    if (!transactionModal) return;


    editandoId =
      item?.id || null;


    if ($("transactionType")) {

      $("transactionType").value =
        item?.tipo || tipo;

    }


    if ($("transactionDescription")) {

      $("transactionDescription").value =
        item?.descricao || "";

    }


    if ($("transactionAmount")) {

      $("transactionAmount").value =
        item?.valor || "";

    }


    if ($("transactionCategory")) {

      $("transactionCategory").value =
        item?.categoria || "outros";

    }


    if ($("transactionDate")) {

      $("transactionDate").value =
        item?.data || hoje();

    }


    if ($("transactionMessage")) {

      $("transactionMessage").textContent = "";

    }


    const titulo =
      transactionModal.querySelector("h2");


    if (titulo) {

      titulo.textContent =
        item
          ? "Editar lançamento"
          : "Novo lançamento";

    }


    if (saveTransactionButton) {

      saveTransactionButton.textContent =
        item
          ? "Salvar alterações"
          : "Salvar lançamento";

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


  // =====================================================
  // BOTÕES RÁPIDOS
  // =====================================================

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


  // =====================================================
  // SALVAR LANÇAMENTO
  // =====================================================

  saveTransactionButton?.addEventListener(
    "click",
    function () {

      if (!usuarioAtual) {

        mensagem(
          $("transactionMessage"),
          "Faça login novamente."
        );

        return;
      }


      const tipo =
        $("transactionType")?.value;

      const descricao =
        $("transactionDescription")
          ?.value.trim();

      const valor =
        Number(
          $("transactionAmount")?.value
        );

      const categoria =
        $("transactionCategory")?.value ||
        "outros";

      const data =
        $("transactionDate")?.value ||
        hoje();


      if (!descricao) {

        mensagem(
          $("transactionMessage"),
          "Digite uma descrição."
        );

        return;
      }


      if (!valor || valor <= 0) {

        mensagem(
          $("transactionMessage"),
          "Digite um valor válido."
        );

        return;
      }


      let lista =
        pegarLancamentos();


      if (editandoId) {

        lista =
          lista.map(function (item) {

            if (item.id === editandoId) {

              return {

                ...item,

                tipo,

                descricao,

                valor,

                categoria,

                data

              };

            }

            return item;

          });

      } else {

        lista.push({

          id: gerarId(),

          tipo,

          descricao,

          valor,

          categoria,

          data,

          criadoEm:
            new Date().toISOString()

        });

      }


      salvarLancamentos(lista);


      fecharModal();

      atualizarTudo();

    }
  );


  // =====================================================
  // TABELA
  // =====================================================

  function atualizarTabela() {

    const tbody =
      $("transactionsTableBody");

    if (!tbody) return;


    let lista =
      pegarLancamentos();


    const pesquisa =
      $("transactionSearch")
        ?.value
        .toLowerCase()
        .trim() || "";


    const filtroTipo =
      $("transactionTypeFilter")
        ?.value || "all";


    const filtroCategoria =
      $("transactionCategoryFilter")
        ?.value || "all";


    lista =
      lista.filter(function (item) {

        const texto =
          (
            item.descricao +
            " " +
            item.categoria
          ).toLowerCase();


        const passouPesquisa =
          !pesquisa ||
          texto.includes(pesquisa);


        const passouTipo =
          filtroTipo === "all" ||
          item.tipo === filtroTipo;


        const passouCategoria =
          filtroCategoria === "all" ||
          item.categoria === filtroCategoria;


        return (
          passouPesquisa &&
          passouTipo &&
          passouCategoria
        );

      });


    lista.sort(function (a, b) {

      return String(b.data)
        .localeCompare(String(a.data));

    });


    if (lista.length === 0) {

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
      lista.map(function (item) {

        const categoria =
          nomeCategoria(item.categoria);


        const tipo =
          item.tipo === "income"
            ? "Receita"
            : "Despesa";


        const valor =
          dinheiro(item.valor);


        return `
          <tr>

            <td>
              ${formatarData(item.data)}
            </td>

            <td>
              ${escaparHTML(item.descricao)}
            </td>

            <td>
              ${escaparHTML(categoria)}
            </td>

            <td>
              ${tipo}
            </td>

            <td>
              ${item.tipo === "income" ? "+" : "-"}
              ${valor}
            </td>

            <td>

              <button
                type="button"
                class="edit-transaction"
                data-id="${item.id}"
              >
                ✏️
              </button>

              <button
                type="button"
                class="delete-transaction"
                data-id="${item.id}"
              >
                🗑️
              </button>

            </td>

          </tr>
        `;

      }).join("");


    tbody
      .querySelectorAll(".edit-transaction")
      .forEach(function (botao) {

        botao.addEventListener(
          "click",
          function () {

            const id =
              this.dataset.id;

            const item =
              pegarLancamentos()
                .find(function (x) {

                  return x.id === id;

                });


            if (item) {

              abrirModal(
                item.tipo,
                item
              );

            }

          }
        );

      });


    tbody
      .querySelectorAll(".delete-transaction")
      .forEach(function (botao) {

        botao.addEventListener(
          "click",
          function () {

            const id =
              this.dataset.id;


            const confirmar =
              confirm(
                "Deseja realmente excluir este lançamento?"
              );


            if (!confirmar) return;


            const novaLista =
              pegarLancamentos()
                .filter(function (item) {

                  return item.id !== id;

                });


            salvarLancamentos(novaLista);

            atualizarTudo();

          }
        );

      });

  }


  // =====================================================
  // FILTROS
  // =====================================================

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


  // =====================================================
  // CATEGORIAS
  // =====================================================

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

    return categorias[categoria] ||
      categoria ||
      "Outros";

  }


  function atualizarFiltroCategorias() {

    const select =
      $("transactionCategoryFilter");

    if (!select) return;


    const atual =
      select.value;


    select.innerHTML = `
      <option value="all">
        Todas as categorias
      </option>
    `;


    Object.keys(categorias)
      .forEach(function (chave) {

        const option =
          document.createElement("option");

        option.value = chave;

        option.textContent =
          categorias[chave];

        select.appendChild(option);

      });


    select.value =
      atual || "all";

  }


  // =====================================================
  // DATA
  // =====================================================

  function formatarData(data) {

    if (!data) return "—";

    const partes =
      String(data).split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

  }


  // =====================================================
  // PERÍODO
  // =====================================================

  function filtrarPeriodo(lista) {

    const periodo =
      $("dashboardPeriod")?.value ||
      "month";


    const agora =
      new Date();


    const anoAtual =
      agora.getFullYear();

    const mesAtual =
      agora.getMonth();


    return lista.filter(function (item) {

      if (!item.data) return true;


      const partes =
        String(item.data).split("-");


      if (partes.length !== 3) {
        return true;
      }


      const ano =
        Number(partes[0]);

      const mes =
        Number(partes[1]) - 1;


      if (periodo === "year") {

        return ano === anoAtual;

      }


      if (periodo === "month") {

        return (
          ano === anoAtual &&
          mes === mesAtual
        );

      }


      return true;

    });

  }


  $("dashboardPeriod")?.addEventListener(
    "change",
    atualizarDashboard
  );


  // =====================================================
  // DASHBOARD
  // =====================================================

  function atualizarDashboard() {

    const todos =
      pegarLancamentos();


    const lista =
      filtrarPeriodo(todos);


    let receitas = 0;
    let despesas = 0;


    lista.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "income") {

        receitas += valor;

      } else {

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
        lista.length;

    }


    atualizarLancamentosRecentes(lista);

    atualizarGraficoFinanceiro(lista);

  }


  // =====================================================
  // LANÇAMENTOS RECENTES
  // =====================================================

  function atualizarLancamentosRecentes(lista = null) {

    const container =
      $("recentTransactions");

    if (!container) return;


    const lancamentos =
      lista || pegarLancamentos();


    const recentes =
      lancamentos
        .slice()
        .sort(function (a, b) {

          return String(b.data)
            .localeCompare(String(a.data));

        })
        .slice(0, 5);


    if (recentes.length === 0) {

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
                  ${formatarData(item.data)}
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


  // =====================================================
  // GRÁFICO FINANCEIRO
  // =====================================================

  function atualizarGraficoFinanceiro(lista) {

    const canvas =
      $("financeChart");

    if (!canvas) return;

    if (
      typeof Chart === "undefined"
    ) {

      return;

    }


    let receitas = 0;
    let despesas = 0;


    lista.forEach(function (item) {

      if (item.tipo === "income") {

        receitas += Number(item.valor) || 0;

      } else {

        despesas += Number(item.valor) || 0;

      }

    });


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


  // =====================================================
  // RELATÓRIOS
  // =====================================================

  function atualizarRelatorios() {

    const lista =
      filtrarPeriodo(
        pegarLancamentos()
      );


    let despesas = 0;
    let receitas = 0;


    const categoriasDespesas = {};


    lista.forEach(function (item) {

      const valor =
        Number(item.valor) || 0;


      if (item.tipo === "expense") {

        despesas += valor;


        categoriasDespesas[item.categoria] =
          (
            categoriasDespesas[item.categoria] ||
            0
          ) + valor;

      }


      if (item.tipo === "income") {

        receitas += valor;

      }

    });


    atualizarGraficoCategorias(
      categoriasDespesas
    );


    if ($("reportSummary")) {

      const saldo =
        receitas - despesas;


      let maiorCategoria =
        "Nenhuma";


      let maiorValor = 0;


      Object.keys(categoriasDespesas)
        .forEach(function (categoria) {

          if (
            categoriasDespesas[categoria] >
            maiorValor
          ) {

            maiorValor =
              categoriasDespesas[categoria];

            maiorCategoria =
              nomeCategoria(categoria);

          }

        });


      $("reportSummary").innerHTML = `

        <div style="display:grid;gap:15px;">

          <div>
            <strong>Receitas</strong>
            <br>
            ${dinheiro(receitas)}
          </div>

          <div>
            <strong>Despesas</strong>
            <br>
            ${dinheiro(despesas)}
          </div>

          <div>
            <strong>Saldo</strong>
            <br>
            ${dinheiro(saldo)}
          </div>

          <div>
            <strong>Maior categoria de despesa</strong>
            <br>
            ${escaparHTML(maiorCategoria)}
            ${
              maiorValor
                ? " — " + dinheiro(maiorValor)
                : ""
            }
          </div>

        </div>

      `;

    }

  }


  function atualizarGraficoCategorias(dados) {

    const canvas =
      $("categoryChart");

    if (!canvas) return;

    if (
      typeof Chart === "undefined"
    ) {

      return;

    }


    const labels =
      Object.keys(dados)
        .map(nomeCategoria);


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


  // =====================================================
  // BOTÃO VER TODOS
  // =====================================================

  $("viewTransactionsButton")
    ?.addEventListener(
      "click",
      function () {

        const botao =
          document.querySelector(
            '.menu-item[data-section="transactions"]'
          );

        botao?.click();

      }
    );


  // =====================================================
  // EXPORTAR CSV
  // =====================================================

  function exportarCSV() {

    const lista =
      pegarLancamentos();


    if (lista.length === 0) {

      alert(
        "Não existem lançamentos para exportar."
      );

      return;
    }


    const linhas = [

      [
        "Data",
        "Descrição",
        "Categoria",
        "Tipo",
        "Valor"
      ],

      ...lista.map(function (item) {

        return [

          item.data,

          item.descricao,

          nomeCategoria(item.categoria),

          item.tipo === "income"
            ? "Receita"
            : "Despesa",

          Number(item.valor)
            .toFixed(2)
            .replace(".", ",")

        ];

      })

    ];


    const csv =
      linhas
        .map(function (linha) {

          return linha
            .map(function (valor) {

              return `"${String(valor)
                .replaceAll('"', '""')}"`;

            })
            .join(";");

        })
        .join("\n");


    const blob =
      new Blob(
        ["\ufeff" + csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "controle-financeiro.csv";


    link.click();


    URL.revokeObjectURL(url);

  }


  // =====================================================
  // BACKUP JSON
  // =====================================================

  function exportarBackup() {

    const backup = {

      versao: 1,

      usuario: usuarioAtual,

      lancamentos:
        pegarLancamentos(),

      criadoEm:
        new Date().toISOString()

    };


    const blob =
      new Blob(
        [
          JSON.stringify(
            backup,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "backup-controle-financeiro.json";


    link.click();


    URL.revokeObjectURL(url);

  }


  // =====================================================
  // FERRAMENTAS EXTRAS
  // =====================================================

  function criarFerramentas() {

    if ($("financeTools")) return;


    const main =
      document.querySelector(".main-content");

    if (!main) return;


    const section =
      document.createElement("section");


    section.id =
      "financeTools";

    section.className =
      "content-section";


    section.innerHTML = `

      <div class="page-heading">

        <div>

          <p class="section-label">
            FERRAMENTAS
          </p>

          <h1>
            Gestão financeira
          </h1>

          <p>
            Ferramentas para organizar melhor seu dinheiro.
          </p>

        </div>

      </div>


      <div
        class="summary-cards"
        style="margin-bottom:25px;"
      >

        <div class="summary-card">

          <div class="card-icon">
            💰
          </div>

          <div>

            <span>
              Orçamento mensal
            </span>

            <strong id="budgetTotal">
              R$ 0,00
            </strong>

          </div>

        </div>


        <div class="summary-card">

          <div class="card-icon">
            🎯
          </div>

          <div>

            <span>
              Meta financeira
            </span>

            <strong id="goalTotal">
              R$ 0,00
            </strong>

          </div>

        </div>

      </div>


      <div
        class="dashboard-grid"
      >

        <div class="panel">

          <div class="panel-header">

            <div>

              <h3>
                Orçamento mensal
              </h3>

              <p>
                Defina um limite para seus gastos.
              </p>

            </div>

          </div>


          <label>
            Limite mensal
          </label>

          <input
            type="number"
            id="budgetInput"
            min="0"
            step="0.01"
            placeholder="Ex.: 3000"
          >

          <button
            id="saveBudgetButton"
            class="primary-button"
            type="button"
            style="margin-top:15px;"
          >
            Salvar orçamento
          </button>


          <div
            id="budgetStatus"
            style="margin-top:20px;"
          ></div>

        </div>


        <div class="panel">

          <div class="panel-header">

            <div>

              <h3>
                Meta financeira
              </h3>

              <p>
                Defina quanto você quer alcançar.
              </p>

            </div>

          </div>


          <label>
            Valor da meta
          </label>

          <input
            type="number"
            id="goalInput"
            min="0"
            step="0.01"
            placeholder="Ex.: 10000"
          >


          <button
            id="saveGoalButton"
            class="primary-button"
            type="button"
            style="margin-top:15px;"
          >
            Salvar meta
          </button>


          <div
            id="goalStatus"
            style="margin-top:20px;"
          ></div>

        </div>

      </div>


      <div
        class="panel"
        style="margin-top:25px;"
      >

        <div class="panel-header">

          <div>

            <h3>
              Dados
            </h3>

            <p>
              Faça uma cópia dos seus dados ou exporte seus lançamentos.
            </p>

          </div>

        </div>


        <div
          style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
          "
        >

          <button
            id="exportCSVButton"
            type="button"
          >
            📊 Exportar CSV
          </button>

          <button
            id="backupButton"
            type="button"
          >
            💾 Fazer backup
          </button>

        </div>

      </div>

    `;


    main.appendChild(section);


    // Adicionar item ao menu

    const menu =
      document.querySelector(".menu");


    if (menu) {

      const botao =
        document.createElement("button");


      botao.type = "button";

      botao.className =
        "menu-item";

      botao.dataset.section =
        "financeTools";


      botao.innerHTML =
        "<span>🛠️</span> Gestão financeira";


      menu.appendChild(botao);


      botao.addEventListener(
        "click",
        function () {

          menuItems.forEach(function (item) {

            item.classList.remove("active");

          });


          document
            .querySelectorAll(".menu-item")
            .forEach(function (item) {

              item.classList.remove("active");

            });


          botao.classList.add("active");


          document
            .querySelectorAll(".content-section")
            .forEach(function (secao) {

              secao.classList.remove(
                "active-section"
              );

            });


          section.classList.add(
            "active-section"
          );


          sidebar?.classList.remove(
            "mobile-open"
          );


          atualizarFerramentas();

        }
      );

    }


    $("saveBudgetButton")
      ?.addEventListener(
        "click",
        salvarOrcamento
      );


    $("saveGoalButton")
      ?.addEventListener(
        "click",
        salvarMeta
      );


    $("exportCSVButton")
      ?.addEventListener(
        "click",
        exportarCSV
      );


    $("backupButton")
      ?.addEventListener(
        "click",
        exportarBackup
      );


    atualizarFerramentas();

  }


  // =====================================================
  // ORÇAMENTO
  // =====================================================

  function chaveOrcamento() {

    return chaveLancamentos() +
      "_orcamento";

  }


  function salvarOrcamento() {

    const valor =
      Number(
        $("budgetInput")?.value
      );


    if (!valor || valor <= 0) {

      alert(
        "Digite um orçamento válido."
      );

      return;
    }


    localStorage.setItem(
      chaveOrcamento(),
      String(valor)
    );


    atualizarFerramentas();

  }


  function pegarOrcamento() {

    return Number(
      localStorage.getItem(
        chaveOrcamento()
      )
    ) || 0;

  }


  // =====================================================
  // META
  // =====================================================

  function chaveMeta() {

    return chaveLancamentos() +
      "_meta";

  }


  function salvarMeta() {

    const valor =
      Number(
        $("goalInput")?.value
      );


    if (!valor || valor <= 0) {

      alert(
        "Digite uma meta válida."
      );

      return;
    }


    localStorage.setItem(
      chaveMeta(),
      String(valor)
    );


    atualizarFerramentas();

  }


  function pegarMeta() {

    return Number(
      localStorage.getItem(
        chaveMeta()
      )
    ) || 0;

  }


  function atualizarFerramentas() {

    if (!$("financeTools")) return;


    const orcamento =
      pegarOrcamento();

    const meta =
      pegarMeta();


    if ($("budgetInput")) {

      $("budgetInput").value =
        orcamento || "";

    }


    if ($("goalInput")) {

      $("goalInput").value =
        meta || "";

    }


    if ($("budgetTotal")) {

      $("budgetTotal").textContent =
        dinheiro(orcamento);

    }


    if ($("goalTotal")) {

      $("goalTotal").textContent =
        dinheiro(meta);

    }


    const lista =
      filtrarPeriodo(
        pegarLancamentos()
      );


    const despesas =
      lista
        .filter(function (item) {

          return item.tipo === "expense";

        })
        .reduce(function (total, item) {

          return total +
            Number(item.valor || 0);

        }, 0);


    if ($("budgetStatus")) {

      if (!orcamento) {

        $("budgetStatus").textContent =
          "Nenhum orçamento definido.";

      } else {

        const restante =
          orcamento - despesas;


        $("budgetStatus").innerHTML = `

          Gastos no período:
          <strong>
            ${dinheiro(despesas)}
          </strong>

          <br><br>

          ${
            restante >= 0
              ? "Ainda disponível: " +
                dinheiro(restante)
              : "Você ultrapassou o orçamento em " +
                dinheiro(Math.abs(restante))
          }

        `;

      }

    }


    if ($("goalStatus")) {

      if (!meta) {

        $("goalStatus").textContent =
          "Nenhuma meta definida.";

      } else {

        const saldo =
          lista.reduce(
            function (total, item) {

              if (
                item.tipo === "income"
              ) {

                return total +
                  Number(item.valor || 0);

              }

              return total -
                Number(item.valor || 0);

            },
            0
          );


        const percentual =
          Math.max(
            0,
            Math.min(
              100,
              (saldo / meta) * 100
            )
          );


        $("goalStatus").innerHTML = `

          Saldo acumulado:
          <strong>
            ${dinheiro(saldo)}
          </strong>

          <br><br>

          Progresso:
          <strong>
            ${percentual.toFixed(1)}%
          </strong>

        `;

      }

    }

  }


  // =====================================================
  // ATUALIZAR TUDO
  // =====================================================

  function atualizarTudo() {

    atualizarFiltroCategorias();

    atualizarDashboard();

    atualizarTabela();

    atualizarRelatorios();

    atualizarFerramentas();

  }


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  criarFerramentas();


  // Definir data atual no modal

  if ($("transactionDate")) {

    $("transactionDate").value =
      hoje();

  }


  // =====================================================
  // RECUPERAR LOGIN
  // =====================================================

  const estaLogado =
    localStorage.getItem(
      "controleFinanceiroLogado"
    );


  const usuarioSalvo =
    pegarUsuario();


  if (
    estaLogado === "true" &&
    usuarioSalvo
  ) {

    usuarioAtual =
      usuarioSalvo;

    abrirSistema();

  } else {

    authScreen?.classList.remove("hidden");
    appScreen?.classList.add("hidden");

  }

});

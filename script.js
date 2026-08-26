document.addEventListener("DOMContentLoaded", function () {

  // =========================================================
  // CONFIGURAÇÃO
  // =========================================================

  const STORAGE_USER = "controleFinanceiroUsuario";
  const STORAGE_LOGADO = "controleFinanceiroLogado";
  const STORAGE_LANCAMENTOS = "controleFinanceiroLancamentos";

  let editandoId = null;

  let financeChart = null;
  let categoryChart = null;


  // =========================================================
  // ELEMENTOS
  // =========================================================

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


  // =========================================================
  // MENSAGENS
  // =========================================================

  function mostrarMensagem(elemento, mensagem, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";

  }


  // =========================================================
  // FORMATAÇÃO DE DINHEIRO
  // =========================================================

  function dinheiro(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  }


  // =========================================================
  // CONVERTER VALOR BRASILEIRO
  // =========================================================

  function converterValor(valorTexto) {

    if (valorTexto === null || valorTexto === undefined) {
      return NaN;
    }

    let texto = String(valorTexto)
      .trim()
      .replace(/\s/g, "")
      .replace(/R\$/gi, "");


    if (!texto) {
      return NaN;
    }


    /*
      Exemplos:

      2.200      -> 2200
      2.200,50   -> 2200.50
      2200       -> 2200
      2200,50    -> 2200.50
      2,50       -> 2.50
    */

    if (
      texto.includes(".") &&
      texto.includes(",")
    ) {

      texto = texto
        .replace(/\./g, "")
        .replace(",", ".");

    } else if (texto.includes(",")) {

      texto = texto.replace(",", ".");

    } else if (
      texto.includes(".") &&
      /^\d{1,3}(\.\d{3})+$/.test(texto)
    ) {

      texto = texto.replace(/\./g, "");

    }


    const numero = Number(texto);

    return numero;

  }


  // =========================================================
  // USUÁRIO
  // =========================================================

  function pegarUsuario() {

    const dados =
      localStorage.getItem(STORAGE_USER);

    if (!dados) {
      return null;
    }

    try {

      return JSON.parse(dados);

    } catch (erro) {

      localStorage.removeItem(STORAGE_USER);

      return null;

    }

  }


  // =========================================================
  // LANÇAMENTOS
  // =========================================================

  function pegarLancamentos() {

    const dados =
      localStorage.getItem(STORAGE_LANCAMENTOS);

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
      STORAGE_LANCAMENTOS,
      JSON.stringify(lancamentos)
    );

  }


  // =========================================================
  // MOSTRAR LOGIN
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


  // =========================================================
  // MOSTRAR CADASTRO
  // =========================================================

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


  // =========================================================
  // BOTÃO CRIAR CONTA
  // =========================================================

  showRegisterButton?.addEventListener(
    "click",
    function () {

      mostrarCadastro();

    }
  );


  // =========================================================
  // BOTÃO VOLTAR LOGIN
  // =========================================================

  showLoginButton?.addEventListener(
    "click",
    function () {

      mostrarLogin();

    }
  );


  // =========================================================
  // TIPO DE CONTA
  // =========================================================

  const registerAccountType =
    document.getElementById("registerAccountType");

  const companyField =
    document.getElementById("companyField");


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


  // =========================================================
  // CADASTRO
  // =========================================================

  registerButton?.addEventListener(
    "click",
    function (event) {

      event.preventDefault();


      const registerMessage =
        document.getElementById("registerMessage");


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


      const usuario = {

        nome: nome,

        email: email.toLowerCase(),

        senha: senha,

        tipo: tipo,

        empresa: empresa,

        criadoEm:
          new Date().toISOString()

      };


      try {

        localStorage.setItem(
          STORAGE_USER,
          JSON.stringify(usuario)
        );


        localStorage.setItem(
          STORAGE_LANCAMENTOS,
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


      document.getElementById("registerName").value = "";
      document.getElementById("registerEmail").value = "";
      document.getElementById("registerPassword").value = "";

      const registerCompany =
        document.getElementById("registerCompany");

      if (registerCompany) {
        registerCompany.value = "";
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


      const loginMessage =
        document.getElementById("loginMessage");


      const email =
        document.getElementById("loginEmail")
          ?.value.trim()
          .toLowerCase();


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


      const usuario =
        pegarUsuario();


      if (!usuario) {

        mostrarMensagem(
          loginMessage,
          "Nenhuma conta cadastrada."
        );

        return;

      }


      if (
        email !== usuario.email.toLowerCase() ||
        senha !== usuario.senha
      ) {

        mostrarMensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;

      }


      localStorage.setItem(
        STORAGE_LOGADO,
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


    const tipos = {

      pessoal: "Pessoal",

      empresa: "Empresa",

      ambos: "Pessoal + Empresa"

    };


    const profileAccountType =
      document.getElementById("profileAccountType");


    if (profileAccountType) {

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


  // =========================================================
  // LOGOUT
  // =========================================================

  logoutButton?.addEventListener(
    "click",
    function () {

      localStorage.removeItem(STORAGE_LOGADO);

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
          atualizarRelatorios();
        }


        if (sectionName === "transactions") {
          atualizarTabela();
        }


        if (window.innerWidth <= 900) {

          document
            .querySelector(".sidebar")
            ?.classList.remove("mobile-open");

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

  const transactionModalTitle =
    document.getElementById(
      "transactionModalTitle"
    );


  function abrirModal(tipo = "income", id = null) {

    editandoId = id;


    const tipoCampo =
      document.getElementById("transactionType");

    const descricaoCampo =
      document.getElementById("transactionDescription");

    const valorCampo =
      document.getElementById("transactionAmount");

    const categoriaCampo =
      document.getElementById("transactionCategory");

    const dataCampo =
      document.getElementById("transactionDate");

    const mensagem =
      document.getElementById("transactionMessage");


    if (mensagem) {
      mensagem.textContent = "";
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


      if (transactionModalTitle) {
        transactionModalTitle.textContent =
          "Editar lançamento";
      }


      if (tipoCampo) {
        tipoCampo.value = item.tipo;
      }

      if (descricaoCampo) {
        descricaoCampo.value = item.descricao;
      }

      if (valorCampo) {
        valorCampo.value =
          Number(item.valor)
            .toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
      }

      if (categoriaCampo) {
        categoriaCampo.value = item.categoria;
      }

      if (dataCampo) {
        dataCampo.value = item.data;
      }


    } else {

      if (transactionModalTitle) {
        transactionModalTitle.textContent =
          "Novo lançamento";
      }


      if (tipoCampo) {
        tipoCampo.value = tipo;
      }


      if (descricaoCampo) {
        descricaoCampo.value = "";
      }


      if (valorCampo) {
        valorCampo.value = "";
      }


      if (categoriaCampo) {
        categoriaCampo.value = "outros";
      }


      if (dataCampo) {

        const hoje =
          new Date();

        const ano =
          hoje.getFullYear();

        const mes =
          String(hoje.getMonth() + 1)
            .padStart(2, "0");

        const dia =
          String(hoje.getDate())
            .padStart(2, "0");

        dataCampo.value =
          `${ano}-${mes}-${dia}`;

      }

    }


    transactionModal?.classList.remove("hidden");

  }


  function fecharModal() {

    transactionModal?.classList.add("hidden");

    editandoId = null;

  }


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


  document
    .getElementById("closeTransactionModal")
    ?.addEventListener(
      "click",
      fecharModal
    );


  document
    .getElementById("cancelTransactionButton")
    ?.addEventListener(
      "click",
      fecharModal
    );


  // =========================================================
  // SALVAR LANÇAMENTO
  // =========================================================

  document
    .getElementById("saveTransactionButton")
    ?.addEventListener(
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


        if (!descricao) {

          mostrarMensagem(
            mensagem,
            "Digite uma descrição."
          );

          return;

        }


        const valor =
          converterValor(valorTexto);


        if (!Number.isFinite(valor) || valor <= 0) {

          mostrarMensagem(
            mensagem,
            "Digite um valor válido. Ex.: 2.200,50"
          );

          return;

        }


        if (!data) {

          mostrarMensagem(
            mensagem,
            "Selecione uma data."
          );

          return;

        }


        let lancamentos =
          pegarLancamentos();


        if (editandoId !== null) {

          lancamentos =
            lancamentos.map(
              function (item) {

                if (item.id === editandoId) {

                  return {

                    ...item,

                    tipo: tipo,

                    descricao: descricao,

                    valor: valor,

                    categoria: categoria,

                    data: data

                  };

                }

                return item;

              }
            );


        } else {

          const novoLancamento = {

            id:
              Date.now(),

            tipo:
              tipo,

            descricao:
              descricao,

            valor:
              valor,

            categoria:
              categoria,

            data:
              data,

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


        atualizarTudo();

      }
    );


  // =========================================================
  // EXCLUIR LANÇAMENTO
  // =========================================================

  function excluirLancamento(id) {

    const confirmar =
      window.confirm(
        "Tem certeza que deseja excluir este lançamento?"
      );


    if (!confirmar) {
      return;
    }


    let lancamentos =
      pegarLancamentos();


    lancamentos =
      lancamentos.filter(
        function (item) {
          return item.id !== id;
        }
      );


    salvarLancamentos(
      lancamentos
    );


    atualizarTudo();

  }


  // =========================================================
  // CATEGORIAS
  // =========================================================

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


  function nomeCategoria(categoria) {

    return nomesCategorias[categoria]
      || categoria
      || "Outros";

  }


  // =========================================================
  // TABELA
  // =========================================================

  function atualizarTabela() {

    const tbody =
      document.getElementById(
        "transactionsTableBody"
      );


    if (!tbody) return;


    const pesquisa =
      document.getElementById(
        "transactionSearch"
      )?.value
      .trim()
      .toLowerCase()
      || "";


    const filtroTipo =
      document.getElementById(
        "transactionTypeFilter"
      )?.value
      || "all";


    const filtroCategoria =
      document.getElementById(
        "transactionCategoryFilter"
      )?.value
      || "all";


    let lancamentos =
      pegarLancamentos();


    lancamentos =
      lancamentos.filter(
        function (item) {

          const texto =
            (
              item.descricao +
              " " +
              nomeCategoria(item.categoria)
            )
              .toLowerCase();


          const correspondePesquisa =
            !pesquisa ||
            texto.includes(pesquisa);


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


    lancamentos.sort(
      function (a, b) {

        return new Date(b.data) -
          new Date(a.data);

      }
    );


    atualizarFiltroCategorias();


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


            const dataFormatada =
              formatarData(item.data);


            return `

              <tr>

                <td>
                  ${dataFormatada}
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

                <td class="${classe}">
                  ${sinal} ${dinheiro(item.valor)}
                </td>

                <td>

                  <button
                    type="button"
                    onclick="editarLancamento(${item.id})"
                    title="Editar"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onclick="excluirLancamento(${item.id})"
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


  // =========================================================
  // DISPONIBILIZAR EDITAR/EXCLUIR
  // =========================================================

  window.editarLancamento =
    function (id) {

      abrirModal(
        "income",
        Number(id)
      );

    };


  window.excluirLancamento =
    function (id) {

      excluirLancamento(
        Number(id)
      );

    };


  // =========================================================
  // FILTRO DE CATEGORIAS
  // =========================================================

  function atualizarFiltroCategorias() {

    const select =
      document.getElementById(
        "transactionCategoryFilter"
      );


    if (!select) return;


    const valorAtual =
      select.value;


    const lancamentos =
      pegarLancamentos();


    const categorias =
      [
        ...new Set(
          lancamentos
            .map(
              function (item) {
                return item.categoria;
              }
            )
            .filter(Boolean)
        )
      ];


    select.innerHTML = `

      <option value="all">
        Todas as categorias
      </option>

    `;


    categorias.forEach(
      function (categoria) {

        const option =
          document.createElement("option");


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
      categorias.includes(valorAtual)
    ) {

      select.value =
        valorAtual;

    } else {

      select.value =
        "all";

    }

  }


  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatarData(data) {

    if (!data) {
      return "—";
    }


    const partes =
      data.split("-");


    if (partes.length !== 3) {
      return data;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

  }


  // =========================================================
  // ESCAPAR HTML
  // =========================================================

  function escaparHTML(texto) {

    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

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
      pegarLancamentos()
        .slice()
        .sort(
          function (a, b) {

            return new Date(b.data) -
              new Date(a.data);

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

                  <div
                    class="transaction-icon ${classe}"
                  >
                    ${item.tipo === "income"
                      ? "↑"
                      : "↓"}
                  </div>

                  <div>

                    <div
                      class="transaction-description"
                    >
                      ${escaparHTML(
                        item.descricao
                      )}
                    </div>

                    <div
                      class="transaction-date"
                    >
                      ${formatarData(item.data)}
                    </div>

                  </div>

                </div>

                <div
                  class="transaction-value ${classe}"
                >
                  ${sinal}
                  ${dinheiro(item.valor)}
                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  function atualizarDashboard() {

    let lancamentos =
      pegarLancamentos();


    const periodo =
      document.getElementById(
        "dashboardPeriod"
      )?.value
      || "month";


    const agora =
      new Date();


    lancamentos =
      lancamentos.filter(
        function (item) {

          if (periodo === "all") {
            return true;
          }


          const data =
            new Date(
              item.data + "T12:00:00"
            );


          if (periodo === "month") {

            return (
              data.getMonth() ===
              agora.getMonth() &&
              data.getFullYear() ===
              agora.getFullYear()
            );

          }


          if (periodo === "year") {

            return (
              data.getFullYear() ===
              agora.getFullYear()
            );

          }


          return true;

        }
      );


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(
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
        lancamentos.length;

    }


    atualizarLancamentosRecentes();

    atualizarGraficoFinanceiro(
      receitas,
      despesas
    );

  }


  // =========================================================
  // GRÁFICO FINANCEIRO
  // =========================================================

  function atualizarGraficoFinanceiro(
    receitas,
    despesas
  ) {

    const canvas =
      document.getElementById(
        "financeChart"
      );


    if (!canvas) return;


    if (typeof Chart === "undefined") {
      return;
    }


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

            },

            scales: {

              y: {

                beginAtZero: true

              }

            }

          }

        }
      );

  }


  // =========================================================
  // RELATÓRIOS
  // =========================================================

  function atualizarRelatorios() {

    const lancamentos =
      pegarLancamentos();


    const despesasPorCategoria = {};


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(
      function (item) {

        if (item.tipo === "income") {

          receitas +=
            Number(item.valor) || 0;

        }


        if (item.tipo === "expense") {

          despesas +=
            Number(item.valor) || 0;


          const categoria =
            item.categoria || "outros";


          despesasPorCategoria[categoria] =
            (
              despesasPorCategoria[categoria]
              || 0
            ) +
            (
              Number(item.valor) || 0
            );

        }

      }
    );


    atualizarGraficoCategorias(
      despesasPorCategoria
    );


    const saldo =
      receitas - despesas;


    const reportSummary =
      document.getElementById(
        "reportSummary"
      );


    if (reportSummary) {

      reportSummary.innerHTML = `

        <div style="display:grid;gap:15px;">

          <div>
            <strong>Receitas</strong>
            <div>
              ${dinheiro(receitas)}
            </div>
          </div>

          <div>
            <strong>Despesas</strong>
            <div>
              ${dinheiro(despesas)}
            </div>
          </div>

          <div>
            <strong>Saldo</strong>
            <div>
              ${dinheiro(saldo)}
            </div>
          </div>

          <div>
            <strong>Lançamentos</strong>
            <div>
              ${lancamentos.length}
            </div>
          </div>

        </div>

      `;

    }

  }


  // =========================================================
  // GRÁFICO DE CATEGORIAS
  // =========================================================

  function atualizarGraficoCategorias(
    dados
  ) {

    const canvas =
      document.getElementById(
        "categoryChart"
      );


    if (!canvas) return;


    if (typeof Chart === "undefined") {
      return;
    }


    const categorias =
      Object.keys(dados);


    const valores =
      Object.values(dados);


    if (categoryChart) {

      categoryChart.destroy();

    }


    if (categorias.length === 0) {

      categoryChart = null;

      return;

    }


    categoryChart =
      new Chart(
        canvas,
        {

          type: "doughnut",

          data: {

            labels:
              categorias.map(
                nomeCategoria
              ),

            datasets: [

              {

                data:
                  valores

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
  // FILTROS
  // =========================================================

  document
    .getElementById("transactionSearch")
    ?.addEventListener(
      "input",
      atualizarTabela
    );


  document
    .getElementById("transactionTypeFilter")
    ?.addEventListener(
      "change",
      atualizarTabela
    );


  document
    .getElementById("transactionCategoryFilter")
    ?.addEventListener(
      "change",
      atualizarTabela
    );


  document
    .getElementById("dashboardPeriod")
    ?.addEventListener(
      "change",
      atualizarDashboard
    );


  // =========================================================
  // VER TODOS
  // =========================================================

  document
    .getElementById("viewTransactionsButton")
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


        const transactionsMenu =
          document.querySelector(
            '[data-section="transactions"]'
          );


        transactionsMenu?.classList.add(
          "active"
        );


        sections.forEach(
          function (section) {

            section.classList.remove(
              "active-section"
            );

          }
        );


        document
          .getElementById("transactions")
          ?.classList.add(
            "active-section"
          );


        atualizarTabela();

      }
    );


  // =========================================================
  // ATUALIZAR TUDO
  // =========================================================

  function atualizarTudo() {

    atualizarDashboard();

    atualizarTabela();

    atualizarRelatorios();

  }


  // =========================================================
  // VERIFICAR LOGIN AO ABRIR
  // =========================================================

  const usuarioInicial =
    pegarUsuario();


  const estaLogado =
    localStorage.getItem(
      STORAGE_LOGADO
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

  }

});

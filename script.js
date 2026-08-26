/* =========================================================
   CONTROLE FINANCEIRO
   SCRIPT PRINCIPAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  // ========================================================
  // ELEMENTOS
  // ========================================================

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


  // ========================================================
  // MENSAGENS
  // ========================================================

  const loginMessage =
    document.getElementById("loginMessage");

  const registerMessage =
    document.getElementById("registerMessage");


  function mostrarMensagem(elemento, mensagem, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";
  }


  // ========================================================
  // MOSTRAR LOGIN
  // ========================================================

  function mostrarLogin() {

    if (loginForm) {
      loginForm.classList.remove("hidden");
    }

    if (registerForm) {
      registerForm.classList.add("hidden");
    }

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    if (registerMessage) {
      registerMessage.textContent = "";
    }
  }


  // ========================================================
  // MOSTRAR CADASTRO
  // ========================================================

  function mostrarCadastro() {

    if (loginForm) {
      loginForm.classList.add("hidden");
    }

    if (registerForm) {
      registerForm.classList.remove("hidden");
    }

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    if (registerMessage) {
      registerMessage.textContent = "";
    }
  }


  // ========================================================
  // BOTÃO CRIAR CONTA
  // ========================================================

  if (showRegisterButton) {

    showRegisterButton.addEventListener("click", function (event) {

      event.preventDefault();

      mostrarCadastro();

    });

  }


  // ========================================================
  // BOTÃO VOLTAR PARA LOGIN
  // ========================================================

  if (showLoginButton) {

    showLoginButton.addEventListener("click", function (event) {

      event.preventDefault();

      mostrarLogin();

    });

  }


  // ========================================================
  // TIPO DE CONTA
  // ========================================================

  if (registerAccountType) {

    registerAccountType.addEventListener("change", function () {

      const tipo = this.value;

      if (
        tipo === "empresa" ||
        tipo === "ambos"
      ) {

        if (companyField) {
          companyField.classList.remove("hidden");
        }

      } else {

        if (companyField) {
          companyField.classList.add("hidden");
        }

      }

    });

  }


  // ========================================================
  // FUNÇÃO PARA PEGAR USUÁRIO
  // ========================================================

  function pegarUsuario() {

    const usuario =
      localStorage.getItem("controleFinanceiroUsuario");

    if (!usuario) {
      return null;
    }

    try {

      return JSON.parse(usuario);

    } catch (erro) {

      localStorage.removeItem(
        "controleFinanceiroUsuario"
      );

      return null;
    }

  }


  // ========================================================
  // CADASTRAR USUÁRIO
  // ========================================================

  if (registerButton) {

    registerButton.addEventListener("click", function (event) {

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


      // -------------------------------
      // VALIDAÇÕES
      // -------------------------------

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


      // ====================================================
      // CRIAR USUÁRIO
      // ====================================================

      const usuario = {

        nome: nome,

        email: email,

        senha: senha,

        tipo: tipo,

        empresa: empresa,

        criadoEm:
          new Date().toISOString()

      };


      localStorage.setItem(
        "controleFinanceiroUsuario",
        JSON.stringify(usuario)
      );


      // Criar lista de lançamentos
      localStorage.setItem(
        "controleFinanceiroLancamentos",
        JSON.stringify([])
      );


      // ====================================================
      // SUCESSO
      // ====================================================

      mostrarMensagem(
        registerMessage,
        "Conta criada com sucesso!",
        true
      );


      // Coloca o e-mail automaticamente no login

      const loginEmail =
        document.getElementById("loginEmail");

      if (loginEmail) {
        loginEmail.value = email;
      }


      // Limpa campos

      const registerName =
        document.getElementById("registerName");

      const registerEmail =
        document.getElementById("registerEmail");

      const registerPassword =
        document.getElementById("registerPassword");

      if (registerName) {
        registerName.value = "";
      }

      if (registerEmail) {
        registerEmail.value = "";
      }

      if (registerPassword) {
        registerPassword.value = "";
      }


      // Depois de um pequeno intervalo,
      // volta para o login.

      setTimeout(function () {

        mostrarLogin();

        if (loginEmail) {
          loginEmail.value = email;
        }

      }, 1000);

    });

  }


  // ========================================================
  // LOGIN
  // ========================================================

  if (loginButton) {

    loginButton.addEventListener("click", function (event) {

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
        usuario.email.toLowerCase()
      ) {

        mostrarMensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;
      }


      if (senha !== usuario.senha) {

        mostrarMensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;
      }


      // ====================================================
      // LOGIN REALIZADO
      // ====================================================

      localStorage.setItem(
        "controleFinanceiroLogado",
        "true"
      );


      abrirSistema(usuario);

    });

  }


  // ========================================================
  // ABRIR SISTEMA
  // ========================================================

  function abrirSistema(usuario) {

    if (authScreen) {
      authScreen.classList.add("hidden");
    }

    if (appScreen) {
      appScreen.classList.remove("hidden");
    }


    // Nome no topo

    const userName =
      document.getElementById("userName");

    if (userName) {
      userName.textContent =
        usuario.nome;
    }


    // Perfil

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
        tipos[usuario.tipo] ||
        "Pessoal";
    }


    const profileCompany =
      document.getElementById(
        "profileCompany"
      );

    if (profileCompany) {

      profileCompany.textContent =
        usuario.empresa || "—";
    }


    atualizarDashboard();

  }


  // ========================================================
  // LOGOUT
  // ========================================================

  if (logoutButton) {

    logoutButton.addEventListener("click", function () {

      localStorage.removeItem(
        "controleFinanceiroLogado"
      );

      if (appScreen) {
        appScreen.classList.add("hidden");
      }

      if (authScreen) {
        authScreen.classList.remove("hidden");
      }

      mostrarLogin();

    });

  }


  // ========================================================
  // MENU
  // ========================================================

  const menuItems =
    document.querySelectorAll(
      ".menu-item"
    );

  const sections =
    document.querySelectorAll(
      ".content-section"
    );


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
          document.getElementById(
            sectionName
          );

        if (section) {

          section.classList.add(
            "active-section"
          );

        }

      }
    );

  });


  // ========================================================
  // MENU MOBILE
  // ========================================================

  const mobileMenuButton =
    document.getElementById(
      "mobileMenuButton"
    );

  const sidebar =
    document.querySelector(
      ".sidebar"
    );


  if (mobileMenuButton && sidebar) {

    mobileMenuButton.addEventListener(
      "click",
      function () {

        sidebar.classList.toggle(
          "mobile-open"
        );

      }
    );

  }


  // ========================================================
  // LANÇAMENTOS
  // ========================================================

  function pegarLancamentos() {

    const dados =
      localStorage.getItem(
        "controleFinanceiroLancamentos"
      );

    if (!dados) {
      return [];
    }

    try {

      return JSON.parse(dados);

    } catch (erro) {

      return [];

    }

  }


  function salvarLancamentos(lancamentos) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(lancamentos)
    );

  }


  // ========================================================
  // FORMATAR DINHEIRO
  // ========================================================

  function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

  }


  // ========================================================
  // DASHBOARD
  // ========================================================

  function atualizarDashboard() {

    const lancamentos =
      pegarLancamentos();


    let receitas = 0;
    let despesas = 0;


    lancamentos.forEach(function (item) {

      if (item.tipo === "income") {

        receitas += Number(item.valor);

      }

      if (item.tipo === "expense") {

        despesas += Number(item.valor);

      }

    });


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


  // ========================================================
  // LANÇAMENTOS RECENTES
  // ========================================================

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
        .reverse()
        .slice(0, 5);


    container.innerHTML =
      recentes.map(function (item) {

        const sinal =
          item.tipo === "income"
            ? "+"
            : "-";

        const classe =
          item.tipo === "income"
            ? "income"
            : "expense";


        return `

          <div class="transaction-row">

            <div class="transaction-info">

              <div class="transaction-icon ${classe}">
                ${item.tipo === "income" ? "↑" : "↓"}
              </div>

              <div>

                <div class="transaction-description">
                  ${item.descricao}
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


  // ========================================================
  // BOTÕES DE RECEITA E DESPESA
  // ========================================================

  const quickIncomeButton =
    document.getElementById(
      "quickIncomeButton"
    );

  const quickExpenseButton =
    document.getElementById(
      "quickExpenseButton"
    );

  const newTransactionButton =
    document.getElementById(
      "newTransactionButton"
    );


  function abrirModal(tipo) {

    const modal =
      document.getElementById(
        "transactionModal"
      );

    const transactionType =
      document.getElementById(
        "transactionType"
      );


    if (!modal) return;


    if (transactionType) {
      transactionType.value =
        tipo || "income";
    }


    modal.classList.remove("hidden");

  }


  if (quickIncomeButton) {

    quickIncomeButton.addEventListener(
      "click",
      function () {

        abrirModal("income");

      }
    );

  }


  if (quickExpenseButton) {

    quickExpenseButton.addEventListener(
      "click",
      function () {

        abrirModal("expense");

      }
    );

  }


  if (newTransactionButton) {

    newTransactionButton.addEventListener(
      "click",
      function () {

        abrirModal("income");

      }
    );

  }


  // ========================================================
  // FECHAR MODAL
  // ========================================================

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


  function fecharModal() {

    if (transactionModal) {

      transactionModal.classList.add(
        "hidden"
      );

    }

  }


  if (closeTransactionModal) {

    closeTransactionModal.addEventListener(
      "click",
      fecharModal
    );

  }


  if (cancelTransactionButton) {

    cancelTransactionButton.addEventListener(
      "click",
      fecharModal
    );

  }


  // ========================================================
  // SALVAR LANÇAMENTO
  // ========================================================

  const saveTransactionButton =
    document.getElementById(
      "saveTransactionButton"
    );


  if (saveTransactionButton) {

    saveTransactionButton.addEventListener(
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
            "

/* =========================================================
   CONTROLE FINANCEIRO
   SCRIPT PRINCIPAL
   SUPABASE + LOGIN + CADASTRO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

  // ========================================================
  // SUPABASE
  // ========================================================

  const SUPABASE_URL =
    "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

  if (!window.supabase) {
    console.error("Biblioteca do Supabase não carregada.");
    alert("Erro: o Supabase não foi carregado.");
    return;
  }

  const supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  // ========================================================
  // ELEMENTOS
  // ========================================================

  const authScreen =
    document.getElementById("authScreen");

  const appScreen =
    document.getElementById("appScreen");

  const loginForm =
    document.getElementById("loginForm");

  const registerForm =
    document.getElementById("registerForm");

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


  // ========================================================
  // MENSAGENS
  // ========================================================

  function mostrarMensagem(
    elemento,
    mensagem,
    sucesso = false
  ) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.color =
      sucesso
        ? "#1f513d"
        : "#d94b4b";
  }


  // ========================================================
  // LOGIN / CADASTRO
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

    showRegisterButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        mostrarCadastro();

      }
    );

  }


  // ========================================================
  // BOTÃO VOLTAR PARA LOGIN
  // ========================================================

  if (showLoginButton) {

    showLoginButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        mostrarLogin();

      }
    );

  }


  // ========================================================
  // TIPO DE CONTA
  // ========================================================

  if (registerAccountType) {

    registerAccountType.addEventListener(
      "change",
      function () {

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

      }
    );

  }


  // ========================================================
  // CADASTRO
  // ========================================================

  if (registerButton) {

    registerButton.addEventListener(
      "click",
      async function (event) {

        event.preventDefault();

        const nome =
          document
            .getElementById("registerName")
            ?.value
            .trim() || "";

        const email =
          document
            .getElementById("registerEmail")
            ?.value
            .trim() || "";

        const senha =
          document
            .getElementById("registerPassword")
            ?.value || "";

        const tipo =
          document
            .getElementById("registerAccountType")
            ?.value || "pessoal";

        const empresa =
          document
            .getElementById("registerCompany")
            ?.value
            .trim() || "";


        // ==================================================
        // VALIDAÇÕES
        // ==================================================

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


        // ==================================================
        // DESABILITA BOTÃO
        // ==================================================

        registerButton.disabled = true;

        registerButton.textContent =
          "Criando conta...";


        mostrarMensagem(
          registerMessage,
          "Criando sua conta...",
          true
        );


        // ==================================================
        // CADASTRO NO SUPABASE AUTH
        // ==================================================

        try {

          const { data, error } =
            await supabaseClient.auth.signUp({

              email: email,

              password: senha,

              options: {

                data: {

                  nome: nome,

                  tipo: tipo,

                  empresa: empresa

                }

              }

            });


          // =================================================
          // ERRO
          // =================================================

          if (error) {

            console.error(
              "Erro Supabase:",
              error
            );

            let mensagem =
              error.message ||
              "Não foi possível criar a conta.";


            if (
              error.message
                .toLowerCase()
                .includes("already registered")
            ) {

              mensagem =
                "Este e-mail já possui uma conta.";

            }


            mostrarMensagem(
              registerMessage,
              mensagem
            );

            registerButton.disabled = false;

            registerButton.textContent =
              "Criar minha conta";

            return;
          }


          // =================================================
          // CONTA CRIADA
          // =================================================

          console.log(
            "Usuário criado:",
            data.user
          );


          // =================================================
          // PERFIL
          // =================================================

          if (data.user) {

            try {

              const { error: profileError } =
                await supabaseClient
                  .from("profiles")
                  .upsert({

                    id: data.user.id,

                    nome: nome,

                    email: email,

                    tipo: tipo,

                    empresa: empresa

                  });


              if (profileError) {

                console.warn(
                  "Perfil não foi salvo:",
                  profileError
                );

              }

            } catch (profileError) {

              console.warn(
                "Erro ao salvar perfil:",
                profileError
              );

            }

          }


          // =================================================
          // MENSAGEM
          // =================================================

          mostrarMensagem(
            registerMessage,
            "Conta criada com sucesso!",
            true
          );


          // =================================================
          // LIMPAR CAMPOS
          // =================================================

          const loginEmail =
            document.getElementById(
              "loginEmail"
            );

          if (loginEmail) {
            loginEmail.value = email;
          }


          const registerName =
            document.getElementById(
              "registerName"
            );

          const registerEmail =
            document.getElementById(
              "registerEmail"
            );

          const registerPassword =
            document.getElementById(
              "registerPassword"
            );

          if (registerName) {
            registerName.value = "";
          }

          if (registerEmail) {
            registerEmail.value = "";
          }

          if (registerPassword) {
            registerPassword.value = "";
          }


          // =================================================
          // SE O SUPABASE EXIGIR CONFIRMAÇÃO
          // =================================================

          if (
            data.user &&
            !data.session
          ) {

            mostrarMensagem(
              registerMessage,
              "Conta criada! Verifique seu e-mail para confirmar a conta.",
              true
            );

            registerButton.disabled = false;

            registerButton.textContent =
              "Criar minha conta";

            return;
          }


          // =================================================
          // SE JÁ ENTROU AUTOMATICAMENTE
          // =================================================

          if (data.session) {

            const usuario = {

              id: data.user.id,

              nome: nome,

              email: email,

              tipo: tipo,

              empresa: empresa

            };

            abrirSistema(usuario);

          } else {

            registerButton.disabled = false;

            registerButton.textContent =
              "Criar minha conta";

            setTimeout(
              function () {

                mostrarLogin();

              },
              1500
            );

          }

        } catch (erro) {

          console.error(
            "Erro inesperado:",
            erro
          );

          mostrarMensagem(
            registerMessage,
            "Ocorreu um erro. Verifique sua conexão e tente novamente."
          );

          registerButton.disabled = false;

          registerButton.textContent =
            "Criar minha conta";

        }

      }
    );

  }


  // ========================================================
  // LOGIN
  // ========================================================

  if (loginButton) {

    loginButton.addEventListener(
      "click",
      async function (event) {

        event.preventDefault();

        const email =
          document
            .getElementById("loginEmail")
            ?.value
            .trim() || "";

        const senha =
          document
            .getElementById("loginPassword")
            ?.value || "";


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

          const { data, error } =
            await supabaseClient.auth.signInWithPassword({

              email: email,

              password: senha

            });


          if (error) {

            console.error(
              "Erro login:",
              error
            );

            mostrarMensagem(
              loginMessage,
              "E-mail ou senha incorretos."
            );

            loginButton.disabled = false;

            loginButton.textContent =
              "Entrar";

            return;
          }


          let usuario = {

            id: data.user.id,

            nome:
              data.user.user_metadata?.nome ||
              email.split("@")[0],

            email:
              data.user.email,

            tipo:
              data.user.user_metadata?.tipo ||
              "pessoal",

            empresa:
              data.user.user_metadata?.empresa ||
              ""

          };


          // =================================================
          // TENTA BUSCAR PERFIL
          // =================================================

          try {

            const { data: perfil } =
              await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .maybeSingle();


            if (perfil) {

              usuario.nome =
                perfil.nome ||
                perfil.name ||
                usuario.nome;

              usuario.email =
                perfil.email ||
                usuario.email;

              usuario.tipo =
                perfil.tipo ||
                perfil.account_type ||
                usuario.tipo;

              usuario.empresa =
                perfil.empresa ||
                perfil.company ||
                usuario.empresa;

            }

          } catch (erroPerfil) {

            console.warn(
              "Não foi possível carregar o perfil:",
              erroPerfil
            );

          }


          abrirSistema(usuario);


        } catch (erro) {

          console.error(
            erro
          );

          mostrarMensagem(
            loginMessage,
            "Erro ao entrar na conta."
          );

        }


        loginButton.disabled = false;

        loginButton.textContent =
          "Entrar";

      }
    );

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


    const userName =
      document.getElementById(
        "userName"
      );

    if (userName) {

      userName.textContent =
        usuario.nome ||
        "Usuário";

    }


    const profileName =
      document.getElementById(
        "profileName"
      );

    if (profileName) {

      profileName.textContent =
        usuario.nome ||
        "Usuário";

    }


    const profileEmail =
      document.getElementById(
        "profileEmail"
      );

    if (profileEmail) {

      profileEmail.textContent =
        usuario.email ||
        "";

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


    atualizarDashboard();

  }


  // ========================================================
  // LOGOUT
  // ========================================================

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async function () {

        await supabaseClient.auth.signOut();

        if (appScreen) {
          appScreen.classList.add("hidden");
        }

        if (authScreen) {
          authScreen.classList.remove("hidden");
        }

        mostrarLogin();

      }
    );

  }


  // ========================================================
  // VERIFICAR SESSÃO EXISTENTE
  // ========================================================

  try {

    const {
      data: {
        session
      }
    } =
      await supabaseClient.auth.getSession();


    if (
      session &&
      session.user
    ) {

      const usuario = {

        id:
          session.user.id,

        nome:
          session.user.user_metadata?.nome ||
          session.user.email?.split("@")[0],

        email:
          session.user.email,

        tipo:
          session.user.user_metadata?.tipo ||
          "pessoal",

        empresa:
          session.user.user_metadata?.empresa ||
          ""

      };


      abrirSistema(usuario);

    }

  } catch (erro) {

    console.error(
      "Erro ao verificar sessão:",
      erro
    );

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

        }
      );

    }
  );


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


  if (
    mobileMenuButton &&
    sidebar
  ) {

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

      return JSON.parse(
        dados
      );

    } catch (erro) {

      return [];

    }

  }


  function salvarLancamentos(
    lancamentos
  ) {

    localStorage.setItem(
      "controleFinanceiroLancamentos",
      JSON.stringify(
        lancamentos
      )
    );

  }


  // ========================================================
  // DINHEIRO
  // ========================================================

  function dinheiro(valor) {

    return Number(
      valor || 0
    ).toLocaleString(
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


    lancamentos.forEach(
      function (item) {

        if (
          item.tipo === "income"
        ) {

          receitas +=
            Number(
              item.valor
            );

        }


        if (
          item.tipo === "expense"
        ) {

          despesas +=
            Number(
              item.valor
            );

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


    if (!container) {
      return;
    }


    const lancamentos =
      pegarLancamentos();


    if (
      lancamentos.length === 0
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
        .reverse()
        .slice(
          0,
          5
        );


    container.innerHTML =
      recentes
        .map(
          function (item) {

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
                    ${
                      item.tipo === "income"
                        ? "↑"
                        : "↓"
                    }
                  </div>

                  <div>

                    <div class="transaction-description">
                      ${item.descricao || ""}
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

          }
        )
        .join("");

  }


  // ========================================================
  // MODAL DE LANÇAMENTO
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


    if (!modal) {
      return;
    }


    if (transactionType) {

      transactionType.value =
        tipo ||
        "income";

    }


    modal.classList.remove(
      "hidden"
    );

  }


  if (quickIncomeButton) {

    quickIncomeButton.addEventListener(
      "click",
      function () {

        abrirModal(
          "income"
        );

      }
    );

  }


  if (quickExpenseButton) {

    quickExpenseButton.addEventListener(
      "click",
      function () {

        abrirModal(
          "expense"
        );

      }
    );

  }


  if (newTransactionButton) {

    newTransactionButton.addEventListener(
      "click",
      function () {

        abrirModal(
          "income"
        );

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
  // SALVAR LANÇAMENTO LOCALMENTE
  // ========================================================
  // Mantido por enquanto para não quebrar
  // o restante do seu sistema.
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
          )?.value ||
          "income";


        const descricao =
          document.getElementById(
            "transactionDescription"
          )?.value
            .trim() ||
          "";


        const valor =
          document.getElementById(
            "transactionAmount"
          )?.value ||
          "";


        const categoria =
          document.getElementById(
            "transactionCategory"
          )?.value ||
          "";


        if (!descricao) {

          alert(
            "Digite uma descrição."
          );

          return;

        }


        if (
          !valor ||
          Number(valor) <= 0
        ) {

          alert(
            "Digite um valor válido."
          );

          return;

        }


        const lancamentos =
          pegarLancamentos();


        lancamentos.push({

          id:
            Date.now(),

          tipo:
            tipo,

          descricao:
            descricao,

          valor:
            Number(valor),

          categoria:
            categoria,

          data:
            new Date().toLocaleDateString(
              "pt-BR"
            )

        });


        salvarLancamentos(
          lancamentos
        );


        fecharModal();

        atualizarDashboard();


        // Limpar campos

        const descricaoInput =
          document.getElementById(
            "transactionDescription"
          );

        const valorInput =
          document.getElementById(
            "transactionAmount"
          );


        if (descricaoInput) {
          descricaoInput.value = "";
        }

        if (valorInput) {
          valorInput.value = "";
        }

      }
    );

  }


  // ========================================================
  // INÍCIO
  // ========================================================

  console.log(
    "Controle Financeiro iniciado."
  );

});

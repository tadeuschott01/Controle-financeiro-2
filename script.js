document.addEventListener("DOMContentLoaded", function () {

  // =====================================================
  // ELEMENTOS
  // =====================================================

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

  const registerMessage =
    document.getElementById("registerMessage");

  const loginMessage =
    document.getElementById("loginMessage");

  const authScreen =
    document.getElementById("authScreen");

  const appScreen =
    document.getElementById("appScreen");


  // =====================================================
  // FUNÇÃO DE MENSAGEM
  // =====================================================

  function mensagem(elemento, texto, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = texto;

    elemento.style.color =
      sucesso ? "#1f513d" : "#d94b4b";
  }


  // =====================================================
  // MOSTRAR CADASTRO
  // =====================================================

  if (showRegisterButton) {

    showRegisterButton.addEventListener("click", function (event) {

      event.preventDefault();

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

    });

  }


  // =====================================================
  // MOSTRAR LOGIN
  // =====================================================

  if (showLoginButton) {

    showLoginButton.addEventListener("click", function (event) {

      event.preventDefault();

      if (registerForm) {
        registerForm.classList.add("hidden");
      }

      if (loginForm) {
        loginForm.classList.remove("hidden");
      }

      if (loginMessage) {
        loginMessage.textContent = "";
      }

      if (registerMessage) {
        registerMessage.textContent = "";
      }

    });

  }


  // =====================================================
  // CADASTRO
  // =====================================================

  if (registerButton) {

    registerButton.addEventListener("click", function (event) {

      event.preventDefault();


      const nomeInput =
        document.getElementById("registerName");

      const emailInput =
        document.getElementById("registerEmail");

      const senhaInput =
        document.getElementById("registerPassword");

      const tipoInput =
        document.getElementById("registerAccountType");

      const empresaInput =
        document.getElementById("registerCompany");


      const nome =
        nomeInput ? nomeInput.value.trim() : "";

      const email =
        emailInput ? emailInput.value.trim() : "";

      const senha =
        senhaInput ? senhaInput.value : "";

      const tipo =
        tipoInput ? tipoInput.value : "pessoal";

      const empresa =
        empresaInput ? empresaInput.value.trim() : "";


      // =================================================
      // VALIDAÇÕES
      // =================================================

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


      if (!email.includes("@") || !email.includes(".")) {

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


      // =================================================
      // CRIAR USUÁRIO
      // =================================================

      const usuario = {

        nome: nome,

        email: email.toLowerCase(),

        senha: senha,

        tipo: tipo,

        empresa: empresa,

        criadoEm: new Date().toISOString()

      };


      // =================================================
      // SALVAR
      // =================================================

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

        console.error(
          "Erro ao salvar conta:",
          erro
        );

        mensagem(
          registerMessage,
          "Não foi possível salvar a conta neste navegador."
        );

        return;
      }


      // =================================================
      // CONFIRMAÇÃO
      // =================================================

      mensagem(
        registerMessage,
        "Conta criada com sucesso!",
        true
      );


      // =================================================
      // COLOCAR E-MAIL NO LOGIN
      // =================================================

      const loginEmail =
        document.getElementById("loginEmail");

      if (loginEmail) {
        loginEmail.value = email.toLowerCase();
      }


      // =================================================
      // LIMPAR CAMPOS
      // =================================================

      if (nomeInput) {
        nomeInput.value = "";
      }

      if (emailInput) {
        emailInput.value = "";
      }

      if (senhaInput) {
        senhaInput.value = "";
      }

      if (empresaInput) {
        empresaInput.value = "";
      }


      // =================================================
      // VOLTAR PARA LOGIN
      // =================================================

      setTimeout(function () {

        if (registerForm) {
          registerForm.classList.add("hidden");
        }

        if (loginForm) {
          loginForm.classList.remove("hidden");
        }

        if (registerMessage) {
          registerMessage.textContent = "";
        }

      }, 1200);

    });

  }


  // =====================================================
  // LOGIN
  // =====================================================

  if (loginButton) {

    loginButton.addEventListener("click", function (event) {

      event.preventDefault();


      const emailInput =
        document.getElementById("loginEmail");

      const senhaInput =
        document.getElementById("loginPassword");


      const email =
        emailInput ? emailInput.value.trim() : "";

      const senha =
        senhaInput ? senhaInput.value : "";


      if (!email || !senha) {

        mensagem(
          loginMessage,
          "Digite seu e-mail e sua senha."
        );

        return;
      }


      // =================================================
      // PEGAR USUÁRIO
      // =================================================

      const dados =
        localStorage.getItem(
          "controleFinanceiroUsuario"
        );


      if (!dados) {

        mensagem(
          loginMessage,
          "Nenhuma conta cadastrada. Clique em Criar conta."
        );

        return;
      }


      let usuario;


      try {

        usuario = JSON.parse(dados);

      } catch (erro) {

        console.error(
          "Erro ao ler usuário:",
          erro
        );

        mensagem(
          loginMessage,
          "Os dados da conta estão corrompidos."
        );

        return;
      }


      // =================================================
      // VERIFICAR LOGIN
      // =================================================

      if (
        email.toLowerCase() !==
        String(usuario.email).toLowerCase()
      ) {

        mensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;
      }


      if (senha !== usuario.senha) {

        mensagem(
          loginMessage,
          "E-mail ou senha incorretos."
        );

        return;
      }


      // =================================================
      // LOGIN OK
      // =================================================

      localStorage.setItem(
        "controleFinanceiroLogado",
        "true"
      );


      mensagem(
        loginMessage,
        "Login realizado com sucesso!",
        true
      );


      // =================================================
      // ABRIR APLICAÇÃO
      // =================================================

      if (authScreen) {
        authScreen.classList.add("hidden");
      }

      if (appScreen) {
        appScreen.classList.remove("hidden");
      }


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

    });

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const logoutButton =
    document.getElementById("logoutButton");


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

      if (registerForm) {
        registerForm.classList.add("hidden");
      }

      if (loginForm) {
        loginForm.classList.remove("hidden");
      }

    });

  }


  // =====================================================
  // TIPO DE CONTROLE / EMPRESA
  // =====================================================

  const registerAccountType =
    document.getElementById(
      "registerAccountType"
    );

  const companyField =
    document.getElementById(
      "companyField"
    );


  if (registerAccountType) {

    registerAccountType.addEventListener(
      "change",
      function () {

        if (
          this.value === "empresa" ||
          this.value === "ambos"
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


  // =====================================================
  // VERIFICAR LOGIN SALVO
  // =====================================================

  const logado =
    localStorage.getItem(
      "controleFinanceiroLogado"
    );


  const dadosUsuario =
    localStorage.getItem(
      "controleFinanceiroUsuario"
    );


  if (
    logado === "true" &&
    dadosUsuario
  ) {

    try {

      const usuario =
        JSON.parse(dadosUsuario);


      if (authScreen) {
        authScreen.classList.add("hidden");
      }

      if (appScreen) {
        appScreen.classList.remove("hidden");
      }


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


    } catch (erro) {

      localStorage.removeItem(
        "controleFinanceiroLogado"
      );

    }

  }

});

document.addEventListener("DOMContentLoaded", function () {

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


  // ==========================================
  // MOSTRAR CADASTRO
  // ==========================================

  showRegisterButton?.addEventListener("click", function () {

    loginForm?.classList.add("hidden");
    registerForm?.classList.remove("hidden");

    if (registerMessage) {
      registerMessage.textContent = "";
    }

  });


  // ==========================================
  // MOSTRAR LOGIN
  // ==========================================

  showLoginButton?.addEventListener("click", function () {

    registerForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");

    if (loginMessage) {
      loginMessage.textContent = "";
    }

  });


  // ==========================================
  // CADASTRAR CONTA
  // ==========================================

  registerButton?.addEventListener("click", function (event) {

    event.preventDefault();

    const nome =
      document.getElementById("registerName")?.value.trim();

    const email =
      document.getElementById("registerEmail")?.value.trim();

    const senha =
      document.getElementById("registerPassword")?.value;

    const tipo =
      document.getElementById("registerAccountType")?.value
      || "pessoal";

    const empresa =
      document.getElementById("registerCompany")?.value.trim()
      || "";


    // ==========================================
    // VALIDAÇÕES
    // ==========================================

    if (!nome) {

      registerMessage.textContent =
        "Digite seu nome.";

      return;
    }


    if (!email) {

      registerMessage.textContent =
        "Digite seu e-mail.";

      return;
    }


    if (!email.includes("@")) {

      registerMessage.textContent =
        "Digite um e-mail válido.";

      return;
    }


    if (!senha) {

      registerMessage.textContent =
        "Digite uma senha.";

      return;
    }


    if (senha.length < 6) {

      registerMessage.textContent =
        "A senha precisa ter pelo menos 6 caracteres.";

      return;
    }


    // ==========================================
    // CRIAR USUÁRIO
    // ==========================================

    const usuario = {
      nome: nome,
      email: email,
      senha: senha,
      tipo: tipo,
      empresa: empresa,
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

      registerMessage.textContent =
        "Não foi possível salvar a conta neste navegador.";

      return;
    }


    // ==========================================
    // CONFIRMAÇÃO
    // ==========================================

    registerMessage.style.color = "#1f513d";

    registerMessage.textContent =
      "Conta criada com sucesso!";


    // Coloca o e-mail no login

    const loginEmail =
      document.getElementById("loginEmail");

    if (loginEmail) {
      loginEmail.value = email;
    }


    // Limpa cadastro

    document.getElementById("registerName").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("registerCompany").value = "";


    // Volta para login depois de 1 segundo

    setTimeout(function () {

      registerForm?.classList.add("hidden");
      loginForm?.classList.remove("hidden");

      registerMessage.textContent = "";

    }, 1000);

  });


  // ==========================================
  // LOGIN
  // ==========================================

  loginButton?.addEventListener("click", function (event) {

    event.preventDefault();

    const email =
      document.getElementById("loginEmail")?.value.trim();

    const senha =
      document.getElementById("loginPassword")?.value;


    if (!email || !senha) {

      loginMessage.textContent =
        "Digite seu e-mail e sua senha.";

      return;
    }


    const dados =
      localStorage.getItem(
        "controleFinanceiroUsuario"
      );


    if (!dados) {

      loginMessage.textContent =
        "Nenhuma conta cadastrada.";

      return;
    }


    const usuario =
      JSON.parse(dados);


    if (
      email.toLowerCase() !==
      usuario.email.toLowerCase()
      ||
      senha !== usuario.senha
    ) {

      loginMessage.textContent =
        "E-mail ou senha incorretos.";

      return;
    }


    localStorage.setItem(
      "controleFinanceiroLogado",
      "true"
    );


    loginMessage.style.color = "#1f513d";

    loginMessage.textContent =
      "Login realizado com sucesso!";


    // ==========================================
    // ABRIR SISTEMA
    // ==========================================

    const authScreen =
      document.getElementById("authScreen");

    const appScreen =
      document.getElementById("appScreen");


    authScreen?.classList.add("hidden");
    appScreen?.classList.remove("hidden");


    const userName =
      document.getElementById("userName");

    if (userName) {
      userName.textContent = usuario.nome;
    }

  });


});

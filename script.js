document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // TELA DE LOGIN E CADASTRO
    // ==========================================

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const showRegisterButton =
        document.getElementById("showRegisterButton");

    const showLoginButton =
        document.getElementById("showLoginButton");


    // ==========================================
    // ABRIR CADASTRO
    // ==========================================

    if (showRegisterButton) {

        showRegisterButton.addEventListener("click", function (event) {

            event.preventDefault();

            loginForm.classList.add("hidden");
            registerForm.classList.remove("hidden");

        });

    }


    // ==========================================
    // VOLTAR PARA LOGIN
    // ==========================================

    if (showLoginButton) {

        showLoginButton.addEventListener("click", function (event) {

            event.preventDefault();

            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");

        });

    }

});
/* =========================================================
   CONTROLE FINANCEIRO
   JavaScript principal
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------------------------------------
    // ELEMENTOS DA TELA
    // ---------------------------------------------------------

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const dashboardSection = document.getElementById("dashboardSection");

    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // ---------------------------------------------------------
    // FUNÇÕES PARA MOSTRAR LOGIN / CADASTRO
    // ---------------------------------------------------------

    function mostrarCadastro() {
        if (loginSection) {
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.style.display = "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function mostrarLogin() {
        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (loginSection) {
            loginSection.style.display = "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // ---------------------------------------------------------
    // BOTÃO "CRIAR CONTA"
    // ---------------------------------------------------------

    if (showRegister) {
        showRegister.addEventListener("click", function(event) {
            event.preventDefault();
            mostrarCadastro();
        });
    }

    // ---------------------------------------------------------
    // BOTÃO "JÁ TENHO UMA CONTA"
    // ---------------------------------------------------------

    if (showLogin) {
        showLogin.addEventListener("click", function(event) {
            event.preventDefault();
            mostrarLogin();
        });
    }

    // ---------------------------------------------------------
    // PROCURA AUTOMATICAMENTE O TEXTO "CRIAR CONTA"
    // CASO O HTML NÃO TENHA O ID ESPERADO
    // ---------------------------------------------------------

    document.querySelectorAll("a, button").forEach(element => {

        const texto = element.textContent
            .trim()
            .toLowerCase();

        if (
            texto === "criar conta" ||
            texto.includes("ainda não possui uma conta")
        ) {

            element.addEventListener("click", function(event) {
                event.preventDefault();
                mostrarCadastro();
            });

        }

        if (
            texto === "já tenho uma conta" ||
            texto === "voltar para entrar" ||
            texto === "entrar"
        ) {

            if (
                registerSection &&
                element.closest("#registerSection")
            ) {
                element.addEventListener("click", function(event) {
                    event.preventDefault();
                    mostrarLogin();
                });
            }
        }
    });

    // ---------------------------------------------------------
    // CADASTRO
    // ---------------------------------------------------------

    if (registerForm) {

        registerForm.addEventListener("submit", function(event) {

            event.preventDefault();

            const nome =
                document.getElementById("registerName")?.value.trim() || "";

            const email =
                document.getElementById("registerEmail")?.value.trim() || "";

            const senha =
                document.getElementById("registerPassword")?.value || "";

            if (!nome) {
                alert("Digite seu nome.");
                return;
            }

            if (!email) {
                alert("Digite seu e-mail.");
                return;
            }

            if (!senha || senha.length < 6) {
                alert("A senha precisa ter pelo menos 6 caracteres.");
                return;
            }

            /*
             * Por enquanto salvamos o cadastro localmente.
             * Depois conectaremos esta parte ao Supabase.
             */

            const usuario = {
                nome: nome,
                email: email,
                senha: senha
            };

            localStorage.setItem(
                "controleFinanceiroUsuario",
                JSON.stringify(usuario)
            );

            alert("Cadastro realizado com sucesso!");

            mostrarLogin();

            const loginEmail =
                document.getElementById("loginEmail");

            if (loginEmail) {
                loginEmail.value = email;
            }

        });
    }

    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------

    if (loginForm) {

        loginForm.addEventListener("submit", function(event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail")?.value.trim() || "";

            const senha =
                document.getElementById("loginPassword")?.value || "";

            if (!email || !senha) {
                alert("Digite seu e-mail e sua senha.");
                return;
            }

            const usuarioSalvo =
                localStorage.getItem("controleFinanceiroUsuario");

            if (!usuarioSalvo) {
                alert("Nenhuma conta cadastrada neste dispositivo. Clique em Criar conta.");
                return;
            }

            const usuario = JSON.parse(usuarioSalvo);

            if (
                email === usuario.email &&
                senha === usuario.senha
            ) {

                localStorage.setItem(
                    "controleFinanceiroLogado",
                    "true"
                );

                abrirDashboard(usuario);

            } else {

                alert("E-mail ou senha incorretos.");

            }

        });
    }

    // ---------------------------------------------------------
    // ABRIR DASHBOARD
    // ---------------------------------------------------------

    function abrirDashboard(usuario) {

        if (loginSection) {
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (dashboardSection) {
            dashboardSection.style.display = "block";
        }

        const nomeUsuario =
            document.getElementById("nomeUsuario");

        if (nomeUsuario && usuario) {
            nomeUsuario.textContent =
                usuario.nome;
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // ---------------------------------------------------------
    // VERIFICAR LOGIN AO ABRIR
    // ---------------------------------------------------------

    const estaLogado =
        localStorage.getItem("controleFinanceiroLogado");

    const usuarioSalvo =
        localStorage.getItem("controleFinanceiroUsuario");

    if (
        estaLogado === "true" &&
        usuarioSalvo
    ) {

        try {

            const usuario =
                JSON.parse(usuarioSalvo);

            abrirDashboard(usuario);

        } catch (erro) {

            localStorage.removeItem(
                "controleFinanceiroLogado"
            );

        }

    }

});

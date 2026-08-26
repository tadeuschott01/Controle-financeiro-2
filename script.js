document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTOS
    // =====================================================

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

    const registerAccountType =
        document.getElementById("registerAccountType");

    const companyField =
        document.getElementById("companyField");

    const logoutButton =
        document.getElementById("logoutButton");

    // =====================================================
    // MOSTRAR CADASTRO
    // =====================================================

    if (showRegisterButton) {

        showRegisterButton.onclick = function () {

            loginForm.classList.add("hidden");
            registerForm.classList.remove("hidden");

        };

    }

    // =====================================================
    // MOSTRAR LOGIN
    // =====================================================

    if (showLoginButton) {

        showLoginButton.onclick = function () {

            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");

        };

    }

    // =====================================================
    // TIPO DE CONTA
    // =====================================================

    if (registerAccountType) {

        registerAccountType.addEventListener("change", function () {

            if (
                this.value === "empresa" ||
                this.value === "ambos"
            ) {

                companyField.classList.remove("hidden");

            } else {

                companyField.classList.add("hidden");

            }

        });

    }

    // =====================================================
    // CADASTRO
    // =====================================================

    if (registerButton) {

        registerButton.onclick = async function () {

            const nome =
                document.getElementById("registerName").value.trim();

            const email =
                document.getElementById("registerEmail").value.trim();

            const senha =
                document.getElementById("registerPassword").value;

            const tipo =
                document.getElementById("registerAccountType").value;

            const empresa =
                document.getElementById("registerCompany")?.value.trim() || "";

            const mensagem =
                document.getElementById("registerMessage");

            if (!nome) {

                mensagem.textContent =
                    "Digite seu nome.";

                return;

            }

            if (!email) {

                mensagem.textContent =
                    "Digite seu e-mail.";

                return;

            }

            if (!senha || senha.length < 6) {

                mensagem.textContent =
                    "A senha precisa ter pelo menos 6 caracteres.";

                return;

            }

            mensagem.textContent =
                "Criando sua conta...";

            // -------------------------------------------------
            // SUPABASE
            // -------------------------------------------------

            if (
                typeof supabase === "undefined"
            ) {

                mensagem.textContent =
                    "Erro: Supabase não foi carregado.";

                return;

            }

            try {

                const SUPABASE_URL =
                    "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

                const SUPABASE_KEY =
                    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

                const cliente =
                    supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_KEY
                    );

                const { data, error } =
                    await cliente.auth.signUp({

                        email: email,

                        password: senha,

                        options: {
                            data: {
                                nome: nome,
                                tipo_conta: tipo,
                                empresa: empresa
                            }
                        }

                    });

                if (error) {

                    mensagem.textContent =
                        error.message;

                    return;

                }

                mensagem.textContent =
                    "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.";

                // Volta para login depois de 2 segundos

                setTimeout(function () {

                    registerForm.classList.add("hidden");
                    loginForm.classList.remove("hidden");

                    document.getElementById(
                        "loginEmail"
                    ).value = email;

                }, 2000);

            } catch (erro) {

                console.error(erro);

                mensagem.textContent =
                    "Não foi possível criar a conta.";

            }

        };

    }

    // =====================================================
    // LOGIN
    // =====================================================

    if (loginButton) {

        loginButton.onclick = async function () {

            const email =
                document.getElementById("loginEmail").value.trim();

            const senha =
                document.getElementById("loginPassword").value;

            const mensagem =
                document.getElementById("loginMessage");

            if (!email || !senha) {

                mensagem.textContent =
                    "Digite seu e-mail e sua senha.";

                return;

            }

            mensagem.textContent =
                "Entrando...";

            if (
                typeof supabase === "undefined"
            ) {

                mensagem.textContent =
                    "Erro: Supabase não foi carregado.";

                return;

            }

            try {

                const SUPABASE_URL =
                    "https://sbiqhbxtrjrzpawdqqmy.supabase.co";

                const SUPABASE_KEY =
                    "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

                const cliente =
                    supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_KEY
                    );

                const { data, error } =
                    await cliente.auth.signInWithPassword({

                        email: email,

                        password: senha

                    });

                if (error) {

                    mensagem.textContent =
                        error.message;

                    return;

                }

                mensagem.textContent =
                    "";

                abrirSistema(data.user);

            } catch (erro) {

                console.error(erro);

                mensagem.textContent =
                    "Erro ao entrar.";

            }

        };

    }

    // =====================================================
    // ABRIR SISTEMA
    // =====================================================

    function abrirSistema(usuario) {

        authScreen.classList.add("hidden");

        appScreen.classList.remove("hidden");

        const userName =
            document.getElementById("userName");

        if (userName && usuario) {

            userName.textContent =
                usuario.user_metadata?.nome ||
                usuario.email ||
                "Usuário";

        }

    }

    // =====================================================
    // LOGOUT
    // =====================================================

    if (logoutButton) {

        logoutButton.onclick = async function () {

            if (typeof supabase !== "undefined") {

                const cliente =
                    supabase.createClient(

                        "https://sbiqhbxtrjrzpawdqqmy.supabase.co",

                        "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8"

                    );

                await cliente.auth.signOut();

            }

            appScreen.classList.add("hidden");

            authScreen.classList.remove("hidden");

            registerForm.classList.add("hidden");

            loginForm.classList.remove("hidden");

        };

    }

});

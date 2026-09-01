/* =====================================================
   CONTROLES — APP.JS
   VERSÃO COMPLETA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const loginScreen = document.getElementById("loginScreen");
    const loginForm = document.getElementById("loginForm");
    const app = document.getElementById("app");

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const userPlan = document.getElementById("userPlan");

    const pageTitle = document.getElementById("pageTitle");
    const currentDate = document.getElementById("currentDate");

    const transactionModal =
        document.getElementById("transactionModal");

    const transactionForm =
        document.getElementById("transactionForm");

    const descriptionInput =
        document.getElementById("descriptionInput");

    const amountInput =
        document.getElementById("amountInput");

    const dateInput =
        document.getElementById("dateInput");

    const frequencyInput =
        document.getElementById("frequencyInput");

    const transactionCategory =
        document.getElementById("transactionCategory");

    const recentTransactions =
        document.getElementById("recentTransactions");

    const allTransactions =
        document.getElementById("allTransactions");

    const searchInput =
        document.getElementById("searchInput");

    const typeFilter =
        document.getElementById("typeFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const balanceValue =
        document.getElementById("balanceValue");

    const incomeValue =
        document.getElementById("incomeValue");

    const expenseValue =
        document.getElementById("expenseValue");

    const economyValue =
        document.getElementById("economyValue");

    const categoryList =
        document.getElementById("categoryList");

    const reportAnalysis =
        document.getElementById("reportAnalysis");

    const monthForecast =
        document.getElementById("monthForecast");


    /* =====================================================
       DADOS
    ===================================================== */

    let transactions =
        JSON.parse(
            localStorage.getItem("controles_transactions") || "[]"
        );

    let currentUser =
        JSON.parse(
            localStorage.getItem("controles_user") || "null"
        );

    let goals =
        JSON.parse(
            localStorage.getItem("controles_goals") || "[]"
        );

    let budgets =
        JSON.parse(
            localStorage.getItem("controles_budgets") || "[]"
        );

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       CATEGORIAS
    ===================================================== */

    const categories = [
        "Alimentação",
        "Moradia",
        "Transporte",
        "Lazer",
        "Saúde",
        "Educação",
        "Compras",
        "Contas",
        "Salário",
        "Investimentos",
        "Outros"
    ];


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

    function saveTransactions() {
        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
        );
    }


    function saveGoals() {
        localStorage.setItem(
            "controles_goals",
            JSON.stringify(goals)
        );
    }


    function saveBudgets() {
        localStorage.setItem(
            "controles_budgets",
            JSON.stringify(budgets)
        );
    }


    function formatMoney(value) {
        return Number(value || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function formatDate(dateString) {

        if (!dateString) return "";

        const date = new Date(
            dateString + "T00:00:00"
        );

        return date.toLocaleDateString("pt-BR");
    }


    function todayISO() {

        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }


    function frequencyLabel(frequency) {

        const labels = {
            once: "Única",
            daily: "Diária",
            weekly: "Semanal",
            monthly: "Mensal"
        };

        return labels[frequency] || "Única";
    }


    function escapeHTML(text) {

        return String(text ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function monthKey(date) {

        return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0")
        );
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    function loadUser() {

        if (!currentUser) {

            loginScreen.classList.remove("hidden");
            app.classList.add("hidden");

            return;
        }

        loginScreen.classList.add("hidden");
        app.classList.remove("hidden");

        if (userName)
            userName.textContent = currentUser.name;

        if (welcomeName)
            welcomeName.textContent = currentUser.name;

        if (userAvatar)
            userAvatar.textContent =
                currentUser.name
                    .charAt(0)
                    .toUpperCase();

        if (userPlan) {

            userPlan.textContent =
                currentUser.plan === "premium"
                    ? "ControleS Premium ⭐"
                    : "ControleS Grátis";
        }

        updateAll();
    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document.getElementById("loginName")
                        ?.value.trim();

                const email =
                    document.getElementById("loginEmail")
                        ?.value.trim();

                const password =
                    document.getElementById("loginPassword")
                        ?.value;

                if (!name || !email || !password) {
                    return;
                }

                currentUser = {
                    name,
                    email,
                    plan: "free"
                };

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(currentUser)
                );

                loadUser();
            }
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "controles_user"
                );

                currentUser = null;

                app.classList.add("hidden");
                loginScreen.classList.remove("hidden");
            }
        );
    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    const navItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".section");


    function openSection(sectionName) {

        sections.forEach(section => {
            section.classList.add("hidden");
        });

        const selected =
            document.getElementById(sectionName);

        if (selected) {
            selected.classList.remove("hidden");
        }

        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );
        });

        const titles = {
            dashboard: "Dashboard",
            transactions: "Lançamentos",
            categories: "Categorias",
            reports: "Relatórios",
            premium: "Premium"
        };

        if (pageTitle) {
            pageTitle.textContent =
                titles[sectionName] || "Dashboard";
        }

        if (sectionName === "premium") {
            updatePremium();
        }
    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                openSection(
                    item.dataset.section
                );

                const sidebar =
                    document.getElementById("sidebar");

                if (sidebar) {
                    sidebar.classList.remove(
                        "mobile-open"
                    );
                }
            }
        );
    });


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (
                !button.classList.contains("nav-item")
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        openSection(
                            button.dataset.section
                        );
                    }
                );
            }
        });


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.getElementById("sidebar");

                if (sidebar) {
                    sidebar.classList.toggle(
                        "mobile-open"
                    );
                }
            }
        );
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal() {

        if (!transactionModal) return;

        transactionModal.classList.remove("hidden");

        if (dateInput) {
            dateInput.value =
                dateInput.value || todayISO();
        }

        if (descriptionInput) {
            descriptionInput.focus();
        }
    }


    function closeModal() {

        if (!transactionModal) return;

        transactionModal.classList.add("hidden");

        if (transactionForm) {
            transactionForm.reset();
        }

        selectedType = "income";

        updateTypeButtons();

        if (dateInput)
            dateInput.value = todayISO();

        if (frequencyInput)
            frequencyInput.value = "once";
    }


    const openTransactionBtn =
        document.getElementById(
            "openTransactionBtn"
        );

    if (openTransactionBtn) {
        openTransactionBtn.addEventListener(
            "click",
            openModal
        );
    }


    const newTransactionButton =
        document.getElementById(
            "newTransactionButton"
        );

    if (newTransactionButton) {
        newTransactionButton.addEventListener(
            "click",
            openModal
        );
    }


    const closeModalButton =
        document.getElementById("closeModal");

    if (closeModalButton) {
        closeModalButton.addEventListener(
            "click",
            closeModal
        );
    }


    const modalOverlay =
        document.querySelector(".modal-overlay");

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );
    }


    /* =====================================================
       TIPO RECEITA / DESPESA
    ===================================================== */

    const typeButtons =
        document.querySelectorAll(".type-option");


    function updateTypeButtons() {

        typeButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.type === selectedType
            );
        });
    }


    typeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedType =
                    button.dataset.type;

                updateTypeButtons();
            }
        );
    });


    /* =====================================================
       SALVAR LANÇAMENTO
    ===================================================== */

    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const description =
                    descriptionInput.value.trim();

                const amount =
                    Number(amountInput.value);

                const date =
                    dateInput.value;

                const frequency =
                    frequencyInput.value;

                const category =
                    transactionCategory.value;


                if (
                    !description ||
                    !amount ||
                    amount <= 0 ||
                    !date
                ) {

                    return;
                }


                const transaction = {

                    id:
                        Date.now() +
                        Math.random(),

                    type:
                        selectedType,

                    description,

                    amount,

                    date,

                    frequency,

                    category
                };


                transactions.push(transaction);

                saveTransactions();

                closeModal();

                updateAll();

                showMessage(
                    "Lançamento salvo ✓"
                );
            }
        );
    }


    /* =====================================================
       MENSAGEM INTERNA
       SEM ALERT()
    ===================================================== */

    function showMessage(message) {

        let messageBox =
            document.getElementById(
                "controleSMessage"
            );

        if (!messageBox) {

            messageBox =
                document.createElement("div");

            messageBox.id =
                "controleSMessage";

            messageBox.className =
                "app-message";

            document.body.appendChild(
                messageBox
            );
        }

        messageBox.textContent = message;

        messageBox.classList.add("show");

        clearTimeout(
            messageBox._timer
        );

        messageBox._timer =
            setTimeout(() => {

                messageBox.classList.remove(
                    "show"
                );

            }, 2200);
    }


    /* =====================================================
       RECORRÊNCIA
    ===================================================== */

    function transactionOccurrences(
        transaction,
        startDate,
        endDate
    ) {

        const occurrences = [];

        const original =
            new Date(
                transaction.date +
                "T00:00:00"
            );


        if (
            transaction.frequency === "once"
        ) {

            if (
                original >= startDate &&
                original <= endDate
            ) {

                occurrences.push(
                    new Date(original)
                );
            }

            return occurrences;
        }


        let current =
            new Date(original);


        while (current <= endDate) {

            if (current >= startDate) {

                occurrences.push(
                    new Date(current)
                );
            }


            if (
                transaction.frequency === "daily"
            ) {

                current.setDate(
                    current.getDate() + 1
                );

            } else if (
                transaction.frequency === "weekly"
            ) {

                current.setDate(
                    current.getDate() + 7
                );

            } else if (
                transaction.frequency === "monthly"
            ) {

                /*
                 * CORREÇÃO IMPORTANTE:
                 * Evita que uma receita mensal seja
                 * considerada mais de uma vez no mês.
                 */

                const originalDay

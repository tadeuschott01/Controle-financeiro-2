/* =====================================================
   CONTROLES — APP.JS
   VERSÃO CORRIGIDA
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

    let transactions = JSON.parse(
        localStorage.getItem("controles_transactions") || "[]"
    );

    let currentUser = JSON.parse(
        localStorage.getItem("controles_user") || "null"
    );

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       CORREÇÃO DOS LANÇAMENTOS ANTIGOS
       Garante que TODOS tenham ID único
    ===================================================== */

    transactions = transactions.map((transaction, index) => {

        return {
            ...transaction,

            id:
                transaction.id !== undefined &&
                transaction.id !== null
                    ? String(transaction.id)
                    : `legacy-${Date.now()}-${index}`,

            frequency:
                transaction.frequency || "once",

            category:
                transaction.category || "Outros"

        };

    });

    localStorage.setItem(
        "controles_transactions",
        JSON.stringify(transactions)
    );


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

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

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

        return String(text || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

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

        userName.textContent =
            currentUser.name;

        welcomeName.textContent =
            currentUser.name;

        userAvatar.textContent =
            currentUser.name
                .charAt(0)
                .toUpperCase();

        userPlan.textContent =
            currentUser.plan === "premium"
                ? "ControleS Premium ⭐"
                : "ControleS Grátis";

        updateAll();

    }


    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        const name =
            document.getElementById("loginName")
                .value.trim();

        const email =
            document.getElementById("loginEmail")
                .value.trim();

        const password =
            document.getElementById("loginPassword")
                .value;

        if (!name || !email || !password) {

            alert("Preencha todos os campos.");

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

    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    document
        .getElementById("logoutBtn")
        .addEventListener("click", () => {

            localStorage.removeItem("controles_user");

            currentUser = null;

            app.classList.add("hidden");
            loginScreen.classList.remove("hidden");

        });


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

        pageTitle.textContent =
            titles[sectionName] || "Dashboard";

        if (sectionName === "premium") {
            updateForecast();
        }

    }


    navItems.forEach(item => {

        item.addEventListener("click", () => {

            openSection(
                item.dataset.section
            );

            document
                .getElementById("sidebar")
                .classList.remove("mobile-open");

        });

    });


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (!button.classList.contains("nav-item")) {

                button.addEventListener("click", () => {

                    openSection(
                        button.dataset.section
                    );

                });

            }

        });


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener("click", () => {

            document
                .getElementById("sidebar")
                .classList.toggle("mobile-open");

        });

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal() {

        transactionModal.classList.remove("hidden");

        dateInput.value =
            todayISO();

        if (frequencyInput) {
            frequencyInput.value = "once";
        }

        descriptionInput.focus();

    }


    function closeModal() {

        transactionModal.classList.add("hidden");

        transactionForm.reset();

        selectedType = "income";

        updateTypeButtons();

        dateInput.value =
            todayISO();

        if (frequencyInput) {
            frequencyInput.value = "once";
        }

    }


    document
        .getElementById("openTransactionBtn")
        .addEventListener("click", openModal);


    document
        .getElementById("newTransactionButton")
        .addEventListener("click", openModal);


    document
        .getElementById("closeModal")
        .addEventListener("click", closeModal);


    const modalOverlay =
        document.querySelector(".modal-overlay");

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================================
       TIPO
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

        button.addEventListener("click", () => {

            selectedType =
                button.dataset.type;

            updateTypeButtons();

        });

    });


    /* =====================================================
       SALVAR LANÇAMENTO
    ===================================================== */

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

            /*
              Se o campo frequência existir,
              usa o valor dele.
              Se não existir, considera única.
            */

            const frequency =
                frequencyInput
                    ? frequencyInput.value
                    : "once";

            const category =
                transactionCategory.value || "Outros";


            if (
                !description ||
                !amount ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Preencha todos os campos corretamente."
                );

                return;

            }


            const transaction = {

                id:
                    `${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 9)}`,

                type:
                    selectedType,

                description:
                    description,

                amount:
                    amount,

                date:
                    date,

                frequency:
                    frequency,

                category:
                    category

            };


            transactions.push(transaction);

            saveTransactions();

            closeModal();

            updateAll();

            alert(
                "Lançamento salvo com sucesso! ✅"
            );

        }
    );


    /* =====================================================
       RECORRÊNCIA
    ===================================================== */

    function transactionOccurrences(
        transaction,
        startDate,
        endDate
    ) {

        const occurrences = [];

        if (!transaction.date) {
            return occurrences;
        }

        const original =
            new Date(
                transaction.date + "T00:00:00"
            );

        /*
          LANÇAMENTO ÚNICO
        */

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


        /*
          LANÇAMENTO DIÁRIO
        */

        if (
            transaction.frequency === "daily"
        ) {

            let current =
                new Date(original);

            while (current <= endDate) {

                if (current >= startDate) {

                    occurrences.push(
                        new Date(current)
                    );

                }

                current.setDate(
                    current.getDate() + 1
                );

            }

            return occurrences;

        }


        /*
          LANÇAMENTO SEMANAL
        */

        if (
            transaction.frequency === "weekly"
        ) {

            let current =
                new Date(original);

            while (current <= endDate) {

                if (current >= startDate) {

                    occurrences.push(
                        new Date(current)
                    );

                }

                current.setDate(
                    current.getDate() + 7
                );

            }

            return occurrences;

        }


        /*
          LANÇAMENTO MENSAL

          IMPORTANTE:
          Ele acontece UMA VEZ por mês.

          Exemplo:
          salário dia 5

          Agosto → 1 vez
          Setembro → 1 vez
          Outubro → 1 vez

          Nunca cria várias ocorrências no mesmo mês.
        */

        if (
            transaction.frequency === "monthly"
        ) {

            let current =
                new Date(original);

            while (current <= endDate) {

                if (current >= startDate) {

                    occurrences.push(
                        new Date(current)
                    );

                }

                current.setMonth(
                    current.getMonth() + 1
                );

            }

            return occurrences;

        }


        return occurrences;

    }


    function getPeriodTransactions(
        startDate,
        endDate
    ) {

        const result = [];

        transactions.forEach(transaction => {

            const occurrences =
                transactionOccurrences(
                    transaction,
                    startDate,
                    endDate
                );

            occurrences.forEach(date => {

                result.push({

                    ...transaction,

                    occurrenceDate:
                        date

                });

            });

        });

        return result;

    }


    /* =====================================================
       MÊS ATUAL
    ===================================================== */

    function getCurrentMonthRange() {

        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                0,
                0,
                0
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );

        return {
            start,
            end
        };

    }


    function calculateMonthTotals() {

        const {
            start,
            end
        } =
            getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        let income = 0;
        let expense = 0;

        items.forEach(item => {

            if (item.type === "income") {

                income +=
                    Number(item.amount);

            } else {

                expense +=
                    Number(item.amount);

            }

        });

        return {

            income,

            expense,

            balance:
                income - expense

        };

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const totals =
            calculateMonthTotals();

        balanceValue.textContent =
            formatMoney(
                totals.balance
            );

        incomeValue.textContent =
            formatMoney(
                totals.income
            );

        expenseValue.textContent =
            formatMoney(
                totals.expense
            );

        let economy = 0;

        if (totals.income > 0) {

            economy =
                (
                    totals.balance /
                    totals.income
                ) * 100;

        }

        economyValue.textContent =
            `${economy.toFixed(1)}%`;

        currentDate.textContent =
            new Date().toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        updateFinanceChart();

    }


    /* =====================================================
       HTML DOS LANÇAMENTOS
    ===================================================== */

    function createTransactionHTML(
        transaction
    ) {

        const sign =
            transaction.type === "income"
                ? "+"
                : "-";

        const valueClass =
            transaction.type === "income"
                ? "income"
                : "expense";

        const icon =
            transaction.type === "income"
                ? "↗"
                : "↘";


        const occurrenceDate =
            transaction.occurrenceDate
                ? transaction.occurrenceDate
                    .toISOString()
                    .split("T")[0]
                : transaction.date;


        return `

            <div class="transaction">

                <div class="transaction-icon">
                    ${icon}
                </div>

                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            transaction.category
                        )}
                        •
                        ${formatDate(
                            occurrenceDate
                        )}
                        •
                        ${frequencyLabel(
                            transaction.frequency
                        )}
                    </small>

                </div>

                <div class="transaction-value ${valueClass}">

                    ${sign}
                    ${formatMoney(
                        transaction.amount
                    )}

                </div>

                <button
                    type="button"
                    class="transaction-delete"
                    data-delete-id="${String(
                        transaction.id
                    )}"
                    title="Excluir lançamento"
                >
                    ×
                </button>

            </div>

        `;

    }


    /* =====================================================
       LANÇAMENTOS RECENTES
    ===================================================== */

    function updateRecentTransactions() {

        const {
            start,
            end
        } =
            getCurrentMonthRange();

        let items =
            getPeriodTransactions(
                start,
                end
            );

        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );

        items =
            items.slice(0, 5);

        if (!items.length) {

            recentTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento neste mês.
                </div>
            `;

            return;

        }

        recentTransactions.innerHTML =
            items
                .map(createTransactionHTML)
                .join("");

    }


    /* =====================================================
       LISTA COMPLETA
    ===================================================== */

    function updateAllTransactions() {

        /*
          Agora mostramos uma janela menor,
          evitando criar previsões/listagens
          de vários anos.
        */

        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );

        let items =
            getPeriodTransactions(
                start,
                end
            );


        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const type =
            typeFilter.value;

        const category =
            categoryFilter.value;


        items =
            items.filter(item => {

                const matchesSearch =
                    !search ||
                    item.description
                        .toLowerCase()
                        .includes(search) ||
                    item.category
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    type === "all" ||
                    item.type === type;

                const matchesCategory =
                    category === "all" ||
                    item.category === category;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            });


        items.sort(
            (a, b) =>
                b.occurrenceDate -
                a.occurrenceDate
        );


        if (!items.length) {

            allTransactions.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento encontrado.
                </div>
            `;

            return;

        }


        allTransactions.innerHTML =
            items
                .map(createTransactionHTML)
                .join("");

    }


    /* =====================================================
       EXCLUSÃO — CORRIGIDA
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (!button) return;


            const id =
                String(
                    button.dataset.deleteId
                );


            const transaction =
                transactions.find(
                    item =>
                        String(item.id) === id
                );


            if (!transaction) {

                alert(
                    "Não foi possível encontrar este lançamento."
                );

                return;

            }


            const confirmed =
                confirm(
                    `Excluir "${transaction.description}"?`
                );


            if (!confirmed) return;


            /*
              Remove comparando tudo como STRING.
              Assim funciona tanto para IDs antigos
              quanto para IDs novos.
            */

            transactions =
                transactions.filter(
                    item =>
                        String(item.id) !== id
                );


            saveTransactions();

            updateAll();

            alert(
                "Lançamento excluído com sucesso! 🗑️"
            );

        }
    );


    /* =====================================================
       FILTROS
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            updateAllTransactions
        );

    }

    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            updateAllTransactions
        );

    }

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            updateAllTransactions
        );

    }


    function updateCategoryFilter() {

        const current =
            categoryFilter.value;

        categoryFilter.innerHTML = `
            <option value="all">
                Todas categorias
            </option>
        `;

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                category;

            categoryFilter.appendChild(
                option
            );

        });

        categoryFilter.value =
            categories.includes(current)
                ? current
                : "all";

    }


    /* =====================================================
       GRÁFICO FINANCEIRO
    ===================================================== */

    function updateFinanceChart() {

        const canvas =
            document.getElementById(
                "financeChart"
            );

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const {
            income,
            expense
        } =
            calculateMonthTotals();

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
                                label: "Valor",

                                data: [
                                    income,
                                    expense
                                ],

                                borderWidth: 0
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

                                beginAtZero: true,

                                ticks: {

                                    callback:
                                        value =>
                                            formatMoney(
                                                value
                                            )

                                }

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       CATEGORIAS
    ===================================================== */

    function calculateCategories() {

        const {
            start,
            end
        } =
            getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        const totals = {};

        items.forEach(item => {

            if (
                item.type !== "expense"
            ) {
                return;
            }

            if (
                !totals[item.category]
            ) {
                totals[item.category] = 0;
            }

            totals[item.category] +=
                Number(item.amount);

        });

        return totals;

    }


    function updateCategories() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );

        if (!entries.length) {

            categoryList.innerHTML = `
                <div class="empty-state">
                    Nenhuma despesa cadastrada neste mês.
                </div>
            `;

            updateCategoryChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum, [, value]) =>
                    sum + value,
                0
            );

        categoryList.innerHTML =
            entries
                .map(
                    ([category, value]) => {

                        const percentage =
                            total > 0
                                ? (
                                    value /
                                    total
                                ) * 100
                                : 0;

                        return `

                            <div class="category-summary-item">

                                <div class="category-summary-left">

                                    <div class="category-dot"></div>

                                    <strong>
                                        ${escapeHTML(
                                            category
                                        )}
                                    </strong>

                                </div>

                                <span>
                                    ${formatMoney(value)}
                                    (${percentage.toFixed(1)}%)
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");

        updateCategoryChart(
            totals
        );

    }


    function updateCategoryChart(
        totals
    ) {

        const canvas =
            document.getElementById(
                "categoryChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            Object.keys(totals),

                        datasets: [
                            {
                                data:
                                    Object.values(totals),

                                borderWidth: 2
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                position: "bottom"
                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       RELATÓRIOS
    ===================================================== */

    function updateReports() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );

        if (!entries.length) {

            reportAnalysis.innerHTML = `
                <div class="empty-state">
                    Cadastre despesas para gerar sua análise.
                </div>
            `;

            updateReportChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum, [, value]) =>
                    sum + value,
                0
            );

        const biggest =
            entries[0];

        reportAnalysis.innerHTML = `

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Total gasto
                    </strong>

                </div>

                <span>
                    ${formatMoney(total)}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Maior categoria
                    </strong>

                </div>

                <span>
                    ${escapeHTML(biggest[0])}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Maior gasto
                    </strong>

                </div>

                <span>
                    ${formatMoney(biggest[1])}
                </span>

            </div>

        `;

        updateReportChart(
            totals
        );

    }


    function updateReportChart(
        totals
    ) {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        if (reportCategoryChart) {
            reportCategoryChart.destroy();
        }

        reportCategoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            Object.keys(totals),

                        datasets: [
                            {
                                data:
                                    Object.values(totals),

                                borderWidth: 2
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                position: "bottom"
                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       PREMIUM — PREVISÃO DO FIM DO MÊS
    ===================================================== */

    function updateForecast() {

        if (!monthForecast) return;


        if (!transactions.length) {

            monthForecast.innerHTML = `
                <div class="empty-state">
                    Adicione seus lançamentos para visualizar
                    uma previsão financeira.
                </div>
            `;

            return;

        }


        const now =
            new Date();

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
                0,
                0,
                0
            );

        const endOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59
            );

        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        /*
          SOMENTE O MÊS ATUAL.
          Não calcula 12 meses.
        */

        const elapsedDays =
            Math.max(
                1,
                Math.floor(
                    (
                        today -
                        startOfMonth
                    ) / 86400000
                ) + 1
            );


        const totalDays =
            endOfMonth.getDate();


        const currentTotals =
            calculateMonthTotals();


        const balance =
            currentTotals.balance;


        /*
          Gasto médio diário.

          Só usamos as despesas já ocorridas
          neste mês.
        */

        const averageDailyExpense =
            currentTotals.expense /
            elapsedDays;


        const remainingDays =
            Math.max(
                0,
                totalDays -
                elapsedDays
            );


        const estimatedRemainingExpense =
            averageDailyExpense *
            remainingDays;


        /*
          PREVISÃO FINAL DO MÊS
        */

        const forecast =
            balance -
            estimatedRemainingExpense;


        let message = "";


        if (forecast >= 0) {

            message =
                "A projeção indica um fechamento positivo. 💎";

        } else {

            message =
                "Atenção: a projeção indica possível saldo negativo. ⚠️";

        }


        monthForecast.innerHTML = `

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Saldo atual
                    </strong>

                </div>

                <span>
                    ${formatMoney(balance)}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Gasto médio diário
                    </strong>

                </div>

                <span>
                    ${formatMoney(
                        averageDailyExpense
                    )}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Dias restantes
                    </strong>

                </div>

                <span>
                    ${remainingDays}
                </span>

            </div>


            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        ⏳ Previsão no fim do mês
                    </strong>

                </div>

                <span>
                    ${formatMoney(forecast)}
                </span>

            </div>


            <div class="empty-state">
                ${message}
            </div>

        `;

    }


    /* =====================================================
       TEMA
    ===================================================== */

    const themeBtn =
        document.getElementById("themeBtn");

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark"
                );

                const dark =
                    document.body.classList.contains(
                        "dark"
                    );

                localStorage.setItem(
                    "controles_dark",
                    dark
                );

            }
        );

    }


    if (
        localStorage.getItem(
            "controles_dark"
        ) === "true"
    ) {

        document.body.classList.add(
            "dark"
        );

    }


    /* =====================================================
       EXPORTAR
    ===================================================== */

    const exportDataBtn =
        document.getElementById(
            "exportDataBtn"
        );

    if (exportDataBtn) {

        exportDataBtn.addEventListener(
            "click",
            () => {

                const data = {

                    user:
                        currentUser,

                    transactions:
                        transactions,

                    exportedAt:
                        new Date().toISOString()

                };

                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                data,
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
                    "controles-dados.json";

                document.body.appendChild(link);

                link.click();

                link.remove();

                URL.revokeObjectURL(url);

            }
        );

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    const subscribePremiumBtn =
        document.getElementById(
            "subscribePremiumBtn"
        );

    if (subscribePremiumBtn) {

        subscribePremiumBtn.addEventListener(
            "click",
            () => {

                if (!currentUser) return;

                currentUser.plan =
                    "premium";

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(
                        currentUser
                    )
                );

                userPlan.textContent =
                    "ControleS Premium ⭐";

                alert(
                    "ControleS Premium ativado! ⭐"
                );

                updateForecast();

            }
        );

    }


    /* =====================================================
       ATUALIZAÇÃO GERAL
    ===================================================== */

    function updateAll() {

        updateCategoryFilter();

        updateDashboard();

        updateRecentTransactions();

        updateAllTransactions();

        updateCategories();

        updateReports();

        updateForecast();

    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    dateInput.value =
        todayISO();

    if (frequencyInput) {
        frequencyInput.value = "once";
    }

    loadUser();

});

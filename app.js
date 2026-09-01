/* =====================================================
   CONTROLES — APP.JS
   VERSÃO CORRIGIDA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       ELEMENTOS
    ================================================= */

    const loginScreen = document.getElementById("loginScreen");
    const loginForm = document.getElementById("loginForm");
    const app = document.getElementById("app");

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const userPlan = document.getElementById("userPlan");

    const pageTitle = document.getElementById("pageTitle");
    const currentDate = document.getElementById("currentDate");

    const transactionModal = document.getElementById("transactionModal");
    const transactionForm = document.getElementById("transactionForm");

    const descriptionInput = document.getElementById("descriptionInput");
    const amountInput = document.getElementById("amountInput");
    const dateInput = document.getElementById("dateInput");
    const frequencyInput = document.getElementById("frequencyInput");
    const transactionCategory = document.getElementById("transactionCategory");

    const recentTransactions = document.getElementById("recentTransactions");
    const allTransactions = document.getElementById("allTransactions");

    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const balanceValue = document.getElementById("balanceValue");
    const incomeValue = document.getElementById("incomeValue");
    const expenseValue = document.getElementById("expenseValue");
    const economyValue = document.getElementById("economyValue");

    const categoryList = document.getElementById("categoryList");
    const reportAnalysis = document.getElementById("reportAnalysis");
    const monthForecast = document.getElementById("monthForecast");

    /* =================================================
       DADOS
    ================================================= */

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

    /* =================================================
       CATEGORIAS
    ================================================= */

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

    /* =================================================
       UTILITÁRIOS
    ================================================= */

    function saveTransactions() {
        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
        );
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatDate(dateString) {
        if (!dateString) return "";

        const date = new Date(dateString + "T00:00:00");

        return date.toLocaleDateString("pt-BR");
    }

    function todayISO() {
        const date = new Date();

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")}`;
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

    function dateOnly(date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
    }

    /* =================================================
       LOGIN
    ================================================= */

    function loadUser() {

        if (!currentUser) {

            loginScreen.classList.remove("hidden");
            app.classList.add("hidden");

            return;
        }

        loginScreen.classList.add("hidden");
        app.classList.remove("hidden");

        userName.textContent = currentUser.name;
        welcomeName.textContent = currentUser.name;

        userAvatar.textContent =
            currentUser.name.charAt(0).toUpperCase();

        userPlan.textContent =
            currentUser.plan === "premium"
                ? "ControleS Premium ⭐"
                : "ControleS Grátis";

        updateAll();
    }

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        const name =
            document.getElementById("loginName").value.trim();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        if (!name || !email || !password) return;

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

    /* =================================================
       LOGOUT
    ================================================= */

    document
        .getElementById("logoutBtn")
        .addEventListener("click", () => {

            localStorage.removeItem("controles_user");

            currentUser = null;

            app.classList.add("hidden");
            loginScreen.classList.remove("hidden");
        });

    /* =================================================
       NAVEGAÇÃO
    ================================================= */

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

            openSection(item.dataset.section);

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

    /* =================================================
       MENU MOBILE
    ================================================= */

    document
        .getElementById("mobileMenuBtn")
        .addEventListener("click", () => {

            document
                .getElementById("sidebar")
                .classList.toggle("mobile-open");
        });

    /* =================================================
       MODAL
    ================================================= */

    function openModal() {

        transactionModal.classList.remove("hidden");

        dateInput.value =
            dateInput.value || todayISO();

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

        dateInput.value = todayISO();

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

    document
        .querySelector(".modal-overlay")
        .addEventListener("click", closeModal);

    /* =================================================
       TIPO
    ================================================= */

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

    /* =================================================
       SALVAR LANÇAMENTO
    ================================================= */

    transactionForm.addEventListener("submit", event => {

        event.preventDefault();

        const description =
            descriptionInput.value.trim();

        const amount =
            Number(amountInput.value);

        const date =
            dateInput.value;

        const frequency =
            frequencyInput
                ? frequencyInput.value
                : "once";

        const category =
            transactionCategory.value;

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

            id: Date.now(),

            type: selectedType,

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

        alert(
            "Lançamento salvo com sucesso! ✅"
        );
    });

    /* =================================================
       RECORRÊNCIA
       
       IMPORTANTE:
       A recorrência é calculada apenas dentro
       do período solicitado.
    ================================================= */

    function transactionOccurrences(
        transaction,
        startDate,
        endDate
    ) {

        const occurrences = [];

        if (!transaction.date) {
            return occurrences;
        }

        const originalParts =
            transaction.date.split("-").map(Number);

        const original =
            new Date(
                originalParts[0],
                originalParts[1] - 1,
                originalParts[2]
            );

        const start = dateOnly(startDate);
        const end = dateOnly(endDate);

        /* =============================
           ÚNICA
        ============================= */

        if (
            !transaction.frequency ||
            transaction.frequency === "once"
        ) {

            if (
                original >= start &&
                original <= end
            ) {

                occurrences.push(original);
            }

            return occurrences;
        }

        /* =============================
           DIÁRIA
        ============================= */

        if (transaction.frequency === "daily") {

            let current = new Date(original);

            if (current < start) {
                current = new Date(start);
            }

            while (current <= end) {

                occurrences.push(
                    new Date(current)
                );

                current.setDate(
                    current.getDate() + 1
                );
            }

            return occurrences;
        }

        /* =============================
           SEMANAL
        ============================= */

        if (transaction.frequency === "weekly") {

            let current = new Date(original);

            if (current < start) {

                const diffDays =
                    Math.floor(
                        (start - original) /
                        86400000
                    );

                const weeks =
                    Math.ceil(diffDays / 7);

                current.setDate(
                    current.getDate() +
                    weeks * 7
                );
            }

            while (current <= end) {

                occurrences.push(
                    new Date(current)
                );

                current.setDate(
                    current.getDate() + 7
                );
            }

            return occurrences;
        }

        /* =============================
           MENSAL
           
           Exemplo:
           salário dia 5
           
           05/08
           05/09
           05/10
           
           Uma vez por mês.
        ============================= */

        if (transaction.frequency === "monthly") {

            const originalDay =
                original.getDate();

            let year =
                start.getFullYear();

            let month =
                start.getMonth();

            while (true) {

                const lastDay =
                    new Date(
                        year,
                        month + 1,
                        0
                    ).getDate();

                const day =
                    Math.min(
                        originalDay,
                        lastDay
                    );

                const occurrence =
                    new Date(
                        year,
                        month,
                        day
                    );

                if (occurrence >= start &&
                    occurrence <= end) {

                    occurrences.push(
                        occurrence
                    );
                }

                if (occurrence > end) {
                    break;
                }

                month++;

                if (month > 11) {
                    month = 0;
                    year++;
                }
            }

            return occurrences;
        }

        return occurrences;
    }

    /* =================================================
       TRANSAÇÕES DE UM PERÍODO
    ================================================= */

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
                        new Date(date)
                });
            });
        });

        return result;
    }

    /* =================================================
       MÊS ATUAL
    ================================================= */

    function getCurrentMonthRange() {

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            );

        return {
            start,
            end
        };
    }

    /* =================================================
       TOTAIS DO MÊS
    ================================================= */

    function calculateMonthTotals() {

        const {
            start,
            end
        } = getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        let income = 0;
        let expense = 0;

        items.forEach(item => {

            if (item.type === "income") {
                income += Number(item.amount);
            }

            if (item.type === "expense") {
                expense += Number(item.amount);
            }
        });

        return {
            income,
            expense,
            balance: income - expense
        };
    }

    /* =================================================
       DASHBOARD
    ================================================= */

    function updateDashboard() {

        const totals =
            calculateMonthTotals();

        balanceValue.textContent =
            formatMoney(totals.balance);

        incomeValue.textContent =
            formatMoney(totals.income);

        expenseValue.textContent =
            formatMoney(totals.expense);

        let economy = 0;

        if (totals.income > 0) {

            economy =
                (totals.balance /
                totals.income) * 100;
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

    /* =================================================
       HTML DO LANÇAMENTO
    ================================================= */

    function createTransactionHTML(transaction) {

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
                    class="transaction-delete"
                    data-delete-id="${transaction.id}"
                    type="button"
                    title="Excluir lançamento"
                >
                    ×
                </button>

            </div>
        `;
    }

    /* =================================================
       ÚLTIMOS LANÇAMENTOS
    ================================================= */

    function updateRecentTransactions() {

        const {
            start,
            end
        } = getCurrentMonthRange();

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

        items = items.slice(0, 5);

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

    /* =================================================
       TODOS OS LANÇAMENTOS
       
       Aqui NÃO vamos mais gerar 12 meses para frente.
       Mostramos um período limitado ao redor do mês atual.
    ================================================= */

    function updateAllTransactions() {

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 2,
                0
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

        items = items.filter(item => {

            const description =
                String(
                    item.description || ""
                ).toLowerCase();

            const itemCategory =
                String(
                    item.category || ""
                ).toLowerCase();

            const matchesSearch =
                !search ||
                description.includes(search) ||
                itemCategory.includes(search);

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

    /* =================================================
       EXCLUSÃO
       
       Exclui o lançamento ORIGINAL pelo ID.
       Assim, uma receita mensal também deixa
       de aparecer nas próximas ocorrências.
    ================================================= */

    document.addEventListener("click", event => {

        const button =
            event.target.closest(
                "[data-delete-id]"
            );

        if (!button) return;

        const id =
            Number(
                button.dataset.deleteId
            );

        const transaction =
            transactions.find(
                item => Number(item.id) === id
            );

        if (!transaction) {

            alert(
                "Esse lançamento não foi encontrado."
            );

            return;
        }

        const confirmed =
            confirm(
                `Excluir "${transaction.description}"?`
            );

        if (!confirmed) return;

        transactions =
            transactions.filter(
                item =>
                    Number(item.id) !== id
            );

        saveTransactions();

        updateAll();

        alert(
            "Lançamento excluído com sucesso! 🗑️"
        );
    });

    /* =================================================
       FILTROS
    ================================================= */

    searchInput.addEventListener(
        "input",
        updateAllTransactions
    );

    typeFilter.addEventListener(
        "change",
        updateAllTransactions
    );

    categoryFilter.addEventListener(
        "change",
        updateAllTransactions
    );

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

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);
        });

        categoryFilter.value =
            categories.includes(current)
                ? current
                : "all";
    }

    /* =================================================
       GRÁFICO FINANCEIRO
    ================================================= */

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
        } = calculateMonthTotals();

        if (financeChart) {
            financeChart.destroy();
        }

        financeChart =
            new Chart(canvas, {

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
            });
    }

    /* =================================================
       CATEGORIAS
    ================================================= */

    function calculateCategories() {

        const {
            start,
            end
        } = getCurrentMonthRange();

        const items =
            getPeriodTransactions(
                start,
                end
            );

        const totals = {};

        items.forEach(item => {

            if (item.type !== "expense") {
                return;
            }

            if (!totals[item.category]) {
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
                .map(([category, value]) => {

                    const percentage =
                        total > 0
                            ? (value / total) * 100
                            : 0;

                    return `

                        <div class="category-summary-item">

                            <div class="category-summary-left">

                                <div class="category-dot"></div>

                                <strong>
                                    ${escapeHTML(category)}
                                </strong>

                            </div>

                            <span>
                                ${formatMoney(value)}
                                (${percentage.toFixed(1)}%)
                            </span>

                        </div>
                    `;
                })
                .join("");

        updateCategoryChart(totals);
    }

    function updateCategoryChart(totals) {

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
            new Chart(canvas, {

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
            });
    }

    /* =================================================
       RELATÓRIOS
    ================================================= */

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

        updateReportChart(totals);
    }

    function updateReportChart(totals) {

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
            new Chart(canvas, {

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
            });
    }

    /* =================================================
       PREMIUM — PREVISÃO DO FIM DO MÊS
       
       A previsão NÃO usa o saldo de um ano.
       
       Ela considera:
       
       1. O que já aconteceu neste mês.
       2. Receitas/despesas recorrentes que ainda
          acontecerão até o último dia deste mês.
       3. Despesas futuras são estimadas usando
          somente o padrão do mês atual.
    ================================================= */

    function updateForecast() {

        if (!monthForecast) return;

        const {
            start,
            end
        } = getCurrentMonthRange();

        const today =
            dateOnly(new Date());

        /* =============================================
           Todos os lançamentos previstos no mês
        ============================================= */

        const monthItems =
            getPeriodTransactions(
                start,
                end
            );

        if (!monthItems.length) {

            monthForecast.innerHTML = `
                <div class="empty-state">
                    Adicione seus lançamentos para visualizar
                    uma previsão financeira.
                </div>
            `;

            return;
        }

        /* =============================================
           O que já aconteceu até hoje
        ============================================= */

        let incomeUntilToday = 0;
        let expenseUntilToday = 0;

        let futureIncome = 0;
        let futureExpense = 0;

        monthItems.forEach(item => {

            const occurrence =
                dateOnly(
                    item.occurrenceDate
                );

            const amount =
                Number(item.amount);

            if (occurrence <= today) {

                if (item.type === "income") {
                    incomeUntilToday += amount;
                }

                if (item.type === "expense") {
                    expenseUntilToday += amount;
                }

            } else {

                if (item.type === "income") {
                    futureIncome += amount;
                }

                if (item.type === "expense") {
                    futureExpense += amount;
                }
            }
        });

        /* =============================================
           Saldo que já aconteceu
        ============================================= */

        const currentBalance =
            incomeUntilToday -
            expenseUntilToday;

        /* =============================================
           PREVISÃO REAL DO MÊS
           
           Inclui os lançamentos futuros já cadastrados.
           
           Exemplo:
           salário mensal dia 5
           
           Se hoje for dia 10:
           salário deste mês já entrou.
           
           Ele NÃO será multiplicado por 12.
        ============================================= */

        const forecast =
            currentBalance +
            futureIncome -
            futureExpense;

        /* =============================================
           Dias restantes
        ============================================= */

        const totalDays =
            end.getDate();

        const currentDay =
            today.getDate();

        const remainingDays =
            Math.max(
                0,
                totalDays - currentDay
            );

        /* =============================================
           Média de despesas que já aconteceram
           
           Usada apenas como indicador.
           NÃO adicionamos essa média novamente
           se já houver despesas futuras cadastradas.
        ============================================= */

        const daysElapsed =
            Math.max(1, currentDay);

        const averageDailyExpense =
            expenseUntilToday /
            daysElapsed;

        let message = "";

        if (forecast > 0) {

            message =
                "A projeção indica um fechamento positivo. ✅";

        } else if (forecast === 0) {

            message =
                "A projeção indica fechamento zerado.";

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
                    ${formatMoney(currentBalance)}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Receitas futuras
                    </strong>

                </div>

                <span>
                    ${formatMoney(futureIncome)}
                </span>

            </div>

            <div class="category-summary-item">

                <div class="category-summary-left">

                    <div class="category-dot"></div>

                    <strong>
                        Despesas futuras
                    </strong>

                </div>

                <span>
                    ${formatMoney(futureExpense)}
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

    /* =================================================
       TEMA
    ================================================= */

    document
        .getElementById("themeBtn")
        .addEventListener("click", () => {

            document.body.classList.toggle("dark");

            const dark =
                document.body.classList.contains("dark");

            localStorage.setItem(
                "controles_dark",
                dark
            );
        });

    if (
        localStorage.getItem(
            "controles_dark"
        ) === "true"
    ) {

        document.body.classList.add("dark");
    }

    /* =================================================
       EXPORTAR
    ================================================= */

    document
        .getElementById("exportDataBtn")
        .addEventListener("click", () => {

            const data = {

                user: currentUser,

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
        });

    /* =================================================
       PREMIUM
    ================================================= */

    document
        .getElementById("subscribePremiumBtn")
        .addEventListener("click", () => {

            if (!currentUser) return;

            currentUser.plan = "premium";

            localStorage.setItem(
                "controles_user",
                JSON.stringify(currentUser)
            );

            userPlan.textContent =
                "ControleS Premium ⭐";

            alert(
                "ControleS Premium ativado! ⭐"
            );

            updateForecast();
        });

    /* =================================================
       ATUALIZAÇÃO GERAL
    ================================================= */

    function updateAll() {

        updateCategoryFilter();

        updateDashboard();

        updateRecentTransactions();

        updateAllTransactions();

        updateCategories();

        updateReports();

        updateForecast();
    }

    /* =================================================
       INICIALIZAÇÃO
    ================================================= */

    dateInput.value = todayISO();

    if (frequencyInput) {
        frequencyInput.value = "once";
    }

    updateTypeButtons();

    loadUser();

});

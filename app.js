document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTOS
    ========================= */

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

    const goalsList = document.getElementById("goalsList");
    const budgetList = document.getElementById("budgetList");
    const smartAlerts = document.getElementById("smartAlerts");
    const monthlyComparison = document.getElementById("monthlyComparison");
    const financialCalendar = document.getElementById("financialCalendar");
    const financialInsights = document.getElementById("financialInsights");

    const healthScore = document.getElementById("healthScore");
    const healthProgress = document.getElementById("healthProgress");
    const healthMessage = document.getElementById("healthMessage");

    const simulationAmount = document.getElementById("simulationAmount");
    const simulationType = document.getElementById("simulationType");
    const simulationResult = document.getElementById("simulationResult");

    const goalModal = document.getElementById("goalModal");
    const goalForm = document.getElementById("goalForm");


    /* =========================
       DADOS
    ========================= */

    let transactions = loadJSON("controles_transactions", []);
    let goals = loadJSON("controles_goals", []);
    let budgets = loadJSON("controles_budgets", []);

    let currentUser = loadJSON("controles_user", null);

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;

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


    /* =========================
       UTILITÁRIOS
    ========================= */

    function loadJSON(key, fallback) {

        try {

            const value = localStorage.getItem(key);

            return value ? JSON.parse(value) : fallback;

        } catch {

            return fallback;

        }

    }


    function saveJSON(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }


    function saveTransactions() {
        saveJSON("controles_transactions", transactions);
    }


    function saveGoals() {
        saveJSON("controles_goals", goals);
    }


    function saveBudgets() {
        saveJSON("controles_budgets", budgets);
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


    function todayISO() {

        const d = new Date();

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");

    }


    function formatDate(dateString) {

        if (!dateString) return "";

        const d = new Date(dateString + "T00:00:00");

        return d.toLocaleDateString("pt-BR");

    }


    function escapeHTML(text) {

        return String(text ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

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


    let toastTimer = null;

    function showToast(message) {

        const toast = document.getElementById("toast");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);

    }


    function isPremium() {

        return currentUser &&
            currentUser.plan === "premium";

    }


    /* =========================
       LOGIN
    ========================= */

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
            isPremium()
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

        saveJSON("controles_user", currentUser);

        loadUser();

        showToast("Bem-vindo ao ControleS! 👋");

    });


    document.getElementById("logoutBtn")
        .addEventListener("click", () => {

            localStorage.removeItem("controles_user");

            currentUser = null;

            app.classList.add("hidden");
            loginScreen.classList.remove("hidden");

            showToast("Você saiu do ControleS.");

        });


    /* =========================
       NAVEGAÇÃO
    ========================= */

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
            updatePremium();
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


    document.querySelectorAll("[data-section]")
        .forEach(button => {

            if (!button.classList.contains("nav-item")) {

                button.addEventListener("click", () => {

                    openSection(button.dataset.section);

                });

            }

        });


    document.getElementById("mobileMenuBtn")
        .addEventListener("click", () => {

            document
                .getElementById("sidebar")
                .classList.toggle("mobile-open");

        });


    /* =========================
       MODAL LANÇAMENTO
    ========================= */

    function openModal() {

        transactionModal.classList.remove("hidden");

        dateInput.value =
            dateInput.value || todayISO();

        descriptionInput.focus();

    }


    function closeModal() {

        transactionModal.classList.add("hidden");

        transactionForm.reset();

        selectedType = "income";

        updateTypeButtons();

        dateInput.value = todayISO();
        frequencyInput.value = "once";

    }


    document.getElementById("openTransactionBtn")
        .addEventListener("click", openModal);

    document.getElementById("newTransactionButton")
        .addEventListener("click", openModal);

    document.getElementById("closeModal")
        .addEventListener("click", closeModal);

    document.querySelector("#transactionModal .modal-overlay")
        .addEventListener("click", closeModal);


    /* =========================
       TIPO
    ========================= */

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

            selectedType = button.dataset.type;

            updateTypeButtons();

        });

    });


    /* =========================
       CATEGORIAS
    ========================= */

    function populateTransactionCategories() {

        transactionCategory.innerHTML = "";

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            transactionCategory.appendChild(option);

        });

    }


    function updateCategoryFilter() {

        const current = categoryFilter.value;

        categoryFilter.innerHTML =
            `<option value="all">Todas categorias</option>`;

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);

        });

        if (categories.includes(current)) {
            categoryFilter.value = current;
        }

    }


    populateTransactionCategories();
    updateCategoryFilter();


    /* =========================
       SALVAR LANÇAMENTO
    ========================= */

    transactionForm.addEventListener("submit", event => {

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

            showToast("Preencha os campos corretamente.");

            return;

        }

        transactions.push({

            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            type: selectedType,

            description,

            amount,

            date,

            frequency,

            category

        });

        saveTransactions();

        closeModal();

        updateAll();

        showToast("Lançamento salvo com sucesso! ✅");

    });


    /* =========================
       OCORRÊNCIAS
    ========================= */

    function transactionOccurrences(
        transaction,
        startDate,
        endDate
    ) {

        const occurrences = [];

        const original =
            new Date(transaction.date + "T00:00:00");

        if (Number.isNaN(original.getTime())) {
            return occurrences;
        }

        let current = new Date(original);

        if (transaction.frequency === "once") {

            if (
                current >= startDate &&
                current <= endDate
            ) {
                occurrences.push(new Date(current));
            }

            return occurrences;
        }


        /*
           IMPORTANTE:

           A recorrência mensal acontece UMA VEZ por mês.
           Portanto, um salário mensal não vira 30 salários
           nem é projetado para o ano inteiro.
        */

        while (current <= endDate) {

            if (current >= startDate) {
                occurrences.push(new Date(current));
            }

            if (transaction.frequency === "daily") {

                current.setDate(
                    current.getDate() + 1
                );

            } else if (transaction.frequency === "weekly") {

                current.setDate(
                    current.getDate() + 7
                );

            } else if (transaction.frequency === "monthly") {

                const originalDay =
                    new Date(transaction.date + "T00:00:00")
                        .getDate();

                const nextMonth =
                    current.getMonth() + 1;

                const year =
                    current.getFullYear() +
                    Math.floor(nextMonth / 12);

                const month =
                    nextMonth % 12;

                const daysInMonth =
                    new Date(
                        year,
                        month + 1,
                        0
                    ).getDate();

                current =
                    new Date(
                        year,
                        month,
                        Math.min(
                            originalDay,
                            daysInMonth
                        )
                    );

            } else {

                break;

            }

        }

        return occurrences;

    }


    function getPeriodTransactions(startDate, endDate) {

        const result = [];

        transactions.forEach(transaction => {

            transactionOccurrences(
                transaction,
                startDate,
                endDate
            ).forEach(date => {

                result.push({
                    ...transaction,
                    occurrenceDate: new Date(date)
                });

            });

        });

        return result;

    }


    /* =========================
       MÊS
    ========================= */

    function getCurrentMonthRange() {

        const now = new Date();

        return {

            start:
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                ),

            end:
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                    23,
                    59,
                    59
                )

        };

    }


    function getMonthRange(offset = 0) {

        const now = new Date();

        return {

            start:
                new Date(
                    now.getFullYear(),
                    now.getMonth() + offset,
                    1
                ),

            end:
                new Date(
                    now.getFullYear(),
                    now.getMonth() + offset + 1,
                    0,
                    23,
                    59,
                    59
                )

        };

    }


    function calculateMonthTotals(offset = 0) {

        const { start, end } =
            getMonthRange(offset);

        const items =
            getPeriodTransactions(start, end);

        let income = 0;
        let expense = 0;

        items.forEach(item => {

            if (item.type === "income") {
                income += Number(item.amount);
            } else {
                expense += Number(item.amount);
            }

        });

        return {
            income,
            expense,
            balance: income - expense
        };

    }


    /* =========================
       DASHBOARD
    ========================= */

    function updateDashboard() {

        const totals =
            calculateMonthTotals();

        balanceValue.textContent =
            formatMoney(totals.balance);

        incomeValue.textContent =
            formatMoney(totals.income);

        expenseValue.textContent =
            formatMoney(totals.expense);

        const economy =
            totals.income > 0
                ? (totals.balance / totals.income) * 100
                : 0;

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


    /* =========================
       TRANSAÇÕES
    ========================= */

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
                        ${escapeHTML(transaction.description)}
                    </strong>

                    <small>
                        ${escapeHTML(transaction.category)}
                        •
                        ${formatDate(occurrenceDate)}
                        •
                        ${frequencyLabel(transaction.frequency)}
                    </small>

                </div>

                <div class="transaction-value ${valueClass}">
                    ${sign} ${formatMoney(transaction.amount)}
                </div>

                <button
                    class="transaction-delete"
                    data-delete-id="${String(transaction.id)}"
                    title="Excluir lançamento"
                    type="button"
                >
                    ×
                </button>

            </div>

        `;

    }


    function updateRecentTransactions() {

        const { start, end } =
            getCurrentMonthRange();

        let items =
            getPeriodTransactions(start, end);

        items.sort(
            (a,b) =>
                b.occurrenceDate - a.occurrenceDate
        );

        items = items.slice(0,5);

        if (!items.length) {

            recentTransactions.innerHTML =
                `<div class="empty-state">
                    Nenhum lançamento neste mês.
                </div>`;

            return;

        }

        recentTransactions.innerHTML =
            items.map(createTransactionHTML).join("");

    }


    function updateAllTransactions() {

        /*
           Mostra somente uma janela razoável:
           12 meses anteriores + mês atual + 12 meses futuros.
           Isso evita uma lista infinita.
        */

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - 12,
                1
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() + 13,
                0,
                23,
                59,
                59
            );

        let items =
            getPeriodTransactions(start,end);

        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const type =
            typeFilter.value;

        const category =
            categoryFilter.value;

        items = items.filter(item => {

            const matchesSearch =
                !search ||
                String(item.description)
                    .toLowerCase()
                    .includes(search) ||
                String(item.category)
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
            (a,b) =>
                b.occurrenceDate - a.occurrenceDate
        );

        if (!items.length) {

            allTransactions.innerHTML =
                `<div class="empty-state">
                    Nenhum lançamento encontrado.
                </div>`;

            return;

        }

        allTransactions.innerHTML =
            items.map(createTransactionHTML).join("");

    }


    /*
       EXCLUSÃO CORRIGIDA

       O ID agora é comparado como texto.
       Assim funciona tanto com IDs antigos
       numéricos quanto com os novos IDs.
    */

    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-delete-id]");

        if (!button) return;

        const id =
            String(button.dataset.deleteId);

        const index =
            transactions.findIndex(
                transaction =>
                    String(transaction.id) === id
            );

        if (index === -1) {

            showToast(
                "Não foi possível encontrar esse lançamento."
            );

            return;

        }

        transactions.splice(index,1);

        saveTransactions();

        updateAll();

        showToast("Lançamento excluído com sucesso! 🗑️");

    });


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


    /* =========================
       GRÁFICO
    ========================= */

    function updateFinanceChart() {

        const canvas =
            document.getElementById("financeChart");

        if (!canvas) return;

        const totals =
            calculateMonthTotals();

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

                    datasets: [{
                        label: "Valor",
                        data: [
                            totals.income,
                            totals.expense
                        ],
                        borderWidth: 0
                    }]

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
                                callback: value =>
                                    formatMoney(value)
                            }

                        }

                    }

                }

            });

    }


    /* =========================
       CATEGORIAS
    ========================= */

    function calculateCategories(offset = 0) {

        const { start, end } =
            getMonthRange(offset);

        const items =
            getPeriodTransactions(start,end);

        const totals = {};

        items.forEach(item => {

            if (item.type !== "expense") return;

            totals[item.category] =
                (totals[item.category] || 0) +
                Number(item.amount);

        });

        return totals;

    }


    function updateCategories() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort((a,b) => b[1] - a[1]);

        if (!entries.length) {

            categoryList.innerHTML =
                `<div class="empty-state">
                    Nenhuma despesa cadastrada neste mês.
                </div>`;

            updateCategoryChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum,[,value]) => sum + value,
                0
            );

        categoryList.innerHTML =
            entries.map(([category,value]) => {

                const percentage =
                    total > 0
                        ? value / total * 100
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

            }).join("");

        updateCategoryChart(totals);

    }


    function updateCategoryChart(totals) {

        const canvas =
            document.getElementById("categoryChart");

        if (!canvas) return;

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart =
            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels: Object.keys(totals),

                    datasets: [{
                        data: Object.values(totals),
                        borderWidth: 2
                    }]

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


    /* =========================
       RELATÓRIOS
    ========================= */

    function updateReports() {

        const totals =
            calculateCategories();

        const entries =
            Object.entries(totals)
                .sort((a,b) => b[1] - a[1]);

        if (!entries.length) {

            reportAnalysis.innerHTML =
                `<div class="empty-state">
                    Cadastre despesas para gerar sua análise.
                </div>`;

            updateReportChart({});

            return;

        }

        const total =
            entries.reduce(
                (sum,[,value]) => sum + value,
                0
            );

        const biggest = entries[0];

        reportAnalysis.innerHTML = `

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Total gasto</strong>
                </div>

                <span>
                    ${formatMoney(total)}
                </span>
            </div>

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Maior categoria</strong>
                </div>

                <span>
                    ${escapeHTML(biggest[0])}
                </span>
            </div>

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Maior gasto</strong>
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

        if (!canvas) return;

        if (reportCategoryChart) {
            reportCategoryChart.destroy();
        }

        reportCategoryChart =
            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels: Object.keys(totals),

                    datasets: [{
                        data: Object.values(totals),
                        borderWidth: 2
                    }]

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


    /* =========================
       PREMIUM
    ========================= */

    function premiumCheck() {

        if (!isPremium()) {

            showToast(
                "Esse recurso faz parte do ControleS Premium ⭐"
            );

            return false;

        }

        return true;

    }


    function updateForecast() {

        if (!monthForecast) return;

        if (!isPremium()) {

            monthForecast.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para usar a previsão financeira. ⭐
                </div>`;

            return;

        }

        const now = new Date();

        const { start, end } =
            getCurrentMonthRange();

        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const totalDays =
            end.getDate();

        const elapsedDays =
            Math.max(
                1,
                Math.floor(
                    (today - start) / 86400000
                ) + 1
            );

        const remainingDays =
            Math.max(
                0,
                totalDays - elapsedDays
            );

        const currentItems =
            getPeriodTransactions(
                start,
                today
            );

        let incomeUntilToday = 0;
        let expenseUntilToday = 0;

        currentItems.forEach(item => {

            if (item.type === "income") {
                incomeUntilToday += Number(item.amount);
            } else {
                expenseUntilToday += Number(item.amount);
            }

        });


        /*
           Aqui está a correção principal:

           A previsão considera somente o mês atual.
           Receitas/despesas mensais futuras dentro deste
           mesmo mês entram uma vez na data em que ocorrem.

           Não multiplica salário mensal por 12 meses.
        */

        const allMonthItems =
            getPeriodTransactions(
                start,
                end
            );

        let futureIncome = 0;
        let futureExpense = 0;

        allMonthItems.forEach(item => {

            if (item.occurrenceDate > today) {

                if (item.type === "income") {
                    futureIncome += Number(item.amount);
                } else {
                    futureExpense += Number(item.amount);
                }

            }

        });


        const averageDailyExpense =
            expenseUntilToday / elapsedDays;

        const estimatedExtraExpense =
            averageDailyExpense * remainingDays;

        /*
           Despesas recorrentes que já estão previstas
           no restante do mês não devem ser duplicadas.

           Usamos o maior valor entre a previsão diária
           e as despesas futuras já cadastradas.
        */

        const remainingExpense =
            Math.max(
                estimatedExtraExpense,
                futureExpense
            );

        const forecast =
            incomeUntilToday +
            futureIncome -
            expenseUntilToday -
            remainingExpense;


        let message;

        if (forecast >= 0) {

            message =
                "A projeção indica um fechamento positivo. 💰";

        } else {

            message =
                "Atenção: a projeção indica possível saldo negativo. 🚨";

        }


        monthForecast.innerHTML = `

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Saldo realizado</strong>
                </div>

                <span>
                    ${formatMoney(
                        incomeUntilToday -
                        expenseUntilToday
                    )}
                </span>
            </div>

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Receitas futuras</strong>
                </div>

                <span>
                    ${formatMoney(futureIncome)}
                </span>
            </div>

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Despesas previstas</strong>
                </div>

                <span>
                    ${formatMoney(remainingExpense)}
                </span>
            </div>

            <div class="category-summary-item">
                <div class="category-summary-left">
                    <div class="category-dot"></div>
                    <strong>Previsão no fim do mês</strong>
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


    /* =========================
       METAS
    ========================= */

    function openGoalModal() {

        if (!premiumCheck()) return;

        goalModal.classList.remove("hidden");

    }


    function closeGoalModal() {

        goalModal.classList.add("hidden");

        goalForm.reset();

        document.getElementById("goalSaved").value = 0;

    }


    document.getElementById("addGoalBtn")
        .addEventListener("click", openGoalModal);

    document.getElementById("closeGoalModal")
        .addEventListener("click", closeGoalModal);

    document.querySelector("#goalModal .modal-overlay")
        .addEventListener("click", closeGoalModal);


    goalForm.addEventListener("submit", event => {

        event.preventDefault();

        if (!premiumCheck()) return;

        const name =
            document.getElementById("goalName")
                .value.trim();

        const target =
            Number(
                document.getElementById("goalTarget").value
            );

        const saved =
            Number(
                document.getElementById("goalSaved").value
            ) || 0;

        const monthly =
            Number(
                document.getElementById("goalMonthly").value
            );


        if (
            !name ||
            target <= 0 ||
            saved < 0 ||
            monthly <= 0
        ) {

            showToast("Preencha a meta corretamente.");

            return;

        }


        goals.push({

            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,

            name,
            target,
            saved: Math.min(saved,target),
            monthly

        });


        saveGoals();

        closeGoalModal();

        updateGoals();

        showToast("Meta criada com sucesso! 🎯");

    });


    function updateGoals() {

        if (!isPremium()) {

            goalsList.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para criar metas financeiras. ⭐
                </div>`;

            return;

        }

        if (!goals.length) {

            goalsList.innerHTML =
                `<div class="empty-state">
                    Você ainda não criou nenhuma meta.
                </div>`;

            return;

        }


        goalsList.innerHTML =
            goals.map(goal => {

                const percentage =
                    Math.min(
                        100,
                        goal.saved /
                        goal.target *
                        100
                    );

                const remaining =
                    Math.max(
                        0,
                        goal.target -
                        goal.saved
                    );

                const months =
                    remaining > 0
                        ? Math.ceil(
                            remaining /
                            goal.monthly
                        )
                        : 0;

                let completion = "";

                if (months === 0) {

                    completion =
                        "Meta concluída! 🎉";

                } else {

                    completion =
                        `Aproximadamente ${months} mês(es) para concluir.`;

                }


                return `

                    <div class="goal-card">

                        <div class="goal-card-header">

                            <strong>
                                🎯 ${escapeHTML(goal.name)}
                            </strong>

                            <button
                                class="goal-delete"
                                data-goal-delete="${String(goal.id)}"
                                type="button"
                            >
                                ×
                            </button>

                        </div>

                        <div class="goal-value">
                            ${formatMoney(goal.saved)}
                            /
                            ${formatMoney(goal.target)}
                        </div>

                        <div class="goal-progress">
                            <div style="width:${percentage}%"></div>
                        </div>

                        <div class="goal-details">

                            <div class="goal-detail">
                                <small>Falta</small>
                                <strong>
                                    ${formatMoney(remaining)}
                                </strong>
                            </div>

                            <div class="goal-detail">
                                <small>Por mês</small>
                                <strong>
                                    ${formatMoney(goal.monthly)}
                                </strong>
                            </div>

                        </div>

                        <p>
                            ${completion}
                        </p>

                    </div>

                `;

            }).join("");

    }


    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-goal-delete]");

        if (!button) return;

        const id =
            String(button.dataset.goalDelete);

        goals =
            goals.filter(
                goal =>
                    String(goal.id) !== id
            );

        saveGoals();

        updateGoals();

        showToast("Meta excluída.");

    });


    /* =========================
       ORÇAMENTO
    ========================= */

    function updateBudgetList() {

        if (!isPremium()) {

            budgetList.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para controlar seu orçamento. ⭐
                </div>`;

            return;

        }


        budgetList.innerHTML =
            categories.map(category => {

                const spent =
                    calculateCategories()[category] || 0;

                const budget =
                    budgets.find(
                        item =>
                            item.category === category
                    );

                const limit =
                    budget
                        ? Number(budget.limit)
                        : 0;

                const percentage =
                    limit > 0
                        ? spent / limit * 100
                        : 0;

                const displayPercentage =
                    Math.min(100,percentage);

                return `

                    <div class="budget-item">

                        <div class="budget-header">

                            <strong>
                                ${escapeHTML(category)}
                            </strong>

                            <span>
                                ${formatMoney(spent)}
                                /
                                ${limit > 0
                                    ? formatMoney(limit)
                                    : "Sem limite"}
                            </span>

                        </div>

                        <div class="budget-progress">

                            <div
                                class="${percentage > 100 ? "over" : ""}"
                                style="width:${displayPercentage}%"
                            ></div>

                        </div>

                        <div class="budget-footer">

                            <span>
                                ${
                                    limit > 0
                                        ? `${percentage.toFixed(0)}% utilizado`
                                        : "Clique para definir limite"
                                }
                            </span>

                            <button
                                class="text-button"
                                data-budget-category="${escapeHTML(category)}"
                                type="button"
                            >
                                ${limit > 0 ? "Alterar" : "Definir"}
                            </button>

                        </div>

                    </div>

                `;

            }).join("");

    }


    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-budget-category]");

        if (!button) return;

        if (!premiumCheck()) return;

        const category =
            button.dataset.budgetCategory;

        const current =
            budgets.find(
                item => item.category === category
            );

        const value =
            prompt(
                `Defina o limite mensal para ${category}:`,
                current ? current.limit : ""
            );

        /*
           Prompt é usado somente para edição do orçamento.
           Não é uma mensagem de alerta.
        */

        if (value === null) return;

        const limit =
            Number(
                String(value)
                    .replace(",", ".")
            );

        if (!limit || limit <= 0) {

            showToast("Digite um limite válido.");

            return;

        }

        const existing =
            budgets.find(
                item => item.category === category
            );

        if (existing) {

            existing.limit = limit;

        } else {

            budgets.push({
                category,
                limit
            });

        }

        saveBudgets();

        updateBudgetList();

        showToast("Orçamento atualizado! 💰");

    });


    /* =========================
       ALERTAS INTELIGENTES
    ========================= */

    function updateSmartAlerts() {

        if (!isPremium()) {

            smartAlerts.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para receber alertas inteligentes. ⭐
                </div>`;

            return;

        }

        const totals =
            calculateMonthTotals();

        const previous =
            calculateMonthTotals(-1);

        const alerts = [];


        if (
            totals.expense >
            previous.expense &&
            previous.expense > 0
        ) {

            const increase =
                (
                    (totals.expense -
                    previous.expense) /
                    previous.expense
                ) * 100;

            if (increase >= 10) {

                alerts.push({
                    title: "🚨 Seus gastos aumentaram",
                    text:
                        `As despesas estão ${increase.toFixed(0)}% maiores que no mês anterior.`
                });

            }

        }


        const categoryTotals =
            calculateCategories();

        Object.entries(categoryTotals)
            .forEach(([category,value]) => {

                const budget =
                    budgets.find(
                        item =>
                            item.category === category
                    );

                if (
                    budget &&
                    value > budget.limit
                ) {

                    alerts.push({
                        title:
                            `🚨 Orçamento ultrapassado: ${category}`,
                        text:
                            `Você já gastou ${formatMoney(value)} de um limite de ${formatMoney(budget.limit)}.`
                    });

                }

            });


        if (totals.income > 0 && totals.balance < 0) {

            alerts.push({
                title: "⚠️ Atenção ao saldo",
                text:
                    "Suas despesas já ultrapassaram suas receitas neste mês."
            });

        }


        if (!alerts.length) {

            alerts.push({
                title: "✅ Tudo sob controle",
                text:
                    "Não encontramos nenhum alerta importante neste momento."
            });

        }


        smartAlerts.innerHTML =
            alerts.map(alert => `

                <div class="smart-alert">

                    <strong>
                        ${escapeHTML(alert.title)}
                    </strong>

                    <p>
                        ${escapeHTML(alert.text)}
                    </p>

                </div>

            `).join("");

    }


    /* =========================
       COMPARAÇÃO MENSAL
    ========================= */

    function updateMonthlyComparison() {

        if (!isPremium()) {

            monthlyComparison.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para comparar seus meses. ⭐
                </div>`;

            return;

        }

        const current =
            calculateMonthTotals(0);

        const previous =
            calculateMonthTotals(-1);


        function variation(currentValue, previousValue) {

            if (previousValue === 0) {

                return currentValue === 0
                    ? "0%"
                    : "Novo";

            }

            const value =
                (
                    (currentValue -
                    previousValue) /
                    previousValue
                ) * 100;

            return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

        }


        monthlyComparison.innerHTML = `

            <div class="comparison-grid">

                <div class="comparison-card">
                    <span>Receitas</span>

                    <strong>
                        ${formatMoney(current.income)}
                    </strong>

                    <small>
                        ${variation(
                            current.income,
                            previous.income
                        )}
                        vs. mês anterior
                    </small>
                </div>

                <div class="comparison-card">
                    <span>Despesas</span>

                    <strong>
                        ${formatMoney(current.expense)}
                    </strong>

                    <small>
                        ${variation(
                            current.expense,
                            previous.expense
                        )}
                        vs. mês anterior
                    </small>
                </div>

                <div class="comparison-card">
                    <span>Saldo</span>

                    <strong>
                        ${formatMoney(current.balance)}
                    </strong>

                    <small>
                        ${variation(
                            current.balance,
                            previous.balance
                        )}
                        vs. mês anterior
                    </small>
                </div>

            </div>

        `;

    }


    /* =========================
       CALENDÁRIO
    ========================= */

    function updateCalendar() {

        if (!isPremium()) {

            financialCalendar.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para usar o calendário financeiro. ⭐
                </div>`;

            return;

        }


        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            now.getMonth();

        const firstDay =
            new Date(year,month,1)
                .getDay();

        const daysInMonth =
            new Date(year,month + 1,0)
                .getDate();


        const start =
            new Date(year,month,1);

        const end =
            new Date(
                year,
                month,
                daysInMonth,
                23,
                59,
                59
            );


        const items =
            getPeriodTransactions(start,end);


        const byDay = {};

        items.forEach(item => {

            const day =
                item.occurrenceDate.getDate();

            if (!byDay[day]) {
                byDay[day] = {
                    income: 0,
                    expense: 0
                };
            }

            if (item.type === "income") {
                byDay[day].income += Number(item.amount);
            } else {
                byDay[day].expense += Number(item.amount);
            }

        });


        const monthName =
            new Date(year,month,1)
                .toLocaleDateString(
                    "pt-BR",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


        let html = `

            <div class="calendar-title">
                ${monthName}
            </div>

            <div class="calendar-grid">

                <div class="calendar-day-name">Dom</div>
                <div class="calendar-day-name">Seg</div>
                <div class="calendar-day-name">Ter</div>
                <div class="calendar-day-name">Qua</div>
                <div class="calendar-day-name">Qui</div>
                <div class="calendar-day-name">Sex</div>
                <div class="calendar-day-name">Sáb</div>

        `;


        for (let i = 0; i < firstDay; i++) {

            html += `<div></div>`;

        }


        for (let day = 1; day <= daysInMonth; day++) {

            const data =
                byDay[day];

            const isToday =
                day === now.getDate();

            let className =
                "calendar-day";

            if (isToday) {
                className += " today";
            }

            if (data?.income) {
                className += " income-day";
            }

            if (data?.expense) {
                className += " expense-day";
            }


            html += `

                <div class="${className}">

                    <strong>${day}</strong>

                    ${
                        data
                            ? `
                                <div class="calendar-amount">
                                    ${
                                        data.income
                                            ? "↗ " + formatMoney(data.income)
                                            : ""
                                    }
                                </div>

                                <div class="calendar-amount">
                                    ${
                                        data.expense
                                            ? "↘ " + formatMoney(data.expense)
                                            : ""
                                    }
                                </div>
                              `
                            : ""
                    }

                </div>

            `;

        }


        html += `</div>`;

        financialCalendar.innerHTML = html;

    }


    /* =========================
       SIMULADOR
    ========================= */

    document.getElementById("simulateBtn")
        .addEventListener("click", () => {

            if (!premiumCheck()) return;

            const amount =
                Number(simulationAmount.value);

            if (!amount || amount <= 0) {

                showToast("Digite um valor para simular.");

                return;

            }

            const current =
                calculateMonthTotals();

            let simulated =
                current.balance;

            if (simulationType.value === "expense") {

                simulated -= amount;

            } else {

                simulated += amount;

            }

            simulationResult.className =
                "simulation-result";

            simulationResult.innerHTML = `

                <strong>
                    Saldo atual:
                </strong>

                ${formatMoney(current.balance)}

                <br><br>

                <strong>
                    Saldo simulado:
                </strong>

                ${formatMoney(simulated)}

            `;

        });


    /* =========================
       INSIGHTS
    ========================= */

    function updateInsights() {

        if (!isPremium()) {

            financialInsights.innerHTML =
                `<div class="empty-state">
                    Ative o Premium para receber insights financeiros. ⭐
                </div>`;

            return;

        }

        const totals =
            calculateMonthTotals();

        const categoryTotals =
            calculateCategories();

        const entries =
            Object.entries(categoryTotals)
                .sort((a,b) => b[1] - a[1]);

        const insights = [];


        if (totals.income > 0) {

            const economy =
                totals.balance /
                totals.income *
                100;

            if (economy >= 20) {

                insights.push({
                    title: "💎 Boa capacidade de economia",
                    text:
                        `Você está economizando aproximadamente ${economy.toFixed(1)}% das suas receitas neste mês.`
                });

            } else if (economy >= 0) {

                insights.push({
                    title: "💡 Dá para melhorar",
                    text:
                        "Seu saldo está positivo, mas existe espaço para aumentar sua economia."
                });

            } else {

                insights.push({
                    title: "🚨 Atenção aos gastos",
                    text:
                        "Suas despesas estão maiores que suas receitas neste mês."
                });

            }

        }


        if (entries.length) {

            insights.push({
                title:
                    `📄 Maior categoria: ${entries[0][0]}`,
                text:
                    `Você gastou ${formatMoney(entries[0][1])} nessa categoria neste mês.`
            });

        }


        if (!insights.length) {

            insights.push({
                title: "💡 Comece a registrar seus lançamentos",
                text:
                    "Com mais dados, o ControleS poderá gerar análises mais inteligentes."
            });

        }


        financialInsights.innerHTML =
            insights.map(item => `

                <div class="insight">

                    <strong>
                        ${escapeHTML(item.title)}
                    </strong>

                    <p>
                        ${escapeHTML(item.text)}
                    </p>

                </div>

            `).join("");

    }


    /* =========================
       SAÚDE FINANCEIRA
    ========================= */

    function updateFinancialHealth() {

        if (!isPremium()) {

            healthScore.textContent = "0/100";
            healthProgress.style.width = "0%";

            healthMessage.textContent =
                "Ative o Premium para analisar sua saúde financeira.";

            return;

        }


        const totals =
            calculateMonthTotals();

        let score = 50;


        if (totals.income > 0) {

            const economy =
                totals.balance /
                totals.income;

            score += economy * 40;

        }


        if (totals.balance < 0) {
            score -= 20;
        }

        if (totals.expense === 0 && totals.income === 0) {
            score = 50;
        }

        score =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(score)
                )
            );


        healthScore.textContent =
            `${score}/100`;

        healthProgress.style.width =
            `${score}%`;


        if (score >= 80) {

            healthMessage.textContent =
                "Excelente! Suas finanças apresentam uma boa margem de segurança. 💎";

        } else if (score >= 60) {

            healthMessage.textContent =
                "Boa situação. Continue controlando seus gastos. 👍";

        } else if (score >= 40) {

            healthMessage.textContent =
                "Atenção. Você pode melhorar sua margem de economia. 💡";

        } else {

            healthMessage.textContent =
                "Cuidado. Seus gastos estão pressionando seu orçamento. 🚨";

        }

    }


    /* =========================
       PREMIUM ATIVAÇÃO
    ========================= */

    document.getElementById("subscribePremiumBtn")
        .addEventListener("click", () => {

            if (!currentUser) return;

            if (isPremium()) {

                showToast(
                    "Você já possui o ControleS Premium ⭐"
                );

                return;

            }

            currentUser.plan = "premium";

            saveJSON(
                "controles_user",
                currentUser
            );

            userPlan.textContent =
                "ControleS Premium ⭐";

            updatePremium();

            showToast(
                "ControleS Premium ativado! ⭐"
            );

        });


    function updatePremium() {

        updateForecast();
        updateGoals();
        updateBudgetList();
        updateSmartAlerts();
        updateMonthlyComparison();
        updateCalendar();
        updateInsights();
        updateFinancialHealth();

    }


    /* =========================
       TEMA
    ========================= */

    document.getElementById("themeBtn")
        .addEventListener("click", () => {

            document.body.classList.toggle("dark");

            const dark =
                document.body.classList.contains("dark");

            localStorage.setItem(
                "controles_dark",
                String(dark)
            );

        });


    if (
        localStorage.getItem("controles_dark") === "true"
    ) {

        document.body.classList.add("dark");

    }


    /* =========================
       EXPORTAR
    ========================= */

    document.getElementById("exportDataBtn")
        .addEventListener("click", () => {

            const data = {

                user: currentUser,

                transactions,

                goals,

                budgets,

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
                        type: "application/json"
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

            showToast("Dados exportados! 💾");

        });


    /* =========================
       ATUALIZAÇÃO GERAL
    ========================= */

    function updateAll() {

        updateCategoryFilter();

        updateDashboard();

        updateRecentTransactions();

        updateAllTransactions();

        updateCategories();

        updateReports();

        updatePremium();

    }


    /* =========================
       INICIALIZAÇÃO
    ========================= */

    dateInput.value = todayISO();

    loadUser();

});

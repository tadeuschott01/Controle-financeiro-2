/* =====================================================
   CONTROLES — APP.JS
   Versão completa
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DADOS
    ===================================================== */

    let transactions = JSON.parse(
        localStorage.getItem("controles_transactions") || "[]"
    );

    let goals = JSON.parse(
        localStorage.getItem("controles_goals") || "[]"
    );

    let budgets = JSON.parse(
        localStorage.getItem("controles_budgets") || "[]"
    );

    let user = JSON.parse(
        localStorage.getItem("controles_user") || "null"
    );

    let isPremium =
        localStorage.getItem("controles_premium") === "true";

    let selectedType = "income";

    let financeChart = null;
    let categoryChart = null;
    let reportCategoryChart = null;


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const loginScreen = document.getElementById("loginScreen");
    const loginForm = document.getElementById("loginForm");

    const app = document.getElementById("app");

    const loginName = document.getElementById("loginName");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const userPlan = document.getElementById("userPlan");
    const welcomeName = document.getElementById("welcomeName");

    const pageTitle = document.getElementById("pageTitle");

    const transactionModal =
        document.getElementById("transactionModal");

    const goalModal =
        document.getElementById("goalModal");

    const budgetModal =
        document.getElementById("budgetModal");

    const transactionForm =
        document.getElementById("transactionForm");

    const goalForm =
        document.getElementById("goalForm");

    const budgetForm =
        document.getElementById("budgetForm");


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

    function saveData() {

        localStorage.setItem(
            "controles_transactions",
            JSON.stringify(transactions)
        );

        localStorage.setItem(
            "controles_goals",
            JSON.stringify(goals)
        );

        localStorage.setItem(
            "controles_budgets",
            JSON.stringify(budgets)
        );

    }


    function money(value) {

        return Number(value || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function today() {

        const date = new Date();

        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function formatDate(dateString) {

        if (!dateString) return "";

        const date = new Date(dateString + "T00:00:00");

        return date.toLocaleDateString(
            "pt-BR"
        );

    }


    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text || "";

        return div.innerHTML;

    }


    function getTotals() {

        let income = 0;
        let expense = 0;

        transactions.forEach(transaction => {

            const amount =
                Number(transaction.amount) || 0;

            if (transaction.type === "income") {

                income += amount;

            } else {

                expense += amount;

            }

        });

        return {
            income,
            expense,
            balance: income - expense
        };

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    function showApp() {

        if (!user) {

            loginScreen.classList.remove("hidden");

            app.classList.add("hidden");

            return;

        }

        loginScreen.classList.add("hidden");

        app.classList.remove("hidden");

        updateUser();

        updateAll();

    }


    function updateUser() {

        if (!user) return;

        const name =
            user.name || "Usuário";

        if (userName) {

            userName.textContent = name;

        }

        if (welcomeName) {

            welcomeName.textContent =
                name.split(" ")[0];

        }

        if (userAvatar) {

            userAvatar.textContent =
                name.charAt(0).toUpperCase();

        }

        if (userPlan) {

            userPlan.textContent =
                isPremium
                    ? "ControleS Premium ⭐"
                    : "ControleS Grátis";

        }

    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    loginName.value.trim();

                const email =
                    loginEmail.value.trim();

                const password =
                    loginPassword.value.trim();

                if (
                    !name ||
                    !email ||
                    !password
                ) {

                    alert(
                        "Preencha todos os campos."
                    );

                    return;

                }

                user = {
                    name,
                    email
                };

                localStorage.setItem(
                    "controles_user",
                    JSON.stringify(user)
                );

                showApp();

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

                user = null;

                localStorage.removeItem(
                    "controles_user"
                );

                showApp();

            }
        );

    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    const sections =
        document.querySelectorAll(
            ".section"
        );


    function showSection(sectionId) {

        sections.forEach(section => {

            section.classList.add("hidden");

        });

        const target =
            document.getElementById(sectionId);

        if (target) {

            target.classList.remove("hidden");

        }

        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
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
                titles[sectionId] || "ControleS";

        }

        if (sectionId === "categories") {

            renderCategoryChart();

            renderCategoryList();

        }

        if (sectionId === "reports") {

            renderReportChart();

            renderReportAnalysis();

        }

        if (sectionId === "premium") {

            renderPremium();

        }

        const sidebar =
            document.getElementById("sidebar");

        if (sidebar) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                showSection(
                    item.dataset.section
                );

            }
        );

    });


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(button => {

            if (
                !button.classList.contains(
                    "nav-item"
                )
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        showSection(
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
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (mobileMenuBtn && sidebar) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );

    }


    /* =====================================================
       TEMA
    ===================================================== */

    const themeBtn =
        document.getElementById(
            "themeBtn"
        );

    const savedTheme =
        localStorage.getItem(
            "controles_theme"
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }


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
                    "controles_theme",
                    dark ? "dark" : "light"
                );

                if (dark) {

                    themeBtn.innerHTML =
                        "<span>☀️</span><span>Tema claro</span>";

                } else {

                    themeBtn.innerHTML =
                        "<span>🌙</span><span>Tema escuro</span>";

                }

            }
        );

    }


    /* =====================================================
       MODAL LANÇAMENTO
    ===================================================== */

    const openTransactionBtn =
        document.getElementById(
            "openTransactionBtn"
        );

    const newTransactionButton =
        document.getElementById(
            "newTransactionButton"
        );

    const closeModal =
        document.getElementById(
            "closeModal"
        );


    function openTransactionModal() {

        transactionModal.classList.remove(
            "hidden"
        );

        const dateInput =
            document.getElementById(
                "dateInput"
            );

        if (dateInput && !dateInput.value) {

            dateInput.value = today();

        }

    }


    function closeTransactionModal() {

        transactionModal.classList.add(
            "hidden"
        );

    }


    if (openTransactionBtn) {

        openTransactionBtn.addEventListener(
            "click",
            openTransactionModal
        );

    }

    if (newTransactionButton) {

        newTransactionButton.addEventListener(
            "click",
            openTransactionModal
        );

    }

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeTransactionModal
        );

    }


    transactionModal
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            closeTransactionModal
        );


    /* =====================================================
       TIPO DE LANÇAMENTO
    ===================================================== */

    const typeOptions =
        document.querySelectorAll(
            ".type-option"
        );

    typeOptions.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                typeOptions.forEach(
                    button =>
                        button.classList.remove(
                            "active"
                        )
                );

                option.classList.add(
                    "active"
                );

                selectedType =
                    option.dataset.type;

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
                    document.getElementById(
                        "descriptionInput"
                    ).value.trim();

                const amount =
                    Number(
                        document.getElementById(
                            "amountInput"
                        ).value
                    );

                const date =
                    document.getElementById(
                        "dateInput"
                    ).value;

                const frequency =
                    document.getElementById(
                        "frequencyInput"
                    ).value;

                const category =
                    document.getElementById(
                        "transactionCategory"
                    ).value;

                if (
                    !description ||
                    !amount ||
                    amount <= 0 ||
                    !date
                ) {

                    alert(
                        "Preencha os dados do lançamento."
                    );

                    return;

                }

                transactions.push({

                    id:
                        Date.now(),

                    description,

                    amount,

                    date,

                    frequency,

                    category,

                    type:
                        selectedType

                });

                saveData();

                transactionForm.reset();

                selectedType =
                    "income";

                typeOptions.forEach(
                    (button, index) => {

                        button.classList.toggle(
                            "active",
                            index === 0
                        );

                    }
                );

                closeTransactionModal();

                updateAll();

            }
        );

    }


    /* =====================================================
       RENDER TRANSAÇÕES
    ===================================================== */

    function transactionHTML(
        transaction
    ) {

        const income =
            transaction.type === "income";

        return `
            <div class="transaction">

                <div class="transaction-icon">
                    ${income ? "↗" : "↘"}
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
                            transaction.date
                        )}
                    </small>

                </div>

                <div
                    class="transaction-value ${
                        income
                            ? "income"
                            : "expense"
                    }"
                >
                    ${income ? "+" : "-"}
                    ${money(transaction.amount)}
                </div>

                <button
                    class="transaction-delete"
                    data-delete-id="${transaction.id}"
                    type="button"
                >
                    ×
                </button>

            </div>
        `;

    }


    function renderRecentTransactions() {

        const container =
            document.getElementById(
                "recentTransactions"
            );

        if (!container) return;

        const recent =
            [...transactions]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
                .slice(0, 5);

        if (!recent.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento cadastrado.
                </div>
            `;

            return;

        }

        container.innerHTML =
            recent
                .map(transactionHTML)
                .join("");

    }


    function renderAllTransactions() {

        const container =
            document.getElementById(
                "allTransactions"
            );

        if (!container) return;

        const search =
            (
                document.getElementById(
                    "searchInput"
                )?.value || ""
            ).toLowerCase();

        const type =
            document.getElementById(
                "typeFilter"
            )?.value || "all";

        const category =
            document.getElementById(
                "categoryFilter"
            )?.value || "all";


        let filtered =
            transactions.filter(
                transaction => {

                    const matchesSearch =
                        transaction.description
                            .toLowerCase()
                            .includes(search);

                    const matchesType =
                        type === "all" ||
                        transaction.type === type;

                    const matchesCategory =
                        category === "all" ||
                        transaction.category === category;

                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesCategory
                    );

                }
            );


        filtered.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        if (!filtered.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Nenhum lançamento encontrado.
                </div>
            `;

            return;

        }


        container.innerHTML =
            filtered
                .map(transactionHTML)
                .join("");

    }


    function updateCategoryFilter() {

        const select =
            document.getElementById(
                "categoryFilter"
            );

        if (!select) return;

        const current =
            select.value;

        const categories =
            [
                ...new Set(
                    transactions.map(
                        transaction =>
                            transaction.category
                    )
                )
            ];

        select.innerHTML = `
            <option value="all">
                Todas categorias
            </option>
        `;

        categories.forEach(category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;

            option.textContent = category;

            select.appendChild(option);

        });

        if (
            categories.includes(current)
        ) {

            select.value = current;

        }

    }


    document
        .getElementById("searchInput")
        ?.addEventListener(
            "input",
            renderAllTransactions
        );

    document
        .getElementById("typeFilter")
        ?.addEventListener(
            "change",
            renderAllTransactions
        );

    document
        .getElementById("categoryFilter")
        ?.addEventListener(
            "change",
            renderAllTransactions
        );


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (!button) return;

            const id =
                Number(
                    button.dataset.deleteId
                );

            if (
                !confirm(
                    "Deseja excluir este lançamento?"
                )
            ) return;

            transactions =
                transactions.filter(
                    transaction =>
                        transaction.id !== id
                );

            saveData();

            updateAll();

        }
    );


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const totals =
            getTotals();

        const balance =
            document.getElementById(
                "balanceValue"
            );

        const income =
            document.getElementById(
                "incomeValue"
            );

        const expense =
            document.getElementById(
                "expenseValue"
            );

        const economy =
            document.getElementById(
                "economyValue"
            );


        if (balance) {

            balance.textContent =
                money(totals.balance);

        }

        if (income) {

            income.textContent =
                money(totals.income);

        }

        if (expense) {

            expense.textContent =
                money(totals.expense);

        }


        let economyValue = 0;

        if (totals.income > 0) {

            economyValue =
                (
                    (
                        totals.income -
                        totals.expense
                    ) /
                    totals.income
                ) * 100;

        }

        if (economy) {

            economy.textContent =
                `${Math.max(
                    0,
                    economyValue
                ).toFixed(1)}%`;

        }


        const dateElement =
            document.getElementById(
                "currentDate"
            );

        if (dateElement) {

            dateElement.textContent =
                new Date().toLocaleDateString(
                    "pt-BR",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

        }

    }


    /* =====================================================
       GRÁFICO FINANCEIRO
    ===================================================== */

    function renderFinanceChart() {

        const canvas =
            document.getElementById(
                "financeChart"
            );

        if (!canvas ||
            typeof Chart === "undefined"
        ) return;

        const totals =
            getTotals();

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
                                label:
                                    "Valor",

                                data: [
                                    totals.income,
                                    totals.expense
                                ],

                                backgroundColor: [
                                    "#16805a",
                                    "#dc2626"
                                ],

                                borderRadius: 10

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
                                            money(value)

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

    function getCategoryTotals() {

        const result = {};

        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .forEach(
                transaction => {

                    const category =
                        transaction.category ||
                        "Outros";

                    result[category] =
                        (
                            result[category] || 0
                        ) +
                        Number(
                            transaction.amount
                        );

                }
            );

        return result;

    }


    function renderCategoryChart() {

        const canvas =
            document.getElementById(
                "categoryChart"
            );

        if (!canvas ||
            typeof Chart === "undefined"
        ) return;

        const totals =
            getCategoryTotals();

        const labels =
            Object.keys(totals);

        const values =
            Object.values(totals);


        if (categoryChart) {

            categoryChart.destroy();

        }


        if (!labels.length) {

            categoryChart = null;

            return;

        }


        categoryChart =
            new Chart(
                canvas,
                {
                    type: "doughnut",

                    data: {

                        labels,

                        datasets: [
                            {
                                data: values,

                                backgroundColor: [
                                    "#f97316",
                                    "#123c2d",
                                    "#16805a",
                                    "#f59e0b",
                                    "#dc2626",
                                    "#18533d",
                                    "#7c3aed",
                                    "#0891b2",
                                    "#65a30d",
                                    "#db2777",
                                    "#64748b"
                                ],

                                borderWidth: 0

                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: "65%",

                        plugins: {

                            legend: {
                                position: "bottom"
                            }

                        }

                    }

                }
            );

    }


    function renderCategoryList() {

        const container =
            document.getElementById(
                "categoryList"
            );

        if (!container) return;

        const totals =
            getCategoryTotals();

        const entries =
            Object.entries(totals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );

        if (!entries.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Ainda não há despesas por categoria.
                </div>
            `;

            return;

        }

        const total =
            entries.reduce(
                (sum, [, value]) =>
                    sum + value,
                0
            );


        container.innerHTML =
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

                                    <span class="category-dot"></span>

                                    <strong>
                                        ${escapeHTML(category)}
                                    </strong>

                                </div>

                                <span>
                                    ${money(value)}
                                    ·
                                    ${percentage.toFixed(1)}%
                                </span>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       RELATÓRIOS
    ===================================================== */

    function renderReportChart() {

        const canvas =
            document.getElementById(
                "reportCategoryChart"
            );

        if (!canvas ||
            typeof Chart === "undefined"
        ) return;

        const totals =
            getCategoryTotals();

        const labels =
            Object.keys(totals);

        const values =
            Object.values(totals);


        if (reportCategoryChart) {

            reportCategoryChart.destroy();

        }

        if (!labels.length) return;


        reportCategoryChart =
            new Chart(
                canvas,
                {
                    type: "doughnut",

                    data: {

                        labels,

                        datasets: [
                            {
                                data: values,

                                backgroundColor: [
                                    "#f97316",
                                    "#123c2d",
                                    "#16805a",
                                    "#f59e0b",
                                    "#dc2626",
                                    "#18533d",
                                    "#7c3aed",
                                    "#0891b2",
                                    "#65a30d",
                                    "#db2777"
                                ],

                                borderWidth: 0

                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: "62%",

                        plugins: {

                            legend: {
                                position: "bottom"
                            }

                        }

                    }

                }
            );

    }


    function renderReportAnalysis() {

        const container =
            document.getElementById(
                "reportAnalysis"
            );

        if (!container) return;

        const totals =
            getTotals();

        if (
            totals.income === 0 &&
            totals.expense === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    Cadastre seus lançamentos para gerar uma análise.
                </div>
            `;

            return;

        }


        const percentage =
            totals.income > 0
                ? (
                    totals.expense /
                    totals.income
                ) * 100
                : 0;


        let message = "";

        if (totals.balance > 0) {

            message =
                `Você está gastando ${percentage.toFixed(
                    1
                )}% da sua renda registrada. Seu saldo está positivo em ${money(
                    totals.balance
                )}.`;

        } else if (totals.balance === 0) {

            message =
                "Suas receitas e despesas estão equilibradas.";

        } else {

            message =
                `Suas despesas estão ${money(
                    Math.abs(totals.balance)
                )} acima das receitas registradas.`;

        }


        container.innerHTML = `
            <p>
                ${message}
            </p>
        `;

    }


    /* =====================================================
       SAÚDE FINANCEIRA
       🟢 🟡 🔴
    ===================================================== */

    function getFinancialHealth() {

        const totals =
            getTotals();

        if (
            totals.income === 0 &&
            totals.expense === 0
        ) {

            return {

                level: "yellow",

                title: "Comece a acompanhar",

                text:
                    "Cadastre suas receitas e despesas para avaliar sua saúde financeira."

            };

        }


        if (totals.income <= 0) {

            return {

                level: "red",

                title: "Atenção",

                text:
                    "Você ainda não possui receitas registradas."

            };

        }


        const ratio =
            totals.expense /
            totals.income;


        if (
            totals.balance < 0 ||
            ratio > 1
        ) {

            return {

                level: "red",

                title: "Saúde financeira em alerta",

                text:
                    "Suas despesas estão acima das suas receitas. É importante reduzir gastos e reorganizar seu orçamento."

            };

        }


        if (
            ratio >= 0.70
        ) {

            return {

                level: "yellow",

                title: "Atenção aos gastos",

                text:
                    "Uma parte significativa da sua renda já está comprometida. Fique atento aos próximos gastos."

            };

        }


        return {

            level: "green",

            title: "Saúde financeira excelente",

            text:
                "Suas receitas estão acima das despesas e você mantém uma boa margem financeira."

        };

    }


    function renderFinancialHealth() {

        const health =
            getFinancialHealth();


        /*
           Procura primeiro um bloco criado
           pelo novo HTML.
        */

        let container =
            document.getElementById(
                "financialHealth"
            );


        /*
           Caso o HTML antigo ainda tenha
           o bloco monthForecast, reutilizamos
           automaticamente.
        */

        if (!container) {

            container =
                document.getElementById(
                    "monthForecast"
                );

        }


        if (!container) return;


        container.innerHTML = `

            <div class="financial-health-box">

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:14px;
                        margin-bottom:14px;
                    "
                >

                    <span
                        style="
                            width:18px;
                            height:18px;
                            min-width:18px;
                            border-radius:50%;
                            display:inline-block;
                            background:${
                                health.level === "green"
                                    ? "#16a34a"
                                    : health.level === "yellow"
                                        ? "#f59e0b"
                                        : "#dc2626"
                            };
                            box-shadow:
                                0 0 0 6px ${
                                    health.level === "green"
                                        ? "rgba(22,163,74,.12)"
                                        : health.level === "yellow"
                                            ? "rgba(245,158,11,.12)"
                                            : "rgba(220,38,38,.12)"
                                };
                        "
                    ></span>

                    <strong
                        style="
                            font-size:18px;
                        "
                    >
                        ${health.title}
                    </strong>

                </div>

                <p
                    style="
                        color:var(--text-light);
                        line-height:1.6;
                        font-size:13px;
                    "
                >
                    ${health.text}
                </p>

                <div
                    style="
                        display:flex;
                        gap:22px;
                        margin-top:20px;
                        flex-wrap:wrap;
                    "
                >

                    <div>
                        <span
                            style="
                                display:block;
                                width:11px;
                                height:11px;
                                border-radius:50%;
                                background:#f59e0b;
                                margin-bottom:6px;
                            "
                        ></span>

                        <small>
                            Atenção
                        </small>
                    </div>

                    <div>
                        <span
                            style="
                                display:block;
                                width:11px;
                                height:11px;
                                border-radius:50%;
                                background:#dc2626;
                                margin-bottom:6px;
                            "
                        ></span>

                        <small>
                            Alerta
                        </small>
                    </div>

                    <div>
                        <span
                            style="
                                display:block;
                                width:11px;
                                height:11px;
                                border-radius:50%;
                                background:#16a34a;
                                margin-bottom:6px;
                            "
                        ></span>

                        <small>
                            Excelente
                        </small>
                    </div>

                </div>

            </div>

        `;

    }


    /* =====================================================
       PREMIUM
    ===================================================== */

    function renderPremium() {

        const totals =
            getTotals();


        const economy =
            document.getElementById(
                "premiumEconomyValue"
            );


        let economyValue = 0;

        if (totals.income > 0) {

            economyValue =
                (
                    (
                        totals.income -
                        totals.expense
                    ) /
                    totals.income
                ) * 100;

        }


        if (economy) {

            economy.textContent =
                `${Math.max(
                    0,
                    economyValue
                ).toFixed(1)}%`;

        }


        const performance =
            document.getElementById(
                "premiumPerformanceText"
            );


        if (performance) {

            if (!transactions.length) {

                performance.textContent =
                    "Cadastre seus lançamentos para acompanhar seu desempenho.";

            } else if (
                totals.balance > 0
            ) {

                performance.textContent =
                    `Você está com saldo positivo de ${money(
                        totals.balance
                    )}. Continue acompanhando seus gastos.`;

            } else {

                performance.textContent =
                    `Suas despesas estão consumindo uma grande parte da sua renda.`;

            }

        }


        renderGoals();

        renderBudgets();

        renderMonthComparison();

        renderSmartAlerts();

        renderPremiumAnalysis();

        renderFinancialHealth();

    }


    /* =====================================================
       PREMIUM — METAS
    ===================================================== */

    const newGoalBtn =
        document.getElementById(
            "newGoalBtn"
        );

    const closeGoalModal =
        document.getElementById(
            "closeGoalModal"
        );


    newGoalBtn?.addEventListener(
        "click",
        () => {

            goalModal.classList.remove(
                "hidden"
            );

        }
    );


    closeGoalModal?.addEventListener(
        "click",
        () => {

            goalModal.classList.add(
                "hidden"
            );

        }
    );


    goalModal
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () => {

                goalModal.classList.add(
                    "hidden"
                );

            }
        );


    goalForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "goalName"
                ).value.trim();

            const target =
                Number(
                    document.getElementById(
                        "goalTarget"
                    ).value
                );

            const saved =
                Number(
                    document.getElementById(
                        "goalSaved"
                    ).value
                ) || 0;


            if (
                !name ||
                target <= 0
            ) {

                alert(
                    "Preencha corretamente a meta."
                );

                return;

            }


            goals.push({

                id:
                    Date.now(),

                name,

                target,

                saved

            });


            saveData();

            goalForm.reset();

            goalModal.classList.add(
                "hidden"
            );

            renderPremium();

        }
    );


    function renderGoals() {

        const container =
            document.getElementById(
                "goalsList"
            );

        if (!container) return;


        if (!goals.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Você ainda não criou nenhuma meta.
                </div>
            `;

            return;

        }


        container.innerHTML =
            goals
                .map(goal => {

                    const percent =
                        Math.min(
                            100,
                            (
                                goal.saved /
                                goal.target
                            ) * 100
                        );


                    return `

                        <div
                            style="
                                padding:16px 0;
                                border-bottom:1px solid var(--border);
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    gap:10px;
                                "
                            >

                                <strong>
                                    ${escapeHTML(
                                        goal.name
                                    )}
                                </strong>

                                <span>
                                    ${money(
                                        goal.saved
                                    )}
                                    /
                                    ${money(
                                        goal.target
                                    )}
                                </span>

                            </div>

                            <div
                                style="
                                    height:9px;
                                    background:var(--green-light);
                                    border-radius:20px;
                                    overflow:hidden;
                                    margin-top:12px;
                                "
                            >

                                <div
                                    style="
                                        width:${percent}%;
                                        height:100%;
                                        background:linear-gradient(
                                            90deg,
                                            var(--green),
                                            var(--orange)
                                        );
                                        border-radius:20px;
                                    "
                                ></div>

                            </div>

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    margin-top:8px;
                                    font-size:11px;
                                    color:var(--text-light);
                                "
                            >

                                <span>
                                    ${percent.toFixed(0)}% concluído
                                </span>

                                <button
                                    type="button"
                                    onclick="deleteGoal(${goal.id})"
                                    style="
                                        border:0;
                                        background:none;
                                        color:var(--danger);
                                        cursor:pointer;
                                    "
                                >
                                    Excluir
                                </button>

                            </div>

                        </div>

                    `;

                })
                .join("");

    }


    window.deleteGoal =
        function(id) {

            goals =
                goals.filter(
                    goal =>
                        goal.id !== id
                );

            saveData();

            renderPremium();

        };


    /* =====================================================
       PREMIUM — ORÇAMENTOS
    ===================================================== */

    const newBudgetBtn =
        document.getElementById(
            "newBudgetBtn"
        );

    const closeBudgetModal =
        document.getElementById(
            "closeBudgetModal"
        );


    newBudgetBtn?.addEventListener(
        "click",
        () => {

            budgetModal.classList.remove(
                "hidden"
            );

        }
    );


    closeBudgetModal?.addEventListener(
        "click",
        () => {

            budgetModal.classList.add(
                "hidden"
            );

        }
    );


    budgetModal
        ?.querySelector(".modal-overlay")
        ?.addEventListener(
            "click",
            () => {

                budgetModal.classList.add(
                    "hidden"
                );

            }
        );


    budgetForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const category =
                document.getElementById(
                    "budgetCategory"
                ).value;

            const limit =
                Number(
                    document.getElementById(
                        "budgetLimit"
                    ).value
                );


            if (limit <= 0) {

                alert(
                    "Informe um limite válido."
                );

                return;

            }


            const existing =
                budgets.find(
                    budget =>
                        budget.category === category
                );


            if (existing) {

                existing.limit =
                    limit;

            } else {

                budgets.push({

                    id:
                        Date.now(),

                    category,

                    limit

                });

            }


            saveData();

            budgetForm.reset();

            budgetModal.classList.add(
                "hidden"
            );

            renderPremium();

        }
    );


    function renderBudgets() {

        const container =
            document.getElementById(
                "budgetsList"
            );

        if (!container) return;


        if (!budgets.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Nenhum orçamento definido.
                </div>
            `;

            return;

        }


        container.innerHTML =
            budgets
                .map(budget => {

                    const spent =
                        transactions
                            .filter(
                                transaction =>
                                    transaction.type === "expense" &&
                                    transaction.category === budget.category
                            )
                            .reduce(
                                (sum, transaction) =>
                                    sum +
                                    Number(
                                        transaction.amount
                                    ),
                                0
                            );


                    const percent =
                        Math.min(
                            100,
                            (
                                spent /
                                budget.limit
                            ) * 100
                        );


                    const danger =
                        spent >
                        budget.limit;


                    return `

                        <div
                            style="
                                padding:15px 0;
                                border-bottom:1px solid var(--border);
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                "
                            >

                                <strong>
                                    ${escapeHTML(
                                        budget.category
                                    )}
                                </strong>

                                <span>
                                    ${money(spent)}
                                    /
                                    ${money(budget.limit)}
                                </span>

                            </div>

                            <div
                                style="
                                    height:9px;
                                    background:var(--green-light);
                                    border-radius:20px;
                                    overflow:hidden;
                                    margin-top:10px;
                                "
                            >

                                <div
                                    style="
                                        width:${percent}%;
                                        height:100%;
                                        background:${
                                            danger
                                                ? "#dc2626"
                                                : "var(--orange)"
                                        };
                                        border-radius:20px;
                                    "
                                ></div>

                            </div>

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    margin-top:8px;
                                    font-size:11px;
                                "
                            >

                                <span
                                    style="
                                        color:${
                                            danger
                                                ? "var(--danger)"
                                                : "var(--text-light)"
                                        };
                                    "
                                >
                                    ${
                                        danger
                                            ? "Limite ultrapassado"
                                            : `${(
                                                100 -
                                                (
                                                    spent /
                                                    budget.limit
                                                ) * 100
                                            ).toFixed(0)}% disponível`
                                    }
                                </span>

                                <button
                                    type="button"
                                    onclick="deleteBudget(${budget.id})"
                                    style="
                                        border:0;
                                        background:none;
                                        color:var(--danger);
                                        cursor:pointer;
                                    "
                                >
                                    Excluir
                                </button>

                            </div>

                        </div>

                    `;

                })
                .join("");

    }


    window.deleteBudget =
        function(id) {

            budgets =
                budgets.filter(
                    budget =>
                        budget.id !== id
                );

            saveData();

            renderPremium();

        };


    /* =====================================================
       SIMULADOR
    ===================================================== */

    const simulateBtn =
        document.getElementById(
            "simulateBtn"
        );

    simulateBtn?.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    document.getElementById(
                        "simulationAmount"
                    ).value
                );


            const result =
                document.getElementById(
                    "simulationResult"
                );


            if (!amount || amount <= 0) {

                result.textContent =
                    "Digite um valor para simular.";

                return;

            }


            const totals =
                getTotals();

            const newBalance =
                totals.balance -
                amount;


            if (newBalance >= 0) {

                result.innerHTML = `
                    <span style="color:var(--success)">
                        ✓ Após essa despesa, seu saldo seria
                        ${money(newBalance)}.
                    </span>
                `;

            } else {

                result.innerHTML = `
                    <span style="color:var(--danger)">
                        ⚠ Essa despesa deixaria seu saldo negativo em
                        ${money(Math.abs(newBalance))}.
                    </span>
                `;

            }

        }
    );


    /* =====================================================
       COMPARAÇÃO MENSAL
    ===================================================== */

    function renderMonthComparison() {

        const container =
            document.getElementById(
                "monthlyComparison"
            );

        if (!container) return;


        if (!transactions.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Cadastre lançamentos para visualizar sua evolução.
                </div>
            `;

            return;

        }


        const current =
            getTotals();


        container.innerHTML = `

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(3,1fr);
                    gap:12px;
                "
            >

                <div
                    style="
                        background:var(--surface-2);
                        border:1px solid var(--border);
                        border-radius:14px;
                        padding:16px;
                    "
                >

                    <small>
                        RECEITAS
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:19px;
                            color:var(--success);
                        "
                    >
                        ${money(current.income)}
                    </strong>

                </div>

                <div
                    style="
                        background:var(--surface-2);
                        border:1px solid var(--border);
                        border-radius:14px;
                        padding:16px;
                    "
                >

                    <small>
                        DESPESAS
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:19px;
                            color:var(--danger);
                        "
                    >
                        ${money(current.expense)}
                    </strong>

                </div>

                <div
                    style="
                        background:var(--surface-2);
                        border:1px solid var(--border);
                        border-radius:14px;
                        padding:16px;
                    "
                >

                    <small>
                        SALDO
                    </small>

                    <strong
                        style="
                            display:block;
                            margin-top:7px;
                            font-size:19px;
                            color:${
                                current.balance >= 0
                                    ? "var(--green)"
                                    : "var(--danger)"
                            };
                        "
                    >
                        ${money(current.balance)}
                    </strong>

                </div>

            </div>

        `;

    }


    /* =====================================================
       ALERTAS INTELIGENTES
    ===================================================== */

    function renderSmartAlerts() {

        const container =
            document.getElementById(
                "smartAlerts"
            );

        if (!container) return;


        const totals =
            getTotals();

        const alerts = [];


        if (
            totals.expense >
            totals.income &&
            totals.expense > 0
        ) {

            alerts.push(
                "🔴 Suas despesas estão acima das suas receitas."
            );

        }


        if (
            totals.income > 0 &&
            totals.expense /
            totals.income >= .70
        ) {

            alerts.push(
                "🟡 Mais de 70% da sua renda já está comprometida."
            );

        }


        budgets.forEach(budget => {

            const spent =
                transactions
                    .filter(
                        transaction =>
                            transaction.type === "expense" &&
                            transaction.category === budget.category
                    )
                    .reduce(
                        (sum, transaction) =>
                            sum +
                            Number(
                                transaction.amount
                            ),
                        0
                    );


            if (
                spent >
                budget.limit
            ) {

                alerts.push(
                    `🔴 O orçamento de ${budget.category} foi ultrapassado.`
                );

            }

        });


        if (!alerts.length) {

            container.innerHTML = `
                <div class="empty-state">
                    🟢 Nenhum alerta importante no momento.
                </div>
            `;

            return;

        }


        container.innerHTML =
            alerts
                .map(
                    alert => `
                        <div
                            style="
                                padding:13px 0;
                                border-bottom:1px solid var(--border);
                                font-size:13px;
                                line-height:1.5;
                            "
                        >
                            ${alert}
                        </div>
                    `
                )
                .join("");

    }


    /* =====================================================
       ANÁLISE PREMIUM
    ===================================================== */

    function renderPremiumAnalysis() {

        const container =
            document.getElementById(
                "premiumAnalysis"
            );

        if (!container) return;


        const totals =
            getTotals();

        const health =
            getFinancialHealth();


        container.innerHTML = `

            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    margin-bottom:10px;
                "
            >

                <span
                    style="
                        width:13px;
                        height:13px;
                        border-radius:50%;
                        display:inline-block;
                        background:${
                            health.level === "green"
                                ? "#16a34a"
                                : health.level === "yellow"
                                    ? "#f59e0b"
                                    : "#dc2626"
                        };
                    "
                ></span>

                <strong>
                    ${health.title}
                </strong>

            </div>

            <p>
                ${health.text}
            </p>

            <p style="margin-top:10px;">
                Receitas registradas:
                <strong>
                    ${money(totals.income)}
                </strong>
            </p>

            <p>
                Despesas registradas:
                <strong>
                    ${money(totals.expense)}
                </strong>
            </p>

            <p>
                Saldo atual:
                <strong>
                    ${money(totals.balance)}
                </strong>
            </p>

        `;

    }


    /* =====================================================
       PREMIUM — ASSINATURA
    ===================================================== */

    const subscribePremiumBtn =
        document.getElementById(
            "subscribePremiumBtn"
        );


    function updatePremiumButton() {

        if (!subscribePremiumBtn) return;


        if (isPremium) {

            subscribePremiumBtn.textContent =
                "⭐ Você já é Premium";

            subscribePremiumBtn.disabled =
                true;

            subscribePremiumBtn.style.opacity =
                "0.7";

        } else {

            subscribePremiumBtn.textContent =
                "Quero ser Premium ⭐";

            subscribePremiumBtn.disabled =
                false;

            subscribePremiumBtn.style.opacity =
                "1";

        }

    }


    subscribePremiumBtn?.addEventListener(
        "click",
        () => {

            /*
               Aqui deixamos a ativação local
               para teste.

               Quando integrar Google Play Billing,
               este botão será ligado à compra real.
            */

            const confirmPremium =
                confirm(
                    "Ativar o Premium para teste?"
                );

            if (!confirmPremium) return;


            isPremium = true;

            localStorage.setItem(
                "controles_premium",
                "true"
            );

            updateUser();

            updatePremiumButton();

            alert(
                "⭐ Premium ativado com sucesso!"
            );

        }
    );


    /* =====================================================
       EXPORTAR DADOS
    ===================================================== */

    const exportDataBtn =
        document.getElementById(
            "exportDataBtn"
        );


    exportDataBtn?.addEventListener(
        "click",
        () => {

            const data = {

                user,

                transactions,

                goals,

                budgets,

                premium: isPremium

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
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "controles-backup.json";

            link.click();

            URL.revokeObjectURL(
                url
            );

        }

/* =====================================================
   CONTROLE FINANCEIRO
   PALETA: LARANJA + VERDE ESCURO
   ===================================================== */

:root {
  --green-dark: #12372a;
  --green: #1f513d;
  --green-light: #2f6b50;

  --orange: #f28c28;
  --orange-dark: #d96f12;
  --orange-light: #fff1df;

  --white: #ffffff;
  --background: #f5f7f5;
  --surface: #ffffff;
  --border: #e3e8e4;

  --text: #17231d;
  --text-light: #6c776f;
  --muted: #8b958e;

  --red: #d94b4b;
  --red-light: #fff0f0;

  --shadow: 0 8px 25px rgba(18, 55, 42, 0.08);

  --radius: 14px;
}


/* =====================================================
   RESET
   ===================================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background: var(--background);
  color: var(--text);
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.hidden {
  display: none !important;
}


/* =====================================================
   LOGIN / CADASTRO
   ===================================================== */

.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background:
    radial-gradient(
      circle at top right,
      rgba(242, 140, 40, 0.14),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      #f5f7f5,
      #eaf0eb
    );
}

.auth-card {
  width: 100%;
  max-width: 440px;

  background: var(--white);

  padding: 38px;

  border-radius: 22px;

  box-shadow:
    0 25px 70px rgba(18, 55, 42, 0.13);

  border: 1px solid var(--border);
}

.brand {
  text-align: center;
  margin-bottom: 30px;
}

.brand-icon {
  width: 62px;
  height: 62px;

  margin: 0 auto 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--orange);
  color: var(--white);

  border-radius: 18px;

  font-size: 29px;
  font-weight: 800;

  box-shadow:
    0 8px 20px rgba(242, 140, 40, 0.25);
}

.brand-icon.small {
  width: 42px;
  height: 42px;

  margin: 0;

  border-radius: 12px;

  font-size: 20px;
}

.brand h1 {
  color: var(--green-dark);
  font-size: 26px;
  margin-bottom: 7px;
}

.brand p {
  color: var(--text-light);
  font-size: 14px;
}

.auth-card h2 {
  color: var(--green-dark);
  font-size: 24px;
  margin-bottom: 5px;
}

.form-description {
  color: var(--text-light);
  margin-bottom: 22px;
  font-size: 14px;
}


/* =====================================================
   FORMULÁRIOS
   ===================================================== */

label {
  display: block;

  margin: 15px 0 7px;

  color: var(--green-dark);

  font-size: 13px;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;

  border: 1px solid var(--border);

  background: #fbfcfb;

  color: var(--text);

  border-radius: 10px;

  padding: 12px 14px;

  outline: none;

  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--orange);

  background: var(--white);

  box-shadow:
    0 0 0 3px rgba(242, 140, 40, 0.12);
}

textarea {
  resize: vertical;
}

.primary-button {
  width: 100%;

  border: none;

  background: var(--orange);

  color: var(--white);

  padding: 13px 18px;

  margin-top: 20px;

  border-radius: 10px;

  font-weight: 800;

  transition:
    transform 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.primary-button:hover {
  background: var(--orange-dark);

  transform: translateY(-1px);

  box-shadow:
    0 7px 18px rgba(242, 140, 40, 0.22);
}

.small-button {
  width: auto;
  margin: 0;
  padding: 11px 18px;
}

.secondary-button {
  border: 1px solid var(--border);

  background: var(--white);

  color: var(--green-dark);

  padding: 11px 18px;

  border-radius: 10px;

  font-weight: 700;
}

.secondary-button:hover {
  background: #f1f4f1;
}

.danger-button {
  border: none;

  background: var(--red);

  color: var(--white);

  padding: 11px 18px;

  border-radius: 10px;

  font-weight: 700;
}

.message {
  min-height: 20px;

  margin-top: 12px;

  color: var(--red);

  font-size: 13px;
}

.switch-auth {
  text-align: center;

  color: var(--text-light);

  font-size: 14px;

  margin-top: 22px;
}

.switch-auth button {
  border: none;

  background: transparent;

  color: var(--orange-dark);

  font-weight: 800;

  margin-left: 4px;
}


/* =====================================================
   APP
   ===================================================== */

.app-screen {
  min-height: 100vh;

  display: flex;
}


/* =====================================================
   SIDEBAR
   ===================================================== */

.sidebar {
  width: 250px;

  position: fixed;

  top: 0;
  left: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;

  background: var(--green-dark);

  color: var(--white);

  padding: 25px 16px;

  z-index: 50;
}

.sidebar-brand {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 5px 10px 30px;
}

.sidebar-brand strong {
  display: block;

  font-size: 16px;
}

.sidebar-brand span {
  display: block;

  font-size: 12px;

  opacity: 0.65;
}

.menu {
  display: flex;

  flex-direction: column;

  gap: 7px;
}

.menu-item {
  width: 100%;

  border: none;

  background: transparent;

  color: rgba(255, 255, 255, 0.72);

  padding: 13px 15px;

  border-radius: 10px;

  text-align: left;

  display: flex;

  align-items: center;

  gap: 12px;

  font-weight: 600;

  transition:
    background 0.2s,
    color 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);

  color: var(--white);
}

.menu-item.active {
  background: var(--orange);

  color: var(--white);
}

.menu-item span {
  width: 22px;

  text-align: center;
}

.sidebar-bottom {
  margin-top: auto;
}

.logout-button {
  width: 100%;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: transparent;

  color: rgba(255, 255, 255, 0.75);

  padding: 12px;

  border-radius: 10px;

  display: flex;

  gap: 10px;

  align-items: center;

  font-weight: 600;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.08);

  color: white;
}


/* =====================================================
   CONTEÚDO PRINCIPAL
   ===================================================== */

.main-content {
  width: calc(100% - 250px);

  margin-left: 250px;

  padding: 30px;

  min-height: 100vh;
}


/* =====================================================
   TOPBAR
   ===================================================== */

.topbar {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 35px;
}

.welcome-small {
  color: var(--text-light);

  font-size: 13px;

  margin-bottom: 2px;
}

.topbar h2 {
  color: var(--green-dark);

  font-size: 22px;
}

.topbar-actions {
  display: flex;

  gap: 9px;
}

.quick-income,
.quick-expense {
  border-radius: 9px;

  padding: 10px 14px;

  font-weight: 700;

  border: 1px solid var(--border);

  background: var(--white);
}

.quick-income {
  color: var(--green);

  border-color: rgba(31, 81, 61, 0.2);
}

.quick-expense {
  color: var(--red);

  border-color: rgba(217, 75, 75, 0.2);
}

.mobile-menu-button {
  display: none;

  border: none;

  background: transparent;

  color: var(--green-dark);

  font-size: 24px;
}


/* =====================================================
   TÍTULOS
   ===================================================== */

.page-heading {
  display: flex;

  justify-content: space-between;

  align-items: flex-end;

  gap: 20px;

  margin-bottom: 25px;
}

.section-label {
  color: var(--orange-dark);

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 1.2px;

  margin-bottom: 5px;
}

.page-heading h1 {
  color: var(--green-dark);

  font-size: 29px;

  margin-bottom: 5px;
}

.page-heading p:not(.section-label) {
  color: var(--text-light);

  font-size: 14px;
}

.period-selector {
  width: 170px;
}

.period-selector label {
  margin-top: 0;
}


/* =====================================================
   SEÇÕES
   ===================================================== */

.content-section {
  display: none;
}

.content-section.active-section {
  display: block;
}


/* =====================================================
   CARDS
   ===================================================== */

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;

  margin-bottom: 20px;
}

.summary-card {
  background: var(--surface);

  border: 1px solid var(--border);

  border-radius: var(--radius);

  padding: 20px;

  display: flex;

  align-items: center;

  gap: 15px;

  box-shadow: var(--shadow);
}

.card-icon {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  border-radius: 12px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: var(--orange-light);

  color: var(--orange-dark);

  font-size: 20px;

  font-weight: 900;
}

.income-card .card-icon {
  background: #e7f3eb;

  color: var(--green);
}

.expense-card .card-icon {
  background: var(--red-light);

  color: var(--red);
}

.transaction-card .card-icon {
  background: #edf0ef;

  color: var(--green-dark);
}

.summary-card span {
  display: block;

  color: var(--text-light);

  font-size: 12px;

  margin-bottom: 5px;
}

.summary-card strong {
  display: block;

  color: var(--green-dark);

  font-size: 19px;
}


/* =====================================================
   PAINÉIS
   ===================================================== */

.dashboard-grid {
  display: grid;

  grid-template-columns:
    1.4fr 1fr;

  gap: 20px;

  margin-bottom: 20px;
}

.panel {
  background: var(--white);

  border: 1px solid var(--border);

  border-radius: var(--radius);

  box-shadow: var(--shadow);

  padding: 22px;

  margin-bottom: 20px;
}

.panel-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 20px;
}

.panel h3 {
  color: var(--green-dark);

  font-size: 17px;

  margin-bottom: 3px;
}

.panel-header p {
  color: var(--text-light);

  font-size: 12px;
}

.chart-container {
  height: 280px;

  position: relative;
}

.chart-container.large {
  height: 360px;
}

.text-button {
  border: none;

  background: transparent;

  color: var(--orange-dark);

  font-weight: 800;

  font-size: 13px;
}


/* =====================================================
   CATEGORIAS
   ===================================================== */

.category-list {
  display: flex;

  flex-direction: column;

  gap: 13px;
}

.category-item {
  display: flex;

  align-items: center;

  justify-content: space-between;
}

.category-name {
  display: flex;

  align-items: center;

  gap: 9px;

  font-size: 13px;

  font-weight: 600;
}

.category-dot {
  width: 9px;
  height: 9px;

  border-radius: 50%;

  background: var(--orange);
}

.category-value {
  font-size: 13px;

  font-weight: 800;

  color: var(--green-dark);
}


/* =====================================================
   TRANSAÇÕES
   ===================================================== */

.transactions-list {
  display: flex;

  flex-direction: column;
}

.transaction-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 14px 0;

  border-bottom: 1px solid var(--border);
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;

  align-items: center;

  gap: 12px;
}

.transaction-icon {
  width: 38px;
  height: 38px;

  border-radius: 10px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: 900;
}

.transaction-icon.income {
  background: #e7f3eb;

  color: var(--green);
}

.transaction-icon.expense {
  background: var(--red-light);

  color: var(--red);
}

.transaction-description {
  font-weight: 700;

  color: var(--green-dark);

  font-size: 13px;
}

.transaction-date {
  color: var(--text-light);

  font-size: 11px;

  margin-top: 3px;
}

.transaction-value {
  font-weight: 900;

  font-size: 14px;

  white-space: nowrap;
}

.transaction-value.income {
  color: var(--green);
}

.transaction-value.expense {
  color: var(--red);
}


/* =====================================================
   FILTROS
   ===================================================== */

.filters-panel {
  display: grid;

  grid-template-columns:
    2fr repeat(3, 1fr);

  gap: 12px;

  background: var(--white);

  border: 1px solid var(--border);

  padding: 16px;

  border-radius: var(--radius);

  margin-bottom: 20px;
}

.filter-field label {
  margin-top: 0;
}


/* =====================================================
   TABELA
   ===================================================== */

.table-panel {
  padding: 0;

  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;

  min-width: 850px;
}

th {
  background: #f7f9f7;

  color: var(--text-light);

  text-align: left;

  padding: 14px 18px;

  font-size: 11px;

  text-transform: uppercase;

  letter-spacing: 0.5px;
}

td {
  padding: 15px 18px;

  border-top: 1px solid var(--border);

  font-size: 13px;

  color: var(--text);
}

.type-badge,
.area-badge,
.account-badge {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 7px;

  font-size: 10px;

  font-weight: 800;
}

.type-badge.income {
  color: var(--green);

  background: #e7f3eb;
}

.type-badge.expense {
  color: var(--red);

  background: var(--red-light);
}

.area-badge {
  color: var(--green-dark);

  background: #edf2ee;
}

.table-actions {
  display: flex;

  gap: 6px;
}

.action-button {
  border: 1px solid var(--border);

  background: white;

  border-radius: 7px;

  padding: 6px 8px;

  font-size: 12px;
}

.action-button:hover {
  background: #f2f5f2;
}

.action-button.delete {
  color: var(--red);
}


/* =====================================================
   ESTADO VAZIO
   ===================================================== */

.empty-state {
  padding: 30px 15px;

  text-align: center;

  color: var(--muted);

  font-size: 13px;
}


/* =====================================================
   RELATÓRIOS
   ===================================================== */

.reports-grid {
  display: grid;

  grid-template-columns:
    1.5fr 1fr;

  gap: 20px;
}

.report-summary {
  display: grid;

  gap: 15px;

  margin-top: 20px;
}

.report-summary div {
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding-bottom: 12px;

  border-bottom: 1px solid var(--border);
}

.report-summary span {
  color: var(--text-light);

  font-size: 13px;
}

.report-summary strong {
  color: var(--green-dark);

  font-size: 16px;
}

.top-category {
  margin-top: 25px;

  background: var(--orange-light);

  color: var(--orange-dark);

  border-radius: 12px;

  padding: 25px;

  font-size: 18px;

  font-weight: 900;

  text-align: center;
}


/* =====================================================
   PERFIL
   ===================================================== */

.profile-panel {
  display: flex;

  align-items: center;

  gap: 20px;
}

.profile-avatar {
  width: 75px;
  height: 75px;

  border-radius: 20px;

  background: var(--orange-light);

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 32px;
}

.profile-info h2 {
  color: var(--green-dark);

  margin-bottom: 4px;
}

.profile-info p {
  color: var(--text-light);

  margin-bottom: 10px;
}

.account-badge {
  background: var(--orange-light);

  color: var(--orange-dark);
}


/* =====================================================
   MODAIS
   ===================================================== */

.modal {
  position: fixed;

  inset: 0;

  z-index: 100;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;
}

.modal-overlay {
  position: absolute;

  inset: 0;

  background: rgba(10, 25, 18, 0.55);

  backdrop-filter: blur(3px);
}

.modal-card {
  position: relative;

  width: 100%;

  max-width: 620px;

  max-height: 90vh;

  overflow-y: auto;

  background: var(--white);

  border-radius: 18px;

  padding: 25px;

  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.2);

  z-index: 1;
}

.modal-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  margin-bottom: 20px;
}

.modal-header h2 {
  color: var(--green-dark);
}

.close-button {
  width: 35px;
  height: 35px;

  border: none;

  background: #f1f4f1;

  color: var(--green-dark);

  border-radius: 9px;

  font-size: 22px;
}

.close-button:hover {
  background: var(--orange-light);

  color: var(--orange-dark);
}

.type-selector {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 8px;

  margin-bottom: 18px;
}

.type-option {
  padding: 11px;

  border-radius: 9px;

  border: 1px solid var(--border);

  background: white;

  font-weight: 800;

  color: var(--text-light);
}

.type-option.active {
  background: var(--green-dark);

  color: white;

  border-color: var(--green-dark);
}

.form-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 5px 15px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.modal-actions {
  display: flex;

  justify-content: flex-end;

  gap: 10px;

  margin-top: 20px;
}

.modal-actions .primary-button {
  width: auto;

  margin: 0;
}

.confirmation-card {
  max-width: 420px;

  text-align: center;
}

.confirmation-icon {
  font-size: 40px;

  margin-bottom: 10px;
}

.confirmation-card h2 {
  color: var(--green-dark);

  margin-bottom: 7px;
}

.confirmation-card p {
  color: var(--text-light);
}


/* =====================================================
   RESPONSIVIDADE
   ===================================================== */

@media (max-width: 1100px) {

  .summary-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


@media (max-width: 800px) {

  .sidebar {
    transform: translateX(-100%);

    transition: transform 0.25s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    width: 100%;

    margin-left: 0;

    padding: 20px 15px;
  }

  .mobile-menu-button {
    display: inline-block;
  }

  .topbar {
    align-items: flex-start;
  }

  .topbar-actions {
    display: none;
  }

  .page-heading {
    align-items: flex-start;

    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 600px) {

  .auth-screen {
    padding: 15px;
  }

  .auth-card {
    padding: 25px 20px;

    border-radius: 18px;
  }

  .page-heading h1 {
    font-size: 24px;
  }

  .summary-card {
    padding: 16px;
  }

  .panel {
    padding: 17px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }

  .modal {
    padding: 10px;
  }

  .modal-card {
    padding: 20px;

    border-radius: 15px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }

  .profile-panel {
    flex-direction: column;

    align-items: flex-start;
  }

}


/* =====================================================
   SCROLLBAR
   ===================================================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #edf1ed;
}

::-webkit-scrollbar-thumb {
  background: #bdc8bf;

  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--green);
}

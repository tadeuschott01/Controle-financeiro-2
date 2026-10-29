/* =========================================================
   CONTROLES — JS DO SITE (site.js)
   Feito para o index.html do site público + login + painel
   ========================================================= */
const SUPABASE_URL = "https://sbiqhbxtrjrzpawdqqmy.supabase.co";
const SUPABASE_KEY = "sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8";

let sb = null;
let user = null;
let transactions = [];
let authMode = "login"; // "login" ou "register"

const $ = id => document.getElementById(id);
const money = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = d => { const p = String(d || "").split("T")[0].split("-"); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : ""; };
const today = () => new Date().toISOString().slice(0, 10);
const isIncome = t => ["receita", "income", "entrada"].includes(String(t.type || "").toLowerCase());

const PAGES = {
  inicio: "Início", lancamentos: "Lançamentos", receber: "A receber",
  metas: "Metas e cofrinho", relatorios: "Relatórios", assessor: "Assessor IA",
  vendas: "Vendas e estoque", missoes: "Missões", futuro: "Mapa do futuro",
  planos: "Planos", suporte: "Suporte"
};

/* ---------- STATUS / VIEWS ---------- */
function setStatus(text, type) {
  const el = $("publicStatus");
  if (!el) return;
  el.textContent = text || "";
  el.hidden = !text;
}
function showView(name) {
  $("publicView").classList.toggle("hidden", name !== "public");
  $("authView").classList.toggle("hidden", name !== "auth");
  $("appView").classList.toggle("hidden", name !== "app");
  window.scrollTo(0, 0);
}
function setAuthMode(mode) {
  authMode = mode;
  const reg = mode === "register";
  $("authTitle").textContent = reg ? "Criar sua conta" : "Entrar no ControleS";
  $("authSubmit").textContent = reg ? "Criar conta" : "Entrar";
  $("switchAuth").textContent = reg ? "Já tenho uma conta" : "Criar uma conta";
  $("nameField").classList.toggle("hidden", !reg);
  $("authPassword").autocomplete = reg ? "new-password" : "current-password";
  setAuthMessage("");
}
function setAuthMessage(text, type) {
  const el = $("authMessage");
  el.textContent = text || "";
  el.className = "message" + (type ? " " + type : "");
}
function openAuth(mode) { setAuthMode(mode); showView("auth"); }

/* ---------- TEMA ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("controles-site-theme", theme);
  const btn = $("themeToggle");
  if (btn) btn.innerHTML = theme === "dark" ? "☀ &nbsp; Tema claro" : "☾ &nbsp; Tema escuro";
}
function toggleTheme() {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
}

/* ---------- AUTENTICAÇÃO ---------- */
async function handleAuth(event) {
  event.preventDefault();
  if (!sb) return setAuthMessage("Sistema indisponível. Recarregue a página.", "error");

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  const name = $("authName").value.trim();
  const button = $("authSubmit");
  button.disabled = true;
  setAuthMessage("Aguarde…");

  try {
    if (authMode === "register") {
      if (!name) throw new Error("Informe seu nome.");
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
      if (error) throw error;
      if (data.session) {
        user = data.session.user;
        await enterApp();
      } else {
        setAuthMessage("Conta criada! Confirme seu e-mail para entrar.", "ok");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      user = data.user;
      await enterApp();
    }
  } catch (err) {
    setAuthMessage(err.message || "Não foi possível continuar.", "error");
  } finally {
    button.disabled = false;
  }
}

async function logout() {
  try { if (sb) await sb.auth.signOut(); } catch (e) { console.error(e); }
  user = null;
  transactions = [];
  showView("public");
}

/* ---------- ENTRAR NO APP ---------- */
async function enterApp() {
  showView("app");
  $("userEmail").textContent = user?.email || "";
  $("planBadge").textContent = "Sem assinatura verificada";
  await loadTransactions();
  goToPage("inicio");
}

async function loadTransactions() {
  if (!sb || !user) return;
  const { data, error } = await sb.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false });
  if (error) {
    console.error(error);
    $("statusMessage").textContent = "Não foi possível carregar seus lançamentos.";
    transactions = [];
    return;
  }
  $("statusMessage").textContent = "";
  transactions = data || [];
}

/* ---------- NAVEGAÇÃO DO PAINEL ---------- */
function goToPage(page) {
  document.querySelectorAll("#sideNav button").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  $("pageTitle").textContent = PAGES[page] || "Início";
  $("sidebarEl")?.classList.remove("open");
  document.querySelector(".sidebar")?.classList.remove("open");

  const render = { inicio: pageInicio, lancamentos: pageLancamentos, receber: pageReceber, relatorios: pageRelatorios }[page];
  $("pageContent").innerHTML = render ? render() : pagePreparacao(PAGES[page] || page);
  if (page === "lancamentos") bindTransactionForm();
}

function totals() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    const a = Math.abs(Number(t.amount) || 0);
    if (isIncome(t)) { if (String(t.date || "") <= today()) income += a; }
    else expense += a;
  });
  return { income, expense, balance: income - expense };
}

function rowHTML(t) {
  const inc = isIncome(t);
  return `<div class="row"><div><strong>${esc(t.description || "Lançamento")}</strong>
    <small>${esc(t.category || "Outros")} • ${fmtDate(t.date)}</small></div>
    <span class="${inc ? "pos" : "neg"}">${inc ? "+" : "-"} ${money(Math.abs(t.amount))}</span></div>`;
}

function pageInicio() {
  const t = totals();
  const recent = transactions.slice(0, 6).map(rowHTML).join("") || `<div class="empty">Nenhum lançamento ainda.</div>`;
  return `
    <div class="cards">
      <div class="card"><small>Saldo</small><strong>${money(t.balance)}</strong></div>
      <div class="card green"><small>Receitas</small><strong>${money(t.income)}</strong></div>
      <div class="card red"><small>Despesas</small><strong>${money(t.expense)}</strong></div>
    </div>
    <div class="panel"><h2>Últimos lançamentos</h2>${recent}</div>`;
}

function pageLancamentos() {
  const list = transactions.map(rowHTML).join("") || `<div class="empty">Nenhum lançamento ainda.</div>`;
  return `
    <div class="panel"><h2>Novo lançamento</h2>
      <form id="txForm" class="form-grid">
        <label>Tipo<select id="txType"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label>
        <label>Valor (R$)<input id="txAmount" type="number" step="0.01" min="0.01" required></label>
        <label>Descrição<input id="txDesc" required></label>
        <label>Categoria<input id="txCat" value="Outros"></label>
        <label>Data<input id="txDate" type="date" value="${today()}" required></label>
        <button class="btn primary" type="submit">Salvar lançamento</button>
      </form></div>
    <div class="panel"><h2>Todos os lançamentos</h2>${list}</div>`;
}

function pageReceber() {
  const list = transactions.filter(t => isIncome(t) && String(t.date || "") > today());
  const total = list.reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
  return `
    <div class="cards"><div class="card green"><small>Total a receber</small><strong>${money(total)}</strong></div></div>
    <div class="panel"><h2>Receitas futuras</h2>${list.map(rowHTML).join("") || `<div class="empty">Nada a receber por enquanto.</div>`}</div>`;
}

function pageRelatorios() {
  const cats = {};
  transactions.filter(t => !isIncome(t)).forEach(t => {
    const c = t.category || "Outros";
    cats[c] = (cats[c] || 0) + Math.abs(Number(t.amount) || 0);
  });
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, e) => s + e[1], 0);
  const rows = entries.map(([c, v]) => `<div class="row"><div><strong>${esc(c)}</strong>
    <small>${total ? ((v / total) * 100).toFixed(1) : 0}% das despesas</small></div><span class="neg">${money(v)}</span></div>`).join("");
  return `<div class="panel"><h2>Despesas por categoria</h2>${rows || `<div class="empty">Sem despesas para analisar.</div>`}</div>`;
}

function pagePreparacao(nome) {
  return `<div class="panel"><h2>${esc(nome)}</h2><div class="empty">Este recurso está em preparação e será liberado em breve.</div></div>`;
}

function bindTransactionForm() {
  const form = $("txForm");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const amount = Number($("txAmount").value);
    if (!(amount > 0)) return;
    const payload = {
      user_id: user.id,
      type: $("txType").value,
      amount,
      description: $("txDesc").value.trim(),
      category: $("txCat").value.trim() || "Outros",
      date: $("txDate").value
    };
    const { error } = await sb.from("transactions").insert(payload);
    if (error) { $("statusMessage").textContent = "Erro ao salvar: " + error.message; return; }
    $("statusMessage").textContent = "Lançamento salvo com sucesso.";
    await loadTransactions();
    goToPage("lancamentos");
  });
}

/* ---------- INICIALIZAÇÃO ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  applyTheme(localStorage.getItem("controles-site-theme") || "light");

  // Botões do site público
  ["openLogin", "openLoginHero"].forEach(id => $(id)?.addEventListener("click", () => openAuth("login")));
  ["openRegister", "openRegisterShowcase", "openRegisterFooter"].forEach(id => $(id)?.addEventListener("click", () => openAuth("register")));
  $("backPublic")?.addEventListener("click", () => showView("public"));
  $("switchAuth")?.addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
  $("authForm")?.addEventListener("submit", handleAuth);

  // Painel
  $("logout")?.addEventListener("click", logout);
  $("themeToggle")?.addEventListener("click", toggleTheme);
  $("mobileNav")?.addEventListener("click", () => document.querySelector(".sidebar")?.classList.toggle("open"));
  $("sideNav")?.addEventListener("click", e => {
    const b = e.target.closest("button[data-page]");
    if (b) goToPage(b.dataset.page);
  });

  // Supabase
  if (window.supabase?.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    try {
      const { data } = await sb.auth.getSession();
      if (data?.session?.user) { user = data.session.user; await enterApp(); return; }
    } catch (err) { console.error(err); }
  } else {
    setStatus("Não foi possível carregar o sistema de login. Recarregue a página.");
  }
  showView("public");
});

'use strict';
// ControleS Web. O navegador não pode conceder planos pagos.
const SUPABASE_URL = 'https://sbiqhbxtrjrzpawdqqmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8';
const $ = id => document.getElementById(id);
const money = value => Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const today = () => new Date().toISOString().slice(0,10);
let client, user, page='inicio', registerMode=false, transactions=[], goals=[], verifiedPlan=null;
const labels={inicio:'Início',lancamentos:'Lançamentos',receber:'A receber',metas:'Metas e cofrinho',relatorios:'Relatórios',assessor:'Assessor IA',vendas:'Vendas e estoque',missoes:'Missões financeiras',futuro:'Mapa do futuro',planos:'Planos e assinatura',suporte:'Central de suporte'};
const proPages=new Set(['vendas','missoes','futuro']);
function view(name){
  ['publicView','authView','appView'].forEach(id=>$(id).classList.toggle('hidden',id!==name));
  window.scrollTo({top:0,behavior:'instant'});
}
function notice(message){$('statusMessage').textContent=message||'';}
function auth(register=false){registerMode=register;$('authTitle').textContent=register?'Criar conta':'Entrar no ControleS';$('nameField').classList.toggle('hidden',!register);$('authName').required=register;$('authSubmit').textContent=register?'Criar conta':'Entrar';$('switchAuth').textContent=register?'Já tenho conta':'Criar uma conta';$('authMessage').textContent='';view('authView');}
async function authenticate(event){event.preventDefault();const btn=$('authSubmit');btn.disabled=true;try{const email=$('authEmail').value.trim(),password=$('authPassword').value;const response=registerMode?await client.auth.signUp({email,password,options:{data:{name:$('authName').value.trim()}}}):await client.auth.signInWithPassword({email,password});if(response.error)throw response.error;if(response.data.session)await enter(response.data.user);else{$('authMessage').textContent='Conta criada. Confirme seu e-mail para entrar, caso solicitado.';auth(false);$('authMessage').textContent='Confira seu e-mail para confirmar o cadastro.';}}catch(e){$('authMessage').textContent=e.message||'Erro ao autenticar.';}finally{btn.disabled=false;}}
async function enter(current){user=current;view('appView');$('userEmail').textContent=user.email||'';verifiedPlan=null;$('planBadge').textContent='Sem assinatura verificada';notice('Você já pode explorar o ControleS e conhecer os planos. A liberação de recursos pagos depende de assinatura validada no servidor.');await loadData();render('inicio');}
async function loadData(){if(!user)return;const [tx,gl]=await Promise.all([client.from('transactions').select('*').eq('user_id',user.id).order('date',{ascending:false}).limit(1000),client.from('goals').select('*').eq('user_id',user.id).limit(100)]);transactions=tx.error?[]:(tx.data||[]);goals=gl.error?[]:(gl.data||[]);if(tx.error)notice('Não foi possível carregar lançamentos: '+tx.error.message);}
function authorized(){return verifiedPlan==='basic'||verifiedPlan==='pro';}
function render(name){if(!labels[name])name='inicio';page=name;$('pageTitle').textContent=labels[name];document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$('sideNav').closest('.sidebar').classList.remove('open');const area=$('pageContent');if(proPages.has(name)&&verifiedPlan!=='pro'){area.innerHTML=locked('Este recurso faz parte do ControleS Pro.');return;}const pages={inicio:home,lancamentos:launches,receber:receivables,metas:goalsPage,relatorios:reports,assessor:advisor,vendas:()=>locked('Gestão de vendas, clientes, fornecedores e estoque em desenvolvimento.'),missoes:()=>locked('Missões personalizadas serão integradas aos seus dados financeiros.'),futuro:()=>locked('Projeções e cenários financeiros serão integrados aos seus dados.'),planos:plans,suporte:supportPage};area.innerHTML=pages[name]();}
function locked(text){return `<div class="locked"><h3>🔒 Recurso não disponível</h3><p>${escapeHtml(text)}</p><button class="btn primary" data-action="plans">Ver planos</button></div>`;}
function totals(){return transactions.reduce((a,t)=>{const n=Number(t.amount)||0;if(['income','receita'].includes(String(t.type).toLowerCase()))a.income+=n;else a.expense+=n;return a;},{income:0,expense:0});}
function home(){
  const {income,expense}=totals();
  const balance=income-expense;
  const greeting=new Date().getHours()<12?'Bom dia':new Date().getHours()<18?'Boa tarde':'Boa noite';
  return `<section class="dashboard-welcome"><div><span class="dash-overline">PAINEL FINANCEIRO</span><h2>${greeting}! Vamos organizar suas finanças?</h2><p>Veja um resumo dos seus lançamentos e acompanhe seus próximos passos.</p></div><button class="btn dash-outline" data-action="goLaunches">Ver lançamentos ↗</button></section>
  <div class="dash-stat-grid"><article class="dash-stat primary"><div class="dash-stat-head"><span>SALDO DOS LANÇAMENTOS</span><span class="dash-stat-symbol">◈</span></div><strong>${money(balance)}</strong><small>Receitas menos despesas registradas</small></article>
  <article class="dash-stat"><div class="dash-stat-head"><span>RECEITAS</span><span class="dash-stat-symbol green">↗</span></div><strong class="positive">${money(income)}</strong><small>Entradas registradas</small></article>
  <article class="dash-stat"><div class="dash-stat-head"><span>DESPESAS</span><span class="dash-stat-symbol orange">↘</span></div><strong class="expense-number">${money(expense)}</strong><small>Saídas registradas</small></article></div>
  <div class="dash-lower"><section class="dash-history"><div class="dash-section-head"><div><span class="dash-overline">SEU HISTÓRICO</span><h3>Últimas movimentações</h3></div><button class="text-action" data-action="goLaunches">Ver todas →</button></div>${transactionTable(transactions.slice(0,6))}</section>
  <aside class="dash-side"><div class="dash-quick"><span class="dash-overline">ACESSO RÁPIDO</span><h3>O que deseja fazer?</h3><button data-action="goLaunches"><span class="quick-ico">↔</span><span>Lançamentos<small>Consulte entradas e saídas</small></span><b>→</b></button><button data-action="goGoals"><span class="quick-ico">◎</span><span>Metas e cofrinho<small>Seus objetivos financeiros</small></span><b>→</b></button><button data-action="goReports"><span class="quick-ico">▥</span><span>Relatórios<small>Entenda seus resultados</small></span><b>→</b></button></div>${!authorized()?'<div class="dash-upgrade"><span>✦ CONTROLES WEB</span><h3>Conheça nossos planos</h3><p>Descubra os recursos disponíveis para sua organização financeira.</p><button class="btn cta-orange" data-action="plans">Ver planos ↗</button></div>':''}</aside></div>`;
}
function transactionTable(items){if(!items.length)return '<div class="card empty">Nenhum lançamento encontrado.</div>';return `<div class="card table-wrap"><table class="data-table"><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th></tr></thead><tbody>${items.map(t=>`<tr><td>${escapeHtml(t.description)}</td><td>${escapeHtml(t.category)}</td><td>${escapeHtml(t.date)}</td><td class="${['income','receita'].includes(String(t.type).toLowerCase())?'positive':'negative'}">${money(t.amount)}</td></tr>`).join('')}</tbody></table></div>`;}
function launches(){return `<div class="toolbar"><p class="muted">Lançamentos sincronizados com o Supabase.</p>${authorized()?'<button class="btn primary" data-action="newTransaction">+ Novo lançamento</button>':''}</div>${authorized()?'<div id="transactionEditor"></div>':'<div class="notice">A criação de lançamentos pelo site requer assinatura web validada.</div>'}${transactionTable(transactions)}`;}
function receivables(){const incoming=transactions.filter(t=>['income','receita'].includes(String(t.type).toLowerCase())&&new Date(t.date+'T00:00:00')>new Date());return `<div class="card"><h3>Receitas com data futura</h3><p>Visualização inicial de valores a receber. A lógica completa de recebimento do aplicativo será integrada em uma próxima etapa.</p></div>${transactionTable(incoming)}`;}
function goalsPage(){return `<div class="grid">${goals.length?goals.map(g=>{const current=Number(g.current_amount)||0,target=Number(g.target_amount)||0,percent=target?Math.min(100,Math.max(0,100*current/target)):0;return `<article class="card"><h3>${escapeHtml(g.name)}</h3><p>${money(current)} de ${money(target)}</p><div class="progress"><span style="width:${percent}%"></span></div></article>`;}).join(''):'<div class="card"><h3>Metas e cofrinho</h3><p>Você ainda não tem metas cadastradas ou elas não puderam ser carregadas.</p></div>'}</div>`;}
function reports(){const byCategory={};for(const t of transactions){if(['income','receita'].includes(String(t.type).toLowerCase()))continue;const key=t.category||'Outros';byCategory[key]=(byCategory[key]||0)+(Number(t.amount)||0);}return `<div class="card"><h3>Despesas por categoria</h3><div class="list">${Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([key,value])=>`<div class="list-item"><span>${escapeHtml(key)}</span><strong>${money(value)}</strong></div>`).join('')||'<p>Nenhuma despesa cadastrada.</p>'}</div></div>`;}
function advisor(){return `<div class="card"><h3>Assessor financeiro ControleS</h3><p>O mesmo assessor do aplicativo será reutilizado aqui. A integração web segura com o serviço existente ainda está pendente; não vamos criar outro assistente ou outro número.</p></div>`;}
function supportPage(){
  return `<section class="card support-panel"><span class="eyebrow">CENTRAL DE AJUDA</span><h2>Como podemos ajudar?</h2><p>O suporte do ControleS deve funcionar dentro do site. A integração com o atendimento existente ainda precisa ser conectada.</p><div class="support-options"><div class="card"><h3>Ajuda com sua conta</h3><p>Login, cadastro e recuperação de acesso.</p></div><div class="card"><h3>Assinaturas</h3><p>Informações sobre Básico e Pro.</p></div><div class="card"><h3>Problemas técnicos</h3><p>Erros, lançamentos e relatórios.</p></div></div><p class="support-warning">O envio de chamados ainda não está disponível nesta versão. Não insira dados sensíveis aqui.</p></section>`;
}
function plans(){return `<div class="plans" style="padding:0;margin:0;max-width:none"><article><span class="eyebrow">MAIS FOCADO NO PESSOAL</span><h2>Básico</h2><h3>R$ 49,99 <small>/mês</small></h3><p>Controle financeiro do dia a dia, metas, lançamentos, relatórios e assessor.</p><p>Assinatura online ainda não configurada.</p></article><article class="featured"><span class="eyebrow">MAIS FOCADO EM EMPRESAS</span><h2>Pro</h2><h3>R$ 89,99 <small>/mês</small></h3><p>Todos os recursos do Básico, mais gestão de vendas, estoque, missões e projeções.</p><p>Assinatura online ainda não configurada.</p></article></div><p class="muted">Os botões de cobrança serão ativados somente depois da integração de pagamentos e da verificação segura da assinatura.</p>`;}
function transactionForm(){return `<form id="transactionForm" class="card"><h3>Novo lançamento</h3><div class="form-grid"><label>Descrição<input name="description" required maxlength="120"></label><label>Valor<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Tipo<select name="type"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label><label>Categoria<input name="category" value="Outros" required></label><label>Data<input name="date" type="date" value="${today()}" required></label></div><div class="form-actions"><button class="btn primary">Salvar lançamento</button><button class="btn ghost" type="button" data-action="cancelTransaction">Cancelar</button></div><p id="transactionMessage" role="status"></p></form>`;}
async function saveTransaction(e){e.preventDefault();if(!authorized())return;const form=e.target;const data=Object.fromEntries(new FormData(form));const payload={user_id:user.id,description:data.description.trim(),amount:Number(data.amount),type:data.type,category:data.category.trim(),date:data.date};const {error}=await client.from('transactions').insert(payload);if(error){$('transactionMessage').textContent=error.message;return;}await loadData();render('lancamentos');notice('Lançamento salvo.');}
function init(){
  client=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
  $('openLogin').onclick=()=>auth();['openLoginHero'].forEach(id=>{const el=$(id);if(el)el.onclick=()=>auth();});['openRegisterShowcase','openRegisterFooter'].forEach(id=>{const el=$(id);if(el)el.onclick=()=>auth(true);});$('openRegister').onclick=()=>auth(true);$('openPlans').onclick=()=>document.querySelector('#publicPlans').scrollIntoView({behavior:'smooth'});$('backPublic').onclick=()=>view('publicView');$('switchAuth').onclick=()=>auth(!registerMode);$('authForm').onsubmit=e=>{
    if(!client){e.preventDefault();$('authMessage').textContent='Não foi possível conectar ao serviço de login. Atualize a página e tente novamente.';return;}
    authenticate(e);
  };$('logout').onclick=async()=>{await client.auth.signOut();user=null;view('publicView');};$('mobileNav').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
  const themeButton=$('themeToggle');
  const setTheme=(dark)=>{
    document.body.classList.toggle('dark-app',dark);
    themeButton.textContent=dark?'☀  Tema claro':'☾  Tema escuro';
    themeButton.setAttribute('aria-pressed',String(dark));
    try{localStorage.setItem('controles-web-light-preference',dark?'dark':'light');}catch(e){}
  };
  let dark=false;
  try{dark=localStorage.getItem('controles-web-light-preference')==='dark';}catch(e){}
  setTheme(dark);
  themeButton.onclick=()=>setTheme(!document.body.classList.contains('dark-app'));
$('sideNav').onclick=e=>{const button=e.target.closest('[data-page]');if(button)render(button.dataset.page);};$('pageContent').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;if(button.dataset.action==='plans')render('planos');
if(button.dataset.action==='goLaunches')render('lancamentos');
if(button.dataset.action==='goGoals')render('metas');
if(button.dataset.action==='goReports')render('relatorios');if(button.dataset.action==='newTransaction')$('transactionEditor').innerHTML=transactionForm();if(button.dataset.action==='cancelTransaction')$('transactionEditor').innerHTML='';});$('pageContent').addEventListener('submit',e=>{if(e.target.id==='transactionForm')saveTransaction(e);});if(!client){
    view('publicView');
    const banner=$('publicStatus');
    if(banner){banner.hidden=false;banner.textContent='O serviço de autenticação não carregou. Verifique a conexão e atualize a página.';}
    return;
  }
  client.auth.getUser().then(({data,error})=>{
    if(error)console.warn('Sessão não disponível:',error.message);
    return data?.user?enter(data.user):view('publicView');
  }).catch(err=>{console.error(err);view('publicView');});
}
document.addEventListener('click',e=>{
  const sidebar=document.querySelector('.sidebar');
  if(sidebar?.classList.contains('open')&&!e.target.closest('.sidebar')&&!e.target.closest('#mobileNav')){
    sidebar.classList.remove('open');
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.querySelector('.sidebar')?.classList.remove('open');
});
document.addEventListener('DOMContentLoaded',init);

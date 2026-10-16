'use strict';
/* ControleS Web — primeira base. NÃO autoriza recursos pagos pelo navegador. */
const SUPABASE_URL = 'https://sbiqhbxtrjrzpawdqqmy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IJbB2nttwg70Ah1KG77Q9A_5HdR25f8';
const $ = id => document.getElementById(id);
let client = null;
let isRegister = false;
let busy = false;
const views = ['landing','auth','dashboard'];
function showView(view) {
  for (const id of views) $(id).classList.toggle('hidden',id !== view);
  $('headerNav').classList.toggle('hidden',view === 'dashboard');
  window.scrollTo({top:0,behavior:'instant'});
}
function setMessage(message, isError=false) {
  $('authMessage').textContent = message;
  $('authMessage').style.color = isError ? '#ffaaa2' : '#a2e8c3';
}
function openAuth(register=false) {
  isRegister = register;
  $('authTitle').textContent = register ? 'Crie sua conta' : 'Entre na sua conta';
  $('nameGroup').classList.toggle('hidden',!register);
  $('authName').required = register;
  $('authPassword').autocomplete = register ? 'new-password' : 'current-password';
  $('authSubmit').textContent = register ? 'Criar conta' : 'Entrar';
  $('switchAuth').textContent = register ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Criar conta';
  setMessage('');
  showView('auth');
}
function safeName(user) {
  const candidate = user?.user_metadata?.name || user?.email?.split('@')[0] || 'usuário';
  return String(candidate).slice(0,60);
}
function showDashboard(user) {
  $('displayName').textContent = safeName(user);
  // Sem verificação no servidor, nunca afirmar que o usuário possui Básico ou Pro.
  $('planPill').textContent = 'Plano não verificado';
  showView('dashboard');
}
async function syncSession() {
  if (!client) return;
  const {data,error} = await client.auth.getUser();
  if (error || !data?.user) { showView('landing'); return; }
  showDashboard(data.user);
}
async function submitAuth(event) {
  event.preventDefault();
  if (!client || busy) return;
  const email = $('authEmail').value.trim();
  const password = $('authPassword').value;
  if (password.length < 6) {setMessage('A senha precisa ter pelo menos 6 caracteres.',true);return;}
  busy=true; $('authSubmit').disabled=true; setMessage('Aguarde...');
  try {
    if (isRegister) {
      const name = $('authName').value.trim();
      if (!name) throw new Error('Informe seu nome.');
      const {data,error} = await client.auth.signUp({email,password,options:{data:{name}}});
      if (error) throw error;
      if (data?.session) showDashboard(data.user);
      else {openAuth(false);setMessage('Cadastro enviado. Confirme seu e-mail, se solicitado, antes de entrar.');}
    } else {
      const {data,error} = await client.auth.signInWithPassword({email,password});
      if (error) throw error;
      showDashboard(data.user);
    }
  } catch (error) {setMessage(error?.message || 'Não foi possível concluir.',true);}
  finally {busy=false;$('authSubmit').disabled=false;}
}
function init() {
  $('year').textContent = new Date().getFullYear();
  $('headerLogin').addEventListener('click',()=>openAuth(false));
  $('heroLogin').addEventListener('click',()=>openAuth(false));
  $('heroRegister').addEventListener('click',()=>openAuth(true));
  $('backHome').addEventListener('click',()=>showView('landing'));
  $('switchAuth').addEventListener('click',()=>openAuth(!isRegister));
  $('authForm').addEventListener('submit',submitAuth);
  document.querySelectorAll('[data-start]').forEach(button=>button.addEventListener('click',()=>openAuth(true)));
  $('logoutBtn').addEventListener('click',async()=>{if(client)await client.auth.signOut();showView('landing');});
  if (!window.supabase?.createClient) {console.error('Biblioteca Supabase indisponível.');return;}
  client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  client.auth.onAuthStateChange((event)=>{
    if(event==='SIGNED_OUT') showView('landing');
    if(event==='SIGNED_IN') queueMicrotask(syncSession);
  });
  syncSession();
}
document.addEventListener('DOMContentLoaded',init);

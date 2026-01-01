// js/main.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ======================
   CONFIGURAÇÃO SUPABASE
====================== */
const SUPABASE_URL = "https://aplaqtdpbjzirtsybgyc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_J0Wu4wGxaRxwqIFNdiYnJA_pmzx59_O";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ======================
   MENU LATERAL (MOBILE)
====================== */
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
if (menuBtn) menuBtn.addEventListener("click", () => sidebar.classList.toggle("-translate-x-64"));

/* ======================
   ELEMENTOS
====================== */
const btnLogin = document.getElementById("btn-login");
const btnRegistro = document.getElementById("btn-registro");
const perfilSection = document.getElementById("perfil");
const jogosSection = document.getElementById("jogos");
const loginAlert = document.getElementById("login-alert");
const saldoBox = document.getElementById("saldo-box");
const logoutBtn = document.getElementById("logout-btn");
const bbcoinSpan = document.getElementById("bbcoin-count");

/* ======================
   MOSTRAR LOGIN / REGISTRO
====================== */
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.remove("hidden");
  });
}

if (btnRegistro) {
  btnRegistro.addEventListener("click", () => {
    perfilSection.classList.remove("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.add("hidden");
  });
}

/* ======================
   REGISTO
====================== */
const registroForm = document.getElementById("registro-form");
if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const nome = document.getElementById("nome").value;
    const apelido = document.getElementById("apelido").value;
    const genero = document.getElementById("genero").value;
    const data_nascimento = document.getElementById("data_nascimento").value;
    const email = document.getElementById("email").value;
    const telemovel = document.getElementById("telemovel").value;
    const senha = document.getElementById("senha").value;

    try {
      // Criar conta no Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (signUpError) throw signUpError;

      // Criar registro do utilizador na tabela "usuarios"
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            id: userData.user.id,
            username,
            nome,
            apelido,
            genero,
            data_nascimento,
            email,
            telemovel,
            saldo: 1000,
            bigBetCoin: 0,
          },
        ]);

      if (insertError) throw insertError;

      alert("Conta criada com sucesso!");
      registroForm.reset();
      perfilSection.classList.remove("hidden");
      jogosSection.classList.remove("hidden");
      loginAlert.classList.add("hidden");

      atualizarDadosUsuario();
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ======================
   LOGIN
====================== */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      perfilSection.classList.remove("hidden");
      jogosSection.classList.remove("hidden");
      loginAlert.classList.add("hidden");

      atualizarDadosUsuario();
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ======================
   LOGOUT
====================== */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.remove("hidden");
  });
}

/* ======================
   FUNÇÃO PARA ATUALIZAR DADOS DO USUÁRIO
====================== */
async function atualizarDadosUsuario() {
  const user = supabase.auth.user();
  if (!user) return;

  const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
  if (error) return;

  window.saldoAtual = data.saldo;
  document.getElementById("saldo").textContent = data.saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = data.bigBetCoin || 0;
  document.title = `BigBet - ${data.username}`;
  saldoBox.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}

/* ======================
   ATUALIZAR SALDO / APOSTAS
====================== */
async function atualizarSaldo(valor) {
  const user = supabase.auth.user();
  if (!user) return;

  const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
  if (error) return;

  let saldo = data.saldo + valor;
  if (saldo < 0) saldo = 0;

  await supabase.from("usuarios").update({ saldo }).eq("id", user.id);
  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
}

async function apostar(valor) {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para jogar");
  if (window.saldoAtual + valor < 0) return alert("⚠️ Saldo insuficiente!");
  await atualizarSaldo(valor);
}

/* ======================
   BIGBET COINS
====================== */
async function comprarBigBetCoin(qtd) {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para comprar BigBet Coins");

  const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
  if (error) return;

  let saldo = data.saldo;
  let moedas = data.bigBetCoin || 0;
  const precoPorMoeda = 10;
  const custo = qtd * precoPorMoeda;

  if (saldo < custo) return alert("⚠️ Saldo insuficiente!");

  saldo -= custo;
  moedas += qtd;

  await supabase.from("usuarios").update({ saldo, bigBetCoin: moedas }).eq("id", user.id);

  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = moedas;

  alert(`🎉 Comprou ${qtd} BigBet Coins!`);
}

/* ======================
   SLOT MACHINE
====================== */
function spinSlot() {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para jogar");

  const resultados = ["🎰","🍒","🍋","🔔","💎"];
  const slot1 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot2 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot3 = resultados[Math.floor(Math.random()*resultados.length)];

  const display = document.getElementById("slot-display");
  if (display) display.textContent = slot1+slot2+slot3;

  let ganho = 0;
  if (slot1===slot2 && slot2===slot3) ganho=500;
  else if (slot1===slot2 || slot2===slot3 || slot1===slot3) ganho=100;
  else ganho=-50;

  apostar(ganho);
}

/* ======================
   DICE GAME
====================== */
function rollDice() {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para jogar");

  const dado1 = Math.floor(Math.random()*6)+1;
  const dado2 = Math.floor(Math.random()*6)+1;

  const display = document.getElementById("dice-display");
  if (display) display.textContent = `${dado1} 🎲 ${dado2}`;

  let ganho = 0;
  if (dado1+dado2===12) ganho=200;
  else if (dado1===dado2) ganho=100;
  else ganho=-20;

  apostar(ganho);
}

/* ======================
   ROULETTE
====================== */
function spinRoulette() {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para jogar");

  const numeros = Array.from({length:36},(_,i)=>i+1);
  const resultado = numeros[Math.floor(Math.random()*numeros.length)];

  const display = document.getElementById("roulette-display");
  if (display) display.textContent = resultado + " 🎡";

  let ganho = resultado%2===0 ? 100 : -50;
  apostar(ganho);
}

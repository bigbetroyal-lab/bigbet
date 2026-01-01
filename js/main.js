// js/main.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js";

// ======= CONFIGURAÇÃO SUPABASE =======
const supabaseUrl = "https://aplaqtdpbjzirtsybgyc.supabase.co"; // substitua pelo seu URL
const supabaseKey = "sb_publishable_J0Wu4wGxaRxwqIFNdiYnJA_pmzx59_O"; // substitua pela sua chave pública (anon)
export const supabase = createClient(supabaseUrl, supabaseKey);

// ======= ELEMENTOS DO DOM =======
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const btnLogin = document.getElementById("btn-login");
const btnRegistro = document.getElementById("btn-registro");
const perfilSection = document.getElementById("perfil");
const jogosSection = document.getElementById("jogos");
const loginAlert = document.getElementById("login-alert");
const loginSection = document.getElementById("login");
const registroForm = document.getElementById("registro-form");
const loginForm = document.getElementById("login-form");
const saldoBox = document.getElementById("saldo-box");
const logoutBtn = document.getElementById("logout-btn");
const bbcoinSpan = document.getElementById("bbcoin-count");

// ======= MENU MOBILE =======
if (menuBtn) menuBtn.addEventListener("click", () => sidebar.classList.toggle("-translate-x-64"));

// ======= LOGIN / REGISTRO BOTÕES =======
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    loginSection.classList.remove("hidden");
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.add("hidden");
  });
}

if (btnRegistro) {
  btnRegistro.addEventListener("click", () => {
    perfilSection.classList.remove("hidden");
    loginSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.add("hidden");
  });
}

// ======= REGISTRO =======
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

    // criar usuário no Auth
    const { data: user, error: authError } = await supabase.auth.signUp({ email, password: senha });
    if (authError) return alert(authError.message);

    // criar dados na tabela usuarios
    const { error: dbError } = await supabase
      .from("usuarios")
      .insert([{
        id: user.user.id,
        username,
        nome,
        apelido,
        genero,
        data_nascimento,
        email,
        telemovel,
        saldo: 1000,
        bigBetCoin: 0,
        data_criacao: new Date()
      }]);
    if (dbError) return alert(dbError.message);

    alert("Conta criada com sucesso!");
    registroForm.reset();
    perfilSection.classList.remove("hidden");
    jogosSection.classList.remove("hidden");
    loginAlert.classList.add("hidden");
  });
}

// ======= LOGIN =======
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return alert(error.message);

    alert("Login bem-sucedido!");
    loginSection.classList.add("hidden");
    perfilSection.classList.remove("hidden");
    jogosSection.classList.remove("hidden");
    loginAlert.classList.add("hidden");
  });
}

// ======= LOGOUT =======
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.remove("hidden");
  });
}

// ======= CARREGAR DADOS DO PERFIL =======
async function carregarPerfil() {
  const user = supabase.auth.user();
  if (!user) {
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    saldoBox.classList.add("hidden");
    return;
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return console.error(error);

  if (jogosSection) jogosSection.classList.remove("hidden");
  if (saldoBox) saldoBox.classList.remove("hidden");
  if (perfilSection) perfilSection.classList.remove("hidden");

  window.saldoAtual = data.saldo;
  document.getElementById("saldo").textContent = data.saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = data.bigBetCoin || 0;
  document.title = `BigBet - ${data.username}`;
}

// atualizar perfil quando autenticação muda
supabase.auth.onAuthStateChange(() => {
  carregarPerfil();
});

// ======= SALDO E APOSTAS =======
async function atualizarSaldo(valor) {
  const user = supabase.auth.user();
  if (!user) return;

  const { data, error } = await supabase
    .from("usuarios")
    .update({ saldo: supabase.rpc("get_saldo", { user_id: user.id }) + valor })
    .eq("id", user.id);
  
  window.saldoAtual = data?.saldo || 0;
  document.getElementById("saldo").textContent = window.saldoAtual.toFixed(2);
}

async function apostar(valor) {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para jogar");
  if (window.saldoAtual + valor < 0) return alert("⚠️ Saldo insuficiente!");
  await atualizarSaldo(valor);
}

// ======= BIGBET COINS =======
async function comprarBigBetCoin(qtd) {
  const user = supabase.auth.user();
  if (!user) return alert("❌ Tens de estar logado para comprar BigBet Coins");

  const { data, error } = await supabase
    .from("usuarios")
    .select("saldo, bigBetCoin")
    .eq("id", user.id)
    .single();
  if (error) return console.error(error);

  let saldo = data.saldo;
  let moedas = data.bigBetCoin || 0;
  const precoPorMoeda = 10;
  const custo = qtd * precoPorMoeda;

  if (saldo < custo) return alert("⚠️ Saldo insuficiente!");

  saldo -= custo;
  moedas += qtd;

  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ saldo, bigBetCoin: moedas })
    .eq("id", user.id);
  if (updateError) return console.error(updateError);

  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = moedas;

  alert(`🎉 Comprou ${qtd} BigBet Coins!`);
}

// ======= JOGOS =======
function spinSlot() {
  if (!supabase.auth.user()) return alert("❌ Tens de estar logado para jogar");
  const resultados = ["🎰","🍒","🍋","🔔","💎"];
  const slot1 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot2 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot3 = resultados[Math.floor(Math.random()*resultados.length)];
  document.getElementById("slot-display").textContent = slot1+slot2+slot3;
  let ganho = slot1===slot2 && slot2===slot3 ? 500 : slot1===slot2||slot2===slot3||slot1===slot3 ? 100 : -50;
  apostar(ganho);
}

function rollDice() {
  if (!supabase.auth.user()) return alert("❌ Tens de estar logado para jogar");
  const dado1 = Math.floor(Math.random()*6)+1;
  const dado2 = Math.floor(Math.random()*6)+1;
  document.getElementById("dice-display").textContent = `${dado1} 🎲 ${dado2}`;
  let ganho = dado1+dado2===12 ? 200 : dado1===dado2 ? 100 : -20;
  apostar(ganho);
}

function spinRoulette() {
  if (!supabase.auth.user()) return alert("❌ Tens de estar logado para jogar");
  const numeros = Array.from({length:36},(_,i)=>i+1);
  const resultado = numeros[Math.floor(Math.random()*numeros.length)];
  document.getElementById("roulette-display").textContent = resultado + " 🎡";
  let ganho = resultado%2===0 ? 100 : -50;
  apostar(ganho);
}

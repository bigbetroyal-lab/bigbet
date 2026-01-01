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

// ======= LOGIN / REGISTRO =======
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
    registroForm.parentElement.classList.remove("hidden");
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
    const data_criacao = new Date().toISOString();

    try {
      // Criar usuário no Supabase Auth
      const { data: user, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha
      });

      if (signUpError) throw signUpError;

      // Criar registro no banco
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
          data_criacao,
          saldo: 1000,
          bigBetCoin: 0
        }]);

      if (dbError) throw dbError;

      alert("Conta criada com sucesso!");
      registroForm.reset();
      perfilSection.classList.remove("hidden");
      jogosSection.classList.remove("hidden");
      loginAlert.classList.add("hidden");

    } catch (err) {
      alert("Erro: " + err.message);
    }
  });
}

// ======= LOGIN =======
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) throw error;

      alert("Login efetuado com sucesso!");
      loginSection.classList.add("hidden");
      perfilSection.classList.remove("hidden");
      jogosSection.classList.remove("hidden");
      loginAlert.classList.add("hidden");

      carregarPerfil();

    } catch (err) {
      alert("Erro: " + err.message);
    }
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

// ======= PERFIL =======
async function carregarPerfil() {
  const user = supabase.auth.getUser();
  const { data: sessionData } = await user;
  if (!sessionData || !sessionData.user) return;

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", sessionData.user.id)
    .single();

  if (error) return console.log(error);

  document.getElementById("saldo").textContent = data.saldo.toFixed(2);
  bbcoinSpan.textContent = data.bigBetCoin;
  document.title = `BigBet - ${data.username}`;
}

// ======= SALDO =======
async function atualizarSaldo(valor) {
  const { data: userSession } = await supabase.auth.getUser();
  if (!userSession?.user) return alert("❌ Tens de estar logado");

  const { data, error } = await supabase
    .from("usuarios")
    .select("saldo")
    .eq("id", userSession.user.id)
    .single();

  if (error) return console.log(error);

  let novoSaldo = data.saldo + valor;
  if (novoSaldo < 0) novoSaldo = 0;

  await supabase
    .from("usuarios")
    .update({ saldo: novoSaldo })
    .eq("id", userSession.user.id);

  window.saldoAtual = novoSaldo;
  document.getElementById("saldo").textContent = novoSaldo.toFixed(2);
}

// ======= APOSTAS =======
async function apostar(valor) {
  const { data: userSession } = await supabase.auth.getUser();
  if (!userSession?.user) return alert("❌ Tens de estar logado");
  if (window.saldoAtual + valor < 0) return alert("⚠️ Saldo insuficiente!");
  await atualizarSaldo(valor);
}

// ======= BIGBET COINS =======
async function comprarBigBetCoin(qtd) {
  const { data: userSession } = await supabase.auth.getUser();
  if (!userSession?.user) return alert("❌ Tens de estar logado");

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userSession.user.id)
    .single();

  if (error) return console.log(error);

  let saldo = data.saldo;
  let moedas = data.bigBetCoin;

  const precoPorMoeda = 10;
  const custo = qtd * precoPorMoeda;

  if (saldo < custo) return alert("⚠️ Saldo insuficiente!");

  saldo -= custo;
  moedas += qtd;

  await supabase
    .from("usuarios")
    .update({ saldo, bigBetCoin: moedas })
    .eq("id", userSession.user.id);

  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
  bbcoinSpan.textContent = moedas;

  alert(`🎉 Comprou ${qtd} BigBet Coins!`);
}

// ======= JOGOS =======
function spinSlot() { apostar(Math.random() > 0.5 ? 500 : -50); }
function rollDice() { apostar(Math.random() > 0.5 ? 100 : -20); }
function spinRoulette() { apostar(Math.random() > 0.5 ? 100 : -50); }

// ======= VERIFICAR LOGIN AO CARREGAR =======
window.addEventListener("DOMContentLoaded", async () => {
  const { data: session } = await supabase.auth.getSession();
  if (session?.user) {
    perfilSection.classList.remove("hidden");
    jogosSection.classList.remove("hidden");
    loginAlert.classList.add("hidden");
    carregarPerfil();
  } else {
    perfilSection.classList.add("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.remove("hidden");
  }
});

// Exportar funções para o onclick dos botões de jogos e BigBet Coins
window.spinSlot = spinSlot;
window.rollDice = rollDice;
window.spinRoulette = spinRoulette;
window.comprarBigBetCoin = comprarBigBetCoin;

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

/* ======================
   MENU LATERAL (MOBILE)
====================== */
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
if (menuBtn) menuBtn.addEventListener("click", () => sidebar.classList.toggle("-translate-x-64"));

// BOTÕES LOGIN / REGISTRO
const btnLogin = document.getElementById("btn-login");
const btnRegistro = document.getElementById("btn-registro");
const perfilSection = document.getElementById("perfil");
const jogosSection = document.getElementById("jogos");
const loginAlert = document.getElementById("login-alert");

// Mostrar seção de login/registro
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    window.location.hash = "#perfil";
    perfilSection.classList.remove("hidden");
    jogosSection.classList.add("hidden");
    loginAlert.classList.add("hidden");
  });
}

if (btnRegistro) {
  btnRegistro.addEventListener("click", () => {
    window.location.hash = "#perfil";
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
    const data_criacao = new Date().toISOString();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
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
      });

      alert("Conta criada com sucesso!");
      registroForm.reset();
      window.location.hash = "#perfil";

    } catch (error) {
      alert(error.message);
    }
  });
}

/* ======================
   PERFIL E LOGIN
====================== */
const jogosSection = document.getElementById("jogos");
const saldoBox = document.getElementById("saldo-box");
const logoutBtn = document.getElementById("logout-btn");
const perfilSection = document.getElementById("perfil");
const bbcoinSpan = document.getElementById("bbcoin-count");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (jogosSection) jogosSection.classList.add("hidden");
    if (saldoBox) saldoBox.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (perfilSection) perfilSection.classList.add("hidden");
    if (window.location.hash === "#perfil") window.location.hash = "#login";
    return;
  }

  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (!snap.exists()) return;

  const data = snap.data();

  if (jogosSection) jogosSection.classList.remove("hidden");
  if (saldoBox) saldoBox.classList.remove("hidden");
  if (logoutBtn) logoutBtn.classList.remove("hidden");
  if (perfilSection) perfilSection.classList.remove("hidden");

  window.saldoAtual = data.saldo;
  document.getElementById("saldo").textContent = data.saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = data.bigBetCoin || 0;
  document.title = `BigBet - ${data.username}`;
});

/* ======================
   LOGOUT
====================== */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.hash = "#login";
  });
}

/* ======================
   SALDO E APOSTAS
====================== */
async function atualizarSaldo(valor) {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  let saldo = snap.data().saldo + valor;
  if (saldo < 0) saldo = 0;

  await updateDoc(ref, { saldo });
  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
}

async function apostar(valor) {
  const user = auth.currentUser;
  if (!user) return alert("❌ Tens de estar logado para jogar");
  if (window.saldoAtual + valor < 0) return alert("⚠️ Saldo insuficiente!");
  await atualizarSaldo(valor);
}

/* ======================
   BIGBET COINS
====================== */
async function comprarBigBetCoin(qtd) {
  const user = auth.currentUser;
  if (!user) return alert("❌ Tens de estar logado para comprar BigBet Coins");

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  let saldo = snap.data().saldo;
  let moedas = snap.data().bigBetCoin || 0;

  const precoPorMoeda = 10;
  const custo = qtd * precoPorMoeda;

  if (saldo < custo) return alert("⚠️ Saldo insuficiente!");

  saldo -= custo;
  moedas += qtd;

  await updateDoc(ref, { saldo, bigBetCoin: moedas });

  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = moedas;

  alert(`🎉 Comprou ${qtd} BigBet Coins!`);
}

/* ======================
   SLOT MACHINE
====================== */
function spinSlot() {
  if (!auth.currentUser) return alert("❌ Tens de estar logado para jogar");

  const resultados = ["🎰","🍒","🍋","🔔","💎"];
  const slot1 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot2 = resultados[Math.floor(Math.random()*resultados.length)];
  const slot3 = resultados[Math.floor(Math.random()*resultados.length)];

  const display = document.getElementById("slot-display");
  if (display) display.textContent = slot1+slot2+slot3;

  let ganho = 0;
  if (slot1===slot2 && slot2===slot3) ganho=500;
  else if (slot1===slot2 || slot2===slot3 || slot

// js/main.js
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

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-64");
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
        saldo: 1000,   // 🎁 saldo inicial
        bigBetCoin: 0  // 🪙 BigBet Coin inicial
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
   LOGIN
====================== */
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.hash = "#perfil";
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ======================
   PERFIL (CARREGAR DADOS)
====================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  // Mostrar saldo
  const saldoSpan = document.getElementById("saldo");
  if (saldoSpan) {
    saldoSpan.textContent = data.saldo.toFixed(2);
  }

  // Mostrar BigBet Coins
  const bbSpan = document.getElementById("bbcoin-count");
  if (bbSpan) bbSpan.textContent = data.bigBetCoin || 0;

  // Guardar saldo local
  window.saldoAtual = data.saldo;
});

/* ======================
   EDITAR PERFIL (LIMITADO)
====================== */
const perfilForm = document.getElementById("perfil-form");

if (perfilForm) {
  perfilForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "usuarios", user.uid), {
      email: document.getElementById("perfil-email").value,
      telemovel: document.getElementById("perfil-telemovel").value
    });

    alert("Perfil atualizado com sucesso!");
  });
}

/* ======================
   SEGURANÇA - BLOQUEIO
====================== */
const jogosSection = document.getElementById("jogos");
const saldoBox = document.getElementById("saldo-box");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    // ❌ NÃO LOGADO
    if (jogosSection) jogosSection.classList.add("hidden");
    if (saldoBox) saldoBox.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");

    // Forçar login
    if (window.location.hash === "#perfil") {
      window.location.hash = "#login";
    }

  } else {
    // ✅ LOGADO
    if (jogosSection) jogosSection.classList.remove("hidden");
    if (saldoBox) saldoBox.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");

    // Buscar nome do utilizador
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      document.title = `BigBet - ${d.username}`;

      // Atualizar BigBet Coins UI
      const bbSpan = document.getElementById("bbcoin-count");
      if (bbSpan) bbSpan.textContent = d.bigBetCoin || 0;
    }
  }
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
   SALDO - ATUALIZAÇÃO
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

  // Atualizar UI
  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);
}

/* ======================
   FUNÇÃO DE APOSTA
====================== */
async function apostar(valor) {
  const user = auth.currentUser;
  if (!user) {
    alert("❌ Tens de estar logado para jogar");
    return;
  }

  if (window.saldoAtual <= 0) {
    alert("❌ Saldo esgotado! Faz depósito ou espera por bónus.");
    return;
  }

  if (window.saldoAtual + valor < 0) {
    alert("⚠️ Saldo insuficiente!");
    return;
  }

  await atualizarSaldo(valor);
}

/* ======================
   SLOT MACHINE
====================== */
function spinSlot() {
  if (!auth.currentUser) {
    alert("❌ Tens de estar logado para jogar");
    return;
  }

  const resultados = ["🎰", "🍒", "🍋", "🔔", "💎"];
  const slot1 = resultados[Math.floor(Math.random() * resultados.length)];
  const slot2 = resultados[Math.floor(Math.random() * resultados.length)];
  const slot3 = resultados[Math.floor(Math.random() * resultados.length)];

  const display = document.getElementById("slot-display");
  if (display) display.textContent = slot1 + slot2 + slot3;

  let ganho = 0;
  if (slot1 === slot2 && slot2 === slot3) {
    ganho = 500;
    alert("🎉 Trinca! Ganhou 500 moedas!");
  } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
    ganho = 100;
    alert("😊 Dois iguais! Ganhou 100 moedas!");
  } else {
    ganho = -50;
    alert("😢 Não combinou. Perdeu 50 moedas.");
  }

  apostar(ganho);
}

/* ======================
   DICE GAME
====================== */
function rollDice() {
  if (!auth.currentUser) {
    alert("❌ Tens de estar logado para jogar");
    return;
  }

  const dado1 = Math.floor(Math.random() * 6) + 1;
  const dado2 = Math.floor(Math.random() * 6) + 1;

  const display = document.getElementById("dice-display");
  if (display) display.textContent = `${dado1} 🎲 ${dado2}`;

  let ganho = 0;
  if (dado1 + dado2 === 12) ganho = 200;
  else if (dado1 === dado2) ganho = 100;
  else ganho = -20;

  apostar(ganho);
}

/* ======================
   ROULETTE
====================== */
function spinRoulette() {
  if (!auth.currentUser) {
    alert("❌ Tens de estar logado para jogar");
    return;
  }

  const numeros = Array.from({ length: 36 }, (_, i) => i + 1);
  const resultado = numeros[Math.floor(Math.random() * numeros.length)];

  const display = document.getElementById("roulette-display");
  if (display) display.textContent = resultado + " 🎡";

  let ganho = resultado % 2 === 0 ? 100 : -50;
  apostar(ganho);
}

/* ======================
   BIGBET COIN
====================== */
async function comprarBigBetCoin(qtd) {
  const user = auth.currentUser;
  if (!user) {
    alert("❌ Tens de estar logado para comprar BigBet Coins");
    return;
  }

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  let saldo = snap.data().saldo;
  let moedas = snap.data().bigBetCoin || 0;

  const precoPorMoeda = 10; // 1 BigBet Coin = 10 moedas do saldo
  const custo = qtd * precoPorMoeda;

  if (saldo < custo) {
    alert("⚠️ Saldo insuficiente para comprar esta quantidade de moedas!");
    return;
  }

  saldo -= custo;
  moedas += qtd;

  await updateDoc(ref, { saldo, bigBetCoin: moedas });

  window.saldoAtual = saldo;
  document.getElementById("saldo").textContent = saldo.toFixed(2);

  // Atualizar UI BigBet Coins
  const bbSpan = document.getElementById("bbcoin-count");
  if (bbSpan) bbSpan.textContent = moedas;

  alert(`🎉 Comprou ${qtd} BigBet Coins!`);
}

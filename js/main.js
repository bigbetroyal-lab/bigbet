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
   ELEMENTOS GLOBAIS
====================== */
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

const btnLogin = document.getElementById("btn-login");
const btnRegistro = document.getElementById("btn-registro");

const loginSection = document.getElementById("login");
const perfilSection = document.getElementById("perfil");
const jogosSection = document.getElementById("jogos");
const loginAlert = document.getElementById("login-alert");

const saldoBox = document.getElementById("saldo-box");
const logoutBtn = document.getElementById("logout-btn");
const bbcoinSpan = document.getElementById("bbcoin-count");

/* ======================
   MENU LATERAL MOBILE
====================== */
if (menuBtn) menuBtn.addEventListener("click", () => sidebar.classList.toggle("-translate-x-64"));

/* ======================
   LOGIN / REGISTRO BOTÕES
====================== */
if (btnLogin) btnLogin.addEventListener("click", () => {
  loginSection.classList.remove("hidden");
  perfilSection.classList.add("hidden");
  jogosSection.classList.add("hidden");
  loginAlert.classList.add("hidden");
  window.location.hash = "#login";
});

if (btnRegistro) btnRegistro.addEventListener("click", () => {
  perfilSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
  jogosSection.classList.add("hidden");
  loginAlert.classList.add("hidden");
  window.location.hash = "#perfil";
});

/* ======================
   REGISTO
====================== */
const registroForm = document.getElementById("registro-form");
if (registroForm) registroForm.addEventListener("submit", async e => {
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
      data_criacao: new Date().toISOString(),
      saldo: 1000,
      bigBetCoin: 0
    });

    alert("🎉 Conta criada com sucesso!");
    registroForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

/* ======================
   LOGIN
====================== */
const loginForm = document.getElementById("login-form");
if (loginForm) loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("✅ Login efetuado com sucesso!");
  } catch (err) {
    alert(err.message);
  }
});

/* ======================
   ATUALIZAÇÃO UI SEGUNDO AUTH
====================== */
onAuthStateChanged(auth, async user => {
  if (!user) {
    // Não logado
    jogosSection.classList.add("hidden");
    perfilSection.classList.add("hidden");
    loginSection.classList.add("hidden");
    saldoBox.classList.add("hidden");
    logoutBtn.classList.add("hidden");

    if (btnLogin) btnLogin.classList.remove("hidden");
    if (btnRegistro) btnRegistro.classList.remove("hidden");
    if (loginAlert) loginAlert.classList.remove("hidden");
    return;
  }

  // Logado
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (!snap.exists()) return;

  const data = snap.data();

  jogosSection.classList.remove("hidden");
  perfilSection.classList.remove("hidden");
  saldoBox.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  if (btnLogin) btnLogin.classList.add("hidden");
  if (btnRegistro) btnRegistro.classList.add("hidden");
  if (loginAlert) loginAlert.classList.add("hidden");

  document.getElementById("saldo").textContent = data.saldo.toFixed(2);
  if (bbcoinSpan) bbcoinSpan.textContent = data.bigBetCoin || 0;
  document.title = `BigBet - ${data.username}`;
});

/* ======================
   LOGOUT
====================== */
if (logoutBtn) logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("❌ Logout efetuado!");
});

/* ======================
   FUNÇÕES DE JOGO (Slots, Dice, Roulette)
====================== */
// ... Mantém todas as funções spinSlot, rollDice, spinRoulette

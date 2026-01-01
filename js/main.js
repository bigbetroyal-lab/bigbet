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
        saldo: 1000   // 🎁 saldo inicial
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



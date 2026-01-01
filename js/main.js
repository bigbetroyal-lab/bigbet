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
        data_criacao
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

  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (!snap.exists()) return;

  const d = snap.data();

  if (document.getElementById("perfil-username")) {
    document.getElementById("perfil-username").value = d.username;
    document.getElementById("perfil-nome").value = d.nome;
    document.getElementById("perfil-apelido").value = d.apelido;
    document.getElementById("perfil-genero").value = d.genero;
    document.getElementById("perfil-nascimento").value = d.data_nascimento;
    document.getElementById("perfil-email").value = d.email;
    document.getElementById("perfil-telemovel").value = d.telemovel;
    document.getElementById("perfil-criacao").value =
      new Date(d.data_criacao).toLocaleDateString("pt-PT");
  }
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

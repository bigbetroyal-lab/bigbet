import { auth } from "./firebase.js";
import { atualizarSaldo } from "./saldo.js";

const missoes = [
    { id:1, descricao:"Girar a slot 5 vezes", meta:5, tipo:"slot" },
    { id:2, descricao:"Ganhar 3 apostas na Roleta", meta:3, tipo:"roleta" },
    { id:3, descricao:"Sacar no Crash 1 vez", meta:1, tipo:"crash" }
];

export async function carregarMissoes() {
    const user = auth.currentUser;
    if(!user) return;

    const lista = document.getElementById("missoes-list");
    lista.innerHTML = "";
    missoes.forEach(missao => {
        const li = document.createElement("li");
        li.textContent = `${missao.descricao} - Progresso: 0/${missao.meta}`;
        li.dataset.id = missao.id;
        lista.appendChild(li);
    });
}

// Recompensa diária
document.getElementById("resgatar-recompensa").addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return alert("Você precisa estar logado!");

    // Aqui você pode usar Firestore para registrar última recompensa
    // Exemplo simples: adicionar 200 coins
    let saldo = parseInt(document.getElementById("top-saldo").textContent.replace(/\D/g,''));
    saldo += 200;
    await atualizarSaldo(user.uid, saldo);
    document.getElementById("missoes-resultado").textContent = "🎁 Recompensa diária: +200 coins!";
});

import { auth } from "./firebase.js";
import { atualizarSaldo, adicionarAposta } from "./saldo.js";

const crashStartBtn = document.getElementById("crash-start");
const crashCashoutBtn = document.getElementById("crash-cashout");
const crashMultiplicadorEl = document.getElementById("crash-multiplicador");
const crashResultadoEl = document.getElementById("crash-resultado");
const crashApostaInput = document.getElementById("crash-aposta");

let multiplicador = 1;
let interval;
let crashed = false;
let userSaldo = 0;
let aposta = 0;

// Lembre-se de colocar isso no CSS
// #crash-multiplicador.win { color: #0f0; transition: color 0.3s; }
// #crash-multiplicador.lose { color: #f00; transition: color 0.3s; }

crashStartBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return alert("Você precisa estar logado para jogar!");

    aposta = parseInt(crashApostaInput.value);
    userSaldo = parseInt(document.getElementById("top-saldo").textContent.replace(/\D/g,''));

    if(userSaldo < aposta) return alert("Saldo insuficiente!");

    userSaldo -= aposta;
    await atualizarSaldo(user.uid, userSaldo);

    multiplicador = 1;
    crashed = false;
    crashCashoutBtn.disabled = false;
    crashResultadoEl.textContent = "";

    // Remove classes anteriores
    crashMultiplicadorEl.classList.remove("win", "lose");

    // Definir quando o crash acontece
    const crashPoint = (Math.random() * 9 + 2).toFixed(2); // entre 2x e 11x

    interval = setInterval(() => {
        multiplicador += 0.01;
        multiplicador = Math.round(multiplicador*100)/100;
        crashMultiplicadorEl.textContent = `Multiplicador: ${multiplicador}x`;

        if(multiplicador >= crashPoint) {
            clearInterval(interval);
            crashed = true;
            crashCashoutBtn.disabled = true;
            crashResultadoEl.textContent = `💥 Crash! Você perdeu ${aposta} coins.`;

            // Flash vermelho
            crashMultiplicadorEl.classList.remove("win");
            crashMultiplicadorEl.classList.add("lose");

            adicionarAposta(user.uid, aposta, "Perdeu Crash");
        }
    }, 50);
});

crashCashoutBtn.addEventListener("click", async () => {
    if(crashed) return;
    clearInterval(interval);
    const user = auth.currentUser;
    const premio = Math.round(aposta * multiplicador);
    userSaldo += premio;
    await atualizarSaldo(user.uid, userSaldo);
    crashResultadoEl.textContent = `🎉 Você sacou a ${multiplicador}x e ganhou ${premio} coins!`;

    // Flash verde
    crashMultiplicadorEl.classList.remove("lose");
    crashMultiplicadorEl.classList.add("win");

    crashCashoutBtn.disabled = true;
    await adicionarAposta(user.uid, aposta, `Ganhou Crash x${multiplicador.toFixed(2)}`);
});

import { adicionarHistorico } from "./ui.js";

document.querySelectorAll(".spin-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const aposta = parseInt(btn.dataset.aposta);

        if (!gastarSaldo(aposta)) return;

        const ganhou = Math.random() < 0.4;
        const resultado = document.getElementById("slot-resultado");

        if (ganhou) {
            const premio = aposta * 2;
            addSaldo(premio);
            resultado.innerText = `🎉 Ganhou ${premio} coins!`;
            adicionarHistorico("Slot", aposta, `Ganhou ${premio}`);
        } else {
            resultado.innerText = "❌ Perdeu!";
            adicionarHistorico("Slot", aposta, "Perdeu");
        }
    });
});



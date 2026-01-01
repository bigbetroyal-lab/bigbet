import { gastarSaldo, addSaldo, atualizarRanking, adicionarHistorico } from "./ui.js";

const symbols = ["🍒","🍋","🍉","🍇","🍊","7️⃣","💎"];
const reels = document.querySelectorAll(".reel-col");
const resultadoEl = document.getElementById("slot-resultado");
const jackpotEl = document.getElementById("jackpot");

let jackpot = parseInt(jackpotEl.innerText);

// 9 linhas de pagamento (indices das linhas de cada reel)
const paylines = [
    [0,0,0,0,0], // superior
    [1,1,1,1,1], // meio
    [2,2,2,2,2], // inferior
    [0,1,2,1,0], // zig-zag superior
    [2,1,0,1,2], // zig-zag inferior
    [0,0,1,0,0], 
    [2,2,1,2,2],
    [0,1,1,1,0],
    [2,1,1,1,2]
];

document.querySelectorAll(".spin-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const aposta = parseInt(btn.dataset.aposta);
        if (!gastarSaldo(aposta)) return;

        resultadoEl.innerText = "";

        jackpot += Math.floor(aposta * 0.05);
        jackpotEl.innerText = jackpot;

        const finalSymbols = [];

        // Gira cada reel
        for (let i=0; i<reels.length; i++){
            const reel = reels[i];
            const symbolsInReel = reel.querySelectorAll(".reel-symbol");
            const spins = 15 + i*5;

            for (let s=0; s<spins; s++){
                symbolsInReel.forEach(el => el.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
                await new Promise(r=>setTimeout(r,50));
            }

            finalSymbols.push([...symbolsInReel].map(el => el.innerText));
        }

        // Verifica linhas vencedoras
        let jackpotGanhou = false;
        let ganhou = false;

        for (const line of paylines){
            const lineSymbols = line.map((row,i) => finalSymbols[i][row]);

            if (lineSymbols.every(s => s==="7️⃣")){
                jackpotGanhou = true;
                break;
            }

            const first = lineSymbols[0];
            if (lineSymbols.filter(s=>s===first).length>=3 && first!=="7️⃣"){
                ganhou = true;
            }
        }

        if (jackpotGanhou){
            addSaldo(jackpot);
            resultadoEl.innerText = `🎉 JACKPOT! Ganhou ${jackpot} coins!`;
            adicionarHistorico("Slot", aposta, `Jackpot ${jackpot}`);
            jackpot = 1000;
            jackpotEl.innerText = jackpot;
        } else if (ganhou){
            const premio = aposta*2;
            addSaldo(premio);
            resultadoEl.innerText = `🎉 Ganhou ${premio} coins!`;
            adicionarHistorico("Slot", aposta, `Ganhou ${premio}`);
        } else {
            resultadoEl.innerText = "❌ Perdeu!";
            adicionarHistorico("Slot", aposta, "Perdeu");
        }

        atualizarRanking();
    });
});

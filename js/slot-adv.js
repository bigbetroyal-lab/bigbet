// ===== SLOT MACHINE AVANÇADA =====
const symbols = ["🍒","🍋","🍉","🍊","7️⃣"];
const reels = document.querySelectorAll('#slot-machine-adv .reel');
const spinBtn = document.getElementById('slot-spin-adv');
const betInput = document.getElementById('slot-bet-adv');
const resultText = document.getElementById('slot-result-adv');
const jackpotText = document.getElementById('slot-jackpot-adv');

let jackpot = 1000;

// Inicializa reels
reels.forEach(reel => {
    for(let i=0;i<symbols.length;i++){
        const sym = document.createElement('div');
        sym.classList.add('symbol');
        sym.textContent = symbols[i];
        reel.appendChild(sym);
    }
});

function spinReel(reel) {
    return new Promise(resolve=>{
        let times = 20 + Math.floor(Math.random()*10);
        let count = 0;
        const interval = setInterval(()=>{
            reel.appendChild(reel.firstElementChild); // rotaciona símbolos
            count++;
            if(count>=times){
                clearInterval(interval);
                resolve(reel.children[0].textContent); // símbolo central
            }
        }, 100);
    });
}

spinBtn.addEventListener('click', async()=>{
    const bet = parseInt(betInput.value);
    if(bet<=0) return;
    resultText.textContent = "Girando...";
    
    const finalSymbols = [];
    for(let i=0;i<reels.length;i++){
        const sym = await spinReel(reels[i]);
        finalSymbols.push(sym);
    }

    // Verifica jackpot (5 setes)
    const isJackpot = finalSymbols.every(s=>s==="7️⃣");
    if(isJackpot){
        resultText.textContent = `🎉 JACKPOT! Ganhou ${jackpot} coins!`;
        jackpot = 1000; // reset
    } else {
        resultText.textContent = `Resultado: ${finalSymbols.join(' | ')} | Perdeu ${bet} coins`;
        jackpot += bet; // acumula jackpot
    }
    jackpotText.textContent = `Jackpot: ${jackpot} coins`;
});

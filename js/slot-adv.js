// ===== SLOT MACHINE AVANÇADA =====
const symbols = [
  '/assets/symbols/cherry.png',
  '/assets/symbols/lemon.png',
  '/assets/symbols/watermelon.png',
  '/assets/symbols/orange.png',
  '/assets/symbols/seven.png'
];

const reels = document.querySelectorAll('#slot-machine-adv .reel');
const spinBtn = document.getElementById('slot-spin-adv');
const betInput = document.getElementById('slot-bet-adv');
const resultText = document.getElementById('slot-result-adv');
const jackpotText = document.getElementById('slot-jackpot-adv');

let jackpot = 1000;

// Inicializa reels com imagens
reels.forEach(reel => {
    reel.innerHTML = '';
    for(let i=0;i<symbols.length;i++){
        const sym = document.createElement('img');
        sym.classList.add('symbol');
        sym.src = symbols[i];
        reel.appendChild(sym);
    }
});

// Função de girar um reel
function spinReel(reel) {
    return new Promise(resolve=>{
        let times = 20 + Math.floor(Math.random()*10);
        let count = 0;
        const interval = setInterval(()=>{
            reel.appendChild(reel.firstElementChild);
            count++;
            if(count>=times){
                clearInterval(interval);
                resolve(reel.children[0].src);
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

    // Verifica jackpot
    const isJackpot = finalSymbols.every(s => s.includes('seven.png'));
    if(isJackpot){
        resultText.textContent = `🎉 JACKPOT! Ganhou ${jackpot} coins!`;
        jackpot = 1000;
    } else {
        resultText.textContent = `Resultado: ${finalSymbols.map(f=>f.split('/').pop().replace('.png','')).join(' | ')} | Perdeu ${bet} coins`;
        jackpot += bet;
    }
    jackpotText.textContent = `Jackpot: ${jackpot} coins`;
});

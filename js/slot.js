// ===== SLOT MACHINE =====
const slotReels = document.querySelectorAll('.reel');
const slotSpinBtn = document.getElementById('slot-spin');
const slotBetInput = document.getElementById('slot-bet');
const slotResult = document.getElementById('slot-result');
const slotJackpot = document.getElementById('slot-jackpot');

let jackpot = 1000;

slotSpinBtn.addEventListener('click', () => {
    const bet = parseInt(slotBetInput.value);
    if (bet <= 0) return;

    slotResult.textContent = "Girando...";
    
    let finalSymbols = [];

    slotReels.forEach((reel, i) => {
        const symbols = [...reel.children];
        const randIndex = Math.floor(Math.random() * symbols.length);
        const chosenSymbol = symbols[randIndex].textContent;
        finalSymbols.push(chosenSymbol);
    });

    // animação simples de delay
    let delay = 0;
    slotReels.forEach((reel, i) => {
        setTimeout(() => {
            reel.scrollTop = 0; // reset
            [...reel.children].forEach(sym => sym.style.background="none");
            reel.children[0].textContent = finalSymbols[i];
        }, delay);
        delay += 200;
    });

    setTimeout(() => {
        const isJackpot = finalSymbols.every(s => s === "7️⃣");
        if (isJackpot) {
            slotResult.textContent = `🎉 JACKPOT! Ganhou ${jackpot} coins!`;
            jackpot = 1000; // reset
        } else {
            slotResult.textContent = `Resultado: ${finalSymbols.join(' | ')} | Perdeu ${bet} coins`;
            jackpot += bet; // aumenta jackpot
        }
        slotJackpot.textContent = `Jackpot: ${jackpot} coins`;
    }, 1200);
});

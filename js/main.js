let saldo = 1000;
const saldoEl = document.getElementById('saldo');

function updateSaldo(value) {
  saldo += value;
  saldoEl.textContent = saldo;
}

// Slot Machine
function spinSlot() {
  const emojis = ['🍒', '🍋', '🍊', '💎', '7️⃣'];
  const slot = document.getElementById('slot-display');
  let result = [];
  for (let i = 0; i < 3; i++) {
    result.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }
  slot.textContent = result.join('');
  // Vitória simples
  if (new Set(result).size === 1) {
    alert('Parabéns! Você ganhou 100 🪙');
    updateSaldo(100);
  } else {
    updateSaldo(-10);
  }
}

// Dice
function rollDice() {
  const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const dice = document.getElementById('dice-display');
  const roll = diceFaces[Math.floor(Math.random() * diceFaces.length)];
  dice.textContent = roll;
  // Exemplo simples: se sair ⚅ ganha 50
  if (roll === '⚅') {
    alert('Você ganhou 50 🪙');
    updateSaldo(50);
  } else {
    updateSaldo(-5);
  }
}

let saldo = 1000;
const saldoEl = document.getElementById('saldo');

// POPUP
function showPopup(msg) {
  document.getElementById('popup-msg').textContent = msg;
  document.getElementById('popup').classList.remove('hidden');
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
}

// Atualizar saldo
function updateSaldo(value) {
  saldo += value;
  saldoEl.textContent = saldo;
}

// SLOT MACHINE
function spinSlot() {
  const emojis = ['🍒', '🍋', '🍊', '💎', '7️⃣'];
  let result = [];
  for (let i = 0; i < 3; i++) {
    result.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }
  document.getElementById('slot-display').textContent = result.join('');
  if (new Set(result).size === 1) {
    updateSaldo(100);
    showPopup(`Parabéns! Você ganhou 100 🪙`);
  } else {
    updateSaldo(-10);
  }
}

// DICE
function rollDice() {
  const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const roll = diceFaces[Math.floor(Math.random() * diceFaces.length)];
  document.getElementById('dice-display').textContent = roll;
  if (roll === '⚅') {
    updateSaldo(50);
    showPopup('Você ganhou 50 🪙');
  } else {
    updateSaldo(-5);
  }
}

// ROULETTE
function spinRoulette() {
  const numbers = Array.from({length: 36}, (_, i) => i + 1);
  const roll = numbers[Math.floor(Math.random() * numbers.length)];
  document.getElementById('roulette-display').textContent = roll;
  if (roll === 7 || roll === 21) {
    updateSaldo(200);
    showPopup('Parabéns! Você ganhou 200 🪙');
  } else {
    updateSaldo(-20);
  }
}

// MENU LATERAL TOGGLE
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-64');
});

// Preencher data de criação da conta automaticamente
const dataCriacaoInput = document.getElementById('data_criacao');
const today = new Date();
dataCriacaoInput.value = today.toLocaleDateString('pt-PT');

// Captura do formulário
const registroForm = document.getElementById('registro-form');

registroForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita reload da página

  // Pega os valores
  const usuario = registroForm.username.value;
  const nome = registroForm.nome.value;
  const apelido = registroForm.apelido.value;
  const genero = registroForm.genero.value;
  const dataNascimento = registroForm.data_nascimento.value;
  const email = registroForm.email.value;
  const telemovel = registroForm.telemovel.value;
  const dataCriacao = registroForm.data_criacao.value;

  // Aqui você poderia salvar em Firebase ou localStorage
  console.log({
    usuario, nome, apelido, genero, dataNascimento, email, telemovel, dataCriacao
  });

  alert(`Conta criada com sucesso!\nBem-vindo(a), ${usuario}!`);

  registroForm.reset();
  dataCriacaoInput.value = today.toLocaleDateString('pt-PT');
});


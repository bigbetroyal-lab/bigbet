// ===============================
// ESTADO GLOBAL DO USUÁRIO
// ===============================
const USER_KEY = "bb_user";
const SALDO_KEY = "bb_saldo";

// ===============================
// SALDO (COINS)
// ===============================
export function getSaldo() {
    return parseInt(localStorage.getItem(SALDO_KEY) || "0");
}

export function setSaldo(valor) {
    localStorage.setItem(SALDO_KEY, valor);
    atualizarTopo();
}

export function addSaldo(valor) {
    setSaldo(getSaldo() + valor);
}

export function gastarSaldo(valor) {
    let saldo = getSaldo();
    if (saldo < valor) {
        alert("❌ Saldo insuficiente");
        return false;
    }
    setSaldo(saldo - valor);
    return true;
}

// ===============================
// USUÁRIO
// ===============================
export function getUser() {
    return JSON.parse(localStorage.getItem(USER_KEY));
}

export function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ===============================
// UI
// ===============================
export function atualizarTopo() {
    const saldoEl = document.getElementById("top-saldo");
    if (saldoEl) {
        saldoEl.innerText = `Saldo: ${getSaldo()} coins`;
    }
}

// ===============================
// MOSTRAR / ESCONDER TELAS
// ===============================
function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.add("hidden"));
    const tela = document.getElementById(id);
    if (tela) tela.classList.remove("hidden");
}

// ===============================
// MENU LATERAL
// ===============================
document.querySelectorAll("aside button").forEach(btn => {
    btn.addEventListener("click", () => {
        const tela = btn.dataset.tela;
        mostrarTela(tela);
    });
});

// ===============================
// LOGOUT
// ===============================
document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
});

// ===============================
// LOGIN / REGISTRO FAKE
// ===============================
document.getElementById("btn-registrar").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nickname = document.getElementById("nickname").value || "Jogador";

    if (!email || !senha) {
        alert("Preencha email e senha");
        return;
    }

    setUser({ email, nickname });
    setSaldo(1000); // saldo inicial
    iniciarSessao();
});

document.getElementById("btn-login").addEventListener("click", () => {
    const user = getUser();
    if (!user) {
        alert("Usuário não encontrado. Registre-se.");
        return;
    }
    iniciarSessao();
});

// ===============================
// INICIAR SESSÃO
// ===============================
function iniciarSessao() {
    document.getElementById("auth-container").classList.add("hidden");
    mostrarTela("slot");
    atualizarTopo();

    // Atualizar perfil
    const nickEl = document.getElementById("perfil-nickname");
    if (nickEl) nickEl.innerText = getUser().nickname;
}

// ===============================
// AUTO LOGIN
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    if (getUser()) {
        iniciarSessao();
    }
});

// ===============================
// HISTÓRICO DE APOSTAS
// ===============================
const HIST_KEY = "bb_historico";

export function adicionarHistorico(jogo, valor, resultado) {
    let hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    hist.push({
        jogo,
        valor,
        resultado,
        date: new Date().toLocaleString()
    });
    localStorage.setItem(HIST_KEY, JSON.stringify(hist));
    atualizarHistorico();
}

export function getHistorico() {
    return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
}

export function atualizarHistorico(filter = "all") {
    const ul = document.getElementById("historico-list");
    if (!ul) return;

    let hist = getHistorico();
    if (filter !== "all") {
        hist = hist.filter(h => h.jogo === filter);
    }

    ul.innerHTML = hist.map(h => `
        <li class="mb-1 border-b border-gray-700 py-1">
            ${h.date} — ${h.jogo} — ${h.valor} coins — ${h.resultado}
        </li>
    `).join("");
}

// ===============================
// FILTRO DE HISTÓRICO
// ===============================
document.querySelectorAll('#historico button[data-filter]').forEach(btn => {
    btn.addEventListener("click", () => {
        atualizarHistorico(btn.dataset.filter);
    });
});

// ===============================
// RANKING SIMULADO
// ===============================
const RANK_KEY = "bb_ranking";

export function atualizarRanking() {
    const tbody = document.querySelector("#ranking-table tbody");
    if (!tbody) return;

    // Pegando todos usuários salvos (simulado: só localStorage)
    let ranking = JSON.parse(localStorage.getItem(RANK_KEY) || "[]");

    // Atualiza ou adiciona usuário atual
    const user = getUser();
    if (user) {
        const idx = ranking.findIndex(u => u.email === user.email);
        if (idx >= 0) {
            ranking[idx].saldo = getSaldo();
        } else {
            ranking.push({ nickname: user.nickname, email: user.email, saldo: getSaldo() });
        }
        // Ordena por saldo
        ranking.sort((a,b) => b.saldo - a.saldo);
        localStorage.setItem(RANK_KEY, JSON.stringify(ranking));
    }

    // Preenche tabela
    tbody.innerHTML = ranking.map((u, i) => `
        <tr class="border-b border-gray-700">
            <td class="px-2 py-1">${i+1}</td>
            <td class="px-2 py-1">${u.nickname}</td>
            <td class="px-2 py-1">${u.saldo}</td>
        </tr>
    `).join("");
}

// Atualiza ranking automaticamente ao mudar de saldo
window.addEventListener("DOMContentLoaded", atualizarRanking);



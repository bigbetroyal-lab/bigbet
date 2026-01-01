import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Cria documento do usuário se não existir
export async function criarDocumentoUsuario(uid) {
    await setDoc(doc(db, "users", uid), { saldo: 1000 });
}

// Carrega saldo e mostra no topo
export async function carregarSaldo(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    let saldo = 1000;
    if (docSnap.exists()) saldo = docSnap.data().saldo;
    else await criarDocumentoUsuario(uid);
    document.getElementById("top-saldo").textContent = `Saldo: ${saldo} coins`;
    return saldo;
}

// Atualiza saldo
export async function atualizarSaldo(uid, novoSaldo) {
    await updateDoc(doc(db, "users", uid), { saldo: novoSaldo });
    document.getElementById("top-saldo").textContent = `Saldo: ${novoSaldo} coins`;
}

// Histórico
export async function carregarHistoricoFiltrado(uid, tipo="all"){
    const historicoEl = document.getElementById("historico");
    historicoEl.innerHTML = "";
    const q = query(collection(db, "users", uid, "historico"), orderBy("data","desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc=>{
        const data = doc.data();
        if(tipo==="all" || data.resultado.toLowerCase().includes(tipo)){
            const li = document.createElement("li");
            li.textContent = `${new Date(data.data.seconds*1000).toLocaleString()} - Aposta: ${data.valor} coins - ${data.resultado}`;
            historicoEl.appendChild(li);
        }
    });
}


// Adiciona aposta ao histórico
export async function adicionarAposta(uid, valor, resultado) {
    await addDoc(collection(db, "users", uid, "historico"), {
        valor: valor,
        resultado: resultado,
        data: new Date()
    });
}


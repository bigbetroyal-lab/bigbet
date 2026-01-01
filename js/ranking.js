import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const tabelaRanking = document.querySelector("#ranking-table tbody");

export async function carregarRanking() {
    tabelaRanking.innerHTML = "";
    const q = query(collection(db, "users"), orderBy("saldo", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    let i = 1;
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${i}</td><td>${data.nickname || doc.id}</td><td>${data.saldo}</td>`;
        tabelaRanking.appendChild(tr);
        i++;
    });
}

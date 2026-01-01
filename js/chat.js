import { auth, db } from "./firebase.js";
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const chatInput = document.getElementById("chat-input");
const chatEnviar = document.getElementById("chat-enviar");
const chatMensagens = document.getElementById("chat-mensagens");

chatEnviar.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return alert("Você precisa estar logado!");

    const msg = chatInput.value.trim();
    if(msg === "") return;

    await addDoc(collection(db, "chat"), {
        user: user.uid,
        msg: msg,
        data: new Date()
    });
    chatInput.value = "";
});

// Atualizar mensagens em tempo real
const q = query(collection(db, "chat"), orderBy("data", "asc"));
onSnapshot(q, (snapshot) => {
    chatMensagens.innerHTML = "";
    snapshot.forEach(doc => {
        const m = doc.data();
        const div = document.createElement("div");
        div.textContent = `${m.user}: ${m.msg}`;
        chatMensagens.appendChild(div);
        chatMensagens.scrollTop = chatMensagens.scrollHeight;
    });
});


import { db } from "./firebase.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

async function criarUsuario(uid, email, nickname) {
    await setDoc(doc(db, "users", uid), {
        saldo: 1000,
        nickname: nickname || email.split("@")[0] // padrão
    });
}

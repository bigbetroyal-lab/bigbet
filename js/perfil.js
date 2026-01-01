import { auth, db } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const avatarSelect = document.getElementById("perfil-avatar-select");
const avatarImg = document.getElementById("perfil-avatar");

avatarSelect.addEventListener("change", async () => {
    const user = auth.currentUser;
    if(!user) return;

    const newAvatar = avatarSelect.value;
    avatarImg.src = newAvatar;
    await updateDoc(doc(db, "users", user.uid), { avatar: newAvatar });
});

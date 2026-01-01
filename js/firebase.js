import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDw0_MsxvRvVhsgSWvzMrVX3sTlmG2ALcg",
    authDomain: "bigbetroyal-c1fb5.firebaseapp.com",
    projectId: "bigbetroyal-c1fb5",
    storageBucket: "bigbetroyal-c1fb5.firebasestorage.app",
    messagingSenderId: "16493079216",
    appId: "1:16493079216:web:ee35f501c6b6bb36376975"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


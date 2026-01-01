// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnE4sbXjAKKyqizshaKyNkrdMOivsovwY",
  authDomain: "bigbet-b2221.firebaseapp.com",
  projectId: "bigbet-b2221",
  storageBucket: "bigbet-b2221.firebasestorage.app",
  messagingSenderId: "27476673960",
  appId: "1:27476673960:web:87758ce396e081465cc99d",
  measurementId: "G-JS7LRED6KS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

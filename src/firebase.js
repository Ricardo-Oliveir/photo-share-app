import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Adicionado para fotos

const firebaseConfig = {
  apiKey: "AIzaSyCpIr701a1NP45dIxA5SnM0kXu80IuDPto",
  authDomain: "photoshare-app-5e641.firebaseapp.com",
  projectId: "photoshare-app-5e641",
  storageBucket: "photoshare-app-5e641.firebasestorage.app",
  messagingSenderId: "316575400139",
  appId: "1:316575400139:web:d705d7bddbdcdc45b19b4e"
};

const app = initializeApp(firebaseConfig);

// Exportações corretas
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Agora as fotos vão carregar
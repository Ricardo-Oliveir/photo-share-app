
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpIr701a1NP45dIxA5SnM0kXu80IuDPto",
  authDomain: "photoshare-app-5e641.firebaseapp.com",
  projectId: "photoshare-app-5e641",
  // Observação: o domínio do storage normalmente é '...appspot.com'
  storageBucket: "photoshare-app-5e641.firebasestorage.app",
  messagingSenderId: "316575400139",
  appId: "1:316575400139:web:d705d7bddbdcdc45b19b4e",
  measurementId: "G-27JXLH0X0Q"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore e Storage para uso no app
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export default caso algum arquivo importe o app diretamente
export default app;
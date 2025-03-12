import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBkGvz8XzLQaWO8vRJMyFJXJJIvw46XUlg',
  authDomain: 'banco-jk.firebaseapp.com',
  projectId: 'banco-jk',
  storageBucket: 'banco-jk.firebasestorage.app',
  messagingSenderId: '670674815227',
  appId: '1:670674815227:android:9c95a4311dc9a5f738885e',
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

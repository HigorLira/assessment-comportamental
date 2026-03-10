// ══════════════════════════════════════════════════════════════════
// FIREBASE — Configuração, Autenticação e Banco de Dados
// ══════════════════════════════════════════════════════════════════
//
//  COMO CONFIGURAR:
//  1. Acesse https://console.firebase.google.com
//  2. Crie um projeto
//  3. Vá em Project Settings → Your apps → Web (</>)
//  4. Copie as credenciais e cole abaixo
//  5. Ative Authentication → Email/Password
//  6. Ative Firestore Database (modo teste)
//
// ══════════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// ┌─────────────────────────────────────────────────┐
// │  COLE SUAS CREDENCIAIS DO FIREBASE AQUI         │
// └─────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey: "AIzaSyAauBYDkZDJx5L9XJVblMseTBp6hQIj2Z0",
  authDomain: "assessment-comportamental.firebaseapp.com",
  projectId: "assessment-comportamental",
  storageBucket: "assessment-comportamental.firebasestorage.app",
  messagingSenderId: "316178954689",
  appId: "1:316178954689:web:ddf59e8d515013b03f9740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestore = getFirestore(app);

// ══════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ══════════════════════════════════════════════════════════════════

export const authHelper = {
  // Login com email e senha
  login: (email, password) => signInWithEmailAndPassword(auth, email, password),

  // Criar conta
  register: (email, password) => createUserWithEmailAndPassword(auth, email, password),

  // Logout
  logout: () => signOut(auth),

  // Observer de estado de auth
  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
};

// ══════════════════════════════════════════════════════════════════
// FIRESTORE HELPERS
// ══════════════════════════════════════════════════════════════════
//
// Collection: "assessments"
// Cada documento tem o ID único do assessment (8 chars)
// Campo `ownerId` = UID do admin que criou (para filtrar por dono)
//

export const db = {
  // Buscar assessment por ID (qualquer pessoa — colaborador usa isso)
  async get(id) {
    try {
      const snap = await getDoc(doc(firestore, "assessments", id));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.error("db.get:", e);
      return null;
    }
  },

  // Salvar/atualizar assessment
  async set(id, data) {
    try {
      await setDoc(doc(firestore, "assessments", id), data);
      return true;
    } catch (e) {
      console.error("db.set:", e);
      return false;
    }
  },

  // Deletar assessment
  async del(id) {
    try {
      await deleteDoc(doc(firestore, "assessments", id));
      return true;
    } catch (e) {
      console.error("db.del:", e);
      return false;
    }
  },

  // Listar assessments do admin logado (filtrado por ownerId)
  async listByOwner(ownerId) {
    try {
      const q = query(
        collection(firestore, "assessments"),
        where("ownerId", "==", ownerId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (e) {
      console.error("db.listByOwner:", e);
      return [];
    }
  },
};

// ══════════════════════════════════════════════════════════════════
// FIREBASE — Configuração, Auth, Firestore + Gestão de Usuários
// ══════════════════════════════════════════════════════════════════
//
//  COLLECTIONS:
//    "assessments"  — os assessments (campo ownerId = quem criou)
//    "users"        — cadastro de usuários (role: master | admin)
//
//  O primeiro usuário que se registrar vira MASTER automaticamente.
//  O master pode cadastrar outros usuários (admins).
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
  updateDoc,
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const fs = getFirestore(app);

// ══════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════

export const authHelper = {
  login: (email, password) => signInWithEmailAndPassword(auth, email, password),
  register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  logout: () => signOut(auth),
  onAuthChange: (cb) => onAuthStateChanged(auth, cb),
};

// ══════════════════════════════════════════════════════════════════
// ASSESSMENTS
// ══════════════════════════════════════════════════════════════════

export const db = {
  async get(id) {
    try { const s = await getDoc(doc(fs, "assessments", id)); return s.exists() ? s.data() : null; }
    catch (e) { console.error("db.get:", e); return null; }
  },

  async set(id, data) {
    try { await setDoc(doc(fs, "assessments", id), data); return true; }
    catch (e) { console.error("db.set:", e); return false; }
  },

  async del(id) {
    try { await deleteDoc(doc(fs, "assessments", id)); return true; }
    catch (e) { console.error("db.del:", e); return false; }
  },

  // List by owner
  async listByOwner(ownerId) {
    try {
      const q = query(collection(fs, "assessments"), where("ownerId", "==", ownerId), orderBy("createdAt", "desc"));
      return (await getDocs(q)).docs.map(d => d.data());
    } catch (e) { console.error("db.listByOwner:", e); return []; }
  },

  // List ALL assessments (master only)
  async listAll() {
    try {
      const q = query(collection(fs, "assessments"), orderBy("createdAt", "desc"));
      return (await getDocs(q)).docs.map(d => d.data());
    } catch (e) { console.error("db.listAll:", e); return []; }
  },
};

// ══════════════════════════════════════════════════════════════════
// USERS COLLECTION
// ══════════════════════════════════════════════════════════════════
//
// Doc ID = Firebase Auth UID
// Fields: { uid, email, name, role ("master"|"admin"), active, createdAt }
//

export const usersDb = {
  async get(uid) {
    try { const s = await getDoc(doc(fs, "users", uid)); return s.exists() ? s.data() : null; }
    catch (e) { return null; }
  },

  async set(uid, data) {
    try { await setDoc(doc(fs, "users", uid), data); return true; }
    catch (e) { console.error("usersDb.set:", e); return false; }
  },

  async update(uid, data) {
    try { await updateDoc(doc(fs, "users", uid), data); return true; }
    catch (e) { console.error("usersDb.update:", e); return false; }
  },

  async del(uid) {
    try { await deleteDoc(doc(fs, "users", uid)); return true; }
    catch (e) { return false; }
  },

  async listAll() {
    try {
      const snap = await getDocs(collection(fs, "users"));
      return snap.docs.map(d => d.data());
    } catch (e) { console.error("usersDb.listAll:", e); return []; }
  },

  // Check if any user exists (to determine if first user = master)
  async hasAnyUser() {
    try {
      const snap = await getDocs(collection(fs, "users"));
      return snap.size > 0;
    } catch (e) { return false; }
  },
};

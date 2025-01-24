// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBIyzx4HUMRXjHvGa1oATwDpW-SFvqbRxQ",
  authDomain: "prepeconomics-4247f.firebaseapp.com",
  projectId: "prepeconomics-4247f",
  storageBucket: "prepeconomics-4247f.firebasestorage.app",
  messagingSenderId: "100451430727",
  appId: "1:100451430727:web:3a61a1b8d74c9dd256dc62",
  measurementId: "G-ETJBWYBZG5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

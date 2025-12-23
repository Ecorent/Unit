// public/js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxeT7J01HowUGiIG-pXie7zb-wgyZkTNk",
  authDomain: "ecorent-203b2.firebaseapp.com",
  projectId: "ecorent-203b2",
  storageBucket: "ecorent-203b2.firebasestorage.app",
  messagingSenderId: "625041370128",
  appId: "1:625041370128:web:66e147a192304c84d72e95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

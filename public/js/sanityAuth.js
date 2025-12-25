import { auth, db } from "/js/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(async () => {
  await signOut(auth);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists() || snap.data().role !== "admin") {
      await signOut(auth);
      window.location.href = "/index.html";
    }
  });
})();

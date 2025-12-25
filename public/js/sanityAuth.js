import { auth, db } from "/js/firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Must be opened from admin login
if (!sessionStorage.getItem("sanityLogin")) {
  window.location.href = "/login.html";
}

const expectedAdminUid = localStorage.getItem("sanityAdminUid");

onAuthStateChanged(auth, async (user) => {
  // 🔴 Not logged in
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  // 🔴 Different admin logged in elsewhere
  if (user.uid !== expectedAdminUid) {
    await signOut(auth);
    window.location.href = "/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "/index.html";
    return;
  }

  // Lock entry token
  sessionStorage.removeItem("sanityLogin");
});

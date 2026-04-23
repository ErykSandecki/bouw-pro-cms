import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/migrate-phases.mjs <email> <password>");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: "AIzaSyA00NttEzoNHqbtlPeh1yGIur5eU4eDsMo",
  authDomain: "bouw-pro-94db2.firebaseapp.com",
  projectId: "bouw-pro-94db2",
  storageBucket: "bouw-pro-94db2.firebasestorage.app",
  messagingSenderId: "978865228058",
  appId: "1:978865228058:web:3bf90c55c0b126381a44a3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const KEY_MAP = {
  Preparation: "preparation",
  "Build Phase": "buildPhase",
  Finishing: "finishing",
};
const OLD_KEYS = Object.keys(KEY_MAP);

async function migrate() {
  console.log(`Signing in as ${email}…`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("Authenticated.\n");

  const snap = await getDocs(collection(db, "projects"));
  console.log(`Found ${snap.size} project(s).`);

  let updated = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const phases = docSnap.data().phases ?? {};
    const hasOldKeys = OLD_KEYS.some((k) => k in phases);

    if (!hasOldKeys) {
      skipped++;
      continue;
    }

    const patch = {};
    for (const oldKey of OLD_KEYS) {
      if (oldKey in phases) {
        patch[`phases.${KEY_MAP[oldKey]}`] = phases[oldKey];
        patch[`phases.${oldKey}`] = deleteField();
      }
    }

    await updateDoc(doc(db, "projects", docSnap.id), patch);
    console.log(`  ✓ ${docSnap.id}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, already correct: ${skipped}.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

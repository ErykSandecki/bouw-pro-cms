import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/migrate-storage-phases.mjs <email> <password>");
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
const storage = getStorage(app);

const OLD_TO_NEW = {
  Preparation: "preparation",
  "Build Phase": "buildPhase",
  Finishing: "finishing",
};

// Extract storage path from a download URL
function storagePath(url) {
  return decodeURIComponent(url.split("/o/")[1].split("?")[0]);
}

async function copyFile(oldRef, newPath) {
  const url = await getDownloadURL(oldRef);
  const res = await fetch(url);
  const bytes = await res.arrayBuffer();
  const newRef = ref(storage, newPath);
  await uploadBytes(newRef, bytes, { contentType: res.headers.get("content-type") ?? "image/jpeg" });
  return getDownloadURL(newRef);
}

async function migrate() {
  console.log(`Signing in as ${email}…`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("Authenticated.\n");

  const snap = await getDocs(collection(db, "projects"));
  console.log(`Found ${snap.size} project(s).\n`);

  let totalFiles = 0;
  let totalSkipped = 0;

  for (const docSnap of snap.docs) {
    const projectId = docSnap.id;
    const data = docSnap.data();
    const phases = data.phases ?? {};
    const firestoreUpdates = {};
    let projectMoved = 0;

    for (const [oldFolder, newFolder] of Object.entries(OLD_TO_NEW)) {
      const oldFolderRef = ref(storage, `projects/${projectId}/phases/${oldFolder}`);

      let items;
      try {
        const list = await listAll(oldFolderRef);
        items = list.items;
      } catch {
        // Folder doesn't exist — skip
        continue;
      }

      if (items.length === 0) continue;

      const newUrls = [];
      for (const fileRef of items) {
        const filename = fileRef.name;
        const newPath = `projects/${projectId}/phases/${newFolder}/${filename}`;
        console.log(`  [${projectId.slice(0, 8)}] ${oldFolder}/${filename} → ${newFolder}/${filename}`);
        const newUrl = await copyFile(fileRef, newPath);
        newUrls.push(newUrl);
        totalFiles++;
      }

      // Replace the URL array for this phase in Firestore with the new URLs
      firestoreUpdates[`phases.${newFolder}`] = newUrls;
      projectMoved += items.length;
    }

    if (Object.keys(firestoreUpdates).length > 0) {
      await updateDoc(doc(db, "projects", projectId), firestoreUpdates);

      // Delete old files after Firestore is updated
      for (const oldFolder of Object.keys(OLD_TO_NEW)) {
        const oldFolderRef = ref(storage, `projects/${projectId}/phases/${oldFolder}`);
        let items;
        try {
          const list = await listAll(oldFolderRef);
          items = list.items;
        } catch {
          continue;
        }
        for (const fileRef of items) {
          await deleteObject(fileRef);
        }
      }

      console.log(`  ✓ ${projectId} — moved ${projectMoved} file(s)\n`);
    } else {
      totalSkipped++;
    }
  }

  console.log(`Done. Files moved: ${totalFiles}, projects skipped (no old-path files): ${totalSkipped}.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

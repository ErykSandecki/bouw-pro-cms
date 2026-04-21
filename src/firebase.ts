import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA00NttEzoNHqbtlPeh1yGIur5eU4eDsMo",
  authDomain: "bouw-pro-94db2.firebaseapp.com",
  projectId: "bouw-pro-94db2",
  storageBucket: "bouw-pro-94db2.firebasestorage.app",
  messagingSenderId: "978865228058",
  appId: "1:978865228058:web:3bf90c55c0b126381a44a3",
  measurementId: "G-H6BTT14WQF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

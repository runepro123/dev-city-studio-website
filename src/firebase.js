// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh8AZSomp5RJBPBHrWPKRggbEvtbCInQc",
  authDomain: "todo-e0cee.firebaseapp.com",
  projectId: "todo-e0cee",
  storageBucket: "todo-e0cee.appspot.com",
  messagingSenderId: "535629905095",
  appId: "1:535629905095:web:4b3a0125439c0a381e12e2",
  measurementId: "G-ZTK2VMZSWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtF1Npm9bDgLdLzmmhOTcFQuB8YParqsM",
  authDomain: "sell-everything-fdd5f.firebaseapp.com",
  projectId: "sell-everything-fdd5f",
  storageBucket: "sell-everything-fdd5f.firebasestorage.app",
  messagingSenderId: "275877885616",
  appId: "1:275877885616:web:9156b77fbe802f011aad75"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export default app;

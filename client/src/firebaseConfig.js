import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "study-quiz-91c5c.firebaseapp.com",
  projectId: "study-quiz-91c5c",
  storageBucket: "study-quiz-91c5c.appspot.com",
  messagingSenderId: "502214752525",
  appId: "1:502214752525:web:db6c598188bc92f3bd1844"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, googleProvider, storage, signInWithPopup, createUserWithEmailAndPassword };

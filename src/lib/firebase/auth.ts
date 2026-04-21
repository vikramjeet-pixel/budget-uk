import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./client";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const signInWithEmail = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const sendPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

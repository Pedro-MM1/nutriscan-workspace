import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC9aNuLn_oW6xc2w23CsLfTlzubJe2a_dI",
    authDomain: "nutriscan-fitness.firebaseapp.com",
    projectId: "nutriscan-fitness",
    storageBucket: "nutriscan-fitness.firebasestorage.app",
    messagingSenderId: "54694658348",
    appId: "1:54694658348:web:4aad770efd9c622a77ec89",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

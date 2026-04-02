import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: "AIzaSyC9aNuLn_oW6xc2w23CsLfTlzubJe2a_dI",
    authDomain: "nutriscan-fitness.firebaseapp.com",
    projectId: "nutriscan-fitness",
    storageBucket: "nutriscan-fitness.firebasestorage.app",
    messagingSenderId: "54694658348",
    appId: "1:54694658348:web:4aad770efd9c622a77ec89",
};

const alreadyInitialized = getApps().length > 0;
export const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

const persistence = Platform.OS === "web"
    ? browserLocalPersistence
    : getReactNativePersistence(ReactNativeAsyncStorage);

export const auth = alreadyInitialized
    ? getAuth(app)
    : initializeAuth(app, { persistence });

export const db = getFirestore(app);

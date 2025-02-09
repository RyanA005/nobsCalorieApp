// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBK6EmH2ZrdjwL7pPIayaEvmgwgcFUQkJg",
  authDomain: "calorieapp-e9d95.firebaseapp.com",
  projectId: "calorieapp-e9d95",
  storageBucket: "calorieapp-e9d95.firebasestorage.app",
  messagingSenderId: "1034032336567",
  appId: "1:1034032336567:web:b930875a94c7704e440732",
  measurementId: "G-MYQLCDX78H"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
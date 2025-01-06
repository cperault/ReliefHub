import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY as string,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID as string,
  appId: process.env.FIREBASE_APP_ID as string,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

import { Auth, getAuth } from "firebase/auth";
import admin from "firebase-admin";
import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { App } from "firebase-admin/app";
import { Auth as AdminAuth } from "firebase-admin/auth";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export class FirebaseService {
  private config: FirebaseConfig;
  private adminApp: App;
  private app: FirebaseApp;

  constructor() {
    this.config = {
      apiKey: process.env.FIREBASE_API_KEY as string,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID as string,
      appId: process.env.FIREBASE_APP_ID as string,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
    };

    const apps = getApps();

    if (apps.length === 0) {
      this.app = initializeApp(this.config);
    } else {
      this.app = getApp();
    }

    this.adminApp = admin.initializeApp({
      credential: admin.credential.cert(`${__dirname}/../../certs/service-account.json`),
      databaseURL: `https://${this.config.projectId}.firebaseio.com`,
    });
  }

  getFirebaseAuth(): Auth {
    return getAuth(this.app);
  }

  getFirestore(): Firestore {
    return getFirestore(this.app);
  }

  getAdminAuth(): AdminAuth {
    return admin.auth();
  }
}

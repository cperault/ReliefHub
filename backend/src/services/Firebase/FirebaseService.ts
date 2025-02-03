import { Auth, getAuth } from "firebase/auth";
import admin from "firebase-admin";
import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";
import { getFirestore as getClientFirestore, Firestore as ClientFirestore } from "firebase/firestore";
import path from "path";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

interface ServiceConfig {
  serviceAccountPath: string;
  databaseURL: string;
}

export class FirebaseService {
  private config!: FirebaseConfig;
  private app!: FirebaseApp;
  private adminApp!: admin.app.App;

  constructor() {
    this.initializeConfig();
    this.initializeClientSDK();
    this.initializeAdminSDK();
  }

  private initializeConfig = (): void => {
    const requiredEnvVars = {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MSG_SENDER_ID: process.env.FIREBASE_MSG_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    } as const;

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(", ")}`);
    }

    this.config = {
      apiKey: requiredEnvVars.FIREBASE_API_KEY!,
      authDomain: requiredEnvVars.FIREBASE_AUTH_DOMAIN!,
      projectId: requiredEnvVars.FIREBASE_PROJECT_ID!,
      storageBucket: requiredEnvVars.FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: requiredEnvVars.FIREBASE_MSG_SENDER_ID!,
      appId: requiredEnvVars.FIREBASE_APP_ID!,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
  };

  private initializeClientSDK = (): void => {
    try {
      this.app = getApps().length === 0 ? initializeApp(this.config) : getApp();
    } catch (error) {
      throw new Error("Failed to initialize Firebase Client SDK");
    }
  };

  private getServiceConfig = (): ServiceConfig => {
    const isTestEnv = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev" || process.env.CYPRESS;
    const serviceAccountFileName = isTestEnv ? "service-account-test.json" : "service-account.json";

    return {
      serviceAccountPath: path.join(__dirname, "../../certs", serviceAccountFileName),
      databaseURL: `https://${this.config.projectId}.firebaseio.com`,
    };
  };

  private initializeAdminSDK = (): void => {
    try {
      const { serviceAccountPath, databaseURL } = this.getServiceConfig();

      if (!admin.apps.length) {
        this.adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          databaseURL,
        });
      } else {
        this.adminApp = admin.app();
      }
    } catch (error) {
      throw new Error("Failed to initialize Firebase Admin SDK");
    }
  };

  public getFirebaseAuth = (): Auth => {
    try {
      return getAuth(this.app);
    } catch (error) {
      throw new Error("Failed to get Firebase Auth instance");
    }
  };

  public getAdminFirestore = (): Firestore => {
    try {
      return admin.firestore();
    } catch (error) {
      throw new Error("Failed to get Admin Firestore instance");
    }
  };

  public getClientFirestore = (): ClientFirestore => {
    try {
      return getClientFirestore(this.app);
    } catch (error) {
      throw new Error("Failed to get Client Firestore instance");
    }
  };

  public getAdminAuth = (): AdminAuth => {
    try {
      return admin.auth();
    } catch (error) {
      throw new Error("Failed to get Admin Auth instance");
    }
  };
}

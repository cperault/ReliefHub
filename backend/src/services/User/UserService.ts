import { Firestore } from "firebase-admin/firestore";
import { FirebaseService } from "../Firebase/FirebaseService";
import { Logger } from "../../utils/Logger";
import { ProfileUser } from "../../types";
import {
  UserErrorType,
  UserServiceError,
  UserNotFoundError,
  InvalidUserDataError,
  UserExistsError,
} from "./user-types";

export class UserService {
  private firestore: Firestore;
  private logger: Logger;

  constructor(firebaseService: FirebaseService) {
    this.firestore = firebaseService.getAdminFirestore();
    this.logger = Logger.getInstance();
  }

  private handleFirestoreError(error: unknown, operation: string, ErrorClass: UserErrorType = UserServiceError): never {
    this.logger.error(`Firestore error during ${operation}:`, error);

    if ((error as any)?.code === "PERMISSION_DENIED") {
      throw new ErrorClass("Permission denied", "FORBIDDEN", 403);
    }
    if ((error as any)?.code === "NOT_FOUND") {
      throw new UserNotFoundError();
    }
    if ((error as any)?.code === "INVALID_ARGUMENT") {
      throw new ErrorClass("Invalid data provided", "INVALID_DATA", 400);
    }
    if ((error as any)?.code === "UNAVAILABLE") {
      throw new ErrorClass("Service temporarily unavailable", "SERVICE_UNAVAILABLE", 503);
    }

    throw new UserServiceError((error as Error).message);
  }

  public async createUser(userData: Partial<ProfileUser>): Promise<ProfileUser> {
    try {
      if (!userData.uid) {
        throw new InvalidUserDataError("User ID is required");
      }

      const userDocRef = this.firestore.collection("users").doc(userData.uid);
      const userDocSnap = await userDocRef.get();

      if (userDocSnap.exists) {
        throw new UserExistsError("User already exists");
      }

      const now = new Date().toISOString();

      const userProfile: ProfileUser = {
        ...userData,
        uid: userData.uid,
        email: userData.email || "",
        type: userData.type!,
        displayName: userData.displayName || userData.email?.split("@")[0] || "User",
        phoneNumber: userData.phoneNumber || "",
        updatedAt: now,
      };

      await userDocRef.set(userProfile);

      return userProfile;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "createUser", UserServiceError);
    }
  }

  public async getAllUsers(): Promise<ProfileUser[]> {
    try {
      const usersCollectionRef = this.firestore.collection("users");
      const querySnapshot = await usersCollectionRef.get();

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => doc.data() as ProfileUser);
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "getAllUsers", UserServiceError);
    }
  }

  public async getUser(uid: string): Promise<ProfileUser> {
    try {
      const userDocRef = this.firestore.collection("users").doc(uid);
      const userDocSnap = await userDocRef.get();

      if (!userDocSnap.exists) {
        throw new UserNotFoundError();
      }

      return userDocSnap.data() as ProfileUser;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "getUser", UserServiceError);
    }
  }

  public async updateUser(uid: string, userData: Partial<ProfileUser>): Promise<ProfileUser> {
    try {
      const userDocRef = this.firestore.collection("users").doc(uid);
      const userDocSnap = await userDocRef.get();

      if (!userDocSnap.exists) {
        throw new UserNotFoundError();
      }

      // Convert nested objects to dot notation
      const flattenUpdate = (obj: any, parentKey = ""): Record<string, any> => {
        return Object.keys(obj).reduce((acc, key) => {
          const path = parentKey ? `${parentKey}.${key}` : key;

          if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenUpdate(obj[key], path));
          } else {
            acc[path] = obj[key];
          }

          return acc;
        }, {} as Record<string, any>);
      };

      const updates = flattenUpdate(userData);
      updates.updatedAt = new Date().toISOString();

      await userDocRef.update(updates);

      const updatedDocSnap = await userDocRef.get();

      return updatedDocSnap.data() as ProfileUser;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "updateUser", UserServiceError);
    }
  }

  public async deleteUser(uid: string): Promise<void> {
    try {
      const userDocRef = this.firestore.collection("users").doc(uid);
      const userDocSnap = await userDocRef.get();

      if (!userDocSnap.exists) {
        throw new UserNotFoundError();
      }

      await userDocRef.delete();
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "deleteUser", UserServiceError);
    }
  }
}

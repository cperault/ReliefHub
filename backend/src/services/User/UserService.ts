import {
  doc,
  collection,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  Firestore,
  QuerySnapshot,
  CollectionReference,
} from "firebase/firestore";
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
    this.firestore = firebaseService.getClientFirestore();
    this.logger = Logger.getInstance();
  }

  private handleFirestoreError = (
    error: unknown,
    operation: string,
    ErrorClass: UserErrorType = UserServiceError
  ): never => {
    if (error instanceof FirestoreError) {
      this.logger.error(`Firestore error during ${operation}:`, error);

      switch (error.code) {
        case "unauthenticated":
          throw new ErrorClass("Unauthorized request", "UNAUTHORIZED", 401);
        case "permission-denied":
          throw new ErrorClass("Permission denied", "FORBIDDEN", 403);
        case "not-found":
          throw new UserNotFoundError();
        case "invalid-argument":
          throw new ErrorClass("Invalid data provided", "INVALID_DATA", 400);
        case "unavailable":
          throw new ErrorClass("Service temporarily unavailable", "SERVICE_UNAVAILABLE", 503);
        default:
          throw new ErrorClass(error.message, "UNKNOWN_ERROR", 500);
      }
    }

    throw new UserServiceError((error as Error).message);
  };

  public createUser = async (userData: Partial<ProfileUser>): Promise<ProfileUser> => {
    try {
      if (!userData.uid) {
        throw new InvalidUserDataError("User ID is required");
      }

      const userDocRef: DocumentReference<DocumentData> = doc(this.firestore, "users", userData.uid);
      const userDocSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
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

      await setDoc(userDocRef, userProfile);

      return userProfile;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "createUser", UserServiceError);
      throw error;
    }
  };

  public getAllUsers = async (): Promise<ProfileUser[]> => {
    try {
      const usersCollectionRef: CollectionReference<DocumentData> = collection(this.firestore, "users");
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(usersCollectionRef);

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((doc) => doc.data() as ProfileUser);
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "getAllUsers", UserServiceError);
      throw error;
    }
  };

  public getUser = async (uid: string): Promise<ProfileUser> => {
    try {
      const userDocRef: DocumentReference<DocumentData> = doc(this.firestore, "users", uid);
      const userDocSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new UserNotFoundError();
      }

      return userDocSnap.data() as ProfileUser;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "getUser", UserServiceError);
      throw error;
    }
  };

  public updateUser = async (uid: string, userData: Partial<ProfileUser>): Promise<ProfileUser> => {
    try {
      const userDocRef: DocumentReference<DocumentData> = doc(this.firestore, "users", uid);
      const userDocSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new UserNotFoundError();
      }

      const updatedProfile: ProfileUser = {
        ...(userDocSnap.data() as ProfileUser),
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, updatedProfile);

      return updatedProfile;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "updateUser", UserServiceError);

      throw error;
    }
  };

  public deleteUser = async (uid: string): Promise<void> => {
    try {
      const userDocRef: DocumentReference<DocumentData> = doc(this.firestore, "users", uid);
      const userDocSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new UserNotFoundError();
      }

      await deleteDoc(userDocRef);
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      this.handleFirestoreError(error, "deleteUser", UserServiceError);
      throw error;
    }
  };
}

import {
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { FirebaseService } from "./FirebaseService";

type DocRef = DocumentReference<DocumentData, DocumentData>;
type DocSnap = DocumentSnapshot<DocumentData, DocumentData>;

export class UserService {
  private firestore: any;

  constructor(firebaseService: FirebaseService) {
    this.firestore = firebaseService.getFirestore();
  }

  public async createUser(userData: any): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(this.firestore, "users", userData.uid);
      const userDocSnap: DocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        throw new UserExistsError();
      }

      await setDoc(userDocRef, userData);

      return userData;
    } catch (error: unknown) {
      if (error instanceof UserExistsError) {
        throw error;
      }

      if (error instanceof FirestoreError) {
        switch (error.code) {
          case "unauthenticated":
            throw new UserCreateError("Unauthorized request");
          case "permission-denied":
            throw new UserCreateError("Permission denied");
          case "invalid-argument":
            throw new UserCreateError("Invalid user data");
          case "unavailable":
            throw new UserCreateError("Service temporarily unavailable. Please try again later.");
          default:
            throw new UserCreateError(error.message);
        }
      }

      throw new UserCreateError((error as Error).message);
    }
  }

  public async getAllUsers(): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(this.firestore, "users");
      const userDocSnap: DocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        throw new UsersNotFoundError();
      }
    } catch (error: unknown) {
      if (error instanceof UsersNotFoundError) {
        throw error;
      }

      if (error instanceof FirestoreError) {
        switch (error.code) {
          case "unauthenticated":
            throw new UserGetAllError("Unauthorized request");
          case "permission-denied":
            throw new UserGetAllError("Permission denied");
          case "not-found":
            throw new UsersNotFoundError("Users not found");
          case "invalid-argument":
            throw new UserGetAllError("Invalid user data");
          case "unavailable":
            throw new UserGetAllError("Service temporarily unavailable. Please try again later.");
          default:
            throw new UserGetAllError(error.message);
        }
      }

      throw new UserGetAllError((error as Error).message);
    }
  }

  public async getUser(uid: string): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(this.firestore, "users", uid);
      const userDocSnap: DocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        throw new UserNotFoundError();
      }
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }

      if (error instanceof FirestoreError) {
        switch (error.code) {
          case "unauthenticated":
            throw new UserGetError("Unauthorized request");
          case "permission-denied":
            throw new UserGetError("Permission denied");
          case "not-found":
            throw new UserNotFoundError("User not found");
          case "invalid-argument":
            throw new UserGetError("Invalid user data");
          case "unavailable":
            throw new UserGetError("Service temporarily unavailable. Please try again later.");
          default:
            throw new UserGetError(error.message);
        }
      }

      throw new UserGetError((error as Error).message);
    }
  }

  public async updateUser(uid: string, userData: any) {
    try {
      const userDocRef: DocRef = doc(this.firestore, "users", uid);

      await setDoc(userDocRef, userData, { merge: true });

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        switch (error.code) {
          case "unauthenticated":
            throw new UserUpdateError("Unauthorized request");
          case "permission-denied":
            throw new UserUpdateError("Permission denied");
          case "not-found":
            throw new UserNotFoundError("User not found");
          case "invalid-argument":
            throw new UserUpdateError("Invalid user data");
          case "unavailable":
            throw new UserUpdateError("Service temporarily unavailable. Please try again later.");
          default:
            throw new UserUpdateError(error.message);
        }
      }

      throw new UserUpdateError((error as Error).message);
    }
  }

  public async deleteUser(uid: string) {
    try {
      const userDocRef: DocRef = doc(this.firestore, "users", uid);

      await setDoc(userDocRef, { active: false }, { merge: true });

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        switch (error.code) {
          case "unauthenticated":
            throw new UserDeleteError("Unauthorized request");
          case "permission-denied":
            throw new UserDeleteError("Permission denied");
          case "not-found":
            throw new UserNotFoundError("User not found");
          case "invalid-argument":
            throw new UserDeleteError("Invalid user data");
          case "unavailable":
            throw new UserDeleteError("Service temporarily unavailable. Please try again later.");
          default:
            throw new UserDeleteError(error.message);
        }
      }

      throw new UserDeleteError((error as Error).message);
    }
  }
}

export class UsersNotFoundError extends Error {
  constructor(message = "Users not found") {
    super(message);
    this.name = "UsersNotFoundError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class UserExistsError extends Error {
  constructor(message = "User already exists") {
    super(message);
    this.name = "UserExistsError";
  }
}

export class UserCreateError extends Error {
  constructor(message = "Error creating user") {
    super(message);
    this.name = "UserCreateError";
  }
}

export class UserGetError extends Error {
  constructor(message = "Error getting user") {
    super(message);
    this.name = "UserGetError";
  }
}

export class UserGetAllError extends Error {
  constructor(message = "Error getting all users") {
    super(message);
    this.name = "UserGetAllError";
  }
}

export class UserUpdateError extends Error {
  constructor(message = "Error updating user") {
    super(message);
    this.name = "UserUpdateError";
  }
}

export class UserDeleteError extends Error {
  constructor(message = "Error deleting user") {
    super(message);
    this.name = "UserDeleteError";
  }
}

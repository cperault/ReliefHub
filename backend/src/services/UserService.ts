import { firestore } from "../config/firebaseConfig";
import { doc, DocumentData, DocumentReference, DocumentSnapshot, getDoc, setDoc } from "firebase/firestore";

type DocRef = DocumentReference<DocumentData, DocumentData>;
type DocSnap = DocumentSnapshot<DocumentData, DocumentData>;

export class UserService {
  public async createUser(userData: any): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(firestore, "users", userData.uid);
      await setDoc(userDocRef, userData);
      return userData;
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async getAllUsers(): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(firestore, "users");
      const userDocSnap: DocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        throw new Error("No users found in Firestore");
      }
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async getUser(uid: string): Promise<DocumentData> {
    try {
      const userDocRef: DocRef = doc(firestore, "users", uid);
      const userDocSnap: DocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        throw new Error("User not found in Firestore");
      }
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async updateUser(uid: string, userData: any) {
    try {
      const userDocRef: DocRef = doc(firestore, "users", uid);
      await setDoc(userDocRef, userData, { merge: true });
      return { success: true };
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async deleteUser(uid: string) {
    try {
      const userDocRef: DocRef = doc(firestore, "users", uid);
      await setDoc(userDocRef, { active: false }, { merge: true });
      return { success: true };
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }
}

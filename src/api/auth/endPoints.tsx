import { addDoc, collection } from "firebase/firestore";

import { db } from "../../firebase-config";
import type { UserData } from "../../types/authType";

export const authService = {
  // Add user to users collection
  async addUser(userData: UserData): Promise<string> {
    try {
      // Validate required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.gender || !userData.dob || !userData.country) {
        throw new Error("All required fields must be provided");
      }

      const firebaseUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        dob: userData.dob,
        country: userData.country,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "users"), firebaseUserData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add user to database");
    }
  },
};

import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../../firebase-config";

export const adminService = {
  async login(email: string, password: string): Promise<{ success: boolean; admin?: any; message?: string }> {
    try {
      const adminQuery = query(
        collection(db, "admin"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const adminSnapshot = await getDocs(adminQuery);
      if (!adminSnapshot.empty) {
        const adminData = adminSnapshot.docs[0].data();
        return { success: true, admin: adminData };
      } else {
        return { success: false, message: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Error logging in admin:", error);
      return { success: false, message: "Login failed" };
    }
  },
};

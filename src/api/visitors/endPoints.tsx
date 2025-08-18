import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import type { Visitor } from "../../types/visitors";

export const visitorService = {
  async addVisitor(visitor: Visitor): Promise<string | null> {
    try {
      const userRef = doc(db, "users", visitor.cookies);
      const q = query(
        collection(db, "visitors"),
        where("cookies", "==", userRef)
      );
      const q2 = query(
        collection(db, "visitors"),
        where("key", "==", visitor.key)
      );
      const [cookiesSnap, keySnap] = await Promise.all([
        getDocs(q),
        getDocs(q2),
      ]);
      if (!cookiesSnap.empty || !keySnap.empty) {
        return null;
      }
      const docRef = await addDoc(collection(db, "visitors"), {
        ...visitor,
        cookies : userRef,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding visitor:", error);
      throw new Error("Failed to add visitor");
    }
  },
};

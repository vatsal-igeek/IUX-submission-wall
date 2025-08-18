import { doc, setDoc, serverTimestamp, collection, getCountFromServer } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../firebase-config";

export const visitorService = {
  async addVisitor() {
    try {
      const visitorId = uuidv4();
      const visitorRef = doc(db, "uniquevisitors", visitorId);

      await setDoc(visitorRef, {
        uuid: visitorId,
        createdAt: serverTimestamp(),
      });

      return visitorId;
    } catch (error) {
      console.error("Error adding unique visitor:", error);
      throw new Error("Failed to add unique visitor");
    }
  },

  async  getUniqueVisitorsCount() {
    try {
        const coll = collection(db, "visitors");
        const snapshot = await getCountFromServer(coll);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching unique visitors count:", error);
        throw new Error("Failed to fetch unique visitors count");
    }
}
};

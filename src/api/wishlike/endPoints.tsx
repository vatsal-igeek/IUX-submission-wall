// Get total sum of all userIds lengths (total likes across all wishes)

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase-config";

// Add a like to a wish
export const wishLikeService = {
  // Toggle like/dislike for a wish by a user
  async toggleLike(wishId: string, userId: string): Promise<void> {
    try {
      // Use Firestore document references for wishId and userId
      const wishRef = doc(db, "wishes", wishId);
      const userRef = doc(db, "users", userId);
      const likesQuery = query(
        collection(db, "wishLikes"),
        where("wishId", "==", wishRef),
        where("userId", "==", userRef)
      );

      const likesSnapshot = await getDocs(likesQuery);

      if (!likesSnapshot.empty) {
        // Dislike → remove that user's like doc
        const likeDoc = likesSnapshot.docs[0];
        await deleteDoc(likeDoc.ref);
      } else {
        // Like → create a new doc for this user
        await addDoc(collection(db, "wishLikes"), {
          wishId: wishRef,
          userId: userRef,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("Failed to toggle like");
    }
  },

  // Get likes for a wish
  async getAllLikes(): Promise<
    {
      wishId: string;
      wishData: any;
      wishOwner?: any;
      likedBy: string[];
    }[]
  > {
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));

    const likesMap: { [wishId: string]: string[] } = {};
    likesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      let wishId: string | null = null;
      let userId: string | null = null;

      if (data.wishId instanceof DocumentReference) {
        wishId = data.wishId.id;
      } else if (typeof data.wishId === "string") {
        wishId = data.wishId;
      }

      if (data.userId instanceof DocumentReference) {
        userId = data.userId.id;
      } else if (typeof data.userId === "string") {
        userId = data.userId;
      }

      if (!wishId || !userId) return;

      if (!likesMap[wishId]) likesMap[wishId] = [];
      likesMap[wishId].push(userId);
    });

   
    const results: {
      wishId: string;
      wishData: any;
      wishOwner?: any;
      likedBy: string[];
    }[] = [];

    for (const wishId of Object.keys(likesMap)) {
      const wishRef = doc(db, "wishes", wishId);
      const wishSnap = await getDoc(wishRef);

      if (wishSnap.exists()) {
        const wishData = wishSnap.data();

       
        let wishOwner: any = null;
        if (wishData.userId instanceof DocumentReference) {
          const ownerSnap = await getDoc(wishData.userId);
          if (ownerSnap.exists()) {
            wishOwner = { id: ownerSnap.id, ...ownerSnap.data() };
          }
        }

        results.push({
          wishId,
          wishData,
          wishOwner,
          likedBy: likesMap[wishId], 
        });
      }
    }

    return results;
  },

  async getTotalLikes(): Promise<number> {
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));
    return likesSnapshot.size;
  },

  async getAllMonthlyStats() {
    try {
      const wishesColl = collection(db, "wishes");
      const likesColl = collection(db, "wishLikes");

      const results: { month: string; wishCount: number; likeCount: number }[] =
        [];

      const today = new Date();
      const year = today.getFullYear();
      const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec

      for (let month = 0; month <= currentMonth; month++) {
        const monthStart = new Date(year, month, 1);
        const nextMonth = new Date(year, month + 1, 1);

       
        const effectiveEnd = nextMonth > today ? today : nextMonth;

        
        const wishQuery = query(
          wishesColl,
          where("createdAt", ">=", Timestamp.fromDate(monthStart)),
          where("createdAt", "<", Timestamp.fromDate(effectiveEnd))
        );
        const wishSnap = await getDocs(wishQuery);

       
        const likeQuery = query(
          likesColl,
          where("createdAt", ">=", Timestamp.fromDate(monthStart)),
          where("createdAt", "<", Timestamp.fromDate(effectiveEnd))
        );
        const likeSnap = await getDocs(likeQuery);

        results.push({
          month: monthStart.toLocaleString("default", { month: "short" }), // e.g. Jan, Feb
          wishCount: wishSnap.size,
          likeCount: likeSnap.size,
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      throw new Error("Failed to fetch monthly stats");
    }
  },

  async getYearlyWeeklyStats(): Promise<
    Array<{
      week: string;
      wishCount: number;
      likeCount: number;
    }>
  > {
    try {
      const currentYear = new Date().getFullYear();

    
      const wishesSnapshot = await getDocs(collection(db, "wishes"));
      const wishes: Date[] = [];
      wishesSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (createdAt.getFullYear() === currentYear) wishes.push(createdAt);
      });

      
      const likesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likes: Date[] = [];
      likesSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (createdAt.getFullYear() === currentYear) likes.push(createdAt);
      });

      const results: {
        week: string;
        wishCount: number;
        likeCount: number;
      }[] = [];

     
      let start = new Date(currentYear, 0, 1);
      start.setHours(0, 0, 0, 0);

      const today = new Date();
      let weekNumber = 1;

      while (start <= today) {
        const weekStart = new Date(start);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekEnd.getDate() + 6); 

        const effectiveEnd = weekEnd > today ? today : weekEnd;

        const wishCount = wishes.filter(
          (d) => d >= weekStart && d <= effectiveEnd
        ).length;

        const likeCount = likes.filter(
          (d) => d >= weekStart && d <= effectiveEnd
        ).length;

        results.push({
          week: `W${weekNumber} (${weekStart.toLocaleDateString(
            "en-GB"
          )} - ${effectiveEnd.toLocaleDateString("en-GB")})`,
          wishCount,
          likeCount,
        });

        if (weekEnd >= today) break;

        start.setDate(start.getDate() + 7); 
        weekNumber++;
      }

      return results;
    } catch (error) {
      console.error("Error fetching yearly weekly stats:", error);
      throw new Error("Failed to fetch yearly weekly stats");
    }
  },

  async getYearlyDailyStats(): Promise<
    Array<{
      day: number;
      month: number;
      year: number;
      wishCount: number;
      likeCount: number;
    }>
  > {
    try {
    const currentYear = new Date().getFullYear();

    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const wishDayMap: Record<
      string,
      { day: number; month: number; year: number; wishCount: number }
    > = {};

    wishesSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      if (createdAt.getFullYear() !== currentYear) return; // only current year

      const day = createdAt.getDate();
      const month = createdAt.getMonth() + 1; 
      const year = createdAt.getFullYear();
      const key = `${year}-${month}-${day}`;
      if (!wishDayMap[key]) {
        wishDayMap[key] = { day, month, year, wishCount: 0 };
      }
      wishDayMap[key].wishCount++;
    });

    // Likes
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));
    const likeDayMap: Record<
      string,
      { day: number; month: number; year: number; likeCount: number }
    > = {};

    likesSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      if (createdAt.getFullYear() !== currentYear) return;

      const day = createdAt.getDate();
      const month = createdAt.getMonth() + 1;
      const year = createdAt.getFullYear();
      const key = `${year}-${month}-${day}`;
      if (!likeDayMap[key]) {
        likeDayMap[key] = { day, month, year, likeCount: 0 };
      }
      likeDayMap[key].likeCount++;
    });

   
    const allKeys = Array.from(
      new Set([...Object.keys(wishDayMap), ...Object.keys(likeDayMap)])
    );

    const result = allKeys.map((key) => ({
      day: wishDayMap[key]?.day || likeDayMap[key]?.day,
      month: wishDayMap[key]?.month || likeDayMap[key]?.month,
      year: wishDayMap[key]?.year || likeDayMap[key]?.year,
      wishCount: wishDayMap[key]?.wishCount || 0,
      likeCount: likeDayMap[key]?.likeCount || 0,
    }));

    // Sort by year, month, day
    result.sort(
      (a, b) => a.year - b.year || a.month - b.month || a.day - b.day
    );

    return result;
    } catch (error) {
      console.error("Error fetching yearly daily stats:", error);
      throw new Error("Failed to fetch yearly daily stats");
    }
  },
};

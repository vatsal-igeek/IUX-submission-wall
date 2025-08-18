// Get total sum of all userIds lengths (total likes across all wishes)

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  // updateDoc,
  // arrayUnion,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase-config";
// import type { WishLike } from "../../types/wishLike";

// Add a like to a wish
export const wishLikeService = {
  // Toggle like/dislike for a wish by a user
  async toggleLike(wishId: string, userId: string): Promise<void> {
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

  // Step 1: Build mapping wishId → userIds who liked
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

  // Step 2: Fetch each wish + its owner
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

      // --- Fetch wish owner details ---
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
        likedBy: likesMap[wishId], // just IDs of users who liked
      });
    }
  }

  return results;
},

  async getTotalLikes(): Promise<number> {
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));
    return likesSnapshot.size;
  },

  async getAllMonthlyStats(): Promise<
    Array<{ month: string; year: number; wishCount: number; likeCount: number }>
  > {
    // Wishes
    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const wishMonthMap: {
      [key: string]: { month: string; year: number; wishCount: number };
    } = {};
    wishesSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      const month = createdAt.toLocaleString("default", { month: "long" });
      const year = createdAt.getFullYear();
      const key = `${year}-${month}`;
      if (!wishMonthMap[key]) wishMonthMap[key] = { month, year, wishCount: 0 };
      wishMonthMap[key].wishCount++;
    });

    // Likes
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));
    const likeMonthMap: {
      [key: string]: { month: string; year: number; likeCount: number };
    } = {};
    likesSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      const month = createdAt.toLocaleString("default", { month: "long" });
      const year = createdAt.getFullYear();
      const key = `${year}-${month}`;
      if (!likeMonthMap[key]) likeMonthMap[key] = { month, year, likeCount: 0 };
      likeMonthMap[key].likeCount++;
    });

    // Merge wish and like maps
    const allKeys = Array.from(
      new Set([...Object.keys(wishMonthMap), ...Object.keys(likeMonthMap)])
    );
    const result = allKeys.map((key) => ({
      month: wishMonthMap[key]?.month || likeMonthMap[key]?.month,
      year: wishMonthMap[key]?.year || likeMonthMap[key]?.year,
      wishCount: wishMonthMap[key]?.wishCount || 0,
      likeCount: likeMonthMap[key]?.likeCount || 0,
    }));

    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // Sort by year and month descending
    result.sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
    return result;
  },

 async getYearlyWeeklyStats(): Promise<
  Array<{ week: number; year: number; wishCount: number; likeCount: number }>
> {
  const currentYear = new Date().getFullYear();

  // Wishes
  const wishesSnapshot = await getDocs(collection(db, "wishes"));
  const wishWeekMap: Record<string, { week: number; year: number; wishCount: number }> = {};

  wishesSnapshot.forEach((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt);
    if (!createdAt || isNaN(createdAt.getTime())) return;
    if (createdAt.getFullYear() !== currentYear) return; // only current year

    const { week, year } = getWeekNumber(createdAt);
    const key = `${year}-W${week}`;
    if (!wishWeekMap[key]) {
      wishWeekMap[key] = { week, year, wishCount: 0 };
    }
    wishWeekMap[key].wishCount++;
  });

  // Likes
  const likesSnapshot = await getDocs(collection(db, "wishLikes"));
  const likeWeekMap: Record<string, { week: number; year: number; likeCount: number }> = {};

  likesSnapshot.forEach((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt);
    if (!createdAt || isNaN(createdAt.getTime())) return;
    if (createdAt.getFullYear() !== currentYear) return;

    const { week, year } = getWeekNumber(createdAt);
    const key = `${year}-W${week}`;
    if (!likeWeekMap[key]) {
      likeWeekMap[key] = { week, year, likeCount: 0 };
    }
    likeWeekMap[key].likeCount++;
  });

  // Merge
  const allKeys = Array.from(new Set([...Object.keys(wishWeekMap), ...Object.keys(likeWeekMap)]));

  const result = allKeys.map((key) => ({
    week: wishWeekMap[key]?.week || likeWeekMap[key]?.week,
    year: wishWeekMap[key]?.year || likeWeekMap[key]?.year,
    wishCount: wishWeekMap[key]?.wishCount || 0,
    likeCount: likeWeekMap[key]?.likeCount || 0,
  }));

  // Sort by year, then week
  result.sort((a, b) => a.year - b.year || a.week - b.week);

  return result;
},


//====================todo================================================

async getYearlyDailyStats(): Promise<
    Array<{ day: number; month: number; year: number; wishCount: number; likeCount: number }>
  > {
    const currentYear = new Date().getFullYear();

    // Wishes
    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const wishDayMap: Record<string, { day: number; month: number; year: number; wishCount: number }> = {};

    wishesSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      if (createdAt.getFullYear() !== currentYear) return; // only current year

      const day = createdAt.getDate();
      const month = createdAt.getMonth() + 1; // 1-based
      const year = createdAt.getFullYear();
      const key = `${year}-${month}-${day}`;
      if (!wishDayMap[key]) {
        wishDayMap[key] = { day, month, year, wishCount: 0 };
      }
      wishDayMap[key].wishCount++;
    });

    // Likes
    const likesSnapshot = await getDocs(collection(db, "wishLikes"));
    const likeDayMap: Record<string, { day: number; month: number; year: number; likeCount: number }> = {};

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

    // Merge
    const allKeys = Array.from(new Set([...Object.keys(wishDayMap), ...Object.keys(likeDayMap)]));

    const result = allKeys.map((key) => ({
      day: wishDayMap[key]?.day || likeDayMap[key]?.day,
      month: wishDayMap[key]?.month || likeDayMap[key]?.month,
      year: wishDayMap[key]?.year || likeDayMap[key]?.year,
      wishCount: wishDayMap[key]?.wishCount || 0,
      likeCount: likeDayMap[key]?.likeCount || 0,
    }));

    // Sort by year, month, day
    result.sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day);

    return result;
  },

};

function getWeekNumber(date: Date): { week: number; year: number } {
  // Copy date so we don't modify original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday = 1, Sunday = 7)
  const dayNum = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((d.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7
  );
  return { week, year: d.getUTCFullYear() };
}

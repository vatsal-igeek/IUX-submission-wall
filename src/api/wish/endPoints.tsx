import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  serverTimestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import type { Wish } from "../../types/wishesh";

export const wishService = {

  async addWish(wish: { text: string; userId: string }): Promise<string> {
    try {
      if (!wish.userId || !wish.text) {
        throw new Error("userId and text are required");
      }

      const wishData = {
        text: wish.text,
        createdAt: serverTimestamp(),
        userId: doc(db, "users", wish.userId),
      };

      const docRef = await addDoc(collection(db, "wishes"), wishData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding wish:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to add wish to database");
    }
  },

  // Get wishes with pagination and limit, sorted by latest first
  async getAllWishes(
    pageLimit: number = 10, // should be Firestore Timestamp
    currentUserId?: string
  ): Promise<
    Array<
      Wish & {
        id: string;
        user?: any;
        location?: string;
        likeCount: number;
        isLiked: boolean;
      }
    >
  > {
    try {
    let wishesQuery;
    // if (lastCreatedAt) {
    //   wishesQuery = query(
    //     collection(db, "wishes"),
    //     orderBy("createdAt", "desc"),
    //     startAfter(lastCreatedAt),
    //     limit(pageLimit)
    //   );
    // } else {
      wishesQuery = query(
        collection(db, "wishes"),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
      );
    // }

    const wishesSnapshot = await getDocs(wishesQuery);

    // Fetch all users once
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersMap: { [id: string]: any } = {};
    usersSnapshot.forEach((docSnap) => {
      usersMap[docSnap.id] = docSnap.data();
    });

    // Fetch all likes once
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

    return wishesSnapshot.docs.map((docSnap) => {
      const wish = docSnap.data() as Wish & { userId: any };
      const userId =
        wish.userId instanceof DocumentReference ? wish.userId.id : wish.userId;

      const likedByArr = likesMap[docSnap.id] || [];
      const isLiked = currentUserId ? likedByArr.includes(currentUserId) : false;

      return {
        ...wish,
        id: docSnap.id,
        userId,
        user: usersMap[userId]?.firstName || "Unknown",
        location: usersMap[userId]?.country || "INDIA",
        likeCount: likedByArr.length, // total likes
        isLiked,
      };
    });
  } catch (error) {
    console.error("Error fetching wishes:", error);
    throw new Error("Failed to fetch wishes");
  }
},


 async getTotalWishes(): Promise<number> {
    const wishSnapshot = await getDocs(collection(db, "wishes"));
    return wishSnapshot.size;
  },

  // Get wishes with their like counts
  // async getWishesWithLikes(
  //   pageLimit: number = 10,
  //   lastCreatedAt?: number
  // ): Promise<
  //   Array<
  //     Wish & {
  //       id: string;
  //       user?: any;
  //       wishLike: { wishId: string; userIds: string[] };
  //     }
  //   >
  // > {
  //   try {
  //     let wishesQuery;
  //     if (lastCreatedAt) {
  //       wishesQuery = query(
  //         collection(db, "wishes"),
  //         orderBy("createdAt", "desc"),
  //         startAfter(lastCreatedAt),
  //         limit(pageLimit)
  //       );
  //     } else {
  //       wishesQuery = query(
  //         collection(db, "wishes"),
  //         orderBy("createdAt", "desc"),
  //         limit(pageLimit)
  //       );
  //     }
  //     const wishesSnapshot = await getDocs(wishesQuery);
  //     // Fetch all users
  //     const usersSnapshot = await getDocs(collection(db, "users"));
  //     const usersMap: { [id: string]: any } = {};
  //     usersSnapshot.forEach((doc) => {
  //       usersMap[doc.id] = doc.data();
  //     });
  //     const wishes = wishesSnapshot.docs.map((doc) => {
  //       const wish = doc.data() as Wish;
  //       return {
  //         ...wish,
  //         id: doc.id,
  //         user: usersMap[wish.userId]?.firstName || "Unknown",
  //         location: usersMap[wish.userId]?.location || "INDIA",
  //       };
  //     });

  //     // Fetch likes for all wishes (toggleLike structure)
  //     const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
  //     const likesMap: { [wishId: string]: string[] } = {};
  //     wishLikesSnapshot.forEach((doc) => {
  //       const data = doc.data();
  //       if (!likesMap[data.wishId]) likesMap[data.wishId] = [];
  //       if (data.userId) likesMap[data.wishId].push(data.userId);
  //     });

  //     // Attach full wishLike data to each wish
  //     return wishes.map((wish) => ({
  //       ...wish,
  //       wishLike: {
  //         wishId: wish.id,
  //         userIds: likesMap[wish.id] || [],
  //       },
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching wishes with likes:", error);
  //     throw new Error("Failed to fetch wishes with likes");
  //   }
  // },

async getTopTwoWishesByLikes(currentUserId: string): Promise<
  Array<{
    wish: Wish & { id: string; user?: any };
    likesCount: number;
    isLiked: boolean;
  }>
> {
  try {
    const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
    const likesMap: { [wishId: string]: string[] } = {};

    wishLikesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Extract wishId and userId from DocumentReference if needed
      const wishId = data.wishId && typeof data.wishId === "object" && "id" in data.wishId ? data.wishId.id : data.wishId;
      const userId = data.userId && typeof data.userId === "object" && "id" in data.userId ? data.userId.id : data.userId;
      if (!wishId || !userId) return;
      if (!likesMap[wishId]) likesMap[wishId] = [];
      likesMap[wishId].push(userId);
    });

    // Sort by likes count descending and get top 2
    const topLikes = Object.entries(likesMap)
      .map(([wishId, userIds]) => ({ wishId, userIds }))
      .sort((a, b) => b.userIds.length - a.userIds.length)
      .slice(0, 2);

    // Fetch wish + user data
    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const usersSnapshot = await getDocs(collection(db, "users"));

    const usersMap: { [id: string]: any } = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data();
    });

    const wishesMap: { [id: string]: Wish & { id: string; user?: any; userName?: string; userLocation?: string } } = {};
    wishesSnapshot.forEach((doc) => {
      const wish = doc.data() as Wish;
      const userId =
        typeof wish.userId === "object" && wish.userId !== null && "id" in (wish.userId as { id?: string })
          ? (wish.userId as { id: string }).id
          : wish.userId;

      wishesMap[doc.id] = {
        ...wish,
        id: doc.id,
        user: usersMap[userId]?.firstName || "Unknown",
        userName: usersMap[userId]?.firstName || "Unknown",
        userLocation: usersMap[userId]?.country || "Unknown",
      };
    });

    // Return wish object along with likesCount and likedBy
    return topLikes.map((like) => ({
      wish: wishesMap[like.wishId],
      likesCount: like.userIds.length,
      isLiked: currentUserId ? like.userIds.includes(currentUserId) : false,
    }));
  } catch (error) {
    console.error("Error fetching top two wishes by likes:", error);
    throw new Error("Failed to fetch top two wishes by likes");
  }
},

 async getTopFiveWishesByLikes(currentUserId: string): Promise<
  Array<{
    wish: Wish & { id: string; user?: any };
    likesCount: number;
    isLiked: boolean;
  }>
> {
  try {
    const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
    const likesMap: { [wishId: string]: string[] } = {};

    wishLikesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Extract wishId and userId from DocumentReference if needed
      const wishId = data.wishId && typeof data.wishId === "object" && "id" in data.wishId ? data.wishId.id : data.wishId;
      const userId = data.userId && typeof data.userId === "object" && "id" in data.userId ? data.userId.id : data.userId;
      if (!wishId || !userId) return;
      if (!likesMap[wishId]) likesMap[wishId] = [];
      likesMap[wishId].push(userId);
    });

    // Sort by likes count descending and get top 2
    const topLikes = Object.entries(likesMap)
      .map(([wishId, userIds]) => ({ wishId, userIds }))
      .sort((a, b) => b.userIds.length - a.userIds.length)
      .slice(0, 5);

    // Fetch wish + user data
    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const usersSnapshot = await getDocs(collection(db, "users"));

    const usersMap: { [id: string]: any } = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data();
    });

    const wishesMap: { [id: string]: Wish & { id: string; user?: any; userName?: string; userLocation?: string } } = {};
    wishesSnapshot.forEach((doc) => {
      const wish = doc.data() as Wish;
      const userId =
        typeof wish.userId === "object" && wish.userId !== null && "id" in (wish.userId as { id?: string })
          ? (wish.userId as { id: string }).id
          : wish.userId;

      wishesMap[doc.id] = {
        ...wish,
        id: doc.id,
        user: usersMap[userId]?.firstName || "Unknown",
        userName: usersMap[userId]?.firstName || "Unknown",
        userLocation: usersMap[userId]?.country || "Unknown",
      };
    });

    // Return wish object along with likesCount and likedBy
    return topLikes.map((like) => ({
      wish: wishesMap[like.wishId],
      likesCount: like.userIds.length,
      isLiked: currentUserId ? like.userIds.includes(currentUserId) : false,
    }));
  } catch (error) {
    console.error("Error fetching top two wishes by likes:", error);
    throw new Error("Failed to fetch top two wishes by likes");
  }
}
};

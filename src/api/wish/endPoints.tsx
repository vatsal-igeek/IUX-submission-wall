import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import type { Wish } from "../../types/wishesh";

export const wishService = {
  // Add wish to wishes collection

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
    pageLimit: number = 10,
    lastCreatedAt?: number
  ): Promise<Array<Wish & { id: string; user?: any }>> {
    try {
      let wishesQuery;
      if (lastCreatedAt) {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          startAfter(lastCreatedAt),
          limit(pageLimit)
        );
      } else {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          limit(pageLimit)
        );
      }
      const wishesSnapshot = await getDocs(wishesQuery);
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: { [id: string]: any } = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      return wishesSnapshot.docs.map((doc) => {
        const wish = doc.data() as Wish;
        return {
          ...wish,
          id: doc.id,
          user: usersMap[wish.userId]?.firstName || "Unknown",
          location: usersMap[wish.userId]?.location || "INDIA",
        };
      });
    } catch (error) {
      console.error("Error fetching wishes:", error);
      throw new Error("Failed to fetch wishes");
    }
  },
  // Get wishes with their like counts
  async getWishesWithLikes(
    pageLimit: number = 10,
    lastCreatedAt?: number
  ): Promise<
    Array<
      Wish & {
        id: string;
        user?: any;
        wishLike: { wishId: string; userIds: string[] };
      }
    >
  > {
    try {
      let wishesQuery;
      if (lastCreatedAt) {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          startAfter(lastCreatedAt),
          limit(pageLimit)
        );
      } else {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          limit(pageLimit)
        );
      }
      const wishesSnapshot = await getDocs(wishesQuery);
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: { [id: string]: any } = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      const wishes = wishesSnapshot.docs.map((doc) => {
        const wish = doc.data() as Wish;
        return {
          ...wish,
          id: doc.id,
          user: usersMap[wish.userId]?.firstName || "Unknown",
          location: usersMap[wish.userId]?.location || "INDIA",
        };
      });

      // Fetch likes for all wishes (toggleLike structure)
      const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: { [wishId: string]: string[] } = {};
      wishLikesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!likesMap[data.wishId]) likesMap[data.wishId] = [];
        if (data.userId) likesMap[data.wishId].push(data.userId);
      });

      // Attach full wishLike data to each wish
      return wishes.map((wish) => ({
        ...wish,
        wishLike: {
          wishId: wish.id,
          userIds: likesMap[wish.id] || [],
        },
      }));
    } catch (error) {
      console.error("Error fetching wishes with likes:", error);
      throw new Error("Failed to fetch wishes with likes");
    }
  },

  async getTopTwoWishesByLikes(): Promise<
    Array<{ wish: Wish & { id: string; user?: any }; userIds: string[] }>
  > {
    try {
      const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: { [wishId: string]: string[] } = {};
      wishLikesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!likesMap[data.wishId]) likesMap[data.wishId] = [];
        if (data.userId) likesMap[data.wishId].push(data.userId);
      });
      // Sort by likes count descending and get top 2
      const topLikes = Object.entries(likesMap)
        .map(([wishId, userIds]) => ({ wishId, userIds }))
        .sort((a, b) => b.userIds.length - a.userIds.length)
        .slice(0, 2);

      // Fetch wish data for top 2 wishes
      const wishesSnapshot = await getDocs(collection(db, "wishes"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: { [id: string]: any } = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      const wishesMap: { [id: string]: Wish & { id: string; user?: any } } = {};
      wishesSnapshot.forEach((doc) => {
        const wish = doc.data() as Wish;
        wishesMap[doc.id] = {
          ...wish,
          id: doc.id,
          user: usersMap[wish.userId]?.firstName || "Unknown",
          location: usersMap[wish.userId]?.location || "INDIA",
        };
      });

      // Combine wish data and likes
      return topLikes.map((like) => ({
        wish: wishesMap[like.wishId],
        userIds: like.userIds,
      }));
    } catch (error) {
      console.error("Error fetching top two wishes by likes:", error);
      throw new Error("Failed to fetch top two wishes by likes");
    }
  },

  async getTopFiveWishesByLikes(): Promise<
    Array<{ wish: Wish & { id: string }; userIds: string[] }>
  > {
    try {
      const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: { [wishId: string]: string[] } = {};
      wishLikesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!likesMap[data.wishId]) likesMap[data.wishId] = [];
        if (data.userId) likesMap[data.wishId].push(data.userId);
      });
      // Sort by likes count descending and get top 5
      const topLikes = Object.entries(likesMap)
        .map(([wishId, userIds]) => ({ wishId, userIds }))
        .sort((a, b) => b.userIds.length - a.userIds.length)
        .slice(0, 5);

      // Fetch wish data for top 2 wishes
      const wishesSnapshot = await getDocs(collection(db, "wishes"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: { [id: string]: any } = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      const wishesMap: { [id: string]: Wish & { id: string; user?: any } } = {};
      wishesSnapshot.forEach((doc) => {
        const wish = doc.data() as Wish;
        wishesMap[doc.id] = {
          ...wish,
          id: doc.id,
          user: usersMap[wish.userId]?.firstName || "Unknown",
          location: usersMap[wish.userId]?.location || "INDIA",
        };
      });

      // Combine wish data and likes
      return topLikes.map((like) => ({
        wish: wishesMap[like.wishId],
        userIds: like.userIds,
      }));
    } catch (error) {
      console.error("Error fetching top two wishes by likes:", error);
      throw new Error("Failed to fetch top two wishes by likes");
    }
  },
};

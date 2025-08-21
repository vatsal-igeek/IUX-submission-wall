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
  getDoc,
  DocumentSnapshot,
  startAfter,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import type { Wish } from "../../types/wishesh";
import type { User } from "../../types/userType";

export interface WishWithMeta extends Wish {
  id: string;
  // userRef: DocumentReference;
  // user?: User | null;
  likeCount: number;
  isLiked: boolean;
}

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
    pageLimit: number = 10,
    currentUserId?: string,
    lastWishDoc?: DocumentSnapshot | null
  ): Promise<{ wishes: WishWithMeta[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let wishesQuery = query(
        collection(db, "wishes"),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
      );

      // Add pagination cursor if provided
      if (lastWishDoc) {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          startAfter(lastWishDoc),
          limit(pageLimit)
        );
      }

      const wishesSnapshot = await getDocs(wishesQuery);

      // If no documents, return empty result
      if (wishesSnapshot.empty) {
        return { wishes: [], lastDoc: null };
      }

      // Get the last document for next pagination
      const lastDoc = wishesSnapshot.docs[wishesSnapshot.docs.length - 1];

      // Fetch all likes once
      const likesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: Record<string, string[]> = {};

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

      // Fetch users on demand
      const wishesWithUsers: WishWithMeta[] = await Promise.all(
        wishesSnapshot.docs.map(async (docSnap) => {
          const wish = docSnap.data() as Wish;
          const userId =
            wish.userId &&
            typeof wish.userId === "object" &&
            "id" in wish.userId
              ? (wish.userId as { id: string }).id
              : wish.userId;

          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          let userData: {
            firstName: string;
            lastName: string;
            country: string;
          } | null = null;
          if (userSnap.exists()) {
            const data = userSnap.data() as User;
            userData = {
              firstName: data.firstName,
              lastName: data.lastName,
              country: data.country,
            };
          }

          const likedByArr = likesMap[docSnap.id] || [];
          const isLiked = currentUserId
            ? likedByArr.includes(currentUserId)
            : false;

          return {
            ...wish,
            id: docSnap.id,
            userId,
            user: userData,
            likeCount: likedByArr.length,
            isLiked,
          };
        })
      );

      return { wishes: wishesWithUsers, lastDoc };
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

  async getTopTwoWishesByLikes(currentUserId: string): Promise<WishWithMeta[]> {
    try {
      // 1. Collect likes
      const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: { [wishId: string]: string[] } = {};

      wishLikesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const wishId =
          data.wishId && typeof data.wishId === "object" && "id" in data.wishId
            ? data.wishId.id
            : data.wishId;
        const userId =
          data.userId && typeof data.userId === "object" && "id" in data.userId
            ? data.userId.id
            : data.userId;

        if (!wishId || !userId) return;
        if (!likesMap[wishId]) likesMap[wishId] = [];
        likesMap[wishId].push(userId);
      });

      // 2. Sort & pick top 2
      const topLikes = Object.entries(likesMap)
        .map(([wishId, userIds]) => ({ wishId, userIds }))
        .sort((a, b) => b.userIds.length - a.userIds.length)
        .slice(0, 2);

      // 3. Resolve each wish + user from Firestore directly
      const result = await Promise.all(
        topLikes.map(async (like) => {
          const wishRef = doc(db, "wishes", like.wishId);
          const wishSnap = await getDoc(wishRef);

          if (!wishSnap.exists()) return null;
          const wishData = wishSnap.data() as Wish & { userId: any };

          // Resolve user reference
          const userId =
            wishData.userId &&
            typeof wishData.userId === "object" &&
            "id" in wishData.userId
              ? wishData.userId.id
              : wishData.userId;

          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          let userData: {
            id: string;
            firstName?: string;
            lastName?: string;
            country?: string;
          } | null = null;
          if (userSnap.exists()) {
            const data = userSnap.data();
            userData = {
              id: userSnap.id,
              firstName: data.firstName,
              lastName: data.lastName,
              country: data.country,
            };
          }

          const likeCount = like.userIds.length;
          const isLiked = currentUserId
            ? like.userIds.includes(currentUserId)
            : false;

          return {
            ...wishData,
            id: wishSnap.id,
            userId,
            user: userData, // 🔹 minimal user info
            likeCount,
            isLiked,
          } as WishWithMeta;
        })
      );

      return result.filter((wish): wish is WishWithMeta => wish !== null);
    } catch (error) {
      console.error("Error fetching top two wishes by likes:", error);
      throw new Error("Failed to fetch top two wishes by likes");
    }
  },

  async getTopFiveWishesByLikes(
    currentUserId: string
  ): Promise<WishWithMeta[]> {
    try {
      // 1. Collect likes
      const wishLikesSnapshot = await getDocs(collection(db, "wishLikes"));
      const likesMap: { [wishId: string]: string[] } = {};

      wishLikesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const wishId =
          data.wishId && typeof data.wishId === "object" && "id" in data.wishId
            ? data.wishId.id
            : data.wishId;
        const userId =
          data.userId && typeof data.userId === "object" && "id" in data.userId
            ? data.userId.id
            : data.userId;

        if (!wishId || !userId) return;
        if (!likesMap[wishId]) likesMap[wishId] = [];
        likesMap[wishId].push(userId);
      });

      // 2. Sort & pick top 2
      const topLikes = Object.entries(likesMap)
        .map(([wishId, userIds]) => ({ wishId, userIds }))
        .sort((a, b) => b.userIds.length - a.userIds.length)
        .slice(0, 5);

      // 3. Resolve each wish + user from Firestore directly
      const result = await Promise.all(
        topLikes.map(async (like) => {
          const wishRef = doc(db, "wishes", like.wishId);
          const wishSnap = await getDoc(wishRef);

          if (!wishSnap.exists()) return null;
          const wishData = wishSnap.data() as Wish & { userId: any };

          // Resolve user reference
          const userId =
            wishData.userId &&
            typeof wishData.userId === "object" &&
            "id" in wishData.userId
              ? wishData.userId.id
              : wishData.userId;

          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          let userData: {
            id: string;
            firstName?: string;
            lastName?: string;
            country?: string;
          } | null = null;
          if (userSnap.exists()) {
            const data = userSnap.data();
            userData = {
              id: userSnap.id,
              firstName: data.firstName,
              lastName: data.lastName,
              country: data.country,
            };
          }

          const likeCount = like.userIds.length;
          const isLiked = currentUserId
            ? like.userIds.includes(currentUserId)
            : false;

          return {
            ...wishData,
            id: wishSnap.id,
            userId,
            user: userData,
            likeCount,
            isLiked,
          } as WishWithMeta;
        })
      );

      return result.filter((wish): wish is WishWithMeta => wish !== null);
    } catch (error) {
      console.error("Error fetching top two wishes by likes:", error);
      throw new Error("Failed to fetch top two wishes by likes");
    }
  },

  subscribeToWishes(
    pageLimit: number = 10,
    currentUserId?: string,
    lastWishDoc?: DocumentSnapshot | null,
    callback?: (result: {
      wishes: WishWithMeta[];
      lastDoc: DocumentSnapshot | null;
    }) => void
  ) {
    try {
      let wishesQuery = query(
        collection(db, "wishes"),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
      );

      if (lastWishDoc) {
        wishesQuery = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          startAfter(lastWishDoc),
          limit(pageLimit)
        );
      }

      const unsubscribe = onSnapshot(wishesQuery, async (wishesSnapshot) => {
        if (wishesSnapshot.empty) {
          callback?.({ wishes: [], lastDoc: null });
          return;
        }

        // Get the last document for pagination
        const lastDoc = wishesSnapshot.docs[wishesSnapshot.docs.length - 1];

        // Fetch likes in realtime (all likes)
        const likesSnapshot = await getDocs(collection(db, "wishLikes"));
        const likesMap: Record<string, string[]> = {};

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

        // Enrich wishes with user data + likes
        const wishesWithUsers: WishWithMeta[] = await Promise.all(
          wishesSnapshot.docs.map(async (docSnap) => {
            const wish = docSnap.data() as Wish;
            const userId =
              wish.userId &&
              typeof wish.userId === "object" &&
              "id" in wish.userId
                ? (wish.userId as { id: string }).id
                : wish.userId;

            let userData: {
              firstName: string;
              lastName: string;
              country: string;
            } | null = null;

            if (userId) {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const data = userSnap.data() as User;
                userData = {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  country: data.country,
                };
              }
            }

            const likedByArr = likesMap[docSnap.id] || [];
            const isLiked = currentUserId
              ? likedByArr.includes(currentUserId)
              : false;

            return {
              ...wish,
              id: docSnap.id,
              userId,
              user: userData,
              likeCount: likedByArr.length,
              isLiked,
            };
          })
        );

        callback?.({ wishes: wishesWithUsers, lastDoc });
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error in subscribeToWishes:", error);
      throw new Error("Failed to subscribe to wishes");
    }
  },
};

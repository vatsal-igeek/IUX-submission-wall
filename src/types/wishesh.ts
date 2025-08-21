import type { Timestamp } from "firebase/firestore";
import type { User } from "./userType";

export type Wish = {
  id: string;
  text: string;
  createdAt: Timestamp;
  isLiked: boolean;
  likeCount: number;
  userId: string;
  user: Pick<User, "id" | "firstName" | "lastName" | "country"> | null;
  isOptimistic?: boolean;
  originalId?: string;
};

export interface Wish {
  userId: string;
  text: string;
  createdAt?: Date;
  timestamp: string; // e.g. "12:00 AM GMT"
  location: string; // e.g. "INDIA"
}

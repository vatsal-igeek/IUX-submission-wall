import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  // getCountFromServer,
  query,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";
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

  async getUniqueVisitorsCount(period: "daily" | "weekly" | "monthly") {
    try {
      const coll = collection(db, "uniquevisitors");

      const now = new Date();

      let currentStart: Date, previousStart: Date, previousEnd: Date;

      if (period === "daily") {
        // Today
        currentStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        // Yesterday
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = new Date(currentStart);
      } else if (period === "weekly") {
        // This week (start from Monday)
        const day = now.getDay(); // 0 = Sun, 1 = Mon
        const diff = day === 0 ? 6 : day - 1;
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - diff);
        currentStart.setHours(0, 0, 0, 0);

        // Last week
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - 7);
      } else {
        // This month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Last month
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Queries
      const currentQuery = query(
        coll,
        where("createdAt", ">=", Timestamp.fromDate(currentStart))
      );
      const previousQuery = query(
        coll,
        where("createdAt", ">=", Timestamp.fromDate(previousStart)),
        where("createdAt", "<", Timestamp.fromDate(previousEnd))
      );

      const [currentSnap, previousSnap] = await Promise.all([
        getDocs(currentQuery),
        getDocs(previousQuery),
      ]);

      const currentCount = currentSnap.size;
      const previousCount = previousSnap.size;

      // % change
      let percentageChange = 0;
      if (previousCount > 0) {
        percentageChange =
          ((currentCount - previousCount) / previousCount) * 100;
      } else if (currentCount > 0) {
        percentageChange = 100;
      }

      return {
        period,
        previous: previousCount, // X
        current: currentCount, // Y
        percentageChange: Math.round(percentageChange * 100) / 100, // 2 decimals
      };
    } catch (error) {
      console.error("Error fetching visitors count:", error);
      throw new Error("Failed to fetch visitors count");
    }
  },

  async getMonthlyVisitors(): Promise<
    Array<{
      month: string;
      count: number;
    }>
  > {
    try {
      const coll = collection(db, "uniquevisitors");
      const results: { month: string; count: number }[] = [];

      const today = new Date();
      const year = today.getFullYear();
      const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec

      for (
        let month = 0;
        month <= currentMonth && year === today.getFullYear();
        month++
      ) {
        const monthStart = new Date(year, month, 1);
        const nextMonth = new Date(year, month + 1, 1);

        // If nextMonth goes beyond today, cap it
        const effectiveEnd = nextMonth > today ? today : nextMonth;

        const monthQuery = query(
          coll,
          where("createdAt", ">=", Timestamp.fromDate(monthStart)),
          where("createdAt", "<", Timestamp.fromDate(effectiveEnd))
        );

        const snap = await getDocs(monthQuery);

        results.push({
          month: monthStart.toLocaleString("default", { month: "short" }), // "Jan", "Feb"
          count: snap.size,
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching monthly visitors:", error);
      throw new Error("Failed to fetch monthly visitors");
    }
  },

  async getWeeklyVisitors(): Promise<
    Array<{
      week: string;
      count: number;
    }>
  > {
    try {
      const coll = collection(db, "uniquevisitors");
      const results: { week: string; count: number }[] = [];

      // Start from 1st Jan of given year
      const today = new Date();
      const year = today.getFullYear();
      let start = new Date(year, 0, 1);
      start.setHours(0, 0, 0, 0);

      let weekNumber = 1;
      while (start <= today && start.getFullYear() === year) {
        const weekStart = new Date(start);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // If weekEnd goes beyond today, cap it at today
        const effectiveEnd = weekEnd > today ? today : weekEnd;

        // Firestore query with Timestamp
        const weekQuery = query(
          coll,
          where("createdAt", ">=", Timestamp.fromDate(weekStart)),
          where("createdAt", "<", Timestamp.fromDate(effectiveEnd))
        );

        const snap = await getDocs(weekQuery);

        results.push({
          week: `W${weekNumber} (${weekStart.toLocaleDateString(
            "en-GB"
          )} - ${effectiveEnd.toLocaleDateString("en-GB")})`,
          count: snap.size,
        });

        // Stop if this week included today
        if (weekEnd >= today) break;

        // Move to next week
        start.setDate(start.getDate() + 7);
        weekNumber++;
      }

      return results;
    } catch (error) {
      console.error("Error fetching weekly visitors:", error);
      throw new Error("Failed to fetch weekly visitors");
    }
  },

  async getLast10DaysVisitors() {
    try {
      const coll = collection(db, "uniquevisitors");
      const results: { day: string; count: number }[] = [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 10 days back (including today)
      const start = new Date(today);
      start.setDate(start.getDate() - 9); // last 10 days = today + 9 previous

      let current = new Date(start);

      while (current <= today) {
        const dayStart = new Date(current);
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayQuery = query(
          coll,
          where("createdAt", ">=", Timestamp.fromDate(dayStart)),
          where("createdAt", "<", Timestamp.fromDate(nextDay))
        );

        const snap = await getDocs(dayQuery);

        results.push({
          day: dayStart.toLocaleDateString("en-GB"), // "dd/mm/yyyy"
          count: snap.size,
        });

        current = nextDay;
      }

      return results;
    } catch (error) {
      console.error("Error fetching last 10 days page views:", error);
      throw new Error("Failed to fetch last 10 days page views");
    }
  },
};

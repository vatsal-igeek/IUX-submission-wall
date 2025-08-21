import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import type { PageView } from "../../types/pageView";

// function startOfDay(date: Date) {
//   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
// }
// function startOfWeek(date: Date) {
//   const d = new Date(date);
//   const day = d.getDay(); // Sunday=0
//   const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
//   return new Date(d.setDate(diff));
// }
// function startOfMonth(date: Date) {
//   return new Date(date.getFullYear(), date.getMonth(), 1);
// }

// async function getPageViewsCount(start: Date, end: Date) {
//   const q = query(
//     collection(db, "pageViews"),
//     where("createdAt", ">=", Timestamp.fromDate(start)),
//     where("createdAt", "<", Timestamp.fromDate(end))
//   );
//   const snap = await getDocs(q);
//   return snap.size;
// }

// async function getTotalPageViews() {
//   const snap = await getDocs(collection(db, "pageViews"));
//   return snap.size;
// }

// function calcGrowth(X: number, Y: number) {
//   if (X === 0 && Y > 0) return 100;
//   if (X === 0 && Y === 0) return 0;
//   return ((Y - X) / X) * 100;
// }

// function getTrend(growth: number) {
//   if (growth > 0) return "up";
//   if (growth < 0) return "down";
//   return "no-change";
// }

export const pageViewService = {
  // Record a visit for a specific page
  async recordPageView(pageView: PageView) {
    try {
      const visitsRef = collection(db, "pageViews");

      const docRef = await addDoc(visitsRef, {
        userId: doc(db, "users", pageView.userId),
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      throw new Error("Error recording page view:");
    }
  },

  async getUniquePageViewersCount(period: "daily" | "weekly" | "monthly") {
    try {
      const coll = collection(db, "pageViews");

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
      console.error("Error fetching page views count:", error);
      throw new Error("Failed to fetch page views count");
    }
  },

  async getMonthlyPageView(): Promise<
    Array<{
      month: string;
      count: number;
    }>
  > {
    try {
      const coll = collection(db, "pageViews");
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
          month: monthStart.toLocaleString("default", { month: "short" }),
          count: snap.size,
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching monthly page views:", error);
      throw new Error("Failed to fetch monthly page views");
    }
  },

  async getWeeklyPageViews(): Promise<Array<{ week: string; count: number }>> {
    try {
      const coll = collection(db, "pageViews");
      const results: { week: string; count: number }[] = [];

      const today = new Date();
      const year = today.getFullYear();

      let start = new Date(year, 0, 1); // Jan 1
      start.setHours(0, 0, 0, 0);

      let weekNumber = 1;
      while (start <= today && start.getFullYear() === year) {
        const weekStart = new Date(start);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // include full last day
        const effectiveEnd = new Date(weekEnd > today ? today : weekEnd);
        effectiveEnd.setDate(effectiveEnd.getDate() + 1);

        const weekQuery = query(
          coll,
          where("createdAt", ">=", Timestamp.fromDate(weekStart)),
          where("createdAt", "<", Timestamp.fromDate(effectiveEnd))
        );

        const snap = await getDocs(weekQuery);

        results.push({
          week: `W${weekNumber} (${weekStart.toLocaleDateString(
            "en-GB"
          )} - ${weekEnd.toLocaleDateString("en-GB")})`,
          count: snap.size,
        });

        if (weekEnd >= today) break;

        start.setDate(start.getDate() + 7);
        weekNumber++;
      }

      return results;
    } catch (error) {
      console.error("Error fetching weekly page views:", error);
      throw new Error("Failed to fetch weekly page views");
    }
  },
  
  async getLast15DaysPageViews() {
    try {
      const coll = collection(db, "pageViews");
      const results: { day: string; count: number }[] = [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 10 days back (including today)
      const start = new Date(today);
      start.setDate(start.getDate() - 14); // last 10 days = today + 9 previous

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
      console.error("Error fetching last 15 days page views:", error);
      throw new Error("Failed to fetch last 15 days page views");
    }
  },
};

import { addDoc, collection, getDocs } from "firebase/firestore";

import { db } from "../../firebase-config";
import type { UserData } from "../../types/authType";

export const authService = {
  // Add user to users collection
  async addUser(userData: UserData): Promise<string> {
    try {
      // Validate required fields
      if (
        !userData.firstName ||
        !userData.lastName ||
        !userData.email ||
        !userData.gender ||
        !userData.dob ||
        !userData.country
      ) {
        throw new Error("All required fields must be provided");
      }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }

      // Always save dob as 'YYYY-MM-DD' string
      let dobStr: string;
      if (userData.dob instanceof Date) {
        const year = userData.dob.getFullYear();
        const month = String(userData.dob.getMonth() + 1).padStart(2, "0");
        const day = String(userData.dob.getDate()).padStart(2, "0");
        dobStr = `${year}-${month}-${day}`;
      } else if (typeof userData.dob === "string") {
        dobStr = (userData.dob as string).slice(0, 10);
      } else {
        dobStr = "";
      }
      const firebaseUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        dob: dobStr,
        country: userData.country,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "users"), firebaseUserData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add user to database");
    }
  },

  async getDailyRegistrations(): Promise<number> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      let today = 0;
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (
          createdAt.getDate() === now.getDate() &&
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        ) {
          today++;
        }
      });
      return today;
    } catch (error) {
      console.error("Error fetching daily registrations:", error);
      throw new Error("Failed to fetch daily registrations");
    }
  },

  // Get weekly registration count
  async getWeeklyRegistrations(): Promise<number> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      let count = 0;
      // Calculate the date 6 days ago (so last 7 days including today)
      const fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (createdAt >= fromDate && createdAt <= toDate) {
          count++;
        }
      });
      return count;
    } catch (error) {
      console.error("Error fetching weekly registrations:", error);
      throw new Error("Failed to fetch weekly registrations");
    }
  },

  // Get monthly registration count
  async getMonthlyRegistrations(): Promise<number> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      let month = 0;
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        ) {
          month++;
        }
      });
      return month;
    } catch (error) {
      console.error("Error fetching monthly registrations:", error);
      throw new Error("Failed to fetch monthly registrations");
    }
  },

  async getUserCountByCountry(
    searchTerm?: string
  ): Promise<Array<{ country: string; count: number }>> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const countryMap: { [country: string]: number } = {};

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const country = data.country || "Unknown";
        countryMap[country] = (countryMap[country] || 0) + 1;
      });

      let result = Object.entries(countryMap).map(([country, count]) => ({
        country,
        count,
      }));

      // If searchTerm provided, filter results
      if (searchTerm && searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        result = result.filter((item) =>
          item.country.toLowerCase().includes(lowerSearch)
        );
      }

      // Sort by count descending
      result.sort((a, b) => b.count - a.count);
      return result;
    } catch (error) {
      console.error("Error fetching user count by country:", error);
      throw new Error("Failed to fetch user count by country");
    }
  },

  //======================Todo===============================================

  async getCurrentMonthGenderPercentageStats(): Promise<{
    month: string;
    year: number;
    total: number;
    genderPercentages: { [gender: string]: number };
  } | null> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const month = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();
      let total = 0;
      const genderCounts: { [gender: string]: number } = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (
          createdAt.getMonth() !== now.getMonth() ||
          createdAt.getFullYear() !== now.getFullYear()
        )
          return;
        const gender = (data.gender || "other").toLowerCase();
        total++;
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      if (total === 0) return null;
      // Calculate percentages so that sum is exactly 100%
      const genderPercentages: { [gender: string]: number } = {};
      const entries = Object.entries(genderCounts);
      let sum = 0;
      let maxKey = "";
      let maxVal = 0;
      entries.forEach(([gender, count]) => {
        const percent = Math.round((count / total) * 100);
        genderPercentages[gender] = percent;
        sum += percent;
        if (count > maxVal) {
          maxVal = count;
          maxKey = gender;
        }
      });
      // Adjust so total is 100%
      if (sum !== 100 && maxKey) {
        genderPercentages[maxKey] += 100 - sum;
      }
      return { month, year, total, genderPercentages };
    } catch (error) {
      console.error(
        "Error fetching current month gender percentage stats:",
        error
      );
      throw new Error("Failed to fetch current month gender percentage stats");
    }
  },

  async getCurrentWeekGenderPercentageStats(): Promise<{
    weekStart: string;
    weekEnd: string;
    total: number;
    genderPercentages: { [gender: string]: number };
  } | null> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      // Calculate week start (Sunday) and end (Saturday)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      let total = 0;
      const genderCounts: { [gender: string]: number } = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (createdAt < weekStart || createdAt > weekEnd) return;
        const gender = (data.gender || "other").toLowerCase();
        total++;
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      if (total === 0) return null;
      // Calculate percentages so that sum is exactly 100%
      const genderPercentages: { [gender: string]: number } = {};
      const entries = Object.entries(genderCounts);
      let sum = 0;
      let maxKey = "";
      let maxVal = 0;
      entries.forEach(([gender, count]) => {
        const percent = Math.round((count / total) * 100);
        genderPercentages[gender] = percent;
        sum += percent;
        if (count > maxVal) {
          maxVal = count;
          maxKey = gender;
        }
      });
      // Adjust so total is 100%
      if (sum !== 100 && maxKey) {
        genderPercentages[maxKey] += 100 - sum;
      }
      // Format weekStart and weekEnd as YYYY-MM-DD
      const weekStartStr = weekStart.toISOString().slice(0, 10);
      const weekEndStr = weekEnd.toISOString().slice(0, 10);
      return {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        total,
        genderPercentages,
      };
    } catch (error) {
      console.error(
        "Error fetching current weeek gender percentage stats:",
        error
      );
      throw new Error("Failed to fetch current week gender percentage stats");
    }
  },

  async getCurrentDayGenderPercentageStats(): Promise<{
    date: string;
    total: number;
    genderPercentages: { [gender: string]: number };
  } | null> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth();
      const year = now.getFullYear();
      let total = 0;
      const genderCounts: { [gender: string]: number } = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (
          createdAt.getDate() !== day ||
          createdAt.getMonth() !== month ||
          createdAt.getFullYear() !== year
        )
          return;
        const gender = (data.gender || "other").toLowerCase();
        total++;
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      if (total === 0) return null;
      // Calculate percentages so that sum is exactly 100%
      const genderPercentages: { [gender: string]: number } = {};
      const entries = Object.entries(genderCounts);
      let sum = 0;
      let maxKey = "";
      let maxVal = 0;
      entries.forEach(([gender, count]) => {
        const percent = Math.round((count / total) * 100);
        genderPercentages[gender] = percent;
        sum += percent;
        if (count > maxVal) {
          maxVal = count;
          maxKey = gender;
        }
      });
      // Adjust so total is 100%
      if (sum !== 100 && maxKey) {
        genderPercentages[maxKey] += 100 - sum;
      }
      // Format date as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      return { date: dateStr, total, genderPercentages };
    } catch (error) {
      console.error(
        "Error fetching current daily gender percentage stats:",
        error
      );
      throw new Error("Failed to fetch current daily gender percentage stats");
    }
  },

  async getCurrentMonthAgeGroupStats(): Promise<{
    month: string;
    year: number;
    total: number;
    lessThan25: number;
    between25And65: number;
    greaterThan65: number;
  }> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const month = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();
      let total = 0;
      let lessThan25 = 0;
      let between25And65 = 0;
      let greaterThan65 = 0;
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        // Only count users registered this month
        if (
          createdAt.getMonth() !== now.getMonth() ||
          createdAt.getFullYear() !== now.getFullYear()
        )
          return;
        const dob = data.dob ? new Date(data.dob) : null;
        if (!dob || isNaN(dob.getTime())) return;
        // Calculate age
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }
        total++;
        if (age < 25) lessThan25++;
        else if (age <= 65) between25And65++;
        else greaterThan65++;
      });
      return { month, year, total, lessThan25, between25And65, greaterThan65 };
    } catch (error) {
      console.error("Error fetching current month age group stats:", error);
      throw new Error("Failed to fetch current month age group stats");
    }
  },

  async getLast7DaysTotalAgeGroupStats(): Promise<{
    from: string;
    to: string;
    total: number;
    lessThan25: number;
    between25And65: number;
    greaterThan65: number;
  }> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      let total = 0;
      let lessThan25 = 0;
      let between25And65 = 0;
      let greaterThan65 = 0;
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (createdAt < fromDate || createdAt > toDate) return;
        const dob = data.dob ? new Date(data.dob) : null;
        if (!dob || isNaN(dob.getTime())) return;
        // Calculate age
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }
        total++;
        if (age < 25) lessThan25++;
        else if (age <= 65) between25And65++;
        else greaterThan65++;
      });
      const fromStr = `${fromDate.getFullYear()}-${String(
        fromDate.getMonth() + 1
      ).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
      const toStr = `${toDate.getFullYear()}-${String(
        toDate.getMonth() + 1
      ).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
      return {
        from: fromStr,
        to: toStr,
        total,
        lessThan25,
        between25And65,
        greaterThan65,
      };
    } catch (error) {
      console.error("Error fetching last 7 days total age group stats:", error);
      throw new Error("Failed to fetch last 7 days total age group stats");
    }
  },

  async getCurrentDayAgeGroupStats(): Promise<{
    date: string;
    total: number;
    lessThan25: number;
    between25And65: number;
    greaterThan65: number;
  }> {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth();
      const year = now.getFullYear();
      let total = 0;
      let lessThan25 = 0;
      let between25And65 = 0;
      let greaterThan65 = 0;
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        if (!createdAt || isNaN(createdAt.getTime())) return;
        if (
          createdAt.getDate() !== day ||
          createdAt.getMonth() !== month ||
          createdAt.getFullYear() !== year
        )
          return;
        const dob = data.dob ? new Date(data.dob) : null;
        if (!dob || isNaN(dob.getTime())) return;
        // Calculate age
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }
        total++;
        if (age < 25) lessThan25++;
        else if (age <= 65) between25And65++;
        else greaterThan65++;
      });
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      return {
        date: dateStr,
        total,
        lessThan25,
        between25And65,
        greaterThan65,
      };
    } catch (error) {
      console.error("Error fetching current day age group stats:", error);
      throw new Error("Failed to fetch current day age group stats");
    }
  },
};

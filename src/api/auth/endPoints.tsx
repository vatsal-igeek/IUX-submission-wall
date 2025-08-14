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

      const firebaseUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        dob: userData.dob,
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

  // async getRegistrationStats(): Promise<{ today: number; week: number; month: number }> {
  //   const usersSnapshot = await getDocs(collection(db, "users"));
  //   const now = new Date();
  //   let today = 0, week = 0, month = 0;
  //   usersSnapshot.forEach(doc => {
  //     const data = doc.data();
  //     const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
  //     if (!createdAt || isNaN(createdAt.getTime())) return;
  //     // Today
  //     if (
  //       createdAt.getDate() === now.getDate() &&
  //       createdAt.getMonth() === now.getMonth() &&
  //       createdAt.getFullYear() === now.getFullYear()
  //     ) {
  //       today++;
  //     }
  //     // This week
  //     const weekStart = new Date(now);
  //     weekStart.setDate(now.getDate() - now.getDay());
  //     const weekEnd = new Date(weekStart);
  //     weekEnd.setDate(weekStart.getDate() + 6);
  //     if (createdAt >= weekStart && createdAt <= weekEnd) {
  //       week++;
  //     }
  //     // This month
  //     if (
  //       createdAt.getMonth() === now.getMonth() &&
  //       createdAt.getFullYear() === now.getFullYear()
  //     ) {
  //       month++;
  //     }
  //   });
  //   return { today, week, month };
  // },

  async getDailyRegistrations(): Promise<number> {
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
  },

  // Get weekly registration count
  async getWeeklyRegistrations(): Promise<number> {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const now = new Date();
    let week = 0;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (!createdAt || isNaN(createdAt.getTime())) return;
      if (createdAt >= weekStart && createdAt <= weekEnd) {
        week++;
      }
    });
    return week;
  },

  // Get monthly registration count
  async getMonthlyRegistrations(): Promise<number> {
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
  },

  // async getUserCountByCountry(): Promise<Array<{ country: string, count: number }>> {
  //   const usersSnapshot = await getDocs(collection(db, "users"));
  //   const countryMap: { [country: string]: number } = {};
  //   usersSnapshot.forEach(doc => {
  //     const data = doc.data();
  //     const country = data.country || "Unknown";
  //     countryMap[country] = (countryMap[country] || 0) + 1;
  //   });
  //   // Convert to array and sort descending
  //   const result = Object.entries(countryMap)
  //     .map(([country, count]) => ({ country, count }))
  //     .sort((a, b) => b.count - a.count);
  //   return result;
  // },

  async getUserCountByCountry(
    searchTerm?: string
  ): Promise<Array<{ country: string; count: number }>> {
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
  },

  //======================Todo===============================================

  async getCurrentMonthGenderPercentageStats(): Promise<{
    month: string;
    year: number;
    total: number;
    genderPercentages: { [gender: string]: number };
  } | null> {
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
    const genderPercentages: { [gender: string]: number } = {};
    Object.entries(genderCounts).forEach(([gender, count]) => {
      genderPercentages[gender] = Math.round((count / total) * 100);
    });
    return { month, year, total, genderPercentages };
  },

  async getCurrentWeekGenderPercentageStats(): Promise<{
    weekStart: string;
    weekEnd: string;
    total: number;
    genderPercentages: { [gender: string]: number };
  } | null> {
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
    const genderPercentages: { [gender: string]: number } = {};
    Object.entries(genderCounts).forEach(([gender, count]) => {
      genderPercentages[gender] = Math.round((count / total) * 100);
    });
    // Format weekStart and weekEnd as YYYY-MM-DD
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      total,
      genderPercentages,
    };
  },
};

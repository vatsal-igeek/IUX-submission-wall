import type { Timestamp } from "firebase/firestore";

function formatTimestamp(timestamp: Timestamp | Date | null | undefined) {
  if (!timestamp) return "";

  let date: Date;

  if ("toDate" in timestamp && typeof timestamp.toDate === "function") {
    // Firestore Timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // JS Date
    date = timestamp;
  } else {
    // Invalid type
    return "";
  }

  const timeString = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Convert 'am' or 'pm' to uppercase
  return timeString.replace(/(am|pm)/i, (match) => match.toUpperCase());
}

export default formatTimestamp;

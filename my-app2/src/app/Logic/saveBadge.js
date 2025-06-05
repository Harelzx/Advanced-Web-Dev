import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function saveBadge(userId, badgeLabel, dateEarned) {
  const badgeRef = doc(db, "users", userId, "badges", badgeLabel);
  await setDoc(badgeRef, {
    label: badgeLabel,
    dateEarned: dateEarned || new Date().toISOString().split("T")[0], // Default to today’s date
  });
}
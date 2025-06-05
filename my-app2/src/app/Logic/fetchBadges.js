import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export async function fetchBadges(userId) {
  const badgesCol = collection(db, "users", userId, "badges");
  const badgeSnapshot = await getDocs(badgesCol);
  const badges = badgeSnapshot.docs.map(doc => {
    const data = doc.data();
    let dateEarned = data.dateEarned;

    if (dateEarned && typeof dateEarned === "string") {
      const date = new Date(dateEarned);
      if (!isNaN(date.getTime())) {
        dateEarned = date.toISOString().split("T")[0];
      } else {
        dateEarned = null;
      }
    }
    return {
      label: data.label,
      dateEarned: dateEarned
    };
  });
  return badges;
}

export async function hasBadge(userId, badgeLabel) {
  const badges = await fetchBadges(userId);
  return badges.some(badge => badge.label === badgeLabel);
}
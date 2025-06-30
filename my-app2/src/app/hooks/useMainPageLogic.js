'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { fetchBadges, hasBadge, saveBadge, recordPageVisit, checkExplorerBadge } from '../components/Badge/BadgeSystem';

/**
 * Custom Hook for managing the main page logic for students.
 * This hook handles user authentication, data fetching for user profile,
 * grades, training progress, and badge system. It provides a clean API
 * for the MainPage component to render the student dashboard.
 *
 * @returns {Object} An object containing the state and functions for the main page:
 * - user: Object containing user information (fullName, school).
 * - grades: Object mapping subjects to their respective grades.
 * - earnedBadges: Array of badges earned by the user.
 * - showBadgeModal: Boolean indicating whether to show the badge notification modal.
 * - newBadgeLabel: String label of the newly earned badge, if any.
 * - trainingProgress: Object containing training progress (currentSession, completedSessions).
 * - setShowBadgeModal: Function to toggle the badge modal visibility.
 * - setNewBadgeLabel: Function to set the label of a newly earned badge.
 */
export function useMainPageLogic() {
  const [user, setUser] = useState({ fullName: 'טוען...', school: 'Braude' });
  const [grades, setGrades] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadgeLabel, setNewBadgeLabel] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const router = useRouter();

  // Main effect to fetch all initial data when the component mounts.
  // It verifies the user is logged in, then fetches their profile, grades,
  // training progress, and badges, and handles badge notifications.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for user authentication
        const userId = sessionStorage.getItem('uid');
        if (!userId) {
          router.push('/login');
          return;
        }

        // Fetch user profile
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ fullName: userDocSnap.data().fullName || 'משתמש' });
        } else {
          sessionStorage.removeItem('uid');
          router.push('/login');
          return;
        }

        // Fetch training progress
        const progressRef = doc(db, 'users', userId, 'training_progress', 'plan_1');
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          setTrainingProgress(progressSnap.data());
        } else {
          setTrainingProgress({ currentSession: 1, completedSessions: 0 });
        }

        // Fetch grades
        const resultsRef = collection(db, `users/${userId}/results`);
        const querySnapshot = await getDocs(resultsRef);
        const subjectGrades = {};
        querySnapshot.forEach((doc) => {
          subjectGrades[doc.id] = doc.data().grade || 0;
        });
        setGrades(subjectGrades);

        // Record page visit for badge tracking
        await recordPageVisit(userId, "Main_Page");

        // Check and award First Login badge
        const hasFirstLogin = await hasBadge(userId, "התחברות ראשונה");
        if (!hasFirstLogin) {
          const today = new Date().toISOString().split("T")[0];
          await saveBadge(userId, "התחברות ראשונה", today);
          setNewBadgeLabel("התחברות ראשונה");
          setShowBadgeModal(true);
        }

        // Check and award Explorer badge
        const hasExplorerBadge = await hasBadge(userId, "חוקר");
        if (!hasExplorerBadge) {
          const earnedExplorer = await checkExplorerBadge(userId);
          if (earnedExplorer) {
            setNewBadgeLabel("חוקר");
            setShowBadgeModal(true);
          }
        }

        // Fetch all earned badges
        const badges = await fetchBadges(userId);
        setEarnedBadges(badges);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [router]);

  return {
    user,
    grades,
    earnedBadges,
    showBadgeModal,
    newBadgeLabel,
    trainingProgress,
    setShowBadgeModal,
    setNewBadgeLabel
  };
}
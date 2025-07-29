"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { recordPageVisit } from "../components/Badge/BadgeSystem";

import Study from "../components/interstudy-ui/Study";
import { useStudyLogic } from "../hooks/useStudyLogic";
import {
  getFirstQuizScores,
  getPracticeQuestions,
  getBagrutQuestions,
  buildPracticeSession,
  saveSessionResults,
  getQuestionImageUrl,
} from "../firebase/trainingService";
import SessionStartScreen from "../components/interstudy-ui/SessionStartScreen";
import SessionSummaryScreen from "../components/interstudy-ui/SessionSummaryScreen";
import { SESSION_CONFIG } from "./sessionConfig";

/**
 * A simple controller component that wraps the Study UI with the study logic hook.
 * This helps to keep the main page component cleaner.
 */
const StudyController = ({
  practiceSets,
  onQuizComplete,
  sessionNumber,
  onHome,
}) => {
  const studyState = useStudyLogic(practiceSets, onQuizComplete, sessionNumber);

  return (
    <Study {...studyState} onHome={onHome} sessionNumber={sessionNumber} />
  );
};

// Helper function to determine available sessions based on completed sessions
const getAvailableSessions = (completedSessions) => {
  // Ensure completedSessions is an array
  const completed = Array.isArray(completedSessions) ? completedSessions : [];
  const available = new Set();

  // Always available
  available.add(1); // session 1 easy

  // Unlocking logic
  if (completed.includes(1)) {
    available.add(2); // session 2 easy
    available.add(4); // session 1 medium
  }
  if (completed.includes(2)) {
    available.add(3); // session 3 easy
    available.add(5); // session 2 medium
  }
  if (completed.includes(4)) {
    available.add(5); // session 2 medium
    available.add(7); // session 1 hard
  }
  if (completed.includes(5)) {
    available.add(6); // session 3 medium
    available.add(8); // session 2 hard
  }
  if (completed.includes(7)) {
    available.add(8); // session 2 hard
  }
  if (completed.includes(8)) {
    available.add(9); // session 3 hard
  }

  return Array.from(available);
};

// Component to display available sessions
const SessionSelection = ({ availableSessions, completedSessions, onSelectSession }) => {
  // Map session numbers to their index within each difficulty
  const difficultyCounters = { easy: 0, medium: 0, hard: 0 };
  const sessionTitles = {};
  Object.entries(SESSION_CONFIG).forEach(([sessionNum, config]) => {
    difficultyCounters[config.key] += 1;
    sessionTitles[sessionNum] = `תרגול ${difficultyCounters[config.key]}`;
  });

  return (
    <div className="min-h-screen panels p-4 pt-20" dir="rtl">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">בחר סשן תרגול</h2>
        
        {/* Explanation about unlocking system */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 max-w-3xl mx-auto shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">איך פותחים תרגולים חדשים?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            המערכת בנויה מ-9 תרגולים המתקדמים בהדרגה מרמה קלה לרמת בגרות.
          </p>
          
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">כללי הפתיחה:</h4>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">השלמת תרגול קל:</span>
                <span className="text-gray-700 dark:text-gray-300"> פותחת תרגול קל נוסף ותרגול בינוני חדש.</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">השלמת תרגול בינוני:</span>
                <span className="text-gray-700 dark:text-gray-300"> פותחת תרגול בינוני נוסף ותרגול קשה (ברמת בגרות).</span>
              </div>
            </div>
            
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SESSION_CONFIG).map(([sessionNum, config]) => {
            const sessionNumber = Number(sessionNum);
            const isAvailable = availableSessions.includes(sessionNumber);
            const isCompleted = completedSessions.includes(sessionNumber);
            
            return (
              <button
                key={sessionNum}
                onClick={() =>
                  isAvailable && onSelectSession(sessionNumber)
                }
                className={`panels p-6 rounded-lg shadow-md transition-all relative ${
                  isCompleted
                    ? "bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transform hover:scale-105 cursor-pointer"
                    : isAvailable
                    ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transform hover:scale-105 cursor-pointer"
                    : "bg-gray-300 dark:bg-gray-700 opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Completed checkmark */}
                {isCompleted && (
                  <div className="absolute top-2 left-2">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isCompleted || isAvailable ? "text-white" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {sessionTitles[sessionNum]}
                </h3>
                <p className={`text-sm ${
                  isCompleted ? "text-green-100" : isAvailable ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                }`}>
                  רמת קושי: {config.name}
                </p>
                
                {/* Status messages */}
                {isCompleted ? (
                  <div>
                    <p className="text-xs mt-2 text-green-100 font-semibold">
                      הושלם בהצלחה! ✓
                    </p>
                    <p className="text-xs mt-1 text-green-200">
                      לחץ כדי לתרגל שוב
                    </p>
                  </div>
                ) : !isAvailable ? (
                  <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    השלם תרגולים קודמים כדי לפתוח
                  </p>
                ) : (
                  <p className="text-xs mt-2 text-blue-100">
                    לחץ להתחלת התרגול
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * The main page component for the interactive study feature.
 * It acts as a controller, managing the overall state of a training session,
 * including data loading, session state, and rendering the appropriate UI.
 */
export default function InterStudyPage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for managing UI feedback (loading and errors)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for holding the core training data
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [practiceSets, setPracticeSets] = useState({
    easy: [],
    medium: [],
    hard: [],
  });
  const [availableSessions, setAvailableSessions] = useState([]);

  // State for managing the session flow
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [lastSessionResults, setLastSessionResults] = useState(null);
  const [showInitialExplanation, setShowInitialExplanation] = useState(false);

  /**
   * Loads all necessary data for the training session from Firestore.
   * This includes user's initial scores and their current training progress.
   * It also builds the question set for the current session.
   */
  const loadTrainingData = useCallback(
    async (userId) => {
      setIsLoading(true);
      setError(null);
      setSessionCompleted(false);

      try {
        // Record visit to InterStudy page
        await recordPageVisit(userId, "InterStudy");

        // Prerequisite: Check if the user has completed the initial quiz.
        const firstQuizScores = await getFirstQuizScores(userId);
        if (
          Object.keys(firstQuizScores).length === 0 ||
          Object.values(firstQuizScores).every((s) => s === 0)
        ) {
          router.push("/FirstQuiz");
          return;
        }

        // Fetch or create the user's training progress document.
        const progressRef = doc(
          db,
          "users",
          userId,
          "training_progress",
          "plan_1"
        );
        let progressSnap = await getDoc(progressRef);
        let progressData;

        if (!progressSnap.exists()) {
          // If no progress exists, create the initial document.
          progressData = {
            completedSessions: [],
            status: "in_progress",
            programStartDate: serverTimestamp(),
            lastActivity: serverTimestamp(),
          };
          await setDoc(progressRef, progressData);
        } else {
          progressData = progressSnap.data();
          // Ensure completedSessions is an array
          if (!Array.isArray(progressData.completedSessions)) {
            progressData.completedSessions = [];
          }
        }

        // If the user has completed the entire program, do nothing further.
        if (progressData.status === "completed") {
          setTrainingProgress(progressData);
          setIsLoading(false);
          return;
        }

        // Calculate available sessions based on completed ones
        const available = getAvailableSessions(progressData.completedSessions);
        setAvailableSessions(available);
        setTrainingProgress(progressData);
      } catch (e) {
        console.error("Error loading training data:", e);
        setError("אירעה שגיאה בטעינת נתוני האימון.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleSessionSelect = useCallback(
    async (sessionNumber) => {
      if (!user || !trainingProgress) return;

      setIsLoading(true);
      try {
        const sessionConfig = SESSION_CONFIG[sessionNumber];

        if (!sessionConfig) {
          setError(`הגדרות אימון לא נמצאו עבור תרגול מספר ${sessionNumber}.`);
          setIsLoading(false);
          return;
        }

        const { key: difficultyKey, value: difficultyNumber } = sessionConfig;
        let allQuestions;
        if (difficultyKey === "hard") {
          allQuestions = await getBagrutQuestions();
        } else {
          allQuestions = await getPracticeQuestions();
        }
        // For hard sessions, exclude already used hard questions
        let usedHardQuestionIds = trainingProgress.usedHardQuestions || [];
        let sessionQuestions;
        if (difficultyKey === "hard") {
          sessionQuestions = buildPracticeSession(
            { currentSession: sessionNumber },
            await getFirstQuizScores(user.uid),
            allQuestions,
            difficultyNumber,
            usedHardQuestionIds
          );
        } else {
          sessionQuestions = buildPracticeSession(
            { currentSession: sessionNumber },
            await getFirstQuizScores(user.uid),
            allQuestions,
            difficultyNumber
          );
        }

        if (sessionQuestions.length === 0) {
          setError(`לא נמצאו שאלות מתאימות עבור תרגול מספר ${sessionNumber}.`);
          setIsLoading(false);
          return;
        }

        if (difficultyKey === "hard") {
          // Fetch image URLs for each question in parallel
          const questionsWithImages = await Promise.all(
            sessionQuestions.map(async (q) => {
              const imageUrl = await getQuestionImageUrl(q.subject, q.imageRef);
              return { ...q, imageUrl };
            })
          );
          setPracticeSets({ easy: [], medium: [], hard: questionsWithImages });
        } else {
          setPracticeSets({
            easy: [],
            medium: [],
            hard: [],
            [difficultyKey]: sessionQuestions,
          });
        }
        setSelectedSession(sessionNumber);
        setSessionStarted(true);
        setIsLoading(false);
      } catch (e) {
        console.error("Error preparing session:", e);
        setError("אירעה שגיאה בהכנת התרגול.");
        setIsLoading(false);
      }
    },
    [user, trainingProgress]
  );

  /**
   * Callback function triggered when a quiz session is completed.
   * It saves the session results and updates the user's progress.
   */
  const handleQuizComplete = useCallback(
    async (results) => {
      if (!user || !trainingProgress || !selectedSession) return;

      setIsLoading(true);
      try {
        const updatedProgress = await saveSessionResults(
          user.uid,
          selectedSession,
          results,
          practiceSets
        );

        // Update completed sessions (ensure uniqueness)
        const prevCompleted = trainingProgress.completedSessions || [];
        const newCompletedSessions = Array.from(
          new Set([...prevCompleted, selectedSession])
        );
        const newAvailableSessions = getAvailableSessions(newCompletedSessions);

        // Track used hard questions
        let newUsedHardQuestions = trainingProgress.usedHardQuestions || [];
        if (results.difficulty === "hard") {
          // Add the current session's hard question IDs to the list
          const hardQuestionIds = (practiceSets.hard || []).map((q) => q.id);
          newUsedHardQuestions = Array.from(
            new Set([...newUsedHardQuestions, ...hardQuestionIds])
          );
        }

        // Check if all sessions are completed
        const allSessions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const completedNums = newCompletedSessions.map(Number);
        const isComplete = allSessions.every((s) => completedNums.includes(s));

        // Save updated completedSessions and usedHardQuestions to Firestore
        const progressRef = doc(
          db,
          "users",
          user.uid,
          "training_progress",
          "plan_1"
        );
        await setDoc(
          progressRef,
          {
            ...trainingProgress,
            completedSessions: newCompletedSessions,
            usedHardQuestions: newUsedHardQuestions,
            status: isComplete ? "completed" : "in_progress",
            lastActivity: serverTimestamp(),
          },
          { merge: true }
        );

        setLastSessionResults(results);
        setTrainingProgress((prev) => ({
          ...prev,
          completedSessions: newCompletedSessions,
          usedHardQuestions: newUsedHardQuestions,
          status: isComplete ? "completed" : "in_progress",
        }));
        setAvailableSessions(newAvailableSessions);
        setSessionCompleted(true);
      } catch (error) {
        console.error("Failed to save session:", error);
        setError("שגיאה בשמירת התרגול. נסה שוב.");
      } finally {
        setIsLoading(false);
      }
    },
    [user, trainingProgress, practiceSets, selectedSession]
  );

  // Effect to trigger data loading and page visit recording once the user is authenticated.
  useEffect(() => {
    if (user) {
      loadTrainingData(user.uid);
      // Show explanation only if coming from navbar (reset=1 parameter)
      const fromNavbar = searchParams.get("reset") === "1";
      if (fromNavbar) {
        setShowInitialExplanation(true);
        // Remove the reset param from the URL after handling
        if (typeof window !== "undefined" && window.history) {
          const url = new URL(window.location);
          url.searchParams.delete("reset");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    }
  }, [user, authLoading, loadTrainingData, searchParams]);

  useEffect(() => {
    if (searchParams.get("reset") === "1") {
      setSessionCompleted(false);
      setSessionStarted(false);
      setSelectedSession(null);
      if (user) loadTrainingData(user.uid);

      // Remove the reset param from the URL after handling
      if (typeof window !== "undefined" && window.history) {
        const url = new URL(window.location);
        url.searchParams.delete("reset");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [searchParams, user, loadTrainingData]);

  // --- Render Logic ---
  // The following section determines which UI to show based on the current state.

  if (isLoading || authLoading) {
    return (
      <div
        className="flex justify-center items-center h-screen pt-16"
        dir="rtl"
      >
        <div className="loader"></div>
        <p className="mr-4">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex justify-center items-center h-screen text-red-500 bg-red-50 p-4 rounded-lg pt-16"
        dir="rtl"
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4 pt-20"
        dir="rtl"
      >
        <p className="text-lg">עליך להתחבר כדי לגשת לתרגול.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
        >
          מעבר להתחברות
        </button>
      </div>
    );
  }

  if (!trainingProgress) {
    return (
      <div
        className="flex justify-center items-center h-screen pt-16"
        dir="rtl"
      >
        <div className="loader"></div>
        <p className="mr-4">טוען נתוני אימון...</p>
      </div>
    );
  }

  // Render flow for a logged-in user with loaded progress.
  if (trainingProgress.status === "completed") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-800 p-4 pt-20"
        dir="rtl"
      >
        <h2 className="text-3xl font-bold mb-4">כל הכבוד!</h2>
        <p className="mb-6">סיימת בהצלחה את כל תוכנית התרגולים.</p>
        <button
          onClick={async () => {
            // Update Firestore status to 'in_progress'
            if (user) {
              const progressRef = doc(
                db,
                "users",
                user.uid,
                "training_progress",
                "plan_1"
              );
              await setDoc(
                progressRef,
                { status: "in_progress" },
                { merge: true }
              );
            }
            setSessionCompleted(false);
            setSessionStarted(false);
            setSelectedSession(null);
            setShowInitialExplanation(false);
            setTrainingProgress((prev) => ({
              ...prev,
              status: "in_progress",
            }));
            if (user) {
              loadTrainingData(user.uid);
            }
          }}
          className="bg-gray-200/80 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300/90 transition duration-300 shadow-md"
        >
          חזור לעמוד התרגולים
        </button>
      </div>
    );
  }

  if (sessionCompleted && lastSessionResults) {
    // Find the next available session (the lowest-numbered available session not yet completed)
    const nextAvailable = availableSessions
      .filter((s) => !(trainingProgress.completedSessions || []).includes(s))
      .sort((a, b) => a - b)[0];

    return (
      <SessionSummaryScreen
        results={lastSessionResults}
        completedSessions={selectedSession}
        nextSessionNumber={nextAvailable}
        onContinue={() => {
          if (nextAvailable) {
            setSessionCompleted(false);
            setSessionStarted(false);
            setSelectedSession(nextAvailable);
            setShowInitialExplanation(false);
          }
        }}
        onBackToSessions={() => {
          setSessionCompleted(false);
          setSessionStarted(false);
          setSelectedSession(null);
          setShowInitialExplanation(false);
        }}
        isComplete={!nextAvailable}
        onRedoSession={() => {
          setSessionCompleted(false);
          setSessionStarted(false);
          setSelectedSession(selectedSession);
          setShowInitialExplanation(false);
        }}
      />
    );
  }

  if (showInitialExplanation) {
    return (
      <SessionStartScreen
        isGeneralExplanation={true}
        onStart={() => setShowInitialExplanation(false)}
      />
    );
  }

  if (!selectedSession) {
    return (
      <SessionSelection
        availableSessions={availableSessions}
        completedSessions={trainingProgress?.completedSessions || []}
        onSelectSession={handleSessionSelect}
      />
    );
  }

  // Default case: The session is active, show the main study UI.
  return (
    <div className="min-h-screen panels pt-16" dir="rtl">
      <StudyController
        practiceSets={practiceSets}
        onQuizComplete={handleQuizComplete}
        sessionNumber={selectedSession}
        onHome={() => {
          setSessionStarted(false);
          setSelectedSession(null);
          setShowInitialExplanation(false);
        }}
      />
    </div>
  );
}

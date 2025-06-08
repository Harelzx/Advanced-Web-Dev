'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import Study from '../components/interstudy-ui/Study';
import { useStudyLogic } from '../hooks/useStudyLogic';
import {
    getFirstQuizScores,
    getPracticeQuestions,
    buildPracticeSession,
    saveSessionResults
} from '../firebase/trainingService';
import SessionStartScreen from '../components/interstudy-ui/SessionStartScreen';
import SessionSummaryScreen from '../components/interstudy-ui/SessionSummaryScreen';
import { SESSION_CONFIG } from '@/utils/constants';

/**
 * A simple controller component that wraps the Study UI with the study logic hook.
 * This helps to keep the main page component cleaner.
 */
const StudyController = ({ practiceSets, onQuizComplete, sessionNumber, onHome }) => {
    const studyState = useStudyLogic(practiceSets, onQuizComplete, sessionNumber);

    return (
        <Study
            {...studyState}
            onHome={onHome}
            sessionNumber={sessionNumber}
        />
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

    // State for managing UI feedback (loading and errors)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for holding the core training data
    const [trainingProgress, setTrainingProgress] = useState(null);
    const [practiceSets, setPracticeSets] = useState({ easy: [], medium: [], hard: [] });
    
    // State for managing the session flow (start, completion)
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const [lastSessionResults, setLastSessionResults] = useState(null);

    /**
     * Loads all necessary data for the training session from Firestore.
     * This includes user's initial scores and their current training progress.
     * It also builds the question set for the current session.
     */
    const loadTrainingData = useCallback(async (userId) => {
        setIsLoading(true);
        setError(null);
        setSessionCompleted(false);

        try {
            // Prerequisite: Check if the user has completed the initial quiz.
            const firstQuizScores = await getFirstQuizScores(userId);
            if (Object.keys(firstQuizScores).length === 0 || Object.values(firstQuizScores).every(s => s === 0)) {
                router.push('/FirstQuiz');
                return;
            }

            // Fetch or create the user's training progress document.
            const progressRef = doc(db, 'users', userId, 'training_progress', 'plan_1');
            let progressSnap = await getDoc(progressRef);
            let progressData;

            if (!progressSnap.exists()) {
                // If no progress exists, create the initial document.
                progressData = {
                    currentSession: 1,
                    completedSessions: 0,
                    status: 'in_progress',
                    programStartDate: serverTimestamp(),
                    lastActivity: serverTimestamp()
                };
                await setDoc(progressRef, progressData);
            } else {
                progressData = progressSnap.data();
            }

            // If the user has completed the entire program, do nothing further.
            if (progressData.status === 'completed') {
                setTrainingProgress(progressData);
                setIsLoading(false);
                return;
            }

            // Fetch all questions and build a personalized session using the centralized config.
            const allQuestions = await getPracticeQuestions();
            const sessionConfig = SESSION_CONFIG[progressData.currentSession];
            
            if (!sessionConfig) {
                setError(`הגדרות אימון לא נמצאו עבור סשן מספר ${progressData.currentSession}.`);
                setIsLoading(false);
                return;
            }

            const { key: difficultyKey, value: difficultyNumber, name: difficultyName } = sessionConfig;
            console.log(`[InterStudy] Loading session: ${progressData.currentSession}, Difficulty: ${difficultyKey} (number: ${difficultyNumber})`);
            
            const sessionQuestions = buildPracticeSession(progressData, firstQuizScores, allQuestions, difficultyNumber);
            
            if (sessionQuestions.length === 0) {
                setError(`לא נמצאו שאלות מתאימות עבורך ברמת קושי "${difficultyName}" לסשן ${progressData.currentSession}. ייתכן שסיימת את כל השאלות הזמינות ברמה זו.`);
                setIsLoading(false);
                return;
            }
            
            // Set the questions for the current session, using the correct difficulty key.
            setPracticeSets({ easy: [], medium: [], hard: [], [difficultyKey]: sessionQuestions });
            setTrainingProgress(progressData);

        } catch (e) {
            console.error("Error loading training data:", e);
            setError("אירעה שגיאה בטעינת נתוני האימון.");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    /**
     * Callback function triggered when a quiz session is completed.
     * It saves the session results and updates the user's progress.
     */
    const handleQuizComplete = useCallback(async (results) => {
        if (!user || !trainingProgress) return;
        
        setIsLoading(true);
        try {
            // Call the service function to save data to Firestore.
            const updatedProgress = await saveSessionResults(
                user.uid,
                trainingProgress.currentSession,
                results,
                practiceSets
            );
            
            // Update local state to reflect the new progress and show the summary screen.
            setLastSessionResults(results);
            setTrainingProgress(prev => ({...prev, ...updatedProgress}));
            setSessionCompleted(true);

        } catch (error) {
            console.error("Failed to save session:", error);
            setError("שגיאה בשמירת התרגול. נסה שוב.");
        } finally {
            setIsLoading(false);
        }
    }, [user, trainingProgress, practiceSets]);

    // Effect to trigger data loading once the user is authenticated.
    useEffect(() => {
        if (user) {
            loadTrainingData(user.uid);
        }
    }, [user, authLoading, loadTrainingData]);

    // --- Render Logic ---
    // The following section determines which UI to show based on the current state.

    if (isLoading || authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500 bg-red-50 p-4 rounded-lg">
                <p>{error}</p>
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4" dir="rtl">
                <p className="text-lg">עליך להתחבר כדי לגשת לתרגול.</p>
                <button
                    onClick={() => router.push('/login')}
                    className="mt-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                >
                    מעבר להתחברות
                </button>
            </div>
        )
    }

    if (!trainingProgress) {
         return (
            <div className="flex justify-center items-center h-screen">
                 <div className="loader"></div>
                 <p className="ml-4">טוען נתוני אימון...</p>
            </div>
        );
    }

    // Render flow for a logged-in user with loaded progress.
    if (trainingProgress.status === 'completed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-800 p-4">
                <h2 className="text-3xl font-bold mb-4">כל הכבוד!</h2>
                <p>סיימת בהצלחה את כל תוכנית האימונים.</p>
            </div>
        );
    }
    
    if (sessionCompleted && lastSessionResults) {
        return (
            <SessionSummaryScreen
                results={lastSessionResults}
                completedSessions={trainingProgress.completedSessions}
                nextSessionNumber={trainingProgress.currentSession}
            />
        );
    }

    if (!sessionStarted) {
        return (
            <SessionStartScreen
                sessionNumber={trainingProgress.currentSession}
                difficulty={SESSION_CONFIG[trainingProgress.currentSession]?.name || 'מתחילים'}
                onStart={() => setSessionStarted(true)}
            />
        );
    }

    // Default case: The session is active, show the main study UI.
    return (
        <div className="container mx-auto p-4" dir="rtl">
            <StudyController
                practiceSets={practiceSets}
                onQuizComplete={handleQuizComplete}
                sessionNumber={trainingProgress.currentSession}
                onHome={() => router.push('/Main_Page')}
            />
        </div>
    );
}
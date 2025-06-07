'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase/config';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import ProtectedRoute from '../components/ProtectedRoute';
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

const difficultyMap = {
    1: 'קל', 2: 'קל', 3: 'קל',
    4: 'בינוני', 5: 'בינוני', 6: 'בינוני',
    7: 'קשה', 8: 'קשה', 9: 'קשה'
};

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

export default function InterStudyPage() {
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [trainingProgress, setTrainingProgress] = useState(null);
    const [practiceSets, setPracticeSets] = useState({ easy: [], medium: [], hard: [] });
    
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const [lastSessionResults, setLastSessionResults] = useState(null);

    const loadTrainingData = useCallback(async (userId) => {
        setIsLoading(true);
        setError(null);
        setSessionCompleted(false);

        try {
            const firstQuizScores = await getFirstQuizScores(userId);
            if (Object.keys(firstQuizScores).length === 0 || Object.values(firstQuizScores).every(s => s === 0)) {
                setError("לא נמצאו תוצאות מבחן ראשוני. אנא השלם את המבחן הראשון כדי להתחיל.");
                setIsLoading(false);
                return;
            }

            const progressRef = doc(db, 'training_progress', userId);
            let progressSnap = await getDoc(progressRef);
            let progressData;

            if (!progressSnap.exists()) {
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

            if (progressData.status === 'completed') {
                setTrainingProgress(progressData);
                setIsLoading(false);
                return;
            }

            const allQuestions = await getPracticeQuestions();
            const sessionQuestions = buildPracticeSession(progressData, firstQuizScores, allQuestions);
            
            if (sessionQuestions.length === 0) {
                setError(`לא נמצאו שאלות מתאימות עבורך לסשן ${progressData.currentSession}. ייתכן שסיימת את כל השאלות הזמינות.`);
                setIsLoading(false);
                return;
            }
            
            const difficultyLevels = { 1: 'easy', 2: 'easy', 3: 'easy', 4: 'medium', 5: 'medium', 6: 'medium', 7: 'hard', 8: 'hard', 9: 'hard' };
            const difficulty = difficultyLevels[progressData.currentSession];
            
            setPracticeSets({ easy: [], medium: [], hard: [], [difficulty]: sessionQuestions });
            setTrainingProgress(progressData);

        } catch (e) {
            console.error("Error loading training data:", e);
            setError("אירעה שגיאה בטעינת נתוני האימון.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleQuizComplete = useCallback(async (results) => {
        if (!user || !trainingProgress) return;
        
        setIsLoading(true);
        try {
            const updatedProgress = await saveSessionResults(
                user.uid, 
                trainingProgress.currentSession, 
                results, 
                practiceSets
            );
            
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

    useEffect(() => {
        if (user) {
            loadTrainingData(user.uid);
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, loadTrainingData]);

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
                difficulty={difficultyMap[trainingProgress.currentSession] || 'מתחילים'}
                onStart={() => setSessionStarted(true)}
            />
        );
    }

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="container mx-auto p-4" dir="rtl">
                <StudyController 
                    practiceSets={practiceSets} 
                    onQuizComplete={handleQuizComplete}
                    sessionNumber={trainingProgress.currentSession}
                    onHome={() => router.push('/Main_Page')}
                />
            </div>
        </ProtectedRoute>
    );
} 
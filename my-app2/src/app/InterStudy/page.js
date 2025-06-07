'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase/config';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import ProtectedRoute from '../components/ProtectedRoute';
import Study from '../components/Study';
import { useStudyLogic } from '../hooks/useStudyLogic';
import { 
    getFirstQuizScores, 
    getPracticeQuestions, 
    buildPracticeSession,
    saveSessionResults
} from '../firebase/trainingService';

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
            // If not loading and no user, there's nothing to do.
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
        const finalScore = Math.round((lastSessionResults.score / lastSessionResults.totalQuestions) * 100);
        const sessionNumber = trainingProgress.completedSessions; 
        const nextSessionNumber = trainingProgress.currentSession;

        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4" dir="rtl">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">כל הכבוד!</h2>
                    <p className="text-lg text-gray-700 mb-6">
                        סיימת את סשן מספר <span className="font-bold">{sessionNumber}</span> בציון <span className="font-bold text-indigo-600">{finalScore}%</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {nextSessionNumber <= 9 ? (
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition duration-300 shadow-md transform hover:scale-105"
                            >
                                המשך לסשן הבא ({nextSessionNumber})
                            </button>
                        ) : (
                            <p className="text-lg font-semibold text-green-600">סיימת את כל תוכנית האימונים!</p>
                        )}
                        <button
                            onClick={() => router.push('/Main_Page')}
                            className="bg-gray-200/80 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300/90 transition duration-300 shadow-md"
                        >
                            חזור לעמוד הראשי
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!sessionStarted) {
        const difficulty = difficultyMap[trainingProgress.currentSession] || 'מתחילים';
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4" dir="rtl">
                <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">תרגול מספר {trainingProgress.currentSession}</h1>
                    <p className="text-xl text-gray-600 mb-6">רמת קושי: <span className="font-semibold text-indigo-600">{difficulty}</span></p>
                    
                    <p className="text-gray-700 mb-8 max-w-lg mx-auto">
                        התרגול מותאם אישית עבורך על בסיס התוצאות מהמבחן הראשוני ומתמקד בנושאים שבהם נדרש חיזוק.
                    </p>
                    
                    <div className="bg-indigo-50/50 p-6 rounded-2xl mb-8 text-right space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">כמה המלצות לפני שמתחילים:</h3>
                        <div className="flex items-start">
                            <span className="text-xl text-indigo-500 ml-3 pt-1">💡</span>
                            <p className="text-gray-700"><strong>קצב מומלץ:</strong> תרגול אחד ביום, עד שלושה בשבוע. עקביות היא המפתח.</p>
                        </div>
                        <div className="flex items-start">
                            <span className="text-xl text-indigo-500 ml-3 pt-1">🤔</span>
                            <p className="text-gray-700"><strong>נתקעת?</strong> אין בעיה! מורה ה-AI שלנו זמין לכל שאלה, 24/7.</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setSessionStarted(true)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all duration-300 text-xl shadow-lg transform hover:scale-105"
                    >
                        בואו נתחיל!
                    </button>
                </div>
            </div>
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
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

/**
 * Custom Hook for managing the dashboard logic.
 * This hook is responsible for fetching, processing, and managing all data 
 * related to the parent/teacher dashboard. It handles user authentication,
 * data fetching for students, and provides a clean API to the UI component.
 */
export function useDashboardLogic() {
    const router = useRouter();
    // Core state for the dashboard
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [studentsData, setStudentsData] = useState([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserData, setCurrentUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Cache for Firebase query results to reduce API calls
    const cacheRef = useRef({
        practiceQuestions: null,
        questionsTimestamp: 0,
        studentResults: new Map(), // studentId -> { data, timestamp }
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    });

    // Fetches and computes detailed results for a single student,
    // including test grades, practice performance, and progress.
    const getStudentResults = useCallback(async (studentId, studentInfo) => {
        try {
            // Check cache first
            const now = Date.now();
            const cachedResult = cacheRef.current.studentResults.get(studentId);
            if (cachedResult && (now - cachedResult.timestamp) < cacheRef.current.CACHE_DURATION) {
                return cachedResult.data;
            }
            // Fetch initial test results
            const resultsRef = collection(db, `users/${studentId}/results`);
            const resultsSnapshot = await getDocs(resultsRef);
            
            let grades = {};
            resultsSnapshot.forEach((doc) => {
                const subject = doc.id;
                const data = doc.data();
                grades[subject] = data.grade || 0;
            });

            // No fake data - let grades be empty if student hasn't taken initial test
            // This is better UX than showing random fake grades

            // Calculate dynamic performance and wrong questions from practice sessions
            const practicePerformanceData = {};
            const wrongQuestionsData = {};
            let totalTime = 0;
            let sessionCount = 0;
            
            // Additional analytics data
            const sessionAnalytics = [];
            let lastStudyDate = null;

            // Query interstudy_sessions subcollection instead of daily_practice
            const sessionsRef = collection(db, 'users', studentId, 'interstudy_sessions');
            const sessionsSnap = await getDocs(sessionsRef);

            // Also need to get practice questions to map questionIds to subjects
            // Use cached practice questions if available
            let questionToSubject = {};
            if (cacheRef.current.practiceQuestions && 
                (now - cacheRef.current.questionsTimestamp) < cacheRef.current.CACHE_DURATION) {
                questionToSubject = cacheRef.current.practiceQuestions;
            } else {
                const practiceQuestionsRef = collection(db, 'practice_questions');
                const practiceQuestionsSnap = await getDocs(practiceQuestionsRef);
                practiceQuestionsSnap.forEach(doc => {
                    const question = doc.data();
                    if (question.subject) {
                        questionToSubject[doc.id] = question.subject;
                    }
                });
                // Cache the practice questions
                cacheRef.current.practiceQuestions = questionToSubject;
                cacheRef.current.questionsTimestamp = now;
            }

            sessionsSnap.forEach(doc => {
                const sessionData = doc.data();
                const sessionNumber = parseInt(doc.id.replace('session_', '')) || 0;
                
                if (sessionData.timeSpent) {
                    totalTime += sessionData.timeSpent;
                    sessionCount++;
                }
                
                // Track last study date
                if (sessionData.completedAt) {
                    const sessionDate = sessionData.completedAt.toDate();
                    if (!lastStudyDate || sessionDate > lastStudyDate) {
                        lastStudyDate = sessionDate;
                    }
                }
                
                // Calculate session performance for analytics and charts
                // Track both per-subject performance and overall session metrics
                let sessionCorrect = 0;
                let sessionTotal = 0;
                
                // Process subject breakdown data from this session
                if (sessionData.subjectBreakdown) {
                    Object.entries(sessionData.subjectBreakdown).forEach(([subject, data]) => {
                        // Initialize subject performance tracking if first encounter
                        if (!practicePerformanceData[subject]) {
                            practicePerformanceData[subject] = { correct: 0, total: 0 };
                        }
                        
                        // Accumulate correct/total across all sessions for this subject
                        practicePerformanceData[subject].correct += data.correct;
                        practicePerformanceData[subject].total += data.questions;
                        
                        // Add to session totals for overall session accuracy calculation
                        sessionCorrect += data.correct;
                        sessionTotal += data.questions;
                    });
                } else if (sessionNumber >= 7 && sessionNumber <= 9) {
                    // For bagrut sessions (7, 8, 9) without subjectBreakdown, calculate from mistakes
                    // Assume 5 questions for bagrut sessions
                    sessionTotal = 5;
                    sessionCorrect = sessionTotal - (sessionData.mistakes?.length || 0);
                }
                
                // Store session analytics for trend charts and improvement graphs
                // Only include sessions with actual question data
                if (sessionTotal > 0) {
                    sessionAnalytics.push({
                        session: sessionNumber,
                        accuracy: Math.round((sessionCorrect / sessionTotal) * 100),
                        date: sessionData.completedAt ? sessionData.completedAt.toDate() : null,
                        timeSpent: sessionData.timeSpent || 0
                    });
                }
                
                // Transform mistakes array to wrongQuestions object
                if (sessionData.mistakes && sessionData.mistakes.length > 0) {
                    sessionData.mistakes.forEach(mistake => {
                        const subject = questionToSubject[mistake.questionId];
                        if (subject) {
                            if (!wrongQuestionsData[subject]) {
                                wrongQuestionsData[subject] = [];
                            }
                            wrongQuestionsData[subject].push(mistake.questionId);
                        }
                    });
                }
            });
            const averageTimeSpent = sessionCount > 0 ? totalTime / sessionCount : 0;
            
            const practicePerformance = Object.entries(practicePerformanceData).reduce((acc, [subject, data]) => {
                acc[subject] = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                return acc;
            }, {});

            // Fetch overall training progress
            const progressRef = doc(db, 'users', studentId, 'training_progress', 'plan_1');
            const progressSnap = await getDoc(progressRef);
            let trainingProgress = { completedSessions: 0, currentSession: 1 };
            if (progressSnap.exists()) {
                trainingProgress = progressSnap.data();
            }

            // Valid subjects - only these 4 subjects should appear
            const validSubjects = ['גיאומטריה', 'הסתברות', 'חישובים פיננסיים', 'סטטיסטיקה'];
            
            // Subject translation mapping (only for English subjects)
            const subjectTranslations = {
                'geometry': 'גיאומטריה',
                'probability': 'הסתברות', 
                'statistics': 'סטטיסטיקה',
                'financial': 'חישובים פיננסיים',
                'finance': 'חישובים פיננסיים'
            };

            // Translate and filter practice performance - only keep valid subjects
            const translatedPracticePerformance = Object.entries(practicePerformance).reduce((acc, [subject, score]) => {
                const hebrewSubject = subjectTranslations[subject] || subject;
                // Only include if it's one of our valid subjects
                if (validSubjects.includes(hebrewSubject)) {
                    acc[hebrewSubject] = score;
                }
                return acc;
            }, {});

            // Combine initial grades with translated practice data for a full performance picture
            const combinedPerformance = { ...grades, ...translatedPracticePerformance };
            
            // Calculate combined average including both first quiz and practice sessions
            const averageGrade = (() => {
                const firstQuizGrades = Object.values(grades);
                
                // If no grades at all, return 0
                if (firstQuizGrades.length === 0) {
                    return 0;
                }
                
                // Calculate first quiz average
                const firstQuizAvg = firstQuizGrades.length > 0 
                    ? firstQuizGrades.reduce((a, b) => a + b, 0) / firstQuizGrades.length 
                    : 0;
                
                // Calculate practice sessions average from completed sessions only
                let practiceAvg = 0;
                const completedSessions = trainingProgress?.completedSessions || [];
                
                if (completedSessions.length > 0 && sessionAnalytics.length > 0) {
                    // Only use accuracy data from sessions that are marked as completed
                    const completedSessionAccuracies = sessionAnalytics
                        .filter(session => completedSessions.includes(session.session))
                        .map(session => session.accuracy);
                    
                    practiceAvg = completedSessionAccuracies.length > 0
                        ? completedSessionAccuracies.reduce((a, b) => a + b, 0) / completedSessionAccuracies.length
                        : 0;
                }
                
                // Combine the averages: if both exist, weight them equally
                if (firstQuizGrades.length > 0 && practiceAvg > 0) {
                    return (firstQuizAvg + practiceAvg) / 2;
                } else if (firstQuizGrades.length > 0) {
                    return firstQuizAvg;
                } else {
                    return practiceAvg;
                }
            })();
            
            // Calculate days since last study
            const daysSinceLastStudy = lastStudyDate 
                ? Math.floor((new Date() - lastStudyDate) / (1000 * 60 * 60 * 24))
                : null;
            
            // Sort session analytics by session number
            sessionAnalytics.sort((a, b) => a.session - b.session);
            
            // Calculate preferred study times based on session history
            // Extract hour (0-23) from each session's completion date
            const studyHours = sessionAnalytics
                .filter(s => s.date) // Only sessions with valid dates
                .map(s => s.date.getHours()); // Get hour component
            
            // Find most frequent study hour using reduce function
            // Compares frequency of each hour and returns the most common one
            const preferredHour = studyHours.length > 0 
                ? studyHours.reduce((a, b, _, arr) => 
                    // Count occurrences of hour 'a' vs hour 'b' in array
                    // Return the hour that appears more frequently
                    arr.filter(h => h === a).length >= arr.filter(h => h === b).length ? a : b
                ) : null;

            const result = {
                id: studentId,
                name: studentInfo.fullName || studentInfo.email || 'Unknown Student',
                grades, // Keep initial test grades separate for detailed view
                averageGrade,
                trainingProgress,
                averageTimeSpent,
                practicePerformance: combinedPerformance, // Use combined data for summary
                wrongQuestions: wrongQuestionsData,
                // New analytics data
                sessionAnalytics,
                daysSinceLastStudy,
                lastStudyDate,
                preferredStudyHour: preferredHour,
            };
            
            // Cache the result
            cacheRef.current.studentResults.set(studentId, {
                data: result,
                timestamp: now
            });
            
            return result;
        } catch (error) {
            console.error('Error fetching student results:', error);
            return {
                id: studentId,
                name: studentInfo.fullName || 'Unknown Student',
                grades: {},
                averageGrade: 0,
                trainingProgress: { completedSessions: 0, currentSession: 1 },
                averageTimeSpent: 0,
                practicePerformance: {},
                wrongQuestions: {},
                // Default analytics data
                sessionAnalytics: [],
                daysSinceLastStudy: null,
                lastStudyDate: null,
                preferredStudyHour: null,
            };
        }
    }, []);

    // Fetches data for all students/children linked to the current user.
    const fetchStudentsData = useCallback(async (_role, _currentUid, childrenIds = []) => {
        try {
            let students = [];
            const validChildrenIds = Array.isArray(childrenIds) 
                ? childrenIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
                : [];
            
            if (validChildrenIds.length > 0) {
                // Using Promise.all for concurrent fetching
                const studentPromises = validChildrenIds.map(studentId => {
                    const studentDocRef = doc(db, 'users', studentId);
                    return getDoc(studentDocRef).then(studentDocSnap => {
                        if (studentDocSnap.exists()) {
                            return getStudentResults(studentId, studentDocSnap.data());
                        }
                        return null;
                    }).catch(error => {
                        console.error(`Error fetching student ${studentId}:`, error);
                        return null;
                    });
                });
                
                const resolvedStudents = await Promise.all(studentPromises);
                students = resolvedStudents.filter(s => s !== null);
            }
            setStudentsData(students);
        } catch (error) {
            console.error('Error fetching students data:', error);
        }
    }, [getStudentResults]);

    // Main effect to fetch all initial data when the component mounts.
    // It verifies the user is logged in, then fetches their profile and their students' data.
    useEffect(() => {
        // This check ensures code only runs on the client side
        if (typeof window !== 'undefined') {
            const uid = sessionStorage.getItem('uid');
            if (!uid) {
                router.replace('/login');
                return;
            }
            setCurrentUserId(uid);
            
            const fetchAllData = async () => {
                setLoading(true);
                try {
                    const userDocRef = doc(db, 'users', uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUserRole(userData.role);
                        setUserName(userData.fullName || userData.email);
                        
                        if (userData.role === 'teacher' || userData.role === 'parent') {
                            const children = userData.children || [];
                            await fetchStudentsData(userData.role, uid, children);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setError('Failed to load dashboard data. Please try refreshing the page.');
                } finally {
                    setLoading(false);
                }
            };
            fetchAllData();
        }
    }, [router, fetchStudentsData]);

    // Fetch current user data for profile editing
    useEffect(() => {
        const fetchCurrentUserData = async () => {
            if (currentUserId) {
                try {
                    const userDocRef = doc(db, 'users', currentUserId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setCurrentUserData({ id: currentUserId, ...userDocSnap.data() });
                    }
                } catch (error) {
                    console.error('Error fetching current user data:', error);
                }
            }
        };
        fetchCurrentUserData();
    }, [currentUserId]);
    
    // Provides a function to manually refresh the dashboard data,
    // useful after adding or removing a student.
    const refreshData = useCallback(async () => {
        if (currentUserId) {
            setLoading(true);
            
            // Clear caches before refresh to ensure fresh data
            cacheRef.current.studentResults.clear();
            cacheRef.current.practiceQuestions = null;
            cacheRef.current.questionsTimestamp = 0;
            
            const userDocRef = doc(db, 'users', currentUserId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Update user name in case profile was updated
                setUserName(userData.fullName || userData.email);
                await fetchStudentsData(userData.role, currentUserId, userData.children || []);
            }
            setLoading(false);
        }
    }, [currentUserId, fetchStudentsData]);

    // Provides a function to update user name after profile edit
    const updateUserName = useCallback((newName) => {
        setUserName(newName);
    }, []);

    // The API returned by the hook for the component to use.
    return {
        userRole,
        userName,
        studentsData,
        currentUserId,
        currentUserData,
        loading,
        error,
        refreshData,
        updateUserName,
    };
} 
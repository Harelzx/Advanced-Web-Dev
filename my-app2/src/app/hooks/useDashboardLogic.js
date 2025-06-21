'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getPracticeQuestions } from '../firebase/trainingService';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetches and computes detailed results for a single student,
    // including test grades, practice performance, and progress.
    const getStudentResults = useCallback(async (studentId, studentInfo) => {
        try {
            // Fetch initial test results
            const resultsRef = collection(db, `users/${studentId}/results`);
            const resultsSnapshot = await getDocs(resultsRef);
            
            let grades = {};
            resultsSnapshot.forEach((doc) => {
                const subject = doc.id;
                const data = doc.data();
                grades[subject] = data.grade || 0;
            });

            // If no results found, create default/demo data
            if (Object.keys(grades).length === 0) {
                grades = {
                    'אלגברה': Math.floor(Math.random() * 40) + 60, // 60-100
                    'גיאומטריה': Math.floor(Math.random() * 40) + 60,
                    'חשבון': Math.floor(Math.random() * 40) + 60,
                    'הסתברות וסטטיסטיקה': Math.floor(Math.random() * 40) + 60
                };
            }

            // Calculate dynamic performance and wrong questions from practice sessions
            const practicePerformanceData = {};
            const wrongQuestionsData = {};
            let totalTime = 0;
            let sessionCount = 0;

            const sessionsQuery = query(collection(db, 'daily_practice'), where("studentId", "==", studentId));
            const sessionsSnap = await getDocs(sessionsQuery);

            sessionsSnap.forEach(doc => {
                const sessionData = doc.data();
                if (sessionData.timeSpent) {
                    totalTime += sessionData.timeSpent;
                    sessionCount++;
                }
                if (sessionData.subjectBreakdown) {
                    Object.entries(sessionData.subjectBreakdown).forEach(([subject, data]) => {
                        if (!practicePerformanceData[subject]) {
                            practicePerformanceData[subject] = { correct: 0, total: 0 };
                        }
                        practicePerformanceData[subject].correct += data.correct;
                        practicePerformanceData[subject].total += data.questions;
                    });
                }
                 if(sessionData.wrongQuestions) {
                    Object.entries(sessionData.wrongQuestions).forEach(([subject, questions]) => {
                        if (!wrongQuestionsData[subject]) {
                            wrongQuestionsData[subject] = [];
                        }
                        wrongQuestionsData[subject].push(...questions);
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

            // Combine initial grades with practice data for a full performance picture
            const combinedPerformance = { ...grades, ...practicePerformance };
            
            const averageGrade = Object.values(grades).length > 0 
                ? Object.values(grades).reduce((a, b) => a + b, 0) / Object.values(grades).length 
                : 0;
            
            const result = {
                id: studentId,
                name: studentInfo.fullName || studentInfo.email || 'Unknown Student',
                grades, // Keep initial test grades separate for detailed view
                averageGrade,
                trainingProgress,
                averageTimeSpent,
                practicePerformance: combinedPerformance, // Use combined data for summary
                wrongQuestions: wrongQuestionsData,
            };
            
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
            };
        }
    }, []);

    // Fetches data for all students/children linked to the current user.
    const fetchStudentsData = useCallback(async (role, currentUid, childrenIds = []) => {
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
    
    // Provides a function to manually refresh the dashboard data,
    // useful after adding or removing a student.
    const refreshData = useCallback(async () => {
        if (currentUserId) {
            setLoading(true);
            const userDocRef = doc(db, 'users', currentUserId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                await fetchStudentsData(userData.role, currentUserId, userData.children || []);
            }
            setLoading(false);
        }
    }, [currentUserId, fetchStudentsData]);

    // The API returned by the hook for the component to use.
    return {
        userRole,
        userName,
        studentsData,
        currentUserId,
        loading,
        error,
        refreshData,
    };
} 
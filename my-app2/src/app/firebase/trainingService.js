// This file will centralize all Firestore interactions for the training program.
// We will move functions like getFirstQuizScores, getPracticeQuestions, etc., here. 

import { db } from './config';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Fetches the initial quiz scores for a user
export async function getFirstQuizScores(userId) {
    const scores = {};
    const resultsCollectionRef = collection(db, 'users', userId, 'results');
    const querySnapshot = await getDocs(resultsCollectionRef);

    if (querySnapshot.empty) {
        console.warn(`No result documents found for user ${userId}`);
        return {};
    }

    querySnapshot.forEach(docSnap => {
        const subject = docSnap.id;
        const data = docSnap.data();
        if (data && typeof data.grade !== 'undefined') {
            scores[subject] = data.grade;
        }
    });
    
    return scores;
}

// Fetches all available practice questions from the database
export async function getPracticeQuestions() {
    const questionsCollection = collection(db, 'practice_questions');
    const querySnapshot = await getDocs(questionsCollection);
    const questions = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const { question_text, question, questionText, correct_answer, incorrect_answers, explanation, ...rest } = data;

        const text = question_text || question || questionText || "No question text found";
        const correctAnswer = correct_answer;
        const allOptions = [correctAnswer, ...incorrect_answers];

        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }
        
        const correctIndex = allOptions.findIndex(opt => opt === correctAnswer);

        questions.push({ 
            id: doc.id,
            question: text,
            options: allOptions,
            correct: correctIndex,
            explanation: explanation || "No explanation available.",
            ...rest 
        });
    });
    return questions;
}

// Builds a personalized practice session based on weaknesses
export function buildPracticeSession(trainingProgress, firstQuizScores, allQuestions) {
    const sessionQuestions = [];
    const subjectsByWeakness = Object.entries(firstQuizScores)
        .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
        .map(([subject]) => subject);

    const questionDistribution = [4, 3, 2, 1];
    let questionCount = 0;

    for (let i = 0; i < subjectsByWeakness.length && questionCount < 10; i++) {
        const subject = subjectsByWeakness[i];
        const numQuestions = questionDistribution[i] || 1;
        
        const filteredQuestions = allQuestions.filter(q => q.subject === subject);
        const questionsToAdd = filteredQuestions.slice(0, numQuestions);
        
        sessionQuestions.push(...questionsToAdd);
        questionCount += questionsToAdd.length;
    }

    if (sessionQuestions.length < 10) {
        const remainingNeeded = 10 - sessionQuestions.length;
        const remainingQuestions = allQuestions.filter(q => !sessionQuestions.some(sq => sq.id === q.id));
        sessionQuestions.push(...remainingQuestions.slice(0, remainingNeeded));
    }
    
    return sessionQuestions.slice(0, 10);
}

// Saves the results of a practice session and updates user progress
export async function saveSessionResults(userId, currentSession, results, practiceSets) {
    const difficulty = results.difficulty;
    const subjectBreakdown = {};
    const mistakes = [];

    results.answers.forEach(answer => {
        const question = practiceSets[difficulty].find(q => q.id === answer.questionId);
        if (!question) return;

        const subject = question.subject;
        if (!subjectBreakdown[subject]) {
            subjectBreakdown[subject] = { questions: 0, correct: 0 };
        }
        subjectBreakdown[subject].questions++;

        if (answer.isCorrect) {
            subjectBreakdown[subject].correct++;
        } else {
            mistakes.push({
                questionId: answer.questionId,
                userAnswer: answer.userAnswer
            });
        }
    });

    const sessionData = {
        timeSpent: results.timeSpent || 0,
        subjectBreakdown,
        mistakes,
        completedAt: serverTimestamp()
    };
            
    // Save the session data to a sub-collection within the user's document
    const practiceDocRef = doc(db, "users", userId, "interstudy_sessions", `session_${currentSession}`);
    await setDoc(practiceDocRef, sessionData);

    const updatedProgress = {
        currentSession: currentSession + 1,
        completedSessions: currentSession,
        status: currentSession + 1 > 9 ? 'completed' : 'in_progress',
        lastActivity: serverTimestamp()
    };

    const progressRef = doc(db, 'users', userId, 'training_progress', 'plan_1');
    await updateDoc(progressRef, updatedProgress);
    
    return updatedProgress;
} 
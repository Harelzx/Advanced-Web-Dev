"use client";
import { useState, useEffect } from "react";

export function useStudyLogic(practiceSets, onQuizComplete, sessionNumber) {
    const [difficulty, setDifficulty] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (practiceSets && typeof practiceSets === 'object') {
            const difficultyLevel = Object.keys(practiceSets).find(key => practiceSets[key] && practiceSets[key].length > 0);
            
            if (difficultyLevel) {
                const questions = practiceSets[difficultyLevel];
                setDifficulty(difficultyLevel);
                setSelectedQuestions(questions);
                setUserAnswers(new Array(questions.length).fill(null));
                setCurrentQuestion(0);
                setTimeLeft(null);
                setIsLoading(false);
                setStartTime(Date.now());
            }
        }
    }, [practiceSets]);

    const handleAnswer = (answerIndex) => {
        if (isAnswered) return;

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setUserAnswers(newAnswers);
        setIsAnswered(true);

        if (answerIndex === selectedQuestions[currentQuestion].correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < selectedQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setIsAnswered(false);
            setTimeLeft(null);
        } else {
            setQuizCompleted(true);
            
            if (onQuizComplete) {
                const timeSpent = startTime ? Math.ceil((Date.now() - startTime) / (1000 * 60)) : 0;
                const results = {
                    score: score,
                    totalQuestions: selectedQuestions.length,
                    answers: userAnswers.map((answer, index) => ({
                        questionId: selectedQuestions[index].id,
                        userAnswer: answer,
                        correct: selectedQuestions[index].correct,
                        isCorrect: answer === selectedQuestions[index].correct
                    })),
                    difficulty: difficulty,
                    timeSpent: timeSpent,
                    sessionNumber: sessionNumber
                };
                onQuizComplete(results);
            }
        }
    };

    const question = selectedQuestions.length > 0 ? selectedQuestions[currentQuestion] : null;
    const userAnswer = userAnswers.length > 0 ? userAnswers[currentQuestion] : null;

    return {
        isLoading,
        quizCompleted,
        score,
        totalQuestions: selectedQuestions.length,
        difficulty,
        currentQuestion,
        question,
        isAnswered,
        userAnswer,
        handleAnswer,
        nextQuestion
    };
} 
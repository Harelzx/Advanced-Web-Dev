"use client";
import Study from "@/app/components/Study";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, storage } from "../firebase/config";
import { ref, getDownloadURL } from "firebase/storage";

const InterStudyPage = () => {
  const [questions, setQuestions] = useState({
    easy: [],
    medium: [],
    hard: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Starting to fetch questions...");
        const fetchedQuestions = {
          easy: [],
          medium: [],
          hard: [],
        };

        // Fetch easy and medium questions from regular collection
        for (const level of ["easy", "medium"]) {
          console.log(`Fetching ${level} questions...`);
          const questionsRef = collection(db, "questions");
          const q = query(questionsRef, where("level", "==", level));

          try {
            const querySnapshot = await getDocs(q);
            console.log(
              `Found ${querySnapshot.docs.length} ${level} questions`
            );

            const levelQuestions = [];

            for (const doc of querySnapshot.docs) {
              try {
                const data = doc.data();
                console.log(`Processing ${level} question:`, {
                  id: doc.id,
                  hasText: !!data.text,
                  hasCorrectAnswer: !!data.correct_answer,
                  hasIncorrectAnswers: Array.isArray(data.incorrect_answers),
                });

                if (data.correct_answer && data.incorrect_answers) {
                  levelQuestions.push({
                    ...data,
                    id: doc.id,
                    question: data.text || "",
                    options: [
                      data.correct_answer,
                      ...(data.incorrect_answers || []),
                    ].filter(Boolean),
                    correct: 0,
                    timeLimit: level === "easy" ? 30 : 45,
                    explanation: data.explanation || "אין הסבר זמין",
                  });
                }
              } catch (docError) {
                console.error(`Error processing ${level} document:`, {
                  error: docError.message,
                  docId: doc.id,
                });
              }
            }

            fetchedQuestions[level] = levelQuestions;
            console.log(
              `Successfully processed ${levelQuestions.length} ${level} questions`
            );
          } catch (levelError) {
            console.error(`Error fetching ${level} questions:`, {
              error: levelError.message,
              stack: levelError.stack,
            });
          }
        }

        // Fetch bagrut questions for hard level
        console.log("Fetching bagrut questions...");
        const bagrutRef = collection(db, "bagrut questions");

        try {
          const bagrutSnapshot = await getDocs(bagrutRef);
          console.log(`Found ${bagrutSnapshot.docs.length} bagrut questions`);

          const hardQuestions = [];

          for (const doc of bagrutSnapshot.docs) {
            try {
              const data = doc.data();
              console.log(`Processing bagrut question:`, {
                id: doc.id,
                subject: data.subject,
                hasImageRef: !!data.imageRef,
                hasSections: Array.isArray(data.sections),
                sectionsCount: data.sections?.length,
              });

              // Only process if it's algebra or calculus
              if (data.subject === "algebra" || data.subject === "calculus") {
                let imageUrl = null;
                const questionData = {
                  ...data,
                  id: doc.id,
                  level: "hard",
                };

                if (data.imageRef) {
                  try {
                    // Log the initial image reference
                    console.log("Processing image reference:", {
                      imageRef: data.imageRef,
                      subject: data.subject,
                      questionId: doc.id,
                    });

                    // Clean up the image reference path
                    const cleanImageRef = data.imageRef
                      .replace(/^\/+/, "")
                      .trim();
                    const cleanSubject = data.subject.toLowerCase().trim();

                    // Try with subject folder first
                    const imagePath = `${cleanSubject}/${cleanImageRef}`;
                    let storageRef = ref(storage, imagePath);

                    console.log("Attempting to get URL with subject folder:", {
                      path: imagePath,
                      fullPath: storageRef.fullPath,
                    });

                    try {
                      imageUrl = await getDownloadURL(storageRef);
                      console.log("Successfully got URL with subject folder:", {
                        url: imageUrl,
                        path: imagePath,
                      });
                    } catch (firstError) {
                      console.log(
                        "First attempt failed, trying without subject folder:",
                        {
                          error: firstError.message,
                          code: firstError.code,
                        }
                      );

                      // Try without subject folder
                      storageRef = ref(storage, cleanImageRef);
                      try {
                        imageUrl = await getDownloadURL(storageRef);
                        console.log(
                          "Successfully got URL without subject folder:",
                          {
                            url: imageUrl,
                            path: cleanImageRef,
                          }
                        );
                      } catch (secondError) {
                        console.error("Both attempts failed:", {
                          withSubject: firstError.message,
                          withoutSubject: secondError.message,
                          imageRef: cleanImageRef,
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Error processing image reference:", {
                      error: error.message,
                      stack: error.stack,
                      imageRef: data.imageRef,
                      questionId: doc.id,
                    });
                  }
                }

                // Process sections
                const sections = data.sections || [];
                console.log("Processing sections:", {
                  questionId: doc.id,
                  count: sections.length,
                });

                const transformedSections = sections.map((section, index) => {
                  // Shuffle the options
                  const options = [
                    section.correct_answer,
                    ...(section.incorrect_answers || []),
                  ].filter(Boolean);

                  // Fisher-Yates shuffle
                  for (let i = options.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [options[i], options[j]] = [options[j], options[i]];
                  }

                  // Find the new index of the correct answer after shuffling
                  const correctAnswerIndex = options.indexOf(
                    section.correct_answer
                  );

                  return {
                    id: section.id || String(index + 1),
                    text: section.text || `חלק ${section.id || index + 1}`,
                    points: section.score || 0,
                    options,
                    correctAnswer: correctAnswerIndex,
                    explanation: section.explanation || "אין הסבר זמין",
                  };
                });

                if (transformedSections.length > 0) {
                  questionData.sections = transformedSections;
                  if (imageUrl) {
                    questionData.imageUrl = imageUrl;
                  }
                  hardQuestions.push(questionData);
                  console.log("Successfully added question:", {
                    id: doc.id,
                    sectionsCount: transformedSections.length,
                    hasImage: !!imageUrl,
                  });
                } else {
                  console.warn("Skipping question - no valid sections:", {
                    id: doc.id,
                  });
                }
              } else {
                console.log("Skipping non-algebra/calculus question:", {
                  id: doc.id,
                  subject: data.subject,
                });
              }
            } catch (docError) {
              console.error("Error processing bagrut document:", {
                error: docError.message,
                docId: doc.id,
              });
            }
          }

          fetchedQuestions.hard = hardQuestions;
          console.log("Successfully processed hard questions:", {
            count: hardQuestions.length,
          });
        } catch (bagrutError) {
          console.error("Error fetching bagrut questions:", {
            error: bagrutError.message,
            stack: bagrutError.stack,
          });
        }

        // Check if we have any questions
        const totalQuestions = Object.entries(fetchedQuestions).reduce(
          (sum, [level, questions]) => {
            console.log(`${level} questions count:`, questions.length);
            return sum + questions.length;
          },
          0
        );

        if (totalQuestions === 0) {
          console.error("No questions found in any category");
          setError("לא נמצאו שאלות. אנא נסה שוב מאוחר יותר.");
        } else {
          console.log("Successfully loaded all questions:", {
            total: totalQuestions,
            byLevel: {
              easy: fetchedQuestions.easy.length,
              medium: fetchedQuestions.medium.length,
              hard: fetchedQuestions.hard.length,
            },
          });
          setQuestions(fetchedQuestions);
        }
        setLoading(false);
      } catch (error) {
        console.error("Fatal error in fetchQuestions:", {
          error: error.message,
          stack: error.stack,
        });
        setError("שגיאה בטעינת השאלות. אנא נסה שוב.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600">שגיאה בטעינת השאלות</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <p className="text-xl text-gray-600">טוען שאלות...</p>
        </div>
      </div>
    );
  }

  return (
    <Study
      questions={questions}
      title="חידון מתמטיקה"
      icon="🧮"
      onHome={() => (window.location.href = "/")}
      difficultyConfigs={{
        easy: {
          color:
            "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800",
          icon: "🌱",
          title: "קל",
          description: "נוסחאות בסיסיות ותרגילים מהירים",
          timeLabel: "30 שניות לשאלה",
        },
        medium: {
          color:
            "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
          icon: "🔥",
          title: "בינוני",
          description: "שאלות מורכבות יותר ונושאים מתקדמים",
          timeLabel: "45 שניות לשאלה",
        },
        hard: {
          color:
            "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          textColor: "text-rose-800",
          icon: "⚡",
          title: "בגרות",
          description: "שאלות בגרות באלגברה וחשבון דיפרנציאלי",
          timeLabel: "ללא הגבלת זמן",
        },
      }}
    />
  );
};

export default InterStudyPage;

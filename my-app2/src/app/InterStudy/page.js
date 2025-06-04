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
          const questionsBySubject = {
            algebra: [],
            calculus: [],
            geometry: [],
            statistics: [],
            trigonometry: [],
          };

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

              // Map the database subject names to our standardized subject names
              const subjectMapping = {
                algebra: "algebra",
                calculus: "calculus",
                geometry: "geometry",
                "prob&stat": "statistics",
                statistics: "statistics",
                trig: "trigonometry",
              };

              const normalizedSubject = subjectMapping[data.subject];
              const validSubjects = [
                "algebra",
                "calculus",
                "geometry",
                "statistics",
                "trigonometry",
              ];

              if (validSubjects.includes(normalizedSubject)) {
                let imageUrl = null;
                const questionData = {
                  ...data,
                  id: doc.id,
                  level: "hard",
                  subject: normalizedSubject, // Use the normalized subject name
                  sections: data.sections || [], // Ensure sections exists
                  question: data.question || "שאלת בגרות", // Default question text
                };

                if (data.imageRef) {
                  try {
                    // Log the initial image reference
                    console.log("Processing image reference:", {
                      imageRef: data.imageRef,
                      originalSubject: data.subject,
                      normalizedSubject: normalizedSubject,
                      questionId: doc.id,
                    });

                    // Clean up the image reference path
                    const cleanImageRef = data.imageRef
                      .replace(/^\/+/, "")
                      .trim();

                    // Use original subject for storage path
                    const storageSubject = data.subject.toLowerCase().trim();

                    // Try with subject folder first
                    const imagePath = `${storageSubject}/${cleanImageRef}`;
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

                // Ensure we have at least one section with required properties
                if (sections.length === 0) {
                  // Create a default section if none exists
                  sections.push({
                    id: "1",
                    text: data.text || "פתור את השאלה",
                    correct_answer: data.correct_answer || "תשובה א",
                    incorrect_answers: data.incorrect_answers || [
                      "תשובה ב",
                      "תשובה ג",
                      "תשובה ד",
                    ],
                    score: 100,
                  });
                }

                const transformedSections = sections.map((section, index) => {
                  // Ensure all required properties exist with defaults
                  const sectionId = section.id || String(index + 1);
                  const sectionText = section.text || `חלק ${sectionId}`;
                  const correctAnswer = section.correct_answer || "תשובה א";
                  const incorrectAnswers = section.incorrect_answers || [
                    "תשובה ב",
                    "תשובה ג",
                    "תשובה ד",
                  ];

                  // Ensure we have valid options array
                  let options = [];
                  if (
                    correctAnswer &&
                    incorrectAnswers &&
                    Array.isArray(incorrectAnswers)
                  ) {
                    options = [correctAnswer, ...incorrectAnswers].filter(
                      Boolean
                    );
                  } else {
                    // Default options if none provided
                    options = ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"];
                    console.warn(
                      `Using default options for section ${sectionId} in question ${doc.id}`
                    );
                  }

                  // Fisher-Yates shuffle
                  for (let i = options.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [options[i], options[j]] = [options[j], options[i]];
                  }

                  // Find the new index of the correct answer after shuffling
                  const correctAnswerIndex = options.indexOf(correctAnswer);

                  // If correctAnswer is not in options (shouldn't happen, but just in case)
                  if (correctAnswerIndex === -1) {
                    console.warn(
                      `Correct answer not found in options for section ${sectionId} in question ${doc.id}`
                    );
                    options = ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"];
                    return {
                      id: sectionId,
                      text: sectionText,
                      points: section.score || 0,
                      options: options,
                      correctAnswer: 0, // First option is correct by default
                      explanation: section.explanation || "אין הסבר זמין",
                    };
                  }

                  return {
                    id: sectionId,
                    text: sectionText,
                    points: section.score || 0,
                    options: options,
                    correctAnswer: correctAnswerIndex,
                    explanation: section.explanation || "אין הסבר זמין",
                  };
                });

                if (transformedSections.length > 0) {
                  questionData.sections = transformedSections;
                  if (imageUrl) {
                    questionData.imageUrl = imageUrl;
                  }
                  // Add to subject-specific array instead of hardQuestions
                  questionsBySubject[normalizedSubject].push(questionData);
                  console.log("Successfully added question:", {
                    id: doc.id,
                    subject: normalizedSubject,
                    sectionsCount: transformedSections.length,
                    hasImage: !!imageUrl,
                    sections: transformedSections.map((s) => ({
                      id: s.id,
                      text: s.text,
                      optionsCount: s.options.length,
                      correctAnswerIndex: s.correctAnswer,
                    })),
                  });
                } else {
                  console.warn("Skipping question - no valid sections:", {
                    id: doc.id,
                  });
                }
              } else {
                console.log("Skipping invalid subject question:", {
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

          // Select one random question from each subject
          Object.entries(questionsBySubject).forEach(([subject, questions]) => {
            if (questions.length > 0) {
              const randomIndex = Math.floor(Math.random() * questions.length);
              hardQuestions.push(questions[randomIndex]);
              console.log(`Selected random question for ${subject}:`, {
                totalQuestions: questions.length,
                selectedIndex: randomIndex,
                questionId: questions[randomIndex].id,
              });
            } else {
              console.warn(`No questions available for subject: ${subject}`);
            }
          });

          // Shuffle the final array of selected questions
          for (let i = hardQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [hardQuestions[i], hardQuestions[j]] = [
              hardQuestions[j],
              hardQuestions[i],
            ];
          }

          fetchedQuestions.hard = hardQuestions;
          console.log("Successfully processed hard questions:", {
            count: hardQuestions.length,
            bySubject: Object.fromEntries(
              Object.entries(questionsBySubject).map(([subject, questions]) => [
                subject,
                questions.length,
              ])
            ),
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
      <div className="min-h-screen bg-white">
        <main className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">
              שגיאה בטעינת השאלות
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6">
              <div className="animate-spin text-6xl">⚡</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              טוען שאלות
            </h3>
            <p className="text-gray-600">
              אנא המתן בזמן שאנחנו טוענים את השאלות עבורך...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Study
      questions={questions}
      title="למידה אינטראקטיבית"
      icon="🧮"
      onHome={() => (window.location.href = "/")}
    />
  );
};

export default InterStudyPage;

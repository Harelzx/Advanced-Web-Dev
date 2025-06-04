"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function StudyProgress({ userId }) {
  const [progressData, setProgressData] = useState({
    easy: [],
    medium: [],
    hard: [],
  });
  const [analytics, setAnalytics] = useState({
    weakestAreas: [],
    strongestAreas: [],
    averageScores: {},
    totalAttempts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return;

      try {
        // Fetch last 10 results for each difficulty
        const difficulties = ["easy", "medium", "hard"];
        const newProgressData = { easy: [], medium: [], hard: [] };
        let weakPoints = {};
        let strongPoints = {};
        let totalAttempts = 0;
        let totalScores = { easy: 0, medium: 0, hard: 0 };
        let attemptCounts = { easy: 0, medium: 0, hard: 0 };

        for (const difficulty of difficulties) {
          const resultsRef = collection(
            db,
            "users",
            userId,
            "interStudyResults"
          );
          const q = query(resultsRef, orderBy("timestamp", "desc"), limit(10));
          const querySnapshot = await getDocs(q);

          querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalAttempts++;
            attemptCounts[difficulty]++;
            totalScores[difficulty] += data.score;

            // Process progress data
            newProgressData[difficulty].push({
              date: format(data.timestamp.toDate(), "dd/MM"),
              score: data.score,
            });

            // Process question analytics
            data.details.questionResults.forEach((result) => {
              const isCorrect =
                result.type === "single"
                  ? result.userAnswer === result.correctAnswer
                  : result.userAnswers.every(
                      (ans, idx) => ans === result.correctAnswers[idx]
                    );

              if (!isCorrect) {
                weakPoints[result.questionId] =
                  (weakPoints[result.questionId] || 0) + 1;
              } else {
                strongPoints[result.questionId] =
                  (strongPoints[result.questionId] || 0) + 1;
              }
            });
          });
        }

        // Calculate averages
        const averageScores = {};
        Object.keys(totalScores).forEach((diff) => {
          averageScores[diff] = attemptCounts[diff]
            ? Math.round(totalScores[diff] / attemptCounts[diff])
            : 0;
        });

        // Sort weak and strong points
        const weakestAreas = Object.entries(weakPoints)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id, count]) => ({ id, count }));

        const strongestAreas = Object.entries(strongPoints)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id, count]) => ({ id, count }));

        setProgressData(newProgressData);
        setAnalytics({
          weakestAreas,
          strongestAreas,
          averageScores,
          totalAttempts,
        });
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl mb-4">⚡</div>
        <p className="text-gray-600">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        התקדמות לאורך זמן
      </h2>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(progressData).map(([difficulty, data]) => (
          <div
            key={difficulty}
            className="bg-gray-50 rounded-xl p-4 shadow-inner"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              {difficulty === "easy" && "קל"}
              {difficulty === "medium" && "בינוני"}
              {difficulty === "hard" && "קשה"}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center mt-2 text-gray-600">
              ממוצע: {analytics.averageScores[difficulty]}%
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Points */}
        <div className="bg-red-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800">
            נושאים לחיזוק
          </h3>
          <ul className="space-y-2">
            {analytics.weakestAreas.map((area) => (
              <li
                key={area.id}
                className="flex justify-between items-center text-red-700"
              >
                <span>שאלה {area.id}</span>
                <span>{area.count} טעויות</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strong Points */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-800">
            נושאים חזקים
          </h3>
          <ul className="space-y-2">
            {analytics.strongestAreas.map((area) => (
              <li
                key={area.id}
                className="flex justify-between items-center text-green-700"
              >
                <span>שאלה {area.id}</span>
                <span>{area.count} תשובות נכונות</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Total Attempts */}
      <div className="text-center mt-6 text-gray-600">
        סה"כ ניסיונות: {analytics.totalAttempts}
      </div>
    </div>
  );
}

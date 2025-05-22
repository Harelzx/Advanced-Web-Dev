// work in progress
// implements first quiz when oyu log in first time

"use client";
import { useState } from "react";
import { getDocs, collection, getFirestore, query, where } from "firebase/firestore";
//import { app } from "../firebase"; // your firebase config

const questions = [
  { id: 1, q: "2 + 2 =", a: "4" },
  { id: 2, q: "5 - 3 =", a: "2" },
  // ...add 8 more
];

export default function InterStudy() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [wrongItems, setWrongItems] = useState([]);

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wrongIds = questions
      .filter((q, idx) => answers[idx] !== q.a)
      .map((q) => q.id);

    // Fetch from Firebase
    if (wrongIds.length > 0) {
      const db = getFirestore(app);
      const qRef = collection(db, "items");
      const qSnap = await getDocs(query(qRef, where("id", "in", wrongIds)));
      setWrongItems(qSnap.docs.map(doc => doc.data()));
    }
  };

  return (
    <div>
      <h1>Math Quiz</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((q, idx) => (
          <div key={q.id}>
            <label>{q.q}</label>
            <input
              value={answers[idx]}
              onChange={e => handleChange(idx, e.target.value)}
              className="border p-1 m-2"
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      {wrongItems.length > 0 && (
        <div>
          <h2>Review These Topics:</h2>
          <ul>
            {wrongItems.map((item, idx) => (
              <li key={idx}>{item.test1}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
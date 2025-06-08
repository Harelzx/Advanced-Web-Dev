import { NextResponse } from 'next/server';

const OPENAI_API_KEY = "";

export async function POST(req) {
  try {
    const { quizResults } = await req.json();

    if (!Array.isArray(quizResults) || quizResults.length === 0) {
      return NextResponse.json({ error: "quizResults must be a non-empty array" }, { status: 400 });
    }

 
    const prompt = `
    תלמיד עבר מבחן אבחון במתמטיקה (3 יח"ל) וקיבל את הציונים הבאים:

    ${quizResults.map(q => `- ${q.topic}: ${q.grade}/100`).join("\n")}

    צור עבורו מסלול למידה אישי בפורמט JSON **כמערך בלבד** – אין להחזיר אובייקט עם מפתחות (כגון "0", "1", וכו').

    כל פריט במסלול הוא אובייקט בפורמט הבא:
    {
      "topic": שם הנושא,
      "explanation": הסבר מפורט וברור במיוחד, המותאם לרמת 3 יח"ל. פרט כל שלב, הסבר את ההיגיון ולא רק את השלבים הטכניים.
      "videoUrl": קישור תקף לסרטון YouTube איכותי (רצוי בעברית) שמסביר היטב את הנושא.
        הקפד ש:
        • הקישור יהיה בפורמט המדויק: https://www.youtube.com/watch?v=...
        • הסרטון יהיה אמיתי, נגיש, לא פרטי, לא מוסתר, לא נמחק ולא שייך לפלייליסט.
        • אל תמציא מזהי סרטונים. השתמש רק בקישורים אמיתיים ונגישים לצפייה ביוטיוב.
      "practiceTip": "המלצה לתרגול מעשי, הכוללת תיאור קצר של התרגול + קישור תקף לאתר אמין בלבד מתוך:אופק מט\"ח או Khan Academy. הקפד שהקישור יהיה נגיש לציבור, ולא יוביל לעמוד שגוי או לא זמין."

    }

    החזר אך ורק מערך JSON תקני – אין להוסיף הסברים, טקסט חופשי, כותרות או תיאורים.
    `.trim();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    const rawText = data.choices?.[0]?.message?.content || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let json;
    try {
      json = JSON.parse(cleaned);
    } catch (e) {
      console.error(" שגיאה בפירסור JSON מהמודל:", e);
      console.error("תוכן שהוחזר מהמודל:", rawText);
      return NextResponse.json({ error: "Invalid JSON returned from model" }, { status: 500 });
    }

    const converted = Object.entries(json).map(([key, value]) => ({
      topic: key,
      ...value,
    }));

    return NextResponse.json(converted);

  } catch (err) {
    console.error(" שגיאה בבקשה ל־OpenAI:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { TextServiceClient } from '@google-ai/generativelanguage';
import fetch from 'node-fetch';

// Next.js App Router משתמש ב-Edge או Node – צריך לוודא שיש fetch
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const client = new TextServiceClient({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const { quizResults } = await request.json();

    if (!Array.isArray(quizResults)) {
      return NextResponse.json({ error: 'quizResults must be an array' }, { status: 400 });
    }

    const filtered = quizResults.filter((q) => q.mistakes > 0);
    if (filtered.length === 0) {
      return NextResponse.json([]);
    }

    function getLevel(mistakes) {
    if (mistakes === 0) return null;        
    if (mistakes <= 1) return 'easy';
    if (mistakes <= 3) return 'medium';
    return 'hard';
    }

    const enriched = quizResults
        .map((q) => {
            const level = getLevel(q.mistakes);
            if (!level) return null;
            return { topic: q.topic, mistakes: q.mistakes, level };
        })
        .filter(Boolean); 



    const prompt = `
    A student is preparing for the Israeli high school matriculation exam ("bagrut") in mathematics (3 units level).
    They completed a diagnostic quiz and made mistakes in the following topics:

    ${enriched.map((q) => `- ${q.topic} (${q.mistakes} mistakes) – level: ${q.level}`).join('\n')}

    Generate a personalized learning path as a **JSON array**.
    Each item must include:
    - "topic": the math topic
    - "explanation": a short and clear explanation of the concept
    - "videoUrl": a relevant YouTube video (in Hebrew if possible)
    - "practiceTip": practice link (Khan Academy / Israeli practice websites)
    - "level": repeat the level given above ("easy", "medium", or "hard")

    Only include topics where mistakes > 0.
    Return **ONLY valid JSON**. No extra text, no markdown, no explanation.
    `.trim();


    const result = await client.generateText({
      model: 'models/text-bison-001',
      prompt,
      temperature: 0.7,
      maxTokens: 1024,
    });

    const rawText = result?.candidates?.[0]?.output || '';

    const cleanedText = rawText.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Error in generatePath route:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}

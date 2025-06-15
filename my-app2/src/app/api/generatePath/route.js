import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, YOUTUBE_API_KEY } from '../../firebase/config';
import fetch from 'node-fetch';

const MODEL_NAME = 'gemini-1.5-flash';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function getVideoCountByScore(score) {
  if (score <= 20) return 3;
  if (score <= 60) return 2;
  return 1;
}

async function searchYouTubeWithMeta(query, maxResults = 1) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=${maxResults}`;
  console.log("🔍 YouTube Query:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn("⚠️ No videos found for:", query);
    }

    const results = (data.items || []).map(item => ({
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description || ""
    }));

    console.log("📺 YouTube Results:", results);
    return results;
  } catch (error) {
    console.error("❌ YouTube Search Error:", error);
    return [];
  }
}

export async function POST(req) {
  try {
    const { quizResults } = await req.json();
    console.log("📥 Received quizResults:", quizResults);

    if (!Array.isArray(quizResults) || quizResults.length === 0) {
      console.warn("❗ Invalid or empty quizResults");
      return NextResponse.json({ error: "quizResults must be a non-empty array" }, { status: 400 });
    }

    const allRequests = await Promise.all(
      quizResults.map(async ({ topic, grade }) => {
        console.log(`🧠 Generating path for topic "${topic}" with grade ${grade}`);

        const videoCount = getVideoCountByScore(grade);
        console.log(`🎯 Fetching ${videoCount} video(s) for topic: ${topic}`);

        const sources = ["LevelUpMath", "מתמטיקה עם רחלי", "3 יחידות", "בגרות במתמטיקה"];
        const query = `${topic} ${sources[Math.floor(Math.random() * sources.length)]}`;

        const videoResults = await searchYouTubeWithMeta(query, videoCount);

        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.5,
          }
        });

        const explanations = await Promise.all(
          videoResults.map(async ({ url, title, description }) => {
            const prompt = `
              בהתבסס על התיאור הבא של סרטון ביוטיוב בנושא "${topic}" ברמת 3 יח"ל:

              כותרת: "${title}"
              תיאור: "${description}"

              כתוב הסבר פשוט, ברור וידידותי לתלמיד תיכון שמתקשה להבין את הנושא. התמקד במה שמוסבר בסרטון.
            `.trim();

            console.log("✏️ Prompt to Gemini:", prompt);

            const geminiResult = await model.generateContent(prompt);
            const explanationText = geminiResult.response.text().trim().replace(/^"|"$/g, '');

            console.log("📄 Gemini Explanation:", explanationText);

            return {
              topic,
              explanation: explanationText,
              videoUrl: url
            };
          })
        );

        return explanations;
      })
    );

    const flatResults = allRequests.flat();
    console.log("✅ Final results being returned:", flatResults);

    return NextResponse.json({
      success: true,
      modelUsed: MODEL_NAME,
      results: flatResults
    });

  } catch (err) {
    console.error("🔥 Internal Error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

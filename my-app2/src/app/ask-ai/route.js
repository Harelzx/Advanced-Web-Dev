import { TextServiceClient } from "@google-ai/generativelanguage";

const client = new TextServiceClient({apiKey: process.env.GEMINI_API_KEY,});
{/*DEMO*/}
function generatePromptMath(grade, weakTopics, mathUnit) {
    return `אתה מורה פרטי חכם. התלמיד לומד בכיתה ${grade}, ויש לו פערים בנושאים: ${weakTopics.join(", ")}.
  הוא לומד ברמת ${mathUnit} יחידות . צור מסלול למידה אישי של כמות ימים הגיונית לחומר הדרוש. כל יום צריך לכלול:
  - נושא
  - הסבר קצר
  - קישור לסרטון (עדיפות ל-YouTube)
  - הצעה לתרגול
  החזר את התוצאה כ־JSON בפורמט הבא:
  [
    {
      "נושא": "...",
      "הסבר": "...",
      "סרטון": "...",
      "תרגול": "..."
    },
    …
  ]`;
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { grade, weakTopics, mathUnit } = req.body;
  const prompt = generatePromptMath(grade, weakTopics, mathUnit);


  try {
    // calling the Gemini API
    const [response] = await client.generateText({
      model: "models/text-bison-001",
      prompt: { text: prompt },
      temperature: 0.7,
      
    });

    const raw = response.candidates?.[0]?.content ?? "[]";
    const plan = JSON.parse(raw);

    return res.status(200).json(plan);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to generate plan", details: err.message });
  }
}
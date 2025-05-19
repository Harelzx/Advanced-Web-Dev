import { OpenAI } from "openai";
// need API key from OpenAI
// need to save the key in .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { question } = await request.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or "gpt-4" if your key supports it
    messages: [{ role: "user", content: question }],
  });

  const answer = completion.choices[0]?.message?.content || "No answer";

  return Response.json({ answer });
}
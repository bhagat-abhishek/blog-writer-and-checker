import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function getContent(system, user) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: "gpt-3.5-turbo",
  });

  return chatCompletion.choices[0].message.content;
}

export default getContent;

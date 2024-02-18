"use server";
import OpenAI from "openai";

// cache into state
export async function generateKeywordDescription() {
  return "This is a keyword description";
}

export async function explainHighlightFurther() {
  return "This is a further explanation";
}

export async function askQuestionOnHighlight(question: string) {
  return `You asked: ${question}. This is my answer.`;
}

export async function getSynthesisByComplexity(
  clusterId: string,
  complexityLevel: string,
  synthesis: string,
  currentSynthesis: string
) {
  if (currentSynthesis !== "...") {
    return { level: complexityLevel, text: currentSynthesis };
  }
  if (complexityLevel == "normal") {
    return { level: "normal", text: synthesis };
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log("ran here");

  const mp = ["concise", "easy", "normal", "very detailed"];

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Given a news article, make the understanding level " +
          mp[complexityLevel],
      },
      {
        role: "user",
        content: synthesis,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  console.log(chatCompletion);
  return {
    text: chatCompletion.choices[0].message.content,
  };
}

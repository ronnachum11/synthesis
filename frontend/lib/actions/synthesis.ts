"use server";

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
  complexityLevel: number
) {
  return { synthesis: "synthesis" };
}

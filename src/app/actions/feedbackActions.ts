// src/app/actions/feedbackActions.ts
"use server";

import { generateAIFeedback, type GenerateAIFeedbackInput } from '@/ai/flows/generate-ai-feedback';

export async function getAIFeedback(input: GenerateAIFeedbackInput) {
  try {
    const result = await generateAIFeedback(input);
    return { success: true, feedback: result.feedback };
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return { success: false, error: "Failed to generate AI feedback." };
  }
}

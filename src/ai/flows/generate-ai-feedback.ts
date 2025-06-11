'use server';

/**
 * @fileOverview AI feedback generation for student answers.
 *
 * - generateAIFeedback - A function that generates AI feedback for student answers.
 * - GenerateAIFeedbackInput - The input type for the generateAIFeedback function.
 * - GenerateAIFeedbackOutput - The return type for the generateAIFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIFeedbackInputSchema = z.object({
  lessonTitle: z.string().describe('The title of the lesson.'),
  studentAnswer: z.string().describe('The student\u2019s answer to the question.'),
  correctSolution: z.string().describe('The correct solution to the question.'),
  studentReasoning: z.string().describe('The student\u2019s reasoning for their answer.'),
  subject: z.enum(['Mathematics', 'Physics']).describe('The subject of the lesson.'),
});

export type GenerateAIFeedbackInput = z.infer<typeof GenerateAIFeedbackInputSchema>;

const GenerateAIFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback for the student\u2019s answer.'),
});

export type GenerateAIFeedbackOutput = z.infer<typeof GenerateAIFeedbackOutputSchema>;

export async function generateAIFeedback(input: GenerateAIFeedbackInput): Promise<GenerateAIFeedbackOutput> {
  return generateAIFeedbackFlow(input);
}

const generateAIFeedbackPrompt = ai.definePrompt({
  name: 'generateAIFeedbackPrompt',
  input: {schema: GenerateAIFeedbackInputSchema},
  output: {schema: GenerateAIFeedbackOutputSchema},
  prompt: `You are an AI tutor providing feedback to a student on their answer to a question.

      Subject: {{subject}}
      Lesson Title: {{lessonTitle}}

      Student\u2019s Answer: {{studentAnswer}}
      Student\u2019s Reasoning: {{studentReasoning}}
      Correct Solution: {{correctSolution}}

      Provide constructive feedback to the student, highlighting areas for improvement and explaining any mistakes.
      Focus on the student's reasoning and offer specific suggestions for how they can improve their understanding.
      The feedback should be encouraging and helpful.

      AI Feedback:`,
});

const generateAIFeedbackFlow = ai.defineFlow(
  {
    name: 'generateAIFeedbackFlow',
    inputSchema: GenerateAIFeedbackInputSchema,
    outputSchema: GenerateAIFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateAIFeedbackPrompt(input);
    return output!;
  }
);

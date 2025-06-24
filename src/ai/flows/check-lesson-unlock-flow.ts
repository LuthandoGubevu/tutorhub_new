'use server';
/**
 * @fileOverview A flow to determine if a student can unlock the next lesson based on their grade.
 *
 * - checkLessonUnlock - Function to evaluate grade and determine next lesson access.
 * - CheckLessonUnlockInput - The input type for the checkLessonUnlock function.
 * - CheckLessonUnlockOutput - The return type for the checkLessonUnlock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckLessonUnlockInputSchema = z.object({
  studentId: z.string().describe('Unique student identifier.'),
  currentLessonId: z.string().describe('ID of the lesson just graded.'),
  grade: z.number().min(0, "Grade must be at least 0.").max(100, "Grade must be at most 100.").describe('Numeric score from 0 to 100.'),
});
export type CheckLessonUnlockInput = z.infer<typeof CheckLessonUnlockInputSchema>;

const CheckLessonUnlockOutputSchema = z.object({
  unlockNextLesson: z.boolean().describe('Whether the student can unlock the next lesson.'),
  message: z.string().describe('A message for the student regarding their progression.'),
});
export type CheckLessonUnlockOutput = z.infer<typeof CheckLessonUnlockOutputSchema>;

export async function checkLessonUnlock(input: CheckLessonUnlockInput): Promise<CheckLessonUnlockOutput> {
  return checkLessonUnlockFlow(input);
}

const checkLessonUnlockFlow = ai.defineFlow(
  {
    name: 'checkLessonUnlockFlow',
    inputSchema: CheckLessonUnlockInputSchema,
    outputSchema: CheckLessonUnlockOutputSchema,
  },
  async (input) => {
    if (input.grade >= 75) {
      return {
        unlockNextLesson: true,
        message: "Great work! You've unlocked the next lesson."
      };
    } else {
      return {
        unlockNextLesson: false,
        message: "You need at least 75% to unlock the next lesson. Please revise and resubmit your work."
      };
    }
  }
);


import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  photoURL?: string | null;
  cellNumber?: string;
  grade?: string | number;
  role?: 'student' | 'tutor' | 'admin';
  isAdmin?: boolean;
  createdAt?: FirebaseTimestamp | string;
}

export type SubjectName = 'Mathematics' | 'Physics';

export interface LessonBranch {
  id: string;
  name: string;
  subject: SubjectName;
}

export interface StructuredQuestionItem {
  id: string; // e.g., "1.1.1"
  text: string; // The question text itself
  marks?: number; // Optional marks for the question
}

export interface Lesson {
  id: string;
  title: string;
  subject: SubjectName;
  branch: string;
  youtubeVideoId: string;
  content: string;
  question: string; // Main question text, can be a general title if structuredQuestions are used
  structuredQuestions?: StructuredQuestionItem[]; // Array of sub-questions
  exampleSolution: string; // Can be overall or point to individual solutions
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string; // Storing the text at submission time for context
  reasoning: string | null;
  answer: string | null;
}

export interface Submission {
  id?: string;
  studentId: string;
  studentName?: string;
  lessonId: string;
  lessonTitle: string;
  subject: SubjectName;
  answer?: string | null; // For single-answer lessons
  reasoning?: string | null; // For single-answer lessons
  questions?: QuestionAnswer[] | null; // For multi-question lessons
  status: 'draft' | 'submitted' | 'reviewed';
  tutorFeedback?: string | null;
  aiFeedback?: string | null;
  grade?: number | string | null;
  timestamp: FirebaseTimestamp | string;
  reviewedAt?: FirebaseTimestamp | string;
}

export interface Booking {
  id: string;
  userId: string;
  subject: SubjectName;
  date: string;
  time: string;
  confirmed: boolean;
}

export interface Feedback {
  id: string;
  lessonId: string;
  userId: string;
  rating: number;
  comment?: string;
  submittedAt: FirebaseTimestamp | string;
}

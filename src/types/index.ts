
export interface User {
  id: string;
  fullName: string;
  email: string;
  cellNumber?: string; // Optional for Google Sign-In
}

export type SubjectName = 'Mathematics' | 'Physics';

export interface LessonBranch {
  id: string;
  name: string;
  subject: SubjectName;
}

export interface Lesson {
  id: string;
  title: string;
  subject: SubjectName;
  branch: string; // Branch name or ID
  youtubeVideoId: string;
  content: string; // Explanatory content, can include HTML or Markdown
  question: string; // Equation-based question
  exampleSolution: string;
}

export interface StudentAnswer {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subject: SubjectName;
  studentId: string;
  reasoning: string;
  solution: string;
  submittedAt: string; // ISO date string
  status: 'Awaiting Review' | 'Reviewed';
  tutorFeedback?: string;
  aiFeedback?: string;
}

export interface Booking {
  id: string;
  userId: string;
  subject: SubjectName;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  confirmed: boolean;
}

export interface Feedback {
  id: string;
  lessonId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  submittedAt: string; // ISO date string
}

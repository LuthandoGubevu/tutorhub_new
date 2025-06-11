
export interface User {
  uid: string; // Changed from id to uid
  fullName: string | null; // Firebase displayName can be null
  email: string | null; // Firebase email can be null
  photoURL?: string | null; // Standard Firebase property
  cellNumber?: string; // Custom, not directly in Firebase auth user object unless set as phone number
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
  studentId: string; // This will store user.uid
  reasoning: string;
  solution: string;
  submittedAt: string; // ISO date string
  status: 'Awaiting Review' | 'Reviewed';
  tutorFeedback?: string;
  aiFeedback?: string;
}

export interface Booking {
  id: string;
  userId: string; // This will store user.uid
  subject: SubjectName;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  confirmed: boolean;
}

export interface Feedback {
  id: string;
  lessonId: string;
  userId: string; // This will store user.uid
  rating: number; // 1-5
  comment?: string;
  submittedAt: string; // ISO date string
}

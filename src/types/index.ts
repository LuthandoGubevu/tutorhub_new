
import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  firstName: string | null; // Changed from fullName
  lastName: string | null; // Added
  email: string | null;
  photoURL?: string | null;
  cellNumber?: string;
  grade?: string | number; // Added: e.g., "Grade 10" or 10
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

export interface Lesson {
  id: string;
  title: string;
  subject: SubjectName;
  branch: string;
  youtubeVideoId: string;
  content: string;
  question: string;
  exampleSolution: string;
}

export interface Submission {
  id?: string;
  studentId: string;
  studentName?: string;
  lessonId: string;
  lessonTitle: string;
  subject: SubjectName;
  answer: string;
  reasoning: string;
  status: 'submitted' | 'reviewed';
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


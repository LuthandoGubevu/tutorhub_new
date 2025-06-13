
import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  fullName: string | null;
  email: string | null;
  photoURL?: string | null;
  cellNumber?: string;
  role?: 'student' | 'tutor' | 'admin'; // 'tutor' can be used for general tutors, 'admin' for the specific admin UID
  isAdmin?: boolean; // Derived in AuthContext based on UID match or role
  createdAt?: FirebaseTimestamp | string; // Store as Firestore Timestamp or ISO string
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
  id?: string; // Firestore document ID, optional if Firestore generates it
  studentId: string;
  studentName?: string; // Optional: denormalized for easier display on tutor dashboard
  lessonId: string;
  lessonTitle: string;
  subject: SubjectName;
  answer: string; // Student's solution
  reasoning: string;
  status: 'submitted' | 'reviewed';
  tutorFeedback?: string | null; // Can be explicitly null
  aiFeedback?: string | null; // Can be explicitly null
  grade?: number | string | null; // New field: stores the mark (e.g., 75 or "A+"), can be null
  timestamp: FirebaseTimestamp | string; // Firestore Timestamp or ISO string for submission time
  reviewedAt?: FirebaseTimestamp | string; // Optional: Firestore Timestamp for review time
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
  submittedAt: FirebaseTimestamp | string; // Firestore Timestamp or ISO string
}

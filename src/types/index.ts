
export interface User {
  uid: string; 
  fullName: string | null; 
  email: string | null; 
  photoURL?: string | null; 
  cellNumber?: string; 
  isAdmin?: boolean; 
  role?: string; // Added for user role
  createdAt?: string; // Added for creation timestamp
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

export interface StudentAnswer {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subject: SubjectName;
  studentId: string; 
  reasoning: string;
  solution: string;
  submittedAt: string; 
  status: 'Awaiting Review' | 'Reviewed';
  tutorFeedback?: string;
  aiFeedback?: string;
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
  submittedAt: string; 
}

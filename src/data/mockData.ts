import type { Lesson, LessonBranch, SubjectName, StudentAnswer, Booking } from '@/types';

export const subjects: Array<{ name: SubjectName; description: string; icon?: any }> = [
  { name: 'Mathematics', description: 'Explore the world of numbers, patterns, and logic.' },
  { name: 'Physics', description: 'Understand the fundamental principles of the universe.' },
];

export const mathematicsBranches: LessonBranch[] = [
  { id: 'alg', name: 'Algebra', subject: 'Mathematics' },
  { id: 'calc', name: 'Calculus', subject: 'Mathematics' },
  { id: 'geom', name: 'Geometry', subject: 'Mathematics' },
  { id: 'stats', name: 'Statistics', subject: 'Mathematics' },
];

export const physicsBranches: LessonBranch[] = [
  { id: 'mech', name: 'Mechanics', subject: 'Physics' },
  { id: 'waves', name: 'Waves & Optics', subject: 'Physics' },
  { id: 'thermo', name: 'Thermodynamics', subject: 'Physics' },
  { id: 'em', name: 'Electromagnetism', subject: 'Physics' },
];

export const lessons: Lesson[] = [
  // Mathematics - Algebra
  {
    id: 'math-alg-001',
    title: 'Lesson 1', // Updated title
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: ' RoqueL3pVgQ', // Example video ID
    content: '<p>This lesson covers the basics of polynomials, including definitions, degrees, and types of polynomials. We will explore how to add, subtract, and multiply polynomial expressions.</p><h3>Key Concepts:</h3><ul><li>Definition of a polynomial</li><li>Degree of a polynomial</li><li>Types: monomial, binomial, trinomial</li><li>Operations: addition, subtraction, multiplication</li></ul>',
    question: 'Simplify the expression: $(3x^2 - 5x + 2) + (x^2 + 7x - 9)$. What is the degree of the resulting polynomial?',
    exampleSolution: 'Solution: $(3x^2 - 5x + 2) + (x^2 + 7x - 9) = 3x^2 + x^2 - 5x + 7x + 2 - 9 = 4x^2 + 2x - 7$. The degree of the resulting polynomial is 2.',
  },
  {
    id: 'math-alg-002',
    title: 'Lesson 2', // Updated title
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'f15zA0PhSek',
    content: '<p>Learn the techniques for solving linear equations in one variable. This includes understanding properties of equality and applying them to isolate the variable.</p>',
    question: 'Solve for $x$: $3(x - 2) + 5 = 2x - 7$.',
    exampleSolution: '$3x - 6 + 5 = 2x - 7 \Rightarrow 3x - 1 = 2x - 7 \Rightarrow x = -6$.',
  },
  // Mathematics - Calculus
  {
    id: 'math-calc-001',
    title: 'Lesson 3', // Updated title
    subject: 'Mathematics',
    branch: 'Calculus',
    youtubeVideoId: ' excelencia8000',
    content: '<p>This lesson introduces the concept of limits, which is fundamental to calculus. We will explore intuitive definitions and graphical interpretations of limits.</p>',
    question: 'Evaluate the limit: $\\lim_{x \\to 2} (x^2 + 3x - 1)$.',
    exampleSolution: 'Substitute $x=2$: $2^2 + 3(2) - 1 = 4 + 6 - 1 = 9$.',
  },
  // Physics - Mechanics
  {
    id: 'phys-mech-001',
    title: 'Lesson 4', // Updated title
    subject: 'Physics',
    branch: 'Mechanics',
    youtubeVideoId: 'kKKM8Y-u7ds',
    content: '<p>An overview of Newton\'s three laws of motion, which form the basis of classical mechanics. We will discuss inertia, force, mass, and action-reaction pairs.</p>',
    question: 'A force of 20 N is applied to an object with a mass of 5 kg. What is the acceleration of the object?',
    exampleSolution: 'Using $F = ma$, we have $20 N = (5 kg)a$. So, $a = 20/5 = 4 m/s^2$.',
  },
  {
    id: 'phys-mech-002',
    title: 'Lesson 5', // Updated title
    subject: 'Physics',
    branch: 'Mechanics',
    youtubeVideoId: 'PYQcpjIFnoo',
    content: '<p>This lesson explores the concepts of work, kinetic energy, potential energy, and power. The work-energy theorem will also be introduced.</p>',
    question: 'A 2 kg object is lifted to a height of 5 meters. Calculate the potential energy gained by the object. (Assume $g = 9.8 m/s^2$)',
    exampleSolution: '$PE = mgh = (2 kg)(9.8 m/s^2)(5 m) = 98 J$.',
  },
];

export const mockStudentAnswers: StudentAnswer[] = [
  {
    id: 'ans-001',
    lessonId: 'math-alg-001',
    lessonTitle: 'Lesson 1', // Updated to match new lesson title
    subject: 'Mathematics',
    studentId: 'student123',
    reasoning: 'I combined like terms. For the degree, I looked at the highest power of x.',
    solution: '4x^2 + 2x - 7, degree is 2',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Reviewed',
    tutorFeedback: 'Great job on combining like terms and identifying the degree! Make sure to show all steps clearly.',
    aiFeedback: 'Your approach to combining like terms is correct. The identification of the degree based on the highest power of x is also accurate. Well done!',
  },
  {
    id: 'ans-002',
    lessonId: 'phys-mech-001',
    lessonTitle: 'Lesson 4', // Updated to match new lesson title
    subject: 'Physics',
    studentId: 'student123',
    reasoning: 'Used F=ma.',
    solution: 'a = 4 m/s^2',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'Awaiting Review',
  },
];

export const mockBookings: Booking[] = [
    {
        id: 'booking-001',
        userId: 'student123',
        subject: 'Mathematics',
        date: '2024-08-15',
        time: '14:00',
        confirmed: true,
    },
    {
        id: 'booking-002',
        userId: 'student123',
        subject: 'Physics',
        date: '2024-08-18',
        time: '10:30',
        confirmed: false, // Example of a pending confirmation perhaps
    }
];

export const getLessonsByBranch = (subject: SubjectName, branchName: string): Lesson[] => {
  return lessons.filter(lesson => lesson.subject === subject && lesson.branch === branchName);
}

export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
}

export const getBranchesBySubject = (subjectName: SubjectName): LessonBranch[] => {
  if (subjectName === 'Mathematics') return mathematicsBranches;
  if (subjectName === 'Physics') return physicsBranches;
  return [];
}


import type { Lesson, LessonBranch, SubjectName, Booking } from '@/types';

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
    title: 'Lesson 1',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'BhBzhKQzYiI',
    content: '<p>In this video, the focus is on nature of roots and simultaneous equations.</p><p>Understanding nature of roots helps in solving equations, graphing functions and analyzing mathematics models.</p><p>Solving simultaneous equations has a variety of applications in various fields, including physics, engineering, economics and computer science.</p>',
    question: 'QUESTION 1\n1.1 Solve for x\n1.1.1 (3−x)(2−x) = 0 (2)\n1.1.2 2x² + 7x = 2 (Correct to 2 decimal places) (4)\n1.1.3 4 + 5x > 6x² (4)\n1.1.4 9x + 9 = 10.3x (4)\n1.2 Solve for x and y:',
    exampleSolution: 'Solution: $(3x^2 - 5x + 2) + (x^2 + 7x - 9) = 3x^2 + x^2 - 5x + 7x + 2 - 9 = 4x^2 + 2x - 7$. The degree of the resulting polynomial is 2.',
  },
  {
    id: 'math-alg-002',
    title: 'Lesson 2',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'f15zA0PhSek',
    content: '<p>Learn the techniques for solving linear equations in one variable. This includes understanding properties of equality and applying them to isolate the variable.</p>',
    question: 'Solve for $x$: $3(x - 2) + 5 = 2x - 7$.',
    exampleSolution: '$3x - 6 + 5 = 2x - 7 \Rightarrow 3x - 1 = 2x - 7 \Rightarrow x = -6$.',
  },
  {
    id: 'math-alg-003',
    title: 'Algebra Lesson 3 (Placeholder)',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder video ID
    content: '<p>This is placeholder content for Algebra Lesson 3. You can edit this later to include specific topics like quadratic equations, inequalities, or functions.</p>',
    question: 'Placeholder question for Algebra Lesson 3. For example: Factor the quadratic expression $x^2 - 5x + 6$.',
    exampleSolution: 'Placeholder solution for Algebra Lesson 3. For example: $(x-2)(x-3)$.',
  },
  {
    id: 'math-alg-004',
    title: 'Algebra Lesson 4 (Placeholder)',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder video ID
    content: '<p>This is placeholder content for Algebra Lesson 4. Consider topics such as polynomial operations, rational expressions, or systems of linear equations.</p>',
    question: 'Placeholder question for Algebra Lesson 4. For example: Simplify the expression $(2x^2 + 3x - 1) - (x^2 - 2x + 5)$.',
    exampleSolution: 'Placeholder solution for Algebra Lesson 4. For example: $x^2 + 5x - 6$.',
  },
  {
    id: 'math-alg-005',
    title: 'Algebra Lesson 5 (Placeholder)',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder video ID
    content: '<p>This is placeholder content for Algebra Lesson 5. You might cover topics like exponents, radicals, or an introduction to matrices.</p>',
    question: 'Placeholder question for Algebra Lesson 5. For example: Solve the system of equations: $y = 2x + 1$ and $y = -x + 4$.',
    exampleSolution: 'Placeholder solution for Algebra Lesson 5. For example: $x=1, y=3$.',
  },
  // Mathematics - Calculus
  {
    id: 'math-calc-001',
    title: 'Lesson 3',
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
    title: 'Lesson 4',
    subject: 'Physics',
    branch: 'Mechanics',
    youtubeVideoId: 'kKKM8Y-u7ds',
    content: '<p>An overview of Newton\'s three laws of motion, which form the basis of classical mechanics. We will discuss inertia, force, mass, and action-reaction pairs.</p>',
    question: 'A force of 20 N is applied to an object with a mass of 5 kg. What is the acceleration of the object?',
    exampleSolution: 'Using $F = ma$, we have $20 N = (5 kg)a$. So, $a = 20/5 = 4 m/s^2$.',
  },
  {
    id: 'phys-mech-002',
    title: 'Lesson 5',
    subject: 'Physics',
    branch: 'Mechanics',
    youtubeVideoId: 'PYQcpjIFnoo',
    content: '<p>This lesson explores the concepts of work, kinetic energy, potential energy, and power. The work-energy theorem will also be introduced.</p>',
    question: 'A 2 kg object is lifted to a height of 5 meters. Calculate the potential energy gained by the object. (Assume $g = 9.8 m/s^2$)',
    exampleSolution: '$PE = mgh = (2 kg)(9.8 m/s^2)(5 m) = 98 J$.',
  },
];


// Mock booking data can remain if this feature is separate from core submissions
export const mockBookings: Booking[] = [
    {
        id: 'booking-001',
        userId: 'student123', // This would be a Firebase UID in a real app
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
        confirmed: false,
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


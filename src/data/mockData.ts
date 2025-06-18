
import type { Lesson, LessonBranch, SubjectName, Booking, StructuredQuestionItem } from '@/types';

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
    question: 'QUESTION 1: Solve the following problems.', // General question title
    structuredQuestions: [
      { id: '1.1.1', text: '(3−x)(2−x) = 0', marks: 2 },
      { id: '1.1.2', text: '2x² + 7x = 2 (Correct to 2 decimal places)', marks: 4 },
      { id: '1.1.3', text: '4 + 5x > 6x²', marks: 4 },
      { id: '1.1.4', text: '9^x + 9 = 10 * 3^x', marks: 4 },
      { id: '1.2', text: 'Solve for x and y: 2x + y = 5 and 3x - 2y = 4', marks: 5 },
    ],
    exampleSolution: 'Solutions for each sub-question should be verified and provided. For 1.1.1: x=3 or x=2. For structured questions, individual solutions should be detailed.',
  },
  {
    id: 'math-alg-002',
    title: 'Lesson 2',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: '3dJXkHo5qkg',
    content: '<p>In this video, the focus is on quadratic equations, surds, exponents.</p><p>There are several ways of solving quadratic equations like, factors,  completing the square or quadratic formula.</p><p>Surds are Mathematical expressions that contain irrational roots, such as square roots, cube roots, and radical expressions.</p><p>Exponents are mathematical operations that involve raising a number to a power. They are used to represent repeated&nbsp;multiplication.</p>',
    question: 'QUESTION 1.1: Solve for x:',
    structuredQuestions: [
      { id: '1.1.1', text: '(x - 2)(5 + x) = 0', marks: 2 },
      { id: '1.1.2', text: '3x² - 2x - 6 = 0 (correct to TWO decimal places)', marks: 4 },
      { id: '1.1.3', text: '2√(x + 6) + 2 = x', marks: 4 },
      { id: '1.1.4', text: 'x² < -2x + 15', marks: 4 },
      { id: '1.1.5', text: '2^(x+2) - 3 ⋅ 2^(x-1) = 80', marks: 5 },
    ],
    exampleSolution: 'Solutions for each sub-question should be verified and provided by the tutor. For structured questions, individual solutions should be detailed here or linked.',
  },
  {
    id: 'math-alg-003',
    title: 'Algebra Lesson 3',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: '4-Lq10ZE1PU',
    content: '<p>In this video, the focus is on quadratic equations, inequality, exponents and simultaneous equations.</p><p>There are several ways of solving quadratic equations like, factors,  completing the square or quadratic formula.</p><p>An inequality is a mathematical statement that compares to expressions using greater than, less than or equal to, or greater than or equal to.</p><p>Exponents are mathematical operations that involve raising a number to a power. They are used to represent repeated multiplication.</p><p>Solving simultaneous equations has a variety of applications in various fields, including physics, engineering, economics and computer&nbsp;science.</p>',
    question: 'QUESTION 1: Solve the following problems.',
    structuredQuestions: [
      { id: '1.1.1', text: '(3x - 2)^2 = 5', marks: 4 },
      { id: '1.1.2', text: '2 * 3^(2x) = 9', marks: 3 },
      { id: '1.1.3', text: 'x^3 - 3x^2 - x + 3 = 0', marks: 4 },
      { id: '1.1.4', text: '2x^2 + 9x - 5 <= 0', marks: 4 },
      { id: '1.2', text: 'Solve for x and y simultaneously if: y - x + 3 = 0 and x^2 - x = 6 + y', marks: 6 },
    ],
    exampleSolution: 'Placeholder solution for Algebra Lesson 3. Solutions for each sub-question should be detailed by the tutor.',
  },
  {
    id: 'math-alg-004',
    title: 'Algebra Lesson 4',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'A6_xy8mgRaE',
    content: '<p>In this video, the focus is on quadratic equations, surds, exponents.</p><p>There are several ways of solving quadratic equations like, factors,  completing the square or quadratic formula.</p><p>Surds are Mathematical expressions that contain irrational roots, such as square roots, cube roots, and radical expressions</p><p>Solving simultaneous equations has a variety of applications in various fields, including physics, engineering, economics and computer&nbsp;science.</p>',
    question: 'Solve the following algebra problems. Correct to TWO decimal places where necessary.',
    structuredQuestions: [
      { id: '1.1.1', text: '(x + 3)(2 - x) = 0', marks: 2 },
      { id: '1.1.2', text: '2x^2 + 3x - 7 = 0', marks: 4 },
      { id: '1.1.3', text: '2^x - 8 = 2 * 2^(x/2)', marks: 4 },
      { id: '1.1.4', text: '7x^2 + 18x - 9 > 0', marks: 4 },
      { id: '1.2.1', text: 'Given: 4y - x = 4 and xy = 8. Solve for x and y simultaneously.', marks: 6 },
      { id: '1.2.2', text: 'Given the graph xy = 8. Write down both lines of symmetry of the graph.', marks: 2 },
    ],
    exampleSolution: 'Solutions for each sub-question should be provided by the tutor. Remember to provide answers correct to two decimal places where necessary.',
  },
  {
    id: 'math-alg-005',
    title: 'Algebra Lesson 5',
    subject: 'Mathematics',
    branch: 'Algebra',
    youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder video ID
    content: '<p>In this video, the focus is on quadratic equations, inequality, exponents and simultaneous equations.</p><p>There are several ways of solving quadratic equations like, factors,  completing the square or quadratic formula.</p><p>An inequality is a mathematical statement that compares to expressions using greater than, less than or equal to, or greater than or equal to.</p><p>Exponents are mathematical operations that involve raising a number to a power. They are used to represent repeated multiplication.</p><p>Solving simultaneous equations has a variety of applications in various fields, including physics, engineering, economics and computer science.</p>',
    question: 'QUESTION 1.1: Solve for x:',
    structuredQuestions: [
      { id: '1.1.1', text: '2x(x² - 1) = 0', marks: 2 },
      { id: '1.1.2', text: 'x - 6 + (2/x) = 0 ; x ≠ 0 (correct to TWO decimal places)', marks: 4 },
      { id: '1.1.3', text: '(x - 1)(x + 4) ≥ 6', marks: 3 },
    ],
    exampleSolution: 'Solutions for each sub-question should be detailed by the tutor.',
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


// src/app/lesson/[lessonId]/page.tsx
import { getLessonById, lessons as allLessons } from '@/data/mockData';
import { notFound } from 'next/navigation';
import LessonDetailClient from '@/components/lessons/LessonDetailClient';

interface LessonPageParams {
  params: {
    lessonId: string;
  };
}

export default function LessonPage({ params }: LessonPageParams) {
  const lesson = getLessonById(params.lessonId);

  if (!lesson) {
    notFound();
  }

  return <LessonDetailClient lesson={lesson} />;
}

export async function generateStaticParams() {
  return allLessons.map((lesson) => ({
    lessonId: lesson.id,
  }));
}

export async function generateMetadata({ params }: LessonPageParams) {
  const lesson = getLessonById(params.lessonId);
  if (!lesson) {
    return { title: "Lesson Not Found" }
  }
  return {
    title: `${lesson.title} | TutorHub`,
    description: `Learn about ${lesson.title} in ${lesson.subject}. ${lesson.content.substring(0,100).replace(/<[^>]+>/g, '')}...`
  }
}

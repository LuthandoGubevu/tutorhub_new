
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

// Specific type for generateMetadata props, acknowledging params might be a Promise
interface GenerateMetadataProps {
  params: { lessonId: string } | Promise<{ lessonId: string }>;
  // searchParams: { [key: string]: string | string[] | undefined }; // If you were using searchParams
}

export async function generateMetadata({ params: paramsInput }: GenerateMetadataProps) {
  const resolvedParams = await paramsInput; // Await the params object that might be a promise
  const lesson = getLessonById(resolvedParams.lessonId);

  if (!lesson) {
    return { title: "Lesson Not Found" };
  }
  return {
    title: `${lesson.title} | TutorHub`,
    description: `Learn about ${lesson.title} in ${lesson.subject}. ${lesson.content.substring(0,100).replace(/<[^>]+>/g, '')}...`
  };
}

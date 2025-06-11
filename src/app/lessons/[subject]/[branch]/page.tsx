// src/app/lessons/[subject]/[branch]/page.tsx
import LessonCard from '@/components/lessons/LessonCard';
import { getLessonsByBranch, getBranchesBySubject, subjects as allSubjects } from '@/data/mockData';
import type { SubjectName, Lesson } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BranchPageParams {
  params: {
    subject: string;
    branch: string;
  };
}

export default function BranchLessonsPage({ params }: BranchPageParams) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1) as SubjectName;
  // Normalize branch name from URL slug (e.g., waves-optics -> Waves & Optics)
  // This needs to match how branch names are stored or looked up. For simplicity, find by normalized name.
  const branchesForSubject = getBranchesBySubject(subjectName);
  const currentBranch = branchesForSubject.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === params.branch);

  if (!currentBranch) {
    notFound();
  }

  const lessons = getLessonsByBranch(subjectName, currentBranch.name);

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-4">
          {currentBranch.name} Lessons
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse lessons in {currentBranch.name} under {subjectName}.
        </p>
        <div className="mt-4">
          <Link href={`/lessons/${subjectName.toLowerCase()}`} className="text-brand-purple-blue hover:underline text-sm">&larr; Back to {subjectName} Branches</Link>
        </div>
      </section>

      {lessons.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map((lesson: Lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </section>
      ) : (
        <p className="text-muted-foreground text-center py-10">No lessons found in this branch yet. Check back soon!</p>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const params: Array<{ subject: string, branch: string }> = [];
  allSubjects.forEach(subject => {
    const branches = getBranchesBySubject(subject.name);
    branches.forEach(branch => {
      params.push({
        subject: subject.name.toLowerCase(),
        branch: branch.name.toLowerCase().replace(/\s+/g, '-'),
      });
    });
  });
  return params;
}

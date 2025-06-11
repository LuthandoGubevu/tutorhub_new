// src/app/lessons/[subject]/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBranchesBySubject, subjects as allSubjects } from '@/data/mockData';
import type { SubjectName, LessonBranch } from '@/types';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { notFound } from 'next/navigation';

interface SubjectPageParams {
  params: {
    subject: string;
  };
}

export default function SubjectBranchesPage({ params }: SubjectPageParams) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1) as SubjectName;
  
  const subjectExists = allSubjects.some(s => s.name.toLowerCase() === params.subject.toLowerCase());
  if (!subjectExists) {
    notFound();
  }
  
  const branches = getBranchesBySubject(subjectName);

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-4">
          {subjectName} Branches
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select a branch to view available lessons.
        </p>
        <div className="mt-4">
          <Link href="/lessons" className="text-brand-purple-blue hover:underline text-sm">&larr; Back to Subjects</Link>
        </div>
      </section>

      {branches.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch: LessonBranch) => (
            <Link key={branch.id} href={`/lessons/${subjectName.toLowerCase()}/${branch.name.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-lg h-full flex flex-col items-center text-center p-6 hover:border-brand-purple-blue border-2 border-transparent">
                <CardHeader className="items-center p-2">
                  <FolderOpen className="h-10 w-10 text-brand-purple-blue mb-2" />
                  <CardTitle className="font-headline text-xl text-brand-navy group-hover:text-brand-purple-blue transition-colors">
                    {branch.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow mt-2">
                    <p className="text-sm text-muted-foreground">Explore lessons in {branch.name}.</p>
                </CardContent>
                <div className="mt-auto text-brand-purple-blue font-semibold flex items-center group-hover:underline text-sm">
                  View Lessons <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card>
            </Link>
          ))}
        </section>
      ) : (
        <p className="text-muted-foreground text-center">No branches found for this subject.</p>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  return allSubjects.map((subject) => ({
    subject: subject.name.toLowerCase(),
  }));
}

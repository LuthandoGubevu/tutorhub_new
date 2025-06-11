// src/app/lessons/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subjects } from '@/data/mockData';
import { ArrowRight, Sigma, AtomIcon } from 'lucide-react';

const subjectIcons = {
  Mathematics: <Sigma className="h-12 w-12 text-brand-purple-blue" />,
  Physics: <AtomIcon className="h-12 w-12 text-brand-purple-blue" />,
};

export default function LessonLibraryPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-4">
          Lesson Library
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive lessons in Mathematics and Physics. Choose a subject to begin.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {subjects.map((subject) => (
          <Link key={subject.name} href={`/lessons/${subject.name.toLowerCase()}`} className="block group">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg h-full flex flex-col items-center text-center p-8 hover:border-brand-purple-blue border-2 border-transparent">
              <CardHeader className="items-center">
                {subjectIcons[subject.name]}
                <CardTitle className="font-headline text-2xl text-brand-navy mt-4 group-hover:text-brand-purple-blue transition-colors">
                  {subject.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{subject.description}</p>
              </CardContent>
              <div className="mt-4 text-brand-purple-blue font-semibold flex items-center group-hover:underline">
                View Branches <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}

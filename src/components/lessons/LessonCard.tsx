// src/components/lessons/LessonCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Lesson } from '@/types';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const placeholderImageUrl = `https://placehold.co/600x400.png`; // Generic placeholder

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="p-0">
        <Image
          src={placeholderImageUrl}
          alt={lesson.title}
          width={600}
          height={300} // Adjust height for aspect ratio
          className="object-cover w-full h-48"
          data-ai-hint={`${lesson.subject} lesson illustration`}
        />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-xl text-brand-navy mb-2">{lesson.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2">
          {lesson.subject} - {lesson.branch}
        </CardDescription>
        <p className="text-sm text-foreground line-clamp-3">
          {lesson.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white">
          <Link href={`/lesson/${lesson.id}`}>
            Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;

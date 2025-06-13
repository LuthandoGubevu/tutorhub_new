
// src/components/dashboard/SubjectProgressCard.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, CheckCircle, TrendingUp, Star } from 'lucide-react';
import type { SubjectName } from '@/types';

interface SubjectProgressCardProps {
  subjectName: SubjectName;
  totalLessons: number;
  attemptedLessons: number; // Changed from completedLessons
  averageGrade: number | null; // New prop for average grade
  icon: React.ReactNode;
  colorClass: string; 
}

const SubjectProgressCard: React.FC<SubjectProgressCardProps> = ({
  subjectName,
  totalLessons,
  attemptedLessons,
  averageGrade,
  icon,
  colorClass,
}) => {
  const pendingLessons = totalLessons - attemptedLessons;
  const progressPercentage = totalLessons > 0 ? (attemptedLessons / totalLessons) * 100 : 0;

  const getAverageGradeColor = (grade: number | null) => {
    if (grade === null || grade === undefined) return 'text-muted-foreground';
    if (grade >= 75) return 'text-green-600';
    if (grade >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline font-medium text-brand-navy">{subjectName}</CardTitle>
        <div className={`p-2 rounded-md ${colorClass.replace('text-', 'bg-')}/10`}>
          {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${colorClass}` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Progress (Attempted)</span>
              <span className={`text-sm font-semibold ${colorClass}`}>{attemptedLessons} / {totalLessons} Lessons</span>
            </div>
            <Progress value={progressPercentage} className={`h-2 [&>div]:bg-gradient-to-r [&>div]:from-${colorClass.split('-')[1]}-400 [&>div]:to-${colorClass.split('-')[1]}-600`} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
            <div>
              <Book className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Attempted</p>
              <p className="text-lg font-semibold text-brand-navy">{attemptedLessons}</p>
            </div>
            <div>
              <Star className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Average Grade</p>
              <p className={`text-lg font-bold ${getAverageGradeColor(averageGrade)}`}>
                {averageGrade !== null && averageGrade > 0 ? `${averageGrade}%` : 'N/A'}
              </p>
            </div>
          </div>
          
           <div className="text-xs text-muted-foreground mt-2">
            Pending lessons: {pendingLessons}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgressCard;


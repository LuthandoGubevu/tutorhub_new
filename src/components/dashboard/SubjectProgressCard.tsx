// src/components/dashboard/SubjectProgressCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, CheckCircle, TrendingUp } from 'lucide-react';
import type { SubjectName } from '@/types';

interface SubjectProgressCardProps {
  subjectName: SubjectName;
  totalLessons: number;
  completedLessons: number;
  icon: React.ReactNode;
  colorClass: string; // e.g. 'text-blue-500' or 'bg-green-500' for progress bar
}

const SubjectProgressCard: React.FC<SubjectProgressCardProps> = ({
  subjectName,
  totalLessons,
  completedLessons,
  icon,
  colorClass,
}) => {
  const pendingLessons = totalLessons - completedLessons;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

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
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className={`text-sm font-semibold ${colorClass}`}>{completedLessons} / {totalLessons} Lessons</span>
            </div>
            <Progress value={progressPercentage} className={`h-2 [&>div]:bg-gradient-to-r [&>div]:from-${colorClass.split('-')[1]}-400 [&>div]:to-${colorClass.split('-')[1]}-600`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Book className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-brand-navy">{totalLessons}</p>
            </div>
            <div>
              <CheckCircle className="h-5 w-5 mx-auto text-brand-green mb-1" />
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold text-brand-green">{completedLessons}</p>
            </div>
            <div>
              <TrendingUp className="h-5 w-5 mx-auto text-brand-red mb-1" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-brand-red">{pendingLessons}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgressCard;

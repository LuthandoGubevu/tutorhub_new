// src/app/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import SubjectProgressCard from '@/components/dashboard/SubjectProgressCard';
import PerformanceChart, { mockPerformanceData } from '@/components/dashboard/PerformanceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, BookOpenText, CheckSquare, ListChecks, Loader2, Sigma, AtomIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { lessons as allLessons, mockStudentAnswers } from '@/data/mockData'; // Assuming lessons are globally unique by ID
import type { StudentAnswer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-purple-blue" />
      </div>
    );
  }

  if (!user) {
    // This should ideally be handled by AuthContext redirect, but as a fallback:
    return (
      <div className="text-center py-10">
        <p>Please log in to view your dashboard.</p>
        <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
      </div>
    );
  }

  // Mock data - replace with actual data fetching
  const mathLessonsCompleted = mockStudentAnswers.filter(ans => ans.subject === 'Mathematics' && ans.status === 'Reviewed').length;
  const physicsLessonsCompleted = mockStudentAnswers.filter(ans => ans.subject === 'Physics' && ans.status === 'Reviewed').length;
  const totalMathLessons = allLessons.filter(l => l.subject === 'Mathematics').length;
  const totalPhysicsLessons = allLessons.filter(l => l.subject === 'Physics').length;

  const lessonsToComplete = allLessons.filter(
    lesson => !mockStudentAnswers.some(ans => ans.lessonId === lesson.id && ans.status === 'Reviewed')
  ).slice(0, 5); // Show first 5

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-2">
          Welcome, {user.fullName || 'Student'}!
        </h1>
        <p className="text-lg text-muted-foreground">Here's an overview of your academic journey.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubjectProgressCard
          subjectName="Mathematics"
          totalLessons={totalMathLessons}
          completedLessons={mathLessonsCompleted}
          icon={<Sigma />}
          colorClass="text-blue-500"
        />
        <SubjectProgressCard
          subjectName="Physics"
          totalLessons={totalPhysicsLessons}
          completedLessons={physicsLessonsCompleted}
          icon={<AtomIcon />}
          colorClass="text-green-500"
        />
      </section>

      <section>
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-brand-navy">Lessons to Complete</CardTitle>
            <CardDescription>Continue your learning journey with these lessons.</CardDescription>
          </CardHeader>
          <CardContent>
            {lessonsToComplete.length > 0 ? (
              <ul className="space-y-3">
                {lessonsToComplete.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="font-semibold text-brand-navy">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground">{lesson.subject} - {lesson.branch}</p>
                    </div>
                    <Button size="sm" asChild className="bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white">
                      <Link href={`/lesson/${lesson.id}`}>Start Lesson</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">You've completed all available lessons for now! Great job!</p>
            )}
          </CardContent>
        </Card>
      </section>
      
      <section>
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:max-w-md">
            <TabsTrigger value="assignments" className="font-semibold"><ListChecks className="mr-2 h-4 w-4 inline-block" />Assignments</TabsTrigger>
            <TabsTrigger value="performance" className="font-semibold"><TrendingUp className="mr-2 h-4 w-4 inline-block" />Performance</TabsTrigger>
            <TabsTrigger value="alerts" className="font-semibold"><AlertCircle className="mr-2 h-4 w-4 inline-block" />Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments" className="mt-4">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-brand-navy">My Submissions</CardTitle>
                <CardDescription>Track your submitted answers and feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                {mockStudentAnswers.filter(ans => ans.studentId === user.uid).length > 0 ? (
                  <ul className="space-y-4">
                    {mockStudentAnswers.filter(ans => ans.studentId === user.uid).map((answer: StudentAnswer) => (
                      <li key={answer.id} className="p-4 border rounded-md shadow-sm bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-brand-navy">{answer.lessonTitle}</h4>
                            <p className="text-xs text-muted-foreground">
                              {answer.subject} | Submitted {formatDistanceToNow(new Date(answer.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant={answer.status === 'Reviewed' ? 'default' : 'secondary'} 
                                 className={`${answer.status === 'Reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                            {answer.status}
                          </Badge>
                        </div>
                        {answer.status === 'Reviewed' && answer.tutorFeedback && (
                           <p className="text-sm mt-2 pt-2 border-t"><strong>Tutor Feedback:</strong> {answer.tutorFeedback}</p>
                        )}
                         {answer.aiFeedback && (
                           <p className="text-sm mt-2 pt-2 border-t text-purple-700"><strong>AI Feedback:</strong> {answer.aiFeedback}</p>
                        )}
                        <Button variant="link" size="sm" asChild className="mt-1 p-0 h-auto text-brand-purple-blue">
                          <Link href={`/lesson/${answer.lessonId}?answerId=${answer.id}`}>View Submission</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No assignments submitted yet. Start a lesson to submit your first answer!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="mt-4">
            <PerformanceChart data={mockPerformanceData} subject="Overall" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <PerformanceChart data={mockPerformanceData.map(d => ({month: d.month, math: d.math}))} subject="Mathematics" />
                <PerformanceChart data={mockPerformanceData.map(d => ({month: d.month, physics: d.physics}))} subject="Physics" />
            </div>
          </TabsContent>
          <TabsContent value="alerts" className="mt-4">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-brand-navy">Alerts & Reminders</CardTitle>
                <CardDescription>Important updates and notifications.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock alerts */}
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-yellow-700">Upcoming: Calculus Quiz</h4>
                      <p className="text-sm text-yellow-600">Your quiz on Introduction to Limits is scheduled for next Monday. Don't forget to revise!</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 bg-green-50 border-l-4 border-green-400 rounded-md">
                    <CheckSquare className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-700">Feedback Received!</h4>
                      <p className="text-sm text-green-600">Your submission for "Newton's Laws of Motion" has been reviewed.</p>
                    </div>
                  </div>
                </div>
                 <p className="text-muted-foreground text-center py-4 mt-4">No new critical alerts.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default DashboardPage;

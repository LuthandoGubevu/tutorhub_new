
// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SubjectProgressCard from '@/components/dashboard/SubjectProgressCard';
import PerformanceChart, { mockPerformanceData } from '@/components/dashboard/PerformanceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, BookOpenText, CheckSquare, ListChecks, Loader2, Sigma, AtomIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { lessons as allLessons } from '@/data/mockData';
import type { Submission } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  getFirestoreDb, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      setLoadingSubmissions(true);
      const db = getFirestoreDb();
      if (!db) {
        toast({ title: "Error", description: "Database not available.", variant: "destructive" });
        setLoadingSubmissions(false);
        return;
      }

      const q = query(
        collection(db, "submissions"),
        where("studentId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedSubmissions: Submission[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
        });
        setSubmissions(fetchedSubmissions);
        setLoadingSubmissions(false);
      }, (error) => {
        console.error("Error fetching submissions: ", error);
        toast({ title: "Error", description: "Could not fetch your submissions.", variant: "destructive" });
        setLoadingSubmissions(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) { // If user is not logged in and auth is not loading
      setLoadingSubmissions(false);
      setSubmissions([]);
    }
  }, [user, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-purple-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Please <Link href="/login" className="underline text-brand-purple-blue">login</Link> to view your dashboard.</p>
        <Button asChild className="mt-4 bg-brand-purple-blue text-white hover:bg-brand-purple-blue/90"><Link href="/login">Login</Link></Button>
      </div>
    );
  }

  const mathLessonsCompleted = submissions.filter(sub => sub.subject === 'Mathematics' && sub.status === 'reviewed').length;
  const physicsLessonsCompleted = submissions.filter(sub => sub.subject === 'Physics' && sub.status === 'reviewed').length;
  const totalMathLessons = allLessons.filter(l => l.subject === 'Mathematics').length;
  const totalPhysicsLessons = allLessons.filter(l => l.subject === 'Physics').length;

  const lessonsToComplete = allLessons.filter(
    lesson => !submissions.some(sub => sub.lessonId === lesson.id && (sub.status === 'reviewed' || sub.status === 'submitted'))
  ).slice(0, 5);


  const formatSubmissionTimestamp = (timestamp: Submission['timestamp']) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } else if (timestamp instanceof Timestamp) {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    return 'Invalid date';
  };


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
            <TabsTrigger value="assignments" className="font-semibold"><ListChecks className="mr-2 h-4 w-4 inline-block" />Submissions</TabsTrigger>
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
                {loadingSubmissions ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-purple-blue" />
                  </div>
                ) : submissions.length > 0 ? (
                  <ul className="space-y-4">
                    {submissions.map((submission: Submission) => (
                      <li key={submission.id} className="p-4 border rounded-md shadow-sm bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-brand-navy">{submission.lessonTitle}</h4>
                            <p className="text-xs text-muted-foreground">
                              {submission.subject} | Submitted {formatSubmissionTimestamp(submission.timestamp)}
                            </p>
                          </div>
                          <Badge variant={submission.status === 'reviewed' ? 'default' : 'secondary'}
                                 className={`${submission.status === 'reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                            {submission.status}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2 text-gray-600"><strong>Reasoning:</strong> {submission.reasoning.substring(0,100)}{submission.reasoning.length > 100 ? '...' : ''}</p>
                        <p className="text-sm mt-1 text-gray-600"><strong>Answer:</strong> {submission.answer.substring(0,100)}{submission.answer.length > 100 ? '...' : ''}</p>
                        {submission.tutorFeedback && (
                           <p className="text-sm mt-2 pt-2 border-t"><strong>Tutor Feedback:</strong> {submission.tutorFeedback}</p>
                        )}
                         {submission.aiFeedback && (
                           <p className="text-sm mt-2 pt-2 border-t text-purple-700"><strong>AI Feedback:</strong> {submission.aiFeedback}</p>
                        )}
                        <Button variant="link" size="sm" asChild className="mt-1 p-0 h-auto text-brand-purple-blue">
                          <Link href={`/lesson/${submission.lessonId}?submissionId=${submission.id}`}>View Submission</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No submissions yet. Start a lesson to submit your first answer!</p>
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
                {/* Mock alerts - can be replaced with Firestore data later */}
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

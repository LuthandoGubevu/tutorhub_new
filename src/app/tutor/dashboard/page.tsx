// src/app/tutor/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Eye, FileText, Users } from 'lucide-react';
import { mockStudentAnswers, getLessonById, saveStudentAnswersToLocalStorage } from '@/data/mockData'; // Re-use student answers for demo
import type { StudentAnswer } from '@/types';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


const TutorDashboardPage = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<StudentAnswer | null>(null);
  const [tutorComment, setTutorComment] = useState('');
  const { toast } = useToast();
  
  // Local state for metrics to ensure they re-render if mockStudentAnswers changes.
  // This is a simple way; more complex apps might use a state management library or context.
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    pendingReviews: 0,
    reviewedCount: 0,
    activeStudents: 0,
  });

  const [submissions, setSubmissions] = useState<StudentAnswer[]>([]);

  useEffect(() => {
    // Function to update metrics and submissions from mockStudentAnswers
    const updateDashboardData = () => {
      const total = mockStudentAnswers.length;
      const pending = mockStudentAnswers.filter(ans => ans.status === 'Awaiting Review').length;
      const reviewed = mockStudentAnswers.filter(ans => ans.status === 'Reviewed').length;
      const students = new Set(mockStudentAnswers.map(ans => ans.studentId)).size;
      
      setMetrics({
        totalSubmissions: total,
        pendingReviews: pending,
        reviewedCount: reviewed,
        activeStudents: students,
      });
      setSubmissions([...mockStudentAnswers]); // Create a new array to trigger re-render
    };

    updateDashboardData(); // Initial update

    // Optional: if mockStudentAnswers could change from other places while page is open
    // and you need live updates without localStorage as the sole trigger.
    // For this localStorage approach, refresh or navigation will show changes.
    // const interval = setInterval(updateDashboardData, 5000); // Poll every 5 seconds
    // return () => clearInterval(interval);

  }, []); // Empty dependency array means this runs once on mount and on data change if re-triggered by parent.

  const metricCardsData = [
    { title: 'Total Submissions', value: metrics.totalSubmissions, icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Pending Reviews', value: metrics.pendingReviews, icon: <Clock className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Reviewed Count', value: metrics.reviewedCount, icon: <CheckCircle className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Active Students', value: metrics.activeStudents, icon: <Users className="h-5 w-5 text-muted-foreground" /> },
  ];


  const handleReviewSubmit = () => {
    if (!selectedSubmission || !tutorComment) {
        toast({title: "Error", description: "Please enter a comment.", variant: "destructive"});
        return;
    }
    
    const index = mockStudentAnswers.findIndex(s => s.id === selectedSubmission.id);
    if (index > -1) {
        mockStudentAnswers[index].status = 'Reviewed';
        mockStudentAnswers[index].tutorFeedback = tutorComment;
        saveStudentAnswersToLocalStorage(); 
        
        // Update local state to trigger re-render
        setSubmissions([...mockStudentAnswers]);
        const pending = mockStudentAnswers.filter(ans => ans.status === 'Awaiting Review').length;
        const reviewed = mockStudentAnswers.filter(ans => ans.status === 'Reviewed').length;
        setMetrics(prevMetrics => ({
            ...prevMetrics,
            pendingReviews: pending,
            reviewedCount: reviewed,
        }));
    }
    toast({title: "Feedback Submitted", description: `Feedback for ${selectedSubmission.lessonTitle} saved.`, className: "bg-brand-green text-white"});
    setSelectedSubmission(null);
    setTutorComment('');
  };


  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-2">
          Tutor Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">Overview of student submissions and activity.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCardsData.map(metric => (
          <Card key={metric.title} className="shadow-lg rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brand-navy">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-brand-navy">Student Submissions</CardTitle>
            <CardDescription>Review and provide feedback on student answers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Answer Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>Student {submission.studentId.substring(0,6)}...</TableCell>
                    <TableCell>{submission.lessonTitle}</TableCell>
                    <TableCell>
                      <Badge variant={submission.status === 'Reviewed' ? 'default' : 'secondary'}
                       className={`${submission.status === 'Reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{submission.solution}</TableCell>
                    <TableCell className="text-right">
                       <Dialog onOpenChange={(open) => {
                           if (!open) {
                               setSelectedSubmission(null);
                               setTutorComment(''); // Reset comment when dialog closes
                           }
                       }}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => {
                               setSelectedSubmission(submission);
                               // If opening an already reviewed submission, prefill comment if desired, or clear for new review
                               if (submission.status === 'Reviewed' && submission.tutorFeedback) {
                                   setTutorComment(submission.tutorFeedback);
                               } else {
                                   setTutorComment('');
                               }
                           }}>
                            <Eye className="mr-2 h-4 w-4" /> Review
                          </Button>
                        </DialogTrigger>
                        {selectedSubmission && selectedSubmission.id === submission.id && (
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-brand-navy">Review Submission: {selectedSubmission.lessonTitle}</DialogTitle>
                            <DialogDescription>Student ID: {selectedSubmission.studentId.substring(0,10)}...</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <Card>
                              <CardHeader><CardTitle className="text-base">Question</CardTitle></CardHeader>
                              <CardContent><p>{getLessonById(selectedSubmission.lessonId)?.question || "Question not found."}</p></CardContent>
                            </Card>
                             <Card>
                              <CardHeader><CardTitle className="text-base">Student's Reasoning</CardTitle></CardHeader>
                              <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.reasoning}</p></CardContent>
                            </Card>
                             <Card>
                              <CardHeader><CardTitle className="text-base">Student's Solution</CardTitle></CardHeader>
                              <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.solution}</p></CardContent>
                            </Card>
                            {selectedSubmission.aiFeedback && (
                               <Card className="bg-purple-50 border-purple-200">
                                <CardHeader><CardTitle className="text-base text-purple-700">AI Feedback</CardTitle></CardHeader>
                                <CardContent><p className="text-purple-800 whitespace-pre-wrap">{selectedSubmission.aiFeedback}</p></CardContent>
                              </Card>
                            )}
                            {selectedSubmission.status === 'Reviewed' && selectedSubmission.tutorFeedback && (
                               <Card className="bg-green-50 border-green-200">
                                <CardHeader><CardTitle className="text-base text-green-700">Your Feedback</CardTitle></CardHeader>
                                <CardContent><p className="text-green-800 whitespace-pre-wrap">{selectedSubmission.tutorFeedback}</p></CardContent>
                              </Card>
                            )}
                            {selectedSubmission.status === 'Awaiting Review' && (
                            <div>
                                <Label htmlFor="tutorComment" className="font-semibold">Your Comments</Label>
                                <Textarea 
                                    id="tutorComment" 
                                    value={tutorComment}
                                    onChange={(e) => setTutorComment(e.target.value)}
                                    rows={4} 
                                    placeholder="Provide constructive feedback..." 
                                    className="mt-1"
                                />
                            </div>)}
                          </div>
                          <DialogFooter>
                            {selectedSubmission.status === 'Awaiting Review' && (
                            <Button onClick={handleReviewSubmit} className="bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white">
                                Submit Review
                            </Button>
                            )}
                             <Button variant="outline" onClick={() => {setSelectedSubmission(null); setTutorComment(''); }}>Close</Button>
                          </DialogFooter>
                        </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {submissions.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No student submissions yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default TutorDashboardPage;

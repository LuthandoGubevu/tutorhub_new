
// src/app/tutor/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Eye, FileText, Users, Loader2 } from 'lucide-react';
import { getLessonById } from '@/data/mockData';
import type { Submission } from '@/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  getFirestoreDb, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

const TutorDashboardPage = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [tutorComment, setTutorComment] = useState('');
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    pendingReviews: 0,
    reviewedCount: 0,
    activeStudents: 0,
  });

  useEffect(() => {
    setLoadingSubmissions(true);
    const db = getFirestoreDb();
    if (!db) {
      toast({ title: "Error", description: "Database not available.", variant: "destructive" });
      setLoadingSubmissions(false);
      return;
    }

    const q = query(collection(db, "submissions"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSubmissions: Submission[] = [];
      querySnapshot.forEach((doc) => {
        fetchedSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(fetchedSubmissions);

      // Update metrics
      const total = fetchedSubmissions.length;
      const pending = fetchedSubmissions.filter(sub => sub.status === 'submitted').length;
      const reviewed = fetchedSubmissions.filter(sub => sub.status === 'reviewed').length;
      const students = new Set(fetchedSubmissions.map(sub => sub.studentId)).size;
      setMetrics({
        totalSubmissions: total,
        pendingReviews: pending,
        reviewedCount: reviewed,
        activeStudents: students,
      });
      setLoadingSubmissions(false);
    }, (error) => {
      console.error("Error fetching submissions: ", error);
      toast({ title: "Error", description: "Could not fetch submissions.", variant: "destructive" });
      setLoadingSubmissions(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const metricCardsData = [
    { title: 'Total Submissions', value: metrics.totalSubmissions, icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Pending Reviews', value: metrics.pendingReviews, icon: <Clock className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Reviewed Count', value: metrics.reviewedCount, icon: <CheckCircle className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Active Students', value: metrics.activeStudents, icon: <Users className="h-5 w-5 text-muted-foreground" /> },
  ];

  const handleReviewSubmit = async () => {
    if (!selectedSubmission || !tutorComment || !selectedSubmission.id) {
      toast({ title: "Error", description: "Please select a submission and enter a comment.", variant: "destructive" });
      return;
    }
    const db = getFirestoreDb();
    if(!db) {
        toast({title: "Error", description: "Database not available.", variant: "destructive"});
        return;
    }

    const submissionRef = doc(db, "submissions", selectedSubmission.id);
    try {
      await updateDoc(submissionRef, {
        status: 'reviewed',
        tutorFeedback: tutorComment,
        reviewedAt: serverTimestamp(),
      });
      toast({ title: "Feedback Submitted", description: `Feedback for ${selectedSubmission.lessonTitle} saved.`, className: "bg-brand-green text-white" });
      setSelectedSubmission(null); // Close dialog by resetting selected submission
      setTutorComment('');
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    }
  };
  
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
            {loadingSubmissions ? (
              <div className="flex justify-center items-center py-10">
                 <Loader2 className="h-8 w-8 animate-spin text-brand-purple-blue" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Answer Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.studentName || submission.studentId.substring(0, 6) + '...'}</TableCell>
                    <TableCell>{submission.lessonTitle}</TableCell>
                    <TableCell>{formatSubmissionTimestamp(submission.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant={submission.status === 'reviewed' ? 'default' : 'secondary'}
                       className={`${submission.status === 'reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{submission.answer}</TableCell>
                    <TableCell className="text-right">
                       <Dialog open={selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                           if (!open) {
                               setSelectedSubmission(null);
                               setTutorComment('');
                           } else {
                               setSelectedSubmission(submission);
                               setTutorComment(submission.tutorFeedback || '');
                           }
                       }}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => {
                               setSelectedSubmission(submission);
                               setTutorComment(submission.tutorFeedback || '');
                           }}>
                            <Eye className="mr-2 h-4 w-4" /> Review
                          </Button>
                        </DialogTrigger>
                        {selectedSubmission && (
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-brand-navy">Review Submission: {selectedSubmission.lessonTitle}</DialogTitle>
                            <DialogDescription>
                                Student: {selectedSubmission.studentName || selectedSubmission.studentId.substring(0,10)+'...'} | Submitted: {formatSubmissionTimestamp(selectedSubmission.timestamp)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <Card>
                              <CardHeader><CardTitle className="text-base">Question</CardTitle></CardHeader>
                              <CardContent><p className="whitespace-pre-wrap">{getLessonById(selectedSubmission.lessonId)?.question || "Question not found."}</p></CardContent>
                            </Card>
                             <Card>
                              <CardHeader><CardTitle className="text-base">Student's Reasoning</CardTitle></CardHeader>
                              <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.reasoning}</p></CardContent>
                            </Card>
                             <Card>
                              <CardHeader><CardTitle className="text-base">Student's Answer</CardTitle></CardHeader>
                              <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.answer}</p></CardContent>
                            </Card>
                            {selectedSubmission.aiFeedback && (
                               <Card className="bg-purple-50 border-purple-200">
                                <CardHeader><CardTitle className="text-base text-purple-700">AI Feedback</CardTitle></CardHeader>
                                <CardContent><p className="text-purple-800 whitespace-pre-wrap">{selectedSubmission.aiFeedback}</p></CardContent>
                              </Card>
                            )}
                            <div>
                                <Label htmlFor="tutorComment" className="font-semibold">
                                    {selectedSubmission.status === 'reviewed' ? 'Your Feedback (Submitted)' : 'Your Feedback'}
                                </Label>
                                <Textarea
                                    id="tutorComment"
                                    value={tutorComment}
                                    onChange={(e) => setTutorComment(e.target.value)}
                                    rows={4}
                                    placeholder="Provide constructive feedback..."
                                    className="mt-1"
                                    disabled={selectedSubmission.status === 'reviewed'}
                                />
                            </div>
                          </div>
                          <DialogFooter>
                            {selectedSubmission.status === 'submitted' && (
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
            )}
             {submissions.length === 0 && !loadingSubmissions && (
              <p className="text-center text-muted-foreground py-6">No student submissions yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default TutorDashboardPage;

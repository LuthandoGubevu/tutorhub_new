
// src/app/tutor/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, Eye, FileText, Users, Loader2, Award, Users2 } from 'lucide-react'; // Added Users2
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
  Timestamp,
  getDocs,
  where
} from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { checkLessonUnlock } from '@/ai/flows/check-lesson-unlock-flow';

const TutorDashboardPage = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [tutorComment, setTutorComment] = useState('');
  const [currentGrade, setCurrentGrade] = useState<string | number>('');
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    pendingReviews: 0,
    reviewedCount: 0,
    activeStudents: 0,
    registeredStudents: 0,
  });

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) {
      toast({ title: "Error", description: "Database not available.", variant: "destructive" });
      setLoadingSubmissions(false);
      return;
    }

    let unsubscribeSubmissions = () => {};

    const fetchData = async () => {
      setLoadingSubmissions(true);
      let fetchedRegisteredStudents = 0;

      try {
        const usersQuery = query(collection(db, "users"), where("role", "==", "student"));
        const usersSnapshot = await getDocs(usersQuery);
        fetchedRegisteredStudents = usersSnapshot.size;
      } catch (error) {
        console.error("Error fetching registered students:", error);
        toast({ title: "Error", description: "Could not fetch registered student count.", variant: "destructive" });
      }

      const handleSubmissionsUpdate = (submissionDocs: Submission[]) => {
        const total = submissionDocs.length;
        const pending = submissionDocs.filter(sub => sub.status === 'submitted').length;
        const reviewed = submissionDocs.filter(sub => sub.status === 'reviewed').length;
        const activeStudentIds = new Set(submissionDocs.map(sub => sub.studentId)).size;

        setMetrics({
          totalSubmissions: total,
          pendingReviews: pending,
          reviewedCount: reviewed,
          activeStudents: activeStudentIds,
          registeredStudents: fetchedRegisteredStudents,
        });
        setSubmissions(submissionDocs);
        setLoadingSubmissions(false);
      };
      
      const submissionsQuery = query(collection(db, "submissions"), orderBy("timestamp", "desc"));
      unsubscribeSubmissions = onSnapshot(submissionsQuery, (querySnapshot) => {
        const fetchedSubmissionsData: Submission[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSubmissionsData.push({ id: doc.id, ...doc.data() } as Submission);
        });
        handleSubmissionsUpdate(fetchedSubmissionsData); 
      }, (error) => {
        console.error("Error fetching submissions: ", error);
        toast({ title: "Error", description: "Could not fetch submissions.", variant: "destructive" });
        setMetrics(prevMetrics => ({ ...prevMetrics, registeredStudents: fetchedRegisteredStudents }));
        setLoadingSubmissions(false);
      });
    };

    fetchData();

    return () => {
      unsubscribeSubmissions();
    };
  }, [toast]);


  const metricCardsData = [
    { title: 'Total Submissions', value: metrics.totalSubmissions, icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Pending Reviews', value: metrics.pendingReviews, icon: <Clock className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Reviewed Count', value: metrics.reviewedCount, icon: <CheckCircle className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Active Students', value: metrics.activeStudents, icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Total Registered Students', value: metrics.registeredStudents, icon: <Users2 className="h-5 w-5 text-muted-foreground" /> },
  ];

  const handleReviewSubmit = async () => {
    if (!selectedSubmission || !selectedSubmission.id) {
      toast({ title: "Error", description: "Please select a submission.", variant: "destructive" });
      return;
    }
    if (!tutorComment && !currentGrade) {
        toast({ title: "Missing Information", description: "Please provide feedback or a grade.", variant: "destructive" });
        return;
    }

    const db = getFirestoreDb();
    if(!db) {
        toast({title: "Error", description: "Database not available.", variant: "destructive"});
        return;
    }

    const submissionRef = doc(db, "submissions", selectedSubmission.id);
    try {
      const updatePayload: Partial<Submission> = {
        status: 'reviewed',
        reviewedAt: serverTimestamp(),
      };
      if (tutorComment) {
        updatePayload.tutorFeedback = tutorComment;
      }
      
      let numericGradeForCheck: number | undefined;
      if (currentGrade || currentGrade === 0) {
        const numericGrade = parseFloat(String(currentGrade));
        if (!isNaN(numericGrade)) {
          updatePayload.grade = numericGrade;
          numericGradeForCheck = numericGrade;
        } else {
          updatePayload.grade = currentGrade; // Save as string if not a number (e.g., "A+")
        }
      }

      await updateDoc(submissionRef, updatePayload);

      // Call the AI flow to check for lesson unlock, but don't block UI
      if (numericGradeForCheck !== undefined) {
        checkLessonUnlock({
          studentId: selectedSubmission.studentId,
          currentLessonId: selectedSubmission.lessonId,
          grade: numericGradeForCheck,
        }).then(result => {
          console.log("Lesson unlock check:", result.message);
          // In a real app, you might use this message for a notification
        }).catch(error => {
          console.error("Error checking lesson unlock status:", error);
        });
      }

      toast({ title: "Review Submitted", description: `Review for ${selectedSubmission.lessonTitle} saved.`, className: "bg-brand-green text-white" });
      setSelectedSubmission(null); 
      setTutorComment('');
      setCurrentGrade('');
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"> 
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
                  <TableHead>Grade</TableHead>
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
                    <TableCell>
                      {submission.grade !== undefined && submission.grade !== null ? (
                        <Badge variant="outline" className="font-semibold">{submission.grade}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{submission.answer || (submission.questions && submission.questions[0]?.answer)}</TableCell>
                    <TableCell className="text-right">
                       <Dialog open={selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                           if (!open) {
                               setSelectedSubmission(null);
                               setTutorComment('');
                               setCurrentGrade('');
                           } else {
                               setSelectedSubmission(submission);
                               setTutorComment(submission.tutorFeedback || '');
                               setCurrentGrade(submission.grade ?? '');
                           }
                       }}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => {
                               setSelectedSubmission(submission);
                               setTutorComment(submission.tutorFeedback || '');
                               setCurrentGrade(submission.grade ?? '');
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
                            {/* FIX: Conditional rendering for structured vs single answers */}
                            {selectedSubmission.questions && selectedSubmission.questions.length > 0 ? (
                              <>
                                <Card>
                                  <CardHeader><CardTitle className="text-base">Main Question Prompt</CardTitle></CardHeader>
                                  <CardContent><p className="whitespace-pre-wrap">{getLessonById(selectedSubmission.lessonId)?.question || "Question not found."}</p></CardContent>
                                </Card>
                                {selectedSubmission.questions.map((q, index) => (
                                  <Card key={index} className="bg-gray-50">
                                    <CardHeader>
                                      <CardTitle className="text-base">Sub-Question: {q.questionText}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div>
                                        <h4 className="font-semibold text-sm">Student's Reasoning</h4>
                                        <p className="whitespace-pre-wrap text-sm">{q.reasoning || "No reasoning provided."}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm">Student's Answer</h4>
                                        <p className="whitespace-pre-wrap text-sm">{q.answer || "No answer provided."}</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </>
                            ) : (
                              <>
                                <Card>
                                  <CardHeader><CardTitle className="text-base">Question</CardTitle></CardHeader>
                                  <CardContent><p className="whitespace-pre-wrap">{getLessonById(selectedSubmission.lessonId)?.question || "Question not found."}</p></CardContent>
                                </Card>
                                <Card>
                                  <CardHeader><CardTitle className="text-base">Student's Reasoning</CardTitle></CardHeader>
                                  <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.reasoning || "No reasoning provided."}</p></CardContent>
                                </Card>
                                <Card>
                                  <CardHeader><CardTitle className="text-base">Student's Answer</CardTitle></CardHeader>
                                  <CardContent><p className="whitespace-pre-wrap">{selectedSubmission.answer || "No answer provided."}</p></CardContent>
                                </Card>
                              </>
                            )}

                            {selectedSubmission.aiFeedback && (
                               <Card className="bg-purple-50 border-purple-200">
                                <CardHeader><CardTitle className="text-base text-purple-700">AI Feedback</CardTitle></CardHeader>
                                <CardContent><p className="text-purple-800 whitespace-pre-wrap">{selectedSubmission.aiFeedback}</p></CardContent>
                              </Card>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="grade" className="font-semibold flex items-center">
                                    <Award className="mr-2 h-4 w-4 text-yellow-500"/> Grade (e.g., 75, B+)
                                </Label>
                                <Input
                                    id="grade"
                                    value={currentGrade}
                                    onChange={(e) => setCurrentGrade(e.target.value)}
                                    placeholder="Enter grade..."
                                    className="mt-1"
                                    disabled={selectedSubmission.status === 'reviewed' && !!selectedSubmission.grade} 
                                />
                            </div>
                            <div>
                                <Label htmlFor="tutorComment" className="font-semibold">
                                    {selectedSubmission.status === 'reviewed' && selectedSubmission.tutorFeedback ? 'Your Feedback (Submitted)' : 'Your Feedback'}
                                </Label>
                                <Textarea
                                    id="tutorComment"
                                    value={tutorComment}
                                    onChange={(e) => setTutorComment(e.target.value)}
                                    rows={4}
                                    placeholder="Provide constructive feedback..."
                                    className="mt-1"
                                    disabled={selectedSubmission.status === 'reviewed' && !!selectedSubmission.tutorFeedback}
                                />
                            </div>
                          </div>
                          <DialogFooter>
                            {selectedSubmission.status === 'submitted' || !(selectedSubmission.grade && selectedSubmission.tutorFeedback) ? (
                            <Button onClick={handleReviewSubmit} className="bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white">
                                {selectedSubmission.status === 'reviewed' ? 'Update Review' : 'Submit Review'}
                            </Button>
                            ) : null}
                             <Button variant="outline" onClick={() => {setSelectedSubmission(null); setTutorComment(''); setCurrentGrade(''); }}>Close</Button>
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
    

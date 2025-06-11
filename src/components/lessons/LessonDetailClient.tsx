
// src/components/lessons/LessonDetailClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Lesson, Submission, SubjectName } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FeedbackForm from './FeedbackForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { getAIFeedback } from '@/app/actions/feedbackActions';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  getFirestoreDb, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from '@/lib/firebase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const answerSchema = z.object({
  reasoning: z.string().min(10, "Reasoning must be at least 10 characters."),
  solution: z.string().min(1, "Solution cannot be empty."),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

interface LessonDetailClientProps {
  lesson: Lesson;
}

const LessonDetailClient: React.FC<LessonDetailClientProps> = ({ lesson }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExampleSolution, setShowExampleSolution] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<Submission | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);


  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      reasoning: '',
      solution: '',
    },
  });

  useEffect(() => {
    if (user && lesson) {
      const db = getFirestoreDb();
      if (!db) return;

      const q = query(
        collection(db, "submissions"),
        where("lessonId", "==", lesson.id),
        where("studentId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as Submission;
          const subId = querySnapshot.docs[0].id;
          setSubmittedAnswer({...docData, id: subId});
          setSubmissionId(subId);
          form.reset({ reasoning: docData.reasoning, solution: docData.answer });
          if (docData.aiFeedback) setAiFeedback(docData.aiFeedback);
          // Retain tutor feedback if it exists on the submission
        } else {
          setSubmittedAnswer(null);
          setSubmissionId(null);
          form.reset({ reasoning: '', solution: '' }); 
          setAiFeedback(null);
        }
      }, (error) => {
        console.error("Error fetching submission: ", error);
        toast({title: "Error", description: "Could not fetch your previous submission.", variant: "destructive"});
      });

      return () => unsubscribe();
    }
  }, [lesson, user, form, toast]);


  const onSubmit = async (data: AnswerFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit an answer.", variant: "destructive" });
      return;
    }
    const db = getFirestoreDb();
    if (!db) {
        toast({ title: "Error", description: "Database not available.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    setAiFeedback(null); // Clear previous AI feedback from UI

    let currentSubmissionId = submissionId;
    
    try {
      let payloadForFirestore: Partial<Submission> & { timestamp: any };

      if (submissionId) {
        // This is an UPDATE to an existing submission
        payloadForFirestore = {
          reasoning: data.reasoning,
          answer: data.solution,
          status: 'submitted', // Reset status
          timestamp: serverTimestamp(), // Update timestamp
          aiFeedback: null, // Explicitly clear AI feedback in Firestore for regeneration
        };
        // Preserve existing tutor feedback if it was 'reviewed' and exists
        if (submittedAnswer?.status === 'reviewed' && typeof submittedAnswer.tutorFeedback === 'string') {
          payloadForFirestore.tutorFeedback = submittedAnswer.tutorFeedback;
        } else if (submittedAnswer && Object.prototype.hasOwnProperty.call(submittedAnswer, 'tutorFeedback') && submittedAnswer.tutorFeedback === null) {
           payloadForFirestore.tutorFeedback = null; // Preserve explicit null
        }
        // If tutorFeedback was undefined on submittedAnswer or status wasn't reviewed, it's omitted from payload.

        const submissionRef = doc(db, "submissions", submissionId);
        await updateDoc(submissionRef, payloadForFirestore);
        console.log("Submission updated:", submissionId);
        toast({ title: "Answer Updated!", description: "Your answer has been updated.", className: "bg-brand-green text-white" });
      } else {
        // This is a NEW submission (addDoc)
        payloadForFirestore = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subject: lesson.subject,
          studentId: user.uid,
          studentName: user.fullName || user.email || "Anonymous Student",
          reasoning: data.reasoning,
          answer: data.solution,
          status: 'submitted',
          timestamp: serverTimestamp(),
          // tutorFeedback and aiFeedback are omitted by default for new submissions,
          // as they are not defined at this point.
        };
        const docRef = await addDoc(collection(db, "submissions"), payloadForFirestore);
        currentSubmissionId = docRef.id;
        setSubmissionId(docRef.id); // Store new submission ID
        console.log("Submission added with ID:", docRef.id);
        toast({ title: "Answer Submitted!", description: "Your answer has been saved.", className: "bg-brand-green text-white" });
      }

      // Common: AI Feedback Generation
      if (currentSubmissionId) {
        setAiFeedbackLoading(true);
        const aiResult = await getAIFeedback({
          lessonTitle: lesson.title,
          studentAnswer: data.solution,
          correctSolution: lesson.exampleSolution,
          studentReasoning: data.reasoning,
          subject: lesson.subject as SubjectName, // Already asserted by Lesson type
        });

        if (aiResult.success && aiResult.feedback) {
          setAiFeedback(aiResult.feedback); // Update UI
          const submissionToUpdateRef = doc(db, "submissions", currentSubmissionId);
          await updateDoc(submissionToUpdateRef, { aiFeedback: aiResult.feedback }); // Update Firestore with AI feedback
          toast({ title: "AI Feedback Received!", description: "Check the AI feedback section below." });
        } else if (aiResult.error) {
          toast({ title: "AI Feedback Error", description: aiResult.error, variant: "destructive" });
        }
      }
    } catch (error: any) {
      console.error("Error submitting/updating answer:", error);
      // Check if it's a FirebaseError and log specific details
      if (error.name === 'FirebaseError') {
        console.error("Firebase Error Code:", error.code);
        console.error("Firebase Error Message:", error.message);
      }
      toast({ title: "Submission Error", description: `Could not save your answer. ${error.message || ''}`, variant: "destructive" });
    } finally {
      setAiFeedbackLoading(false);
      setIsSubmitting(false);
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
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-brand-navy text-white p-6">
          <CardTitle className="font-headline text-3xl">{lesson.title}</CardTitle>
          <CardDescription className="text-blue-200">{lesson.subject} - {lesson.branch}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="aspect-video mb-6 bg-gray-200 rounded-md overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-md"
            ></iframe>
          </div>

          <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />

          <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
            <h3 className="font-headline text-xl font-semibold text-brand-navy mb-2">Question:</h3>
            <p className="text-lg text-foreground whitespace-pre-wrap">{lesson.question}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-brand-navy">Your Answer</CardTitle>
           {submittedAnswer && (
            <div className="mt-2">
              <Badge variant={submittedAnswer.status === 'reviewed' ? 'default' : 'secondary'}
                     className={`${submittedAnswer.status === 'reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                Status: {submittedAnswer.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted {formatSubmissionTimestamp(submittedAnswer.timestamp)}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {user ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="reasoning" className="text-lg font-semibold">Your Reasoning</Label>
                <Textarea
                  id="reasoning"
                  {...form.register('reasoning')}
                  rows={5}
                  placeholder="Explain your thought process and how you arrived at your solution..."
                  className={`mt-2 ${form.formState.errors.reasoning ? 'border-destructive' : ''}`}
                  disabled={isSubmitting || (!!submittedAnswer && submittedAnswer.status === 'reviewed')}
                />
                {form.formState.errors.reasoning && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.reasoning.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="solution" className="text-lg font-semibold">Your Solution (Answer)</Label>
                <Textarea
                  id="solution"
                  {...form.register('solution')}
                  rows={3}
                  placeholder="Provide your final answer here..."
                  className={`mt-2 ${form.formState.errors.solution ? 'border-destructive' : ''}`}
                  disabled={isSubmitting || (!!submittedAnswer && submittedAnswer.status === 'reviewed')}
                />
                {form.formState.errors.solution && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.solution.message}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white"
                  disabled={isSubmitting || (!!submittedAnswer && submittedAnswer.status === 'reviewed')}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {submittedAnswer && submittedAnswer.status !== 'reviewed' ? (submissionId ? 'Update Answer' : 'Submit Answer') : (submittedAnswer?.status === 'reviewed' ? 'Answer Reviewed' : 'Submit Answer')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExampleSolution(!showExampleSolution)}
                  className="w-full sm:w-auto"
                >
                  {showExampleSolution ? 'Hide' : 'Show'} Example Solution
                </Button>
              </div>
            </form>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                Please <Link href="/login" className="underline text-brand-purple-blue">login</Link> or <Link href="/register" className="underline text-brand-purple-blue">register</Link> to submit your answer.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showExampleSolution && (
        <Card className="shadow-lg rounded-lg bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-green-700">Example Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 whitespace-pre-wrap">{lesson.exampleSolution}</p>
          </CardContent>
        </Card>
      )}

      {aiFeedbackLoading && (
        <div className="flex items-center justify-center p-6 bg-card rounded-lg shadow-md">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-purple-blue" />
          <p className="text-brand-purple-blue">Generating AI Feedback...</p>
        </div>
      )}

      {aiFeedback && !aiFeedbackLoading && (
        <Card className="shadow-lg rounded-lg bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center space-x-3">
             <MessageSquare className="h-6 w-6 text-purple-600" />
            <CardTitle className="font-headline text-xl text-purple-700">AI Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 whitespace-pre-wrap">{aiFeedback}</p>
          </CardContent>
        </Card>
      )}

      {submittedAnswer && submittedAnswer.status === 'reviewed' && submittedAnswer.tutorFeedback && (
         <Card className="shadow-lg rounded-lg bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center space-x-3">
             <CheckCircle className="h-6 w-6 text-blue-600" />
            <CardTitle className="font-headline text-xl text-blue-700">Tutor Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 whitespace-pre-wrap">{submittedAnswer.tutorFeedback}</p>
          </CardContent>
        </Card>
      )}

      <FeedbackForm lessonId={lesson.id} />
    </div>
  );
};

export default LessonDetailClient;

    

// src/components/lessons/LessonDetailClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Lesson, Submission, SubjectName, QuestionAnswer, StructuredQuestionItem, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FeedbackForm from './FeedbackForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, MessageSquare, Award, ListChecks, Save, Lock } from 'lucide-react';
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
  Timestamp,
  getDocs
} from '@/lib/firebase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Schema for lessons with a single answer/reasoning block
const singleAnswerSchema = z.object({
  reasoning: z.string().min(10, "Reasoning must be at least 10 characters."),
  solution: z.string().min(1, "Solution cannot be empty."),
});
type SingleAnswerFormValues = z.infer<typeof singleAnswerSchema>;

// Schema for lessons with structured questions
const structuredAnswerSchema = z.object({
  structuredAnswers: z.array(
    z.object({
      // questionId: z.string(), // Not part of form values, added at submission
      // questionText: z.string(), // Not part of form values, added at submission
      reasoning: z.string().min(1, "Reasoning cannot be empty for this question."),
      solution: z.string().min(1, "Solution cannot be empty for this question."),
    })
  ).refine(data => data.every(q => q.reasoning && q.solution), {
    message: "All questions must be answered.", // This is a general array message if needed elsewhere
  }),
});
type StructuredAnswerFormValues = z.infer<typeof structuredAnswerSchema>;

interface LessonDetailClientProps {
  lesson: Lesson;
}

const LessonDetailClient: React.FC<LessonDetailClientProps> = ({ lesson }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Used for both draft and final submit
  const [showExampleSolution, setShowExampleSolution] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<Submission | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // For prerequisite logic
  const [canAccessLesson, setCanAccessLesson] = useState(true);
  const [accessCheckLoading, setAccessCheckLoading] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

  const isStructuredLesson = !!(lesson.structuredQuestions && lesson.structuredQuestions.length > 0);

  const form = useForm<SingleAnswerFormValues | StructuredAnswerFormValues>({
    resolver: zodResolver(isStructuredLesson ? structuredAnswerSchema : singleAnswerSchema),
    defaultValues: isStructuredLesson
      ? { structuredAnswers: lesson.structuredQuestions?.map(() => ({ reasoning: '', solution: '' })) || [] }
      : { reasoning: '', solution: '' },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "structuredAnswers" as any, // Type assertion needed for conditional field array
  });

  useEffect(() => {
    const checkPrerequisites = async (currentUser: User, lessonToCheck: Lesson) => {
        if (lessonToCheck.id !== 'math-alg-002' || currentUser.isAdmin) {
            setCanAccessLesson(true);
            return;
        }

        setAccessCheckLoading(true);
        const db = getFirestoreDb();
        if (!db) {
            setAccessDeniedMessage("Could not verify lesson prerequisites. Database unavailable.");
            setCanAccessLesson(false);
            setAccessCheckLoading(false);
            return;
        }

        const prerequisiteLessonId = 'math-alg-001';
        const q = query(
            collection(db, "submissions"),
            where("studentId", "==", currentUser.uid),
            where("lessonId", "==", prerequisiteLessonId)
        );

        try {
            const querySnapshot = await getDocs(q);
            let hasPassedPrerequisite = false;
            querySnapshot.forEach(doc => {
                const submission = doc.data() as Submission;
                if (submission.status === 'reviewed' && typeof submission.grade === 'number' && submission.grade >= 75) {
                    hasPassedPrerequisite = true;
                }
            });

            if (hasPassedPrerequisite) {
                setCanAccessLesson(true);
            } else {
                setCanAccessLesson(false);
                setAccessDeniedMessage(`You must complete and pass Lesson 1 (Algebra) with a grade of 75% or higher to access this lesson. Please complete the prerequisite.`);
            }
        } catch (error) {
            console.error("Error checking prerequisites:", error);
            setCanAccessLesson(false);
            setAccessDeniedMessage("An error occurred while checking for prerequisites. Please try again later.");
        } finally {
            setAccessCheckLoading(false);
        }
    };


    if (user && lesson) {
      checkPrerequisites(user, lesson);

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
          setSubmittedAnswer({ ...docData, id: subId });
          setSubmissionId(subId);

          if (isStructuredLesson && docData.questions) {
            form.reset({
              structuredAnswers: lesson.structuredQuestions?.map(sq => {
                const prevAns = docData.questions?.find(q => q.questionId === sq.id);
                return {
                  reasoning: prevAns?.reasoning || '',
                  solution: prevAns?.answer || '',
                };
              }) || []
            } as StructuredAnswerFormValues);
          } else if (!isStructuredLesson && docData.answer !== undefined && docData.reasoning !== undefined) {
            form.reset({ reasoning: docData.reasoning || '', solution: docData.answer || '' } as SingleAnswerFormValues);
          }

          if (docData.aiFeedback) setAiFeedback(docData.aiFeedback);
        } else {
          setSubmittedAnswer(null);
          setSubmissionId(null);
          form.reset(
            isStructuredLesson
              ? { structuredAnswers: lesson.structuredQuestions?.map(() => ({ reasoning: '', solution: '' })) || [] }
              : { reasoning: '', solution: '' }
          );
          setAiFeedback(null);
        }
      }, (error) => {
        console.error("Error fetching submission: ", error);
        toast({ title: "Error", description: "Could not fetch your previous submission.", variant: "destructive" });
      });

      return () => unsubscribe();
    }
  }, [lesson, user, form, toast, isStructuredLesson]);

  const preparePayload = (data: SingleAnswerFormValues | StructuredAnswerFormValues): Omit<Submission, 'id' | 'timestamp' | 'status'> => {
    const commonPayloadBase = {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      subject: lesson.subject,
      studentId: user!.uid,
      studentName: user!.firstName ? `${user!.firstName} ${user!.lastName || ''}`.trim() : (user!.email || "Anonymous Student"),
    };

    if (isStructuredLesson) {
      const structuredData = data as StructuredAnswerFormValues;
      const questionsForSubmission: QuestionAnswer[] = lesson.structuredQuestions!.map((sq, index) => ({
        questionId: sq.id,
        questionText: sq.text,
        reasoning: structuredData.structuredAnswers[index].reasoning ?? null,
        answer: structuredData.structuredAnswers[index].solution ?? null,
      }));
      return {
        ...commonPayloadBase,
        questions: questionsForSubmission,
        answer: null, 
        reasoning: null,
      };
    } else {
      const singleData = data as SingleAnswerFormValues;
      return {
        ...commonPayloadBase,
        answer: singleData.solution ?? null,
        reasoning: singleData.reasoning ?? null,
        questions: null,
      };
    }
  };


  const handleSaveDraft = async (formData: SingleAnswerFormValues | StructuredAnswerFormValues) => {
    if (!user) return;
    const db = getFirestoreDb();
    if (!db) {
      toast({ title: "Error", description: "Database not available.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const preparedData = preparePayload(formData);
    const payloadForFirestore: Partial<Submission> & { timestamp: any } = {
      ...preparedData,
      status: 'draft',
      timestamp: serverTimestamp(),
    };

    try {
      if (submissionId) {
        const submissionRef = doc(db, "submissions", submissionId);
        await updateDoc(submissionRef, payloadForFirestore);
        toast({ title: "Draft Saved!", description: "Your progress has been saved.", className: "bg-brand-green text-white" });
      } else {
        const docRef = await addDoc(collection(db, "submissions"), payloadForFirestore);
        setSubmissionId(docRef.id);
        toast({ title: "Draft Saved!", description: "Your progress has been saved.", className: "bg-brand-green text-white" });
      }
      form.reset(formData); // To mark form as not dirty after save
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({ title: "Draft Save Error", description: `Could not save your draft. ${error.message || ''}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  const onSubmit = async (data: SingleAnswerFormValues | StructuredAnswerFormValues) => {
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
    setAiFeedback(null); // Reset AI feedback for new submission

    const preparedData = preparePayload(data);
    let payloadForFirestore: Partial<Submission> & { timestamp: any } = {
      ...preparedData,
      status: 'submitted',
      timestamp: serverTimestamp(),
      aiFeedback: null, // Explicitly reset for new submission
      tutorFeedback: null,
      grade: null,
      reviewedAt: null,
    };
    
    let currentSubmissionIdForAI = submissionId;

    try {
      if (submissionId) {
        const submissionRef = doc(db, "submissions", submissionId);
        await updateDoc(submissionRef, payloadForFirestore);
        console.log("Submission updated for review:", submissionId);
        toast({ title: "Answer Resubmitted!", description: "Your answer has been re-submitted for review.", className: "bg-brand-green text-white" });
      } else {
        const docRef = await addDoc(collection(db, "submissions"), payloadForFirestore);
        setSubmissionId(docRef.id);
        currentSubmissionIdForAI = docRef.id;
        console.log("Submission added for review with ID:", docRef.id);
        toast({ title: "Answer Submitted!", description: "Your answer has been saved for review.", className: "bg-brand-green text-white" });
      }
      form.reset(data); // To mark form as not dirty after successful submission

      if (currentSubmissionIdForAI) {
        setAiFeedbackLoading(true);
        let studentAnswerForAI: string;
        let studentReasoningForAI: string;

        if (isStructuredLesson && payloadForFirestore.questions && payloadForFirestore.questions.length > 0) {
          studentAnswerForAI = payloadForFirestore.questions[0].answer || "No answer provided.";
          studentReasoningForAI = payloadForFirestore.questions[0].reasoning || "No reasoning provided.";
        } else if (!isStructuredLesson && payloadForFirestore.answer) {
          studentAnswerForAI = payloadForFirestore.answer;
          studentReasoningForAI = payloadForFirestore.reasoning!;
        } else {
          studentAnswerForAI = "No answer provided.";
          studentReasoningForAI = "No reasoning provided.";
        }

        const aiResult = await getAIFeedback({
          lessonTitle: lesson.title,
          studentAnswer: studentAnswerForAI,
          correctSolution: lesson.exampleSolution,
          studentReasoning: studentReasoningForAI,
          subject: lesson.subject as SubjectName,
        });

        if (aiResult.success && aiResult.feedback) {
          setAiFeedback(aiResult.feedback);
          const submissionToUpdateRef = doc(db, "submissions", currentSubmissionIdForAI);
          await updateDoc(submissionToUpdateRef, { aiFeedback: aiResult.feedback });
          toast({ title: "AI Feedback Received!", description: "Check the AI feedback section below." });
        } else if (aiResult.error) {
          toast({ title: "AI Feedback Error", description: aiResult.error, variant: "destructive" });
          // Keep aiFeedback null on the document if generation failed
           const submissionToUpdateRef = doc(db, "submissions", currentSubmissionIdForAI);
           await updateDoc(submissionToUpdateRef, { aiFeedback: null });
        }
      }
    } catch (error: any) {
      console.error("Error submitting/updating answer:", error);
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

  const isFormPermanentlyDisabled = submittedAnswer && submittedAnswer.status === 'reviewed';
  
  const mainSubmitButtonText = () => {
    if (!submittedAnswer || submittedAnswer.status === 'draft') return "Submit for Review";
    if (submittedAnswer.status === 'submitted') return "Resubmit for Review";
    if (submittedAnswer.status === 'reviewed') return "Resubmit (Clears Review)"; // Or just disable
    return "Submit for Review";
  };

  // Disable main submit if form is permanently disabled, or if submitting, or if form is not dirty AND a draft/submitted answer exists
  const isMainSubmitButtonDisabled = 
    isFormPermanentlyDisabled || 
    isSubmitting || 
    (!form.formState.isDirty && !!submittedAnswer && (submittedAnswer.status === 'submitted' || submittedAnswer.status === 'draft'));

  // Disable save draft if form is permanently disabled, or if submitting, or if form is not dirty AND a draft answer exists
  const isSaveDraftButtonDisabled = 
    isFormPermanentlyDisabled || 
    isSubmitting ||
    (!form.formState.isDirty && !!submittedAnswer && submittedAnswer.status === 'draft');

  if (accessCheckLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-400px)]">
              <Loader2 className="h-12 w-12 animate-spin text-brand-purple-blue" />
              <p className="mt-4 text-lg text-muted-foreground">Checking lesson access...</p>
          </div>
      );
  }

  if (!canAccessLesson) {
      return (
          <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
              <Lock className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                  {accessDeniedMessage}
                  <div className="mt-4">
                      <Button asChild>
                          <Link href="/dashboard">Back to Dashboard</Link>
                      </Button>
                  </div>
              </AlertDescription>
          </Alert>
      );
  }

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
             <h3 className="font-headline text-xl font-semibold text-brand-navy mb-2">
                {lesson.question}
            </h3>
            {!isStructuredLesson && lesson.structuredQuestions && lesson.structuredQuestions.length === 0 && (
                <p className="text-lg text-foreground whitespace-pre-wrap">{lesson.question}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-brand-navy flex items-center">
            <ListChecks className="mr-2 h-6 w-6" /> Your Answer
          </CardTitle>
          {submittedAnswer && (
            <div className="mt-2">
              <Badge variant={submittedAnswer.status === 'reviewed' ? 'default' : (submittedAnswer.status === 'submitted' ? 'secondary' : 'outline')}
                className={`${
                  submittedAnswer.status === 'reviewed' ? 'bg-brand-green text-white' 
                  : submittedAnswer.status === 'submitted' ? 'bg-yellow-400 text-yellow-900'
                  : 'border-gray-400 text-gray-600' // Draft status
                }`}>
                Status: {submittedAnswer.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Last saved/submitted {formatSubmissionTimestamp(submittedAnswer.timestamp)}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {user ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isStructuredLesson ? (
                <div className="space-y-6">
                  {(lesson.structuredQuestions || []).map((sq, index) => (
                    <div key={sq.id} className="p-4 border rounded-md bg-card">
                       <div className="mb-2">
                        <p className="font-semibold text-brand-navy text-lg">Question {sq.id}</p>
                        <p className="text-foreground mt-1">{sq.text}</p>
                        {sq.marks && <p className="text-sm text-muted-foreground mt-1">({sq.marks} marks)</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`structuredAnswers.${index}.reasoning`} className="text-base font-semibold">Your Reasoning</Label>
                        <Textarea
                          id={`structuredAnswers.${index}.reasoning`}
                          {...form.register(`structuredAnswers.${index}.reasoning` as any)}
                          rows={3}
                          placeholder={`Explain your reasoning for question ${sq.id}...`}
                          className={`mt-1 ${(form.formState.errors as any)?.structuredAnswers?.[index]?.reasoning ? 'border-destructive' : ''}`}
                          disabled={isFormPermanentlyDisabled || isSubmitting}
                        />
                        {(form.formState.errors as any)?.structuredAnswers?.[index]?.reasoning && (
                          <p className="text-sm text-destructive mt-1">{(form.formState.errors as any)?.structuredAnswers?.[index]?.reasoning?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2 mt-3">
                        <Label htmlFor={`structuredAnswers.${index}.solution`} className="text-base font-semibold">Your Solution (Answer)</Label>
                        <Textarea
                          id={`structuredAnswers.${index}.solution`}
                          {...form.register(`structuredAnswers.${index}.solution` as any)}
                          rows={2}
                          placeholder={`Your answer for question ${sq.id}...`}
                          className={`mt-1 ${(form.formState.errors as any)?.structuredAnswers?.[index]?.solution ? 'border-destructive' : ''}`}
                          disabled={isFormPermanentlyDisabled || isSubmitting}
                        />
                        {(form.formState.errors as any)?.structuredAnswers?.[index]?.solution && (
                          <p className="text-sm text-destructive mt-1">{(form.formState.errors as any)?.structuredAnswers?.[index]?.solution?.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="reasoning" className="text-lg font-semibold">Your Reasoning</Label>
                    <Textarea
                      id="reasoning"
                      {...(form.register as any)('reasoning')}
                      rows={5}
                      placeholder="Explain your thought process and how you arrived at your solution..."
                      className={`mt-2 ${(form.formState.errors as any).reasoning ? 'border-destructive' : ''}`}
                      disabled={isFormPermanentlyDisabled || isSubmitting}
                    />
                    {(form.formState.errors as any).reasoning && (
                      <p className="text-sm text-destructive mt-1">{(form.formState.errors as any).reasoning.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="solution" className="text-lg font-semibold">Your Solution (Answer)</Label>
                    <Textarea
                      id="solution"
                      {...(form.register as any)('solution')}
                      rows={3}
                      placeholder="Provide your final answer here..."
                      className={`mt-2 ${(form.formState.errors as any).solution ? 'border-destructive' : ''}`}
                      disabled={isFormPermanentlyDisabled || isSubmitting}
                    />
                    {(form.formState.errors as any).solution && (
                      <p className="text-sm text-destructive mt-1">{(form.formState.errors as any).solution.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSaveDraft(form.getValues())}
                        className="w-full sm:w-auto"
                        disabled={isSaveDraftButtonDisabled}
                    >
                        {isSubmitting && form.formState.isSubmitting && submittedAnswer?.status !== 'submitted' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white"
                        disabled={isMainSubmitButtonDisabled}
                    >
                        {isSubmitting && form.formState.isSubmitting && submittedAnswer?.status !== 'draft' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {mainSubmitButtonText()}
                    </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExampleSolution(!showExampleSolution)}
                  className="w-full sm:w-auto"
                >
                  {showExampleSolution ? 'Hide' : 'Show'} Example Solution
                </Button>
              </div>
              {submittedAnswer && submittedAnswer.status === 'reviewed' && (
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
                  <AlertTriangle className="h-4 w-4 !text-blue-600" />
                  <AlertTitle className="font-semibold">Answer Reviewed</AlertTitle>
                  <AlertDescription>
                    This answer has been reviewed. If you resubmit, your previous feedback and grade will be cleared, and it will require a new review. You can save a draft if you are working on changes.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                Please <Link href="/login" className="underline text-brand-purple-blue">login</Link> or <Link href="/register" className="underline text-brand-purple-blue">register</Link> to submit your answer or save a draft.
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
            {isStructuredLesson && lesson.structuredQuestions && (
                <div className="mt-4 space-y-3">
                    <h5 className="font-semibold">Note: For structured questions, refer to specific solutions if provided by your tutor. The example above might be general.</h5>
                </div>
            )}
          </CardContent>
        </Card>
      )}

      {submittedAnswer && submittedAnswer.status === 'reviewed' && submittedAnswer.grade != null && (
        <Card className="shadow-lg rounded-lg bg-indigo-50 border-indigo-200">
          <CardHeader className="flex flex-row items-center space-x-3">
            <Award className="h-6 w-6 text-indigo-600" />
            <CardTitle className="font-headline text-xl text-indigo-700">Your Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-indigo-800 text-3xl font-bold">{submittedAnswer.grade}</p>
            {isStructuredLesson && <p className="text-sm text-indigo-600 mt-1">This is an overall grade for the lesson.</p>}
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
            {isStructuredLesson && <p className="text-sm text-blue-600 mt-1">This is overall feedback for the lesson.</p>}
          </CardContent>
        </Card>
      )}

      {aiFeedbackLoading && !aiFeedback && (
        <div className="flex items-center justify-center p-6 bg-card rounded-lg shadow-md">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-purple-blue" />
          <p className="text-brand-purple-blue">Generating AI Feedback...</p>
        </div>
      )}

      {aiFeedback && !aiFeedbackLoading && submittedAnswer?.status !== 'draft' && ( // Only show AI feedback if not a draft
        <Card className="shadow-lg rounded-lg bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <CardTitle className="font-headline text-xl text-purple-700">AI Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 whitespace-pre-wrap">{aiFeedback}</p>
            {isStructuredLesson && <p className="text-sm text-purple-600 mt-1">AI feedback based on the first question submitted. For detailed feedback on all parts, please refer to tutor comments.</p>}
          </CardContent>
        </Card>
      )}


      <FeedbackForm lessonId={lesson.id} />
    </div>
  );
};

export default LessonDetailClient;

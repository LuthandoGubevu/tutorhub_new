// src/components/lessons/LessonDetailClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Lesson, StudentAnswer, SubjectName } from '@/types';
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
import { mockStudentAnswers, saveStudentAnswersToLocalStorage } from '@/data/mockData'; // For mock persistence
import Link from 'next/link';

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
  const [submittedAnswer, setSubmittedAnswer] = useState<StudentAnswer | null>(null);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      reasoning: '',
      solution: '',
    },
  });

  useEffect(() => {
    if (user) {
        const existingAnswer = mockStudentAnswers.find(
            (ans) => ans.lessonId === lesson.id && ans.studentId === user.uid
        );
        if (existingAnswer) {
            setSubmittedAnswer(existingAnswer);
            form.reset({ reasoning: existingAnswer.reasoning, solution: existingAnswer.solution });
            if (existingAnswer.aiFeedback) setAiFeedback(existingAnswer.aiFeedback);
        }
    }
  }, [lesson.id, user, form]);


  const onSubmit = async (data: AnswerFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit an answer.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setAiFeedback(null); 

    const newAnswer: StudentAnswer = {
      id: `ans-${Date.now()}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      subject: lesson.subject,
      studentId: user.uid,
      reasoning: data.reasoning,
      solution: data.solution,
      submittedAt: new Date().toISOString(),
      status: 'Awaiting Review', 
    };
    
    const answerIndex = mockStudentAnswers.findIndex(ans => ans.lessonId === lesson.id && ans.studentId === user.uid);
    if (answerIndex > -1) {
        mockStudentAnswers[answerIndex] = { ...mockStudentAnswers[answerIndex], ...newAnswer, status: 'Awaiting Review', tutorFeedback: undefined, aiFeedback: undefined };
    } else {
        mockStudentAnswers.push(newAnswer);
    }
    setSubmittedAnswer(newAnswer);
    saveStudentAnswersToLocalStorage();


    console.log("Answer submitted:", newAnswer);
    toast({ title: "Answer Submitted!", description: "Your answer has been saved and sent to the tutor.", className: "bg-brand-green text-white" });

    setAiFeedbackLoading(true);
    const aiFeedbackResult = await getAIFeedback({
      lessonTitle: lesson.title,
      studentAnswer: data.solution,
      correctSolution: lesson.exampleSolution,
      studentReasoning: data.reasoning,
      subject: lesson.subject as SubjectName, 
    });

    if (aiFeedbackResult.success && aiFeedbackResult.feedback) {
      setAiFeedback(aiFeedbackResult.feedback);
      const updatedAnswerIndex = mockStudentAnswers.findIndex(ans => ans.id === newAnswer.id);
      if (updatedAnswerIndex > -1) {
          mockStudentAnswers[updatedAnswerIndex].aiFeedback = aiFeedbackResult.feedback;
          setSubmittedAnswer(mockStudentAnswers[updatedAnswerIndex]);
          saveStudentAnswersToLocalStorage();
      }
      toast({ title: "AI Feedback Received!", description: "Check the AI feedback section below."});
    } else {
      toast({ title: "AI Feedback Error", description: aiFeedbackResult.error || "Could not retrieve AI feedback.", variant: "destructive" });
    }
    setAiFeedbackLoading(false);
    setIsSubmitting(false);
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
             <Badge variant={submittedAnswer.status === 'Reviewed' ? 'default' : 'secondary'} 
                    className={`mt-2 ${submittedAnswer.status === 'Reviewed' ? 'bg-brand-green text-white' : 'bg-yellow-400 text-yellow-900'}`}>
               Status: {submittedAnswer.status}
             </Badge>
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
                  disabled={!!submittedAnswer && submittedAnswer.status === 'Reviewed'}
                />
                {form.formState.errors.reasoning && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.reasoning.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="solution" className="text-lg font-semibold">Your Solution</Label>
                <Textarea
                  id="solution"
                  {...form.register('solution')}
                  rows={3}
                  placeholder="Provide your final answer here..."
                  className={`mt-2 ${form.formState.errors.solution ? 'border-destructive' : ''}`}
                  disabled={!!submittedAnswer && submittedAnswer.status === 'Reviewed'}
                />
                {form.formState.errors.solution && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.solution.message}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white" 
                  disabled={isSubmitting || (!!submittedAnswer && submittedAnswer.status === 'Reviewed')}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {submittedAnswer && submittedAnswer.status !== 'Reviewed' ? 'Update Answer' : submittedAnswer?.status === 'Reviewed' ? 'Answer Submitted' : 'Submit Answer'}
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

      {submittedAnswer && submittedAnswer.status === 'Reviewed' && submittedAnswer.tutorFeedback && (
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

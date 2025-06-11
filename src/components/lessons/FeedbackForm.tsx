// src/components/lessons/FeedbackForm.tsx
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Feedback } from '@/types'; // Assuming Feedback type exists for submitted data

const feedbackSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().max(500, "Comment cannot exceed 500 characters.").optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  lessonId: string;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ lessonId, onSubmitSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit feedback.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const newFeedback: Omit<Feedback, 'id' | 'submittedAt'> = { // Adapt if Feedback type expects more
        lessonId,
        userId: user.uid, // Changed from user.id to user.uid
        rating: data.rating,
        comment: data.comment,
    };
    console.log("Feedback submitted:", newFeedback);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you would save `newFeedback` to your backend and get back the full Feedback object with id and submittedAt.
    
    setIsSubmitting(false);
    toast({ title: "Feedback Submitted!", description: "Thank you for your feedback.", className: "bg-brand-green text-white" });
    form.reset({rating: 0, comment: ''}); // Reset form with initial values
    if (onSubmitSuccess) onSubmitSuccess();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-md bg-card mt-8">
      <h3 className="text-xl font-headline font-semibold text-brand-navy">Leave Feedback</h3>
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-base">Rating</Label>
        <Controller
          name="rating"
          control={form.control}
          render={({ field }) => (
            <StarRating
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {form.formState.errors.rating && (
          <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-base">Comment (Optional)</Label>
        <Textarea
          id="comment"
          {...form.register('comment')}
          placeholder="Tell us what you think..."
          rows={4}
          className={form.formState.errors.comment ? 'border-destructive' : ''}
        />
        {form.formState.errors.comment && (
          <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full md:w-auto bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Feedback
      </Button>
    </form>
  );
};

export default FeedbackForm;

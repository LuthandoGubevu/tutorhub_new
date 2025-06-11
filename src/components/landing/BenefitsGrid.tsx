// src/components/landing/BenefitsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Bot, CheckSquare, Users, ShieldCheck, MessageSquare } from 'lucide-react';

const benefits = [
  { title: 'Interactive Lessons', icon: <Zap className="h-8 w-8 text-brand-purple-blue" />, description: "Engaging video lessons and practical exercises." },
  { title: 'AI Tutor Support', icon: <Bot className="h-8 w-8 text-brand-purple-blue" />, description: "Instant feedback and guidance from our AI tutor." },
  { title: 'Answer Tracking', icon: <CheckSquare className="h-8 w-8 text-brand-purple-blue" />, description: "Monitor your progress and review submitted answers." },
  { title: 'Session Booking', icon: <Users className="h-8 w-8 text-brand-purple-blue" />, description: "Schedule 1-on-1 sessions with experienced tutors." },
  { title: 'Secure Focused Learning', icon: <ShieldCheck className="h-8 w-8 text-brand-purple-blue" />, description: "A safe and distraction-free learning environment." },
  { title: 'Feedback Loop', icon: <MessageSquare className="h-8 w-8 text-brand-purple-blue" />, description: "Continuous feedback from tutors and AI to improve." },
];

const BenefitsGrid = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy text-center mb-12">
          Why Choose TutorHub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                {benefit.icon}
                <CardTitle className="font-headline text-xl text-brand-navy">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;

// src/components/landing/PricingPlans.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    title: 'Single Subject',
    price: 'R300',
    period: '/month',
    features: ['Access to all lessons in 1 subject', 'AI Tutor Support', 'Answer Tracking', 'Session Booking'],
    cta: 'Choose Plan',
    bgColor: 'bg-white',
    textColor: 'text-brand-navy',
    borderColor: 'border-gray-200',
    buttonClass: 'bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white',
  },
  {
    title: 'Both Subjects',
    price: 'R600',
    period: '/month',
    features: ['Access to all lessons in 2 subjects (Math & Physics)', 'AI Tutor Support', 'Answer Tracking', 'Session Booking', 'Priority Support'],
    cta: 'Choose Plan',
    bgColor: 'bg-brand-navy',
    textColor: 'text-white',
    borderColor: 'border-brand-purple-blue',
    buttonClass: 'bg-brand-green hover:bg-brand-green/80 text-white',
  },
];

const PricingPlans = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy text-center mb-12">
          Flexible Pricing Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.title} className={`shadow-xl rounded-lg flex flex-col ${plan.bgColor} ${plan.textColor} border-2 ${plan.borderColor}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`font-headline text-2xl ${plan.textColor}`}>{plan.title}</CardTitle>
                <CardDescription className={`${plan.textColor === 'text-white' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  All essential features included.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.textColor}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.textColor === 'text-white' ? 'text-gray-300' : 'text-muted-foreground'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className={`h-5 w-5 mr-2 ${plan.textColor === 'text-white' ? 'text-brand-green' : 'text-brand-green'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full font-semibold ${plan.buttonClass}`} asChild>
                   <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;

// src/components/landing/HeroSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="py-10 md:py-16 text-center bg-gradient-to-br from-brand-light-bg to-blue-50 rounded-lg shadow-lg">
      <div className="container mx-auto px-4">
        <h1 className="font-headline text-4xl md:text-6xl font-bold text-brand-navy mb-6">
          Unlock Your Academic Potential
        </h1>
        <p className="text-lg md:text-xl text-foreground mb-10 max-w-2xl mx-auto">
          TutorHub Online Academy provides Grade 12 learners with engaging Mathematics and Physics lessons, AI-powered support, and personalized tutoring.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" className="w-full sm:w-auto bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white font-semibold" asChild>
            <Link href="/register">Start Your Journey</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-purple-blue text-brand-purple-blue hover:bg-brand-purple-blue hover:text-white font-semibold" asChild>
            <Link href="/lessons">Explore Lessons</Link>
          </Button>
        </div>
        <div className="mt-16">
          <Image 
            src="/hero-section.jpg"
            alt="Students learning online"
            width={800}
            height={400}
            className="rounded-lg shadow-xl mx-auto"
            priority // Add priority if it's LCP
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

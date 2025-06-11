import HeroSection from '@/components/landing/HeroSection';
import BenefitsGrid from '@/components/landing/BenefitsGrid';
import PricingPlans from '@/components/landing/PricingPlans';

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-20">
      <HeroSection />
      <BenefitsGrid />
      <PricingPlans />
    </div>
  );
}

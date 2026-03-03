import PublicNav from '../../components/ui/PublicNav';
import Pricing from '../(marketing)/_components/sections/Pricing';
import FAQ from '../(marketing)/_components/sections/FAQ';
import CTA from '../(marketing)/_components/sections/CTA';

export const metadata = {
  title: 'Quiet Tracker Pricing',
  description: 'Transparent pricing for e-commerce store owners and small agencies protecting margins with pricing intelligence.'
};

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-container px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <PublicNav className="mb-5" />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}

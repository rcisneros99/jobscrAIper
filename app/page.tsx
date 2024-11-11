import Blog from "@/components/sections/blog";
import CTA from "@/components/sections/cta";
import FAQ from "@/components/sections/faq";
import Features from "@/components/sections/features";
import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Logos from "@/components/sections/logos";
import Pricing from "@/components/sections/pricing";
import Problem from "@/components/sections/problem";
import Solution from "@/components/sections/solution";
import Testimonials from "@/components/sections/testimonials";
import TestimonialsCarousel from "@/components/sections/testimonials-carousel";
import Globe from "@/components/ui/globe";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="relative min-h-screen flex items-center justify-center">
        <Globe className="z-0" />
        <div className="absolute inset-0 bg-black/40 z-[5] dark:block hidden" /> {/* Dark overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 mt-20">
          <Hero />
        </div>
      </div>
      <Logos />
      <Problem />
      <Solution />
      <HowItWorks />
      <TestimonialsCarousel />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Blog />
      <CTA />
      <Footer />
    </main>
  );
}

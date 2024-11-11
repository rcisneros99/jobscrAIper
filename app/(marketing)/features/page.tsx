import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AIText } from "@/components/ui/ai-text";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ArrowRight } from "lucide-react";

export default async function FeaturesLandingPage() {
  const user = await currentUser();

  // If user is logged in, redirect to the AI search page
  if (user) {
    redirect("/features/search");
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Let <AIText text="AI" /> Find Your Dream Job
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Our advanced AI technology scans thousands of job postings in real-time, 
            finding the perfect opportunities that match your skills and preferences.
          </p>

          <div className="grid gap-8 md:grid-cols-3 py-8">
            <div className="space-y-4 p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Smart Matching</h3>
              <p className="text-muted-foreground">AI-powered job matching based on your skills and preferences</p>
            </div>
            <div className="space-y-4 p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Real-time Search</h3>
              <p className="text-muted-foreground">Live job scraping from company career pages</p>
            </div>
            <div className="space-y-4 p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Personalized Results</h3>
              <p className="text-muted-foreground">Tailored job recommendations just for you</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
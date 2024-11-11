import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import { AIText } from "@/components/ui/ai-text";
import Globe from "@/components/ui/globe";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center mt-20">
        <Globe className="z-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Our Story
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  How frustration led to innovation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter">The Beginning</h2>
              <p className="text-gray-500 dark:text-gray-400">
                <AIText text="JobScrAIper" /> was born from the shared frustration of students and young professionals 
                tired of the endless cycle of manual job applications. As recent graduates ourselves, 
                we spent countless hours copying and pasting our information across different job portals, 
                only to face silence or rejection.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter">Our Mission</h2>
              <p className="text-gray-500 dark:text-gray-400">
                We believe that talent shouldn't be lost in the noise of complicated application processes. 
                Our mission is to democratize the job search process, making it efficient, intelligent, and 
                accessible to everyone. With <AIText text="JobScrAIper" />, we're not just building a tool; 
                we're creating a revolution in how people find their dream jobs.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter">The Solution</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Using cutting-edge AI technology, we've created a platform that understands both job seekers 
                and job postings at a deeper level. Our system doesn't just match keywords – it understands 
                context, potential, and the human element of job searching.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter">Join Our Journey</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Today, we're proud to help thousands of job seekers find their perfect positions more 
                efficiently than ever before. But this is just the beginning. We're constantly innovating 
                and improving our platform to make job searching as seamless as possible.
              </p>
              <div className="flex justify-center pt-4">
                <Button asChild>
                  <Link href="/signup">
                    Join Us Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 
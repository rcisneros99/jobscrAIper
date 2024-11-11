import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Globe from "@/components/ui/globe";

export default function CareersPage() {
  return (
    <main>
      <Header />
      
      <section className="relative min-h-[60vh] flex items-center justify-center mt-20">
        <Globe className="z-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  🚧 Careers at JobScrAIper 🚧
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  We're building something exciting. Check back soon for opportunities!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 
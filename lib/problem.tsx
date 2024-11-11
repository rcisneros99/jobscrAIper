import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Zap } from "lucide-react";

const problems = [
  {
    title: "Time Consuming",
    description:
      "Job seekers spend countless hours manually filling out applications on different company websites, leading to inefficient and repetitive work.",
    icon: Brain,
  },
  {
    title: "Format Variations",
    description:
      "Every company website has a different application format and requirements, making it difficult to maintain consistency across applications.",
    icon: Zap,
  },
  {
    title: "Tracking Progress",
    description:
      "Managing multiple applications across various company portals makes it challenging to track application status and follow up effectively.",
    icon: Shield,
  },
];

export default function Component() {
  return (
    <Section
      title="Problem"
      subtitle="Applying through a company's website is 4x more effective than with LinkedIn. Let AI do it"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}

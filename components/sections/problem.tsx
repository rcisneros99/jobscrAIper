import { Card, CardContent } from "@/components/ui/card";
import Section from "@/components/section";
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

export default function Problem() {
  return (
    <Section
      title="Common Problems"
      subtitle="Challenges in Traditional Job Search"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Network, UserCircle, LineChart, Download } from "lucide-react";

const data = [
  {
    id: 1,
    title: "Connect to LinkedIn",
    content: "Seamlessly integrate with your background, interests and network.",
    image: "/dashboard.png",
    icon: <Network className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Be You",
    content: "Chat with JobAIgent to refine and discover your perfect career path.",
    image: "/dashboard.png",
    icon: <UserCircle className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Smart Analytics",
    content: "Get personalized job recommendations based on your search patterns.",
    image: "/dashboard.png",
    icon: <LineChart className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Your Data, Your Way",
    content: "Download and own your job search data anytime, anywhere.",
    image: "/dashboard.png",
    icon: <Download className="h-6 w-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="Personalized" subtitle="Because we are all unique">
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}

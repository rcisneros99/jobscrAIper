import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Sparkles, Upload, Zap } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Create Your Profile",
    content:
      "Set up your professional profile by uploading your resume and customizing your preferences. Our platform makes it easy to showcase your skills and experience to potential employers.",
    image: "/dashboard.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. AI Job Search",
    content:
      "Let our AI analyze thousands of job postings to find the perfect matches for your skills and preferences. Our intelligent algorithms ensure you discover relevant opportunities quickly.",
    image: "/dashboard.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Save and Apply",
    content:
      "Save interesting positions to your dashboard and apply with just a few clicks. Our platform streamlines the application process so you can focus on landing your dream job.",
    image: "/dashboard.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="Just 3 steps to get started">
      <Features data={data} />
    </Section>
  );
}

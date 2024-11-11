import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube, FaRobot } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { AIText } from "@/components/ui/ai-text";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: <AIText text="JobScrAIper" />,
  description: "Find and apply to jobs automatically with AI-powered job search",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Jobs", "Career", "Job Search", "AI", "Job Board", "Recruitment"],
  links: {
    email: "racr1999@gmail.com",
    twitter: "https://twitter.com/JobScrAIper",
    discord: "https://discord.gg/JobScrAIper",
    github: "https://github.com/JobScrAIper",
    instagram: "https://instagram.com/JobScrAIper/",
  },
  header: [
    {
      trigger:  <AIText text="SeAIrch Jobs" />,
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "AI-Powered Job Search",
          description: "Find relevant jobs automatically with smart matching.",
          href: "/features",
          className: "hover:text-primary transition-colors",
        },
        items: [
          {
            href: "/features/jobAIgent",
            title: <AIText text="JobAIgent" />,
            description: "Work with our matchmaking AI Agent to find your next position.",
            className: "hover:bg-primary/5 transition-colors",
          },
          {
            href: "/features/autoapply",
            title: <AIText text="AutoApplAI" />,
            description: "Apply to multiple jobs with a single click.",
            className: "hover:bg-primary/5 transition-colors",
          },
          {
            href: "/features/real-time-updates",
            title: <AIText text="UpdAItes" />,
            description: "Get instant notifications for new job matches.",
            className: "hover:bg-primary/5 transition-colors",
          },
        ],
      },
    },
    {
      trigger: "Company",
      content: {
        items: [
          {
            title: "About Us",
            href: "/about",
            description: "Learn about our mission and story.",
            className: "hover:bg-primary/5 transition-colors",
          },
          {
            title: "Careers",
            href: "/careers",
            description: "Join our team and make an impact.",
            className: "hover:bg-primary/5 transition-colors",
          },
          {
            title: "Blog",
            href: "/blog",
            description: "Insights, updates, and job search tips.",
            className: "hover:bg-primary/5 transition-colors",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
      className: "hover:text-primary transition-colors",
    },
  ],
  pricing: [
    {
      name: "FREE",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "Basic Job Search",
        "10 Applications/month",
        "Email Support",
        "Job Alerts",
        "Basic Profile",
      ],
      description: "Perfect for casual job seekers",
      buttonText: "Get Started",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "$29",
      period: "month",
      yearlyPrice: "$24",
      features: [
        "Advanced Job Matching",
        "Unlimited Applications",
        "Priority Support",
        "Resume Builder",
        "Application Tracking",
      ],
      description: "Ideal for active job seekers",
      buttonText: "Subscribe",
      isPopular: true,
    },
    {
      name: "BUSINESS",
      href: "#",
      price: "$99",
      period: "month",
      yearlyPrice: "$82",
      features: [
        "Multiple Job Posts",
        "Candidate Matching",
        "24/7 Premium Support",
        "Analytics Dashboard",
        "API Access",
      ],
      description: "For recruiters and companies",
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What is JobScrAIper?",
      answer: (
        <span>
          JobScrAIper is an AI-powered job board that revolutionizes the job search process in three key ways:
          <ul className="list-disc pl-6 mt-2">
            <br></br>
            <li>🤖 Automated job collection from thousands of company career pages</li>
            <li>🧠 Intelligent matching between candidates and positions using advanced AI</li>
            <li>⚡ Streamlined application process with auto-fill capabilities</li>
            <br></br>
          </ul>
          Our platform eliminates the tedious parts of job hunting, allowing you to focus on preparing for interviews and advancing your career!
        </span>
      ),
    },
    {
      question: "How does the job matching work?",
      answer: (
        <span>
          Our sophisticated AI matching system operates on multiple levels:
          <ul className="list-disc pl-6 mt-2">
          <br></br>
            <li>📄 We analyze your resume, skills, experience, and certifications</li>
            <li>🎯 The AI learns from your application history and job interactions</li>
            <li>📊 We consider industry trends and hiring patterns</li>
            <li>🔄 The matching algorithm becomes more precise over time through machine learning</li>
          <br></br>
          </ul>
          This multi-faceted approach ensures you see the most relevant opportunities for your career goals.
        </span>
      ),
    },
    {
      question: "Is JobScrAIper free to use?",
      answer: (
        <span>
          We offer a flexible pricing structure to suit different needs:
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Free Tier:</strong> Includes basic job search, 10 applications/month, and email support</li>
            <li><strong>Pro Plan ($29/month):</strong> Unlimited applications, advanced matching, and priority support</li>
            <li><strong>Business Plan ($99/month):</strong> Full suite of recruiting tools, API access, and premium support</li>
          </ul>
          All plans come with a 7-day free trial, no credit card required. You can upgrade, downgrade, or cancel at any time.
        </span>
      ),
    },
    {
      question: "How often are new jobs added?",
      answer: (
        <span>
          Never... and Always! 
        <br></br>
        <br></br>
          When you perform a search, our AI searches real-time for information directly from company websites. Unlike traditional job boards that store outdated listings, we don't maintain a purely static database. Instead, our advanced AI technology actively scrapes and analyzes company career pages the moment you search, ensuring you get the most current opportunities available. 
        <br></br>
        <br></br> 
          This means every search gives you fresh, up-to-the-minute results, and you'll never waste time applying to positions that are no longer open. Our platform can even detect when positions have been filled or removed, saving you valuable time in your job search. You can enable notifications to stay informed about new matches as they become available on company websites.
        </span>
      ),
    },
    {
      question: "Can companies post jobs directly?",
      answer: (
        <span>
         😔 No, companies cannot post jobs directly. However, we do offer a Business plan for companies to streamline their hiring process. 🔜
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Services",
      links: [
        { 
          href: "/features", 
          text: <AIText text="AI-powered Job Search" />, 
          icon: null 
        },
        { 
          href: "/features/jobAIgent", 
          text: <AIText text="JobAIgent" />, 
          icon: null 
        },
        { 
          href: "/features/autoapply", 
          text: <AIText text="AutoApplAI" />, 
          icon: null 
        },
        { 
          href: "/features/real-time-updates", 
          text: <AIText text="UpdAItes" />, 
          icon: null 
        },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", text: "About Us", icon: null },
        { href: "/careers", text: "Careers", icon: null },
        { href: "/blog", text: "Blog", icon: null },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", text: "Career Advice", icon: null },
        { href: "#", text: "Contact", icon: null },
        { href: "#", text: "Support", icon: null },
        { href: "#", text: "Status", icon: null },
      ],
    },
    {
      title: "Social",
      links: [
        {
          href: "#",
          text: "Twitter",
          icon: <FaTwitter />,
        },
        {
          href: "#",
          text: "Instagram",
          icon: <RiInstagramFill />,
        },
        {
          href: "#",
          text: "Youtube",
          icon: <FaYoutube />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;

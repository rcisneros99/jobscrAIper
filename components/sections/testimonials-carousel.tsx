import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { MdOutlineFormatQuote } from "react-icons/md";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Netflix",
  "YouTube",
  "Instagram",
  "Uber",
  "Spotify",
];

const testimonials = [
  {
    text: "JobScrAIper completely transformed my job search. The AI-powered system saved me countless hours of repetitive work. Within weeks, I landed my dream role as a Data Scientist at a top tech company.",
    name: "Tyler Gallup",
    role: "Data Scientist"
  },
  {
    text: "As a recent graduate, I was struggling to keep track of all my job applications. This platform streamlined everything and helped me maintain consistency across applications. I'm now working at my ideal company thanks to JobScrAIper!",
    name: "Arturo Avalos", 
    role: "Finance Analyst"
  },
  {
    text: "The automated application process is incredible. Instead of spending hours filling out forms, I could focus on preparing for interviews. JobScrAIper helped me secure a position that perfectly matches my skills and career goals.",
    name: "Vitoria Soria",
    role: "Machine Learning Engineer"
  }
];

export default function Component() {
  return (
    <Section
      title="Success Stories"
      subtitle="From job seekers who found their dream roles"
    >
      <Carousel>
        <div className="max-w-2xl mx-auto relative">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index}>
                <div className="p-2 pb-5">
                  <div className="text-center">
                    <MdOutlineFormatQuote className="text-4xl text-themeDarkGray my-4 mx-auto" />
                    <BlurFade delay={0.25} inView>
                      <h4 className="text-1xl font-semibold max-w-lg mx-auto px-10">
                        {testimonial.text}
                      </h4>
                    </BlurFade>
                    <BlurFade delay={0.25 * 2} inView>
                      <div className="mt-8">
                        <Image
                          width={0}
                          height={40}
                          key={index}
                          src={`https://cdn.magicui.design/companies/${
                            companies[index % companies.length]
                          }.svg`}
                          alt={`${companies[index % companies.length]} Logo`}
                          className="mx-auto w-auto h-[40px] grayscale opacity-30"
                        />
                      </div>
                    </BlurFade>
                    <div className="">
                      <BlurFade delay={0.25 * 3} inView>
                        <h4 className="text-1xl font-semibold my-2">
                          {testimonial.name}
                        </h4>
                      </BlurFade>
                    </div>
                    <BlurFade delay={0.25 * 4} inView>
                      <div className=" mb-3">
                        <span className="text-sm text-themeDarkGray">
                          {testimonial.role}
                        </span>
                      </div>
                    </BlurFade>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-2/12 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full  w-2/12 bg-gradient-to-l from-background"></div>
        </div>
        <div className="md:block hidden">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </Section>
  );
}

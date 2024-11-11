import { SignUp } from "@clerk/nextjs";
import Globe from "@/components/ui/globe";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Globe className="z-0" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background/80 backdrop-blur-md shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
} 
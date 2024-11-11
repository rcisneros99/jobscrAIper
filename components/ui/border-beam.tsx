import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-px rounded-[inherit] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 [mask-image:linear-gradient(black,transparent)]" />
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-rotate-gradient" />
    </div>
  );
};

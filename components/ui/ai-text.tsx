"use client";

import { cn } from "@/lib/utils";

interface AITextProps {
  text: string;
  className?: string;
}
export function AIText({ text, className }: AITextProps) {
  // Function to wrap "AI" in a span with special styling
  const formatText = (text: string) => {
    return text.split(/(AI)/).map((part, index) => {
      if (part === "AI") {
        return (
          <span
            key={index}
            className={cn(
              "font-bold text-primary animate-pulse", // Changed font-[550] to font-bold for thicker text
              className
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return <>{formatText(text)}</>;
}
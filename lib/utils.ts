import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/lib/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`;
}

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  [key: string]: any;
}

export function constructMetadata({
  title = String(siteConfig.name),
  description = siteConfig.description,
  image = absoluteUrl("/og"),
  ...props
}: MetadataProps = {}) {
  return {
    title: {
      default: title,
      template: `%s | ${String(siteConfig.name)}`,
    },
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@yourtwitterhandle",
    },
    icons: {
      icon: "/favicon.ico",
    },
    ...props,
  };
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

"use client";

import Drawer from "@/components/drawer";
import { Icons } from "@/components/icons";
import Menu from "@/components/menu";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true);
      } else {
        setAddBorder(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            title="brand-logo"
            className="relative mr-6 flex items-center space-x-2 hover:text-[#8B5CF6] transition-colors"
          >
            <span className="font-bold text-xl">{siteConfig.name}</span>
          </Link>

          <div className="hidden lg:block">
            <div className="flex items-center">
              <nav className="mr-10">
                <Menu />
              </nav>

              <div className="gap-2 flex items-center">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "hover:text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors"
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "w-full sm:w-auto text-background flex gap-2 hover:bg-[#8B5CF6] transition-colors"
                    )}
                  >
                    <Icons.logo className="h-6 w-6" />
                    Get Started
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/profile"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "hover:text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors"
                    )}
                  >
                    Profile
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 hover:opacity-80 transition-opacity"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
          <div className="mt-2 cursor-pointer block lg:hidden hover:text-[#8B5CF6] transition-colors">
            <Drawer />
          </div>
        </div>
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}

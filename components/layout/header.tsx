'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-[#8B5CF6] transition-colors">
            JobScrAIper
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/features/search" 
              className="text-sm font-medium hover:text-[#8B5CF6] transition-colors"
            >
              SeAIrch Jobs
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/5">
                    Company
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-2 p-4">
                      <li>
                        <Link 
                          href="/about" 
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6]"
                        >
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/careers"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6]"
                        >
                          Careers
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/blog"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6]"
                        >
                          Blog
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link 
              href="/blog" 
              className="text-sm font-medium hover:text-[#8B5CF6] transition-colors"
            >
              Blog
            </Link>

            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
      </div>
    </header>
  );
} 
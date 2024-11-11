"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AIText } from "@/components/ui/ai-text";

export default function Menu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {siteConfig.header.map((item, index) => {
          if ("trigger" in item) {
            return (
              <NavigationMenuItem key={index}>
                <NavigationMenuTrigger>{item.trigger}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px]">
                    {item.content?.main && (
                      <Link
                        href={item.content.main.href}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          item.content.main.title === "AI-Powered Job Search" 
                            ? "bg-primary/10 hover:bg-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10"
                            : "hover:bg-accent"
                        )}
                      >
                        {item.content.main.icon}
                        <div>
                          <div className="text-sm font-medium leading-none">
                            <AIText text={item.content.main.title} />
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.content.main.description}
                          </p>
                        </div>
                      </Link>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {item.content?.items?.map((subItem, i) => (
                        <Link
                          key={i}
                          href={subItem.href}
                          className="p-3 hover:bg-accent rounded-lg"
                        >
                          <div className="text-sm font-medium leading-none">
                            {subItem.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {subItem.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={index}>
              <Link href={item.href || "#"} legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium leading-none">
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

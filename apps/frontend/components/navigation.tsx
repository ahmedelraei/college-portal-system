"use client";

import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Registration", href: "/courses" },
  ];

  return (
    <nav className="bg-white border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => item.href !== "#" && router.push(item.href)}
                disabled={item.href === "#"}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

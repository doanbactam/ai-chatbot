"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  SettingsIcon,
  MonitorIcon,
  ChatBubbleIcon,
  PersonIcon,
  InfoCircleIcon,
} from "@/components/icons";

interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: "general",
    label: "General",
    icon: SettingsIcon,
  },
  {
    id: "interface",
    label: "Interface",
    icon: MonitorIcon,
  },
  {
    id: "dialogue",
    label: "Dialogue",
    icon: ChatBubbleIcon,
  },
  {
    id: "account",
    label: "Account",
    icon: PersonIcon,
  },
  {
    id: "about",
    label: "About",
    icon: InfoCircleIcon,
  },
];

export const SettingsNavigation = ({
  activeSection,
  onSectionChange,
}: SettingsNavigationProps) => {
  return (
    <nav className="w-48 border-r bg-muted/30 p-4">
      <ul className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
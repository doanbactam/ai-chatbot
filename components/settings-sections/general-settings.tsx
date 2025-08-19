"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SystemIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

type ThemeMode = "system" | "light" | "dark";

export const GeneralSettings = () => {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("light");
  const [language, setLanguage] = React.useState("en-US");

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", { themeMode, language });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Theme Mode</h2>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant={themeMode === "system" ? "default" : "outline"}
            className={cn(
              "h-20 flex-col gap-2",
              themeMode === "system" && "bg-primary text-primary-foreground"
            )}
            onClick={() => setThemeMode("system")}
          >
            <SystemIcon />
            <span className="text-sm font-medium">System Mode</span>
          </Button>
          
          <Button
            variant={themeMode === "light" ? "default" : "outline"}
            className={cn(
              "h-20 flex-col gap-2",
              themeMode === "light" && "bg-primary text-primary-foreground"
            )}
            onClick={() => setThemeMode("light")}
          >
            <SunIcon />
            <span className="text-sm font-medium">Light Mode</span>
          </Button>
          
          <Button
            variant={themeMode === "dark" ? "default" : "outline"}
            className={cn(
              "h-20 flex-col gap-2",
              themeMode === "dark" && "bg-primary text-primary-foreground"
            )}
            onClick={() => setThemeMode("dark")}
          >
            <MoonIcon />
            <span className="text-sm font-medium">Dark Mode</span>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Language Settings</h2>
        <div className="flex items-center gap-4">
          <Label htmlFor="language" className="text-sm font-medium">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} className="px-8">
          Save
        </Button>
      </div>
    </div>
  );
};
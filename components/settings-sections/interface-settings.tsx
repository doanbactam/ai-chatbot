"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const InterfaceSettings = () => {
  const [layout, setLayout] = React.useState("default");
  const [sidebarPosition, setSidebarPosition] = React.useState("left");
  const [compactMode, setCompactMode] = React.useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving interface settings:", { layout, sidebarPosition, compactMode });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Layout Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="layout" className="text-sm font-medium w-32">
              Layout Style
            </Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="narrow">Narrow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="sidebar" className="text-sm font-medium w-32">
              Sidebar Position
            </Label>
            <Select value={sidebarPosition} onValueChange={setSidebarPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Display Options</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="compact" className="text-sm font-medium w-32">
              Compact Mode
            </Label>
            <Button
              variant={compactMode ? "default" : "outline"}
              onClick={() => setCompactMode(!compactMode)}
              className="w-20"
            >
              {compactMode ? "On" : "Off"}
            </Button>
          </div>
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
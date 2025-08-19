"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export const DialogueSettings = () => {
  const [maxTokens, setMaxTokens] = React.useState("4000");
  const [temperature, setTemperature] = React.useState("0.7");
  const [autoSave, setAutoSave] = React.useState(true);
  const [typingIndicator, setTypingIndicator] = React.useState(true);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving dialogue settings:", { 
      maxTokens, 
      temperature, 
      autoSave, 
      typingIndicator 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">AI Response Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="maxTokens" className="text-sm font-medium w-32">
              Max Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              className="w-32"
              min="100"
              max="8000"
            />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="temperature" className="text-sm font-medium w-32">
              Temperature
            </Label>
            <Select value={temperature} onValueChange={setTemperature}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select temperature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">Conservative (0.1)</SelectItem>
                <SelectItem value="0.3">Balanced (0.3)</SelectItem>
                <SelectItem value="0.7">Creative (0.7)</SelectItem>
                <SelectItem value="1.0">Very Creative (1.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Chat Experience</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="autoSave" className="text-sm font-medium w-32">
              Auto-save Conversations
            </Label>
            <Button
              variant={autoSave ? "default" : "outline"}
              onClick={() => setAutoSave(!autoSave)}
              className="w-20"
            >
              {autoSave ? "On" : "Off"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="typingIndicator" className="text-sm font-medium w-32">
              Typing Indicator
            </Label>
            <Button
              variant={typingIndicator ? "default" : "outline"}
              onClick={() => setTypingIndicator(!typingIndicator)}
              className="w-20"
            >
              {typingIndicator ? "On" : "Off"}
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
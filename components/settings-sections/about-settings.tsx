"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export const AboutSettings = () => {
  const appVersion = "3.1.0";
  const buildDate = "2024-01-15";
  const nodeVersion = "18.17.0";

  const handleCheckUpdate = () => {
    // TODO: Implement update check
    console.log("Checking for updates...");
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Exporting data...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Application Information</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Chatbot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Version
                </Label>
                <p className="text-lg font-semibold">{appVersion}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Build Date
                </Label>
                <p className="text-lg font-semibold">{buildDate}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Node.js Version
              </Label>
              <p className="text-lg font-semibold">{nodeVersion}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                License
              </Label>
              <p className="text-lg font-semibold">MIT License</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">OpenAI</Badge>
                  <Badge variant="secondary">Anthropic</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Google</Badge>
                  <Badge variant="secondary">Mistral</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Chat</Badge>
                  <Badge variant="outline">Code</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Files</Badge>
                  <Badge variant="outline">Multi-modal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex gap-4">
          <Button onClick={handleCheckUpdate} variant="outline">
            Check for Updates
          </Button>
          <Button onClick={handleExportData} variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Support</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For support, please visit our documentation or contact our team.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="outline" size="sm">
              Report Bug
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
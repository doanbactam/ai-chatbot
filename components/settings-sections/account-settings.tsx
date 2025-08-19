"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AccountSettings = () => {
  const [displayName, setDisplayName] = React.useState("User");
  const [email, setEmail] = React.useState("user@example.com");
  const [bio, setBio] = React.useState("");
  const [notifications, setNotifications] = React.useState(true);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving account settings:", { 
      displayName, 
      email, 
      bio, 
      notifications 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="notifications" className="text-sm font-medium w-32">
              Email Notifications
            </Label>
            <Button
              variant={notifications ? "default" : "outline"}
              onClick={() => setNotifications(!notifications)}
              className="w-20"
            >
              {notifications ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Enable Two-Factor Authentication</Button>
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
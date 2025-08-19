"use client";

import { SettingsButton } from "@/components/settings-button";

export default function SettingsDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Settings System Demo</h1>
          <p className="text-muted-foreground">
            Click the settings button below to open the settings modal.
          </p>
        </div>

        <div className="flex items-center gap-4 p-6 border rounded-lg bg-card">
          <div>
            <h2 className="text-lg font-semibold mb-2">Quick Access</h2>
            <p className="text-sm text-muted-foreground">
              Access all your system settings in one place
            </p>
          </div>
          <div className="ml-auto">
            <SettingsButton />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Theme mode selection (System, Light, Dark)</li>
              <li>• Language settings with multiple options</li>
              <li>• Interface customization</li>
              <li>• Dialogue and AI response settings</li>
              <li>• Account management</li>
              <li>• System information and support</li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3">Design Principles</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Follows project's design patterns</li>
              <li>• Uses existing UI components</li>
              <li>• Responsive and accessible</li>
              <li>• Consistent with app theme</li>
              <li>• Easy to extend and customize</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SettingsNavigation } from "./settings-navigation";
import { GeneralSettings } from "./settings-sections/general-settings";
import { InterfaceSettings } from "./settings-sections/interface-settings";
import { DialogueSettings } from "./settings-sections/dialogue-settings";
import { AccountSettings } from "./settings-sections/account-settings";
import { AboutSettings } from "./settings-sections/about-settings";

type SettingsSection = "general" | "interface" | "dialogue" | "account" | "about";

export const SettingsContent = () => {
  const [activeSection, setActiveSection] = React.useState<SettingsSection>("general");

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "interface":
        return <InterfaceSettings />;
      case "dialogue":
        return <DialogueSettings />;
      case "account":
        return <AccountSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex h-full">
      <SettingsNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
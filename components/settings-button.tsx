"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "@/components/icons";
import { SettingsDialog } from "./settings-dialog";

export const SettingsButton = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-9 w-9"
        aria-label="Open settings"
      >
        <SettingsIcon />
      </Button>
      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
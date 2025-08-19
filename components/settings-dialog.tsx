'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Settings,
  Monitor,
  Sun,
  Moon,
  Keyboard,
  Users,
  Puzzle,
  BarChart3,
  Bot,
  Mail,
} from 'lucide-react';

interface SettingsDialogProps {
  children: React.ReactNode;
}

type SettingsTab = 
  | 'general'
  | 'shortcuts' 
  | 'settings'
  | 'members'
  | 'plugins'
  | 'usage'
  | 'background-agents'
  | 'contact';

const settingsTabs = [
  { id: 'general' as const, label: 'General', icon: Settings },
  { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'members' as const, label: 'Members', icon: Users },
  { id: 'plugins' as const, label: 'Plugins', icon: Puzzle },
  { id: 'usage' as const, label: 'Usage', icon: BarChart3 },
  { id: 'background-agents' as const, label: 'Background Agents', icon: Bot },
  { id: 'contact' as const, label: 'Contact Us', icon: Mail },
];

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [defaultGrouping, setDefaultGrouping] = useState('merge');

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">General</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure default UI display, grouping, and expansion behaviors.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block">UI Display Style</label>
          <p className="text-xs text-muted-foreground mb-3">
            Choose how to display the theme in all views.
          </p>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Default Grouping</label>
          <p className="text-xs text-muted-foreground mb-3">
            Initial grouping for new background agents list.
          </p>
          <Select value={defaultGrouping} onValueChange={setDefaultGrouping}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge</SelectItem>
              <SelectItem value="separate">Separate</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'shortcuts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
            <p className="text-sm text-muted-foreground">
              Customize keyboard shortcuts for faster navigation.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage team members and their permissions.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {settingsTabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <div className="text-sm text-muted-foreground">
              This section is under development.
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r p-4">
            <div className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left',
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

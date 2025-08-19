'use client';

import { useState, useRef } from 'react';
import { AgentMentionAutocomplete } from '@/components/agent-mention-autocomplete';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TestMentionPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; mentions: string[] }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock group ID for testing
  const mockGroupId = 'test-group-123';

  // Mock agents for testing
  const mockAgents = [
    { id: '1', key: 'assistant', displayName: 'AI Assistant', color: '#3B82F6', localEnabled: true, isEnabled: true },
    { id: '2', key: 'coder', displayName: 'Code Helper', color: '#10B981', localEnabled: true, isEnabled: true },
    { id: '3', key: 'writer', displayName: 'Writing Assistant', color: '#F59E0B', localEnabled: true, isEnabled: true },
    { id: '4', key: 'disabled', displayName: 'Disabled Agent', color: '#EF4444', localEnabled: false, isEnabled: true },
  ];

  const handleMentionSelect = (agentKey: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = input.substring(0, cursorPosition);
    const textAfterCursor = input.substring(cursorPosition);
    
    // Find the last @ symbol before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Replace from @ to cursor with @agentKey
      const newText = `${textBeforeCursor.substring(0, lastAtIndex)}@${agentKey} ${textAfterCursor}`;
      setInput(newText);
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newCursorPos = lastAtIndex + agentKey.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const handleInvalidMention = (agentKey: string, reason: string) => {
    console.warn(`Invalid mention detected: @${agentKey} - ${reason}`);
    // Add a visual indicator for invalid mentions
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: `⚠️ Invalid mention @${agentKey}: ${reason}`,
      mentions: []
    }]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Extract mentions from input
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null = null;
    while (true) {
      match = mentionRegex.exec(input);
      if (match === null) break;
      mentions.push(match[1]);
    }

    // Add message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: input,
      mentions
    }]);

    // Clear input
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">@Mention Test Page</h1>
        <p className="text-muted-foreground">
          Test the @mention functionality with visual tags and validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test @Mention Input</CardTitle>
            <CardDescription>
              Type @ to trigger autocomplete. Try mentioning agents like @assistant, @coder, or @writer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type @ to mention agents..."
                className="min-h-[120px] resize-none"
              />
              
              {/* Mock AgentMentionAutocomplete for testing */}
              <div className="mt-2">
                <AgentMentionAutocomplete
                  groupId={mockGroupId}
                  input={input}
                  textareaRef={textareaRef}
                  onMentionSelect={handleMentionSelect}
                  onInvalidMention={handleInvalidMention}
                />
              </div>
            </div>

            <Button onClick={handleSendMessage} className="w-full">
              Send Message
            </Button>

            {/* Available Agents */}
            <div>
              <h4 className="font-medium mb-2">Available Agents:</h4>
              <div className="flex flex-wrap gap-2">
                {mockAgents.map((agent) => (
                  <Badge
                    key={agent.id}
                    variant={agent.localEnabled && agent.isEnabled ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <div 
                      className="size-2 rounded-full"
                      style={{ backgroundColor: agent.color }}
                    />
                    @{agent.key}
                    {!agent.localEnabled && <span className="text-xs">(disabled)</span>}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Display */}
        <Card>
          <CardHeader>
            <CardTitle>Messages & Mentions</CardTitle>
            <CardDescription>
              View sent messages and extracted mentions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No messages yet. Send a message with @mentions to see them here.
                </p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.mentions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Mentions:</span>
                        {message.mentions.map((mention) => (
                          <Badge key={`mention-${mention}`} variant="outline" className="text-xs">
                            @{mention}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Separator />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Type <code className="bg-muted px-1 rounded">@</code> to open the autocomplete dropdown</li>
            <li>Use arrow keys to navigate through available agents</li>
            <li>Press Enter or Tab to select an agent</li>
            <li>Press Esc to close the dropdown</li>
            <li>Mention tags will appear above the input with remove buttons</li>
            <li>Invalid mentions will be logged to console and displayed in messages</li>
            <li>Try mentioning disabled agents to see validation in action</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
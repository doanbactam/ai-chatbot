'use client';

import { useState, useRef } from 'react';
import { AgentMentionTags, AgentMentionAutocomplete } from './agent-mention-autocomplete';
import type { AiAgent } from '@/lib/db/schema';

// Mock data for testing
const mockAgents: Array<AiAgent & { localEnabled: boolean }> = [
  { 
    id: '1', 
    key: 'assistant', 
    displayName: 'AI Assistant', 
    color: '#3B82F6', 
    localEnabled: true, 
    role: 'assistant', 
    model: 'gpt-4', 
    systemPrompt: '', 
    isEnabled: true, 
    tools: [], 
    maxTokens: '2000', 
    temperature: '0.7', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    ownerId: 'user1' 
  },
  { 
    id: '2', 
    key: 'coder', 
    displayName: 'Code Helper', 
    color: '#10B981', 
    localEnabled: true, 
    role: 'assistant', 
    model: 'gpt-4', 
    systemPrompt: '', 
    isEnabled: true, 
    tools: [], 
    maxTokens: '2000', 
    temperature: '0.7', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    ownerId: 'user1' 
  },
  { 
    id: '3', 
    key: 'writer', 
    displayName: 'Writing Assistant', 
    color: '#F59E0B', 
    localEnabled: false, 
    role: 'assistant', 
    model: 'gpt-4', 
    systemPrompt: '', 
    isEnabled: true, 
    tools: [], 
    maxTokens: '2000', 
    temperature: '0.7', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    ownerId: 'user1' 
  },
];

export function AgentMentionTest() {
  const [input, setInput] = useState('');
  const [selectedGroupId] = useState('test-group');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMentionSelect = (agentKey: string) => {
    console.log('Selected agent:', agentKey);
    // Simulate adding mention to input
    const newInput = `${input}@${agentKey} `;
    setInput(newInput);
  };

  const handleRemoveMention = (mention: string) => {
    console.log('Removing mention:', mention);
    const newInput = input.replace(mention, '');
    setInput(newInput);
  };

  const handleInvalidMention = (invalidMention: string, reason: string) => {
    console.log('Invalid mention:', invalidMention, reason);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Agent Mention Test</h1>
      
      <div className="space-y-4">
        <div>
          <div className="block text-sm font-medium mb-2">Input Text:</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type some text with @mentions like @assistant or @coder..."
            className="w-full h-32 p-3 border rounded-md"
          />
        </div>

        <div>
          <div className="block text-sm font-medium mb-2">Current Input:</div>
          <div className="p-3 bg-muted rounded-md">
            {input || '(empty)'}
          </div>
        </div>

        <div>
          <div className="block text-sm font-medium mb-2">Mention Tags:</div>
          <AgentMentionTags
            input={input}
            agents={mockAgents}
            onRemoveMention={handleRemoveMention}
          />
        </div>

        <div>
          <div className="block text-sm font-medium mb-2">Autocomplete Test:</div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="Type @ to test autocomplete..."
              className="w-full h-20 p-3 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === '@') {
                  console.log('@ pressed');
                }
              }}
            />
            <AgentMentionAutocomplete
              groupId={selectedGroupId}
              input={input}
              textareaRef={textareaRef}
              onMentionSelect={handleMentionSelect}
              onInvalidMention={handleInvalidMention}
            />
          </div>
        </div>

        <div>
          <div className="block text-sm font-medium mb-2">Mock Agents:</div>
          <div className="space-y-2">
            {mockAgents.map(agent => (
              <div key={agent.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <div 
                  className="size-3 rounded-full"
                  style={{ backgroundColor: agent.color || '#3B82F6' }}
                />
                <span className="font-mono">@{agent.key}</span>
                <span>{agent.displayName}</span>
                <span className={`px-2 py-1 text-xs rounded ${agent.localEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {agent.localEnabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="block text-sm font-medium mb-2">Test Cases:</div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setInput('Hello @assistant, can you help me?')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Test: @assistant
            </button>
            <button
              type="button"
              onClick={() => setInput('@coder please review this code')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 ml-2"
            >
              Test: @coder
            </button>
            <button
              type="button"
              onClick={() => setInput('@invalid-agent test')}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 ml-2"
            >
              Test: Invalid agent
            </button>
            <button
              type="button"
              onClick={() => setInput('@writer test (disabled)')}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 ml-2"
            >
              Test: Disabled agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
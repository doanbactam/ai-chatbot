'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { AiAgent } from '@/lib/db/schema';

interface AgentMentionAutocompleteProps {
  groupId?: string;
  input: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onMentionSelect: (mention: string) => void;
  onInvalidMention?: (invalidMention: string, reason: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
}

interface ParsedMention {
  fullMention: string;
  agentKey: string;
  startIndex: number;
  endIndex: number;
  isValid: boolean;
}

// Component to display tagged mentions in a beautiful way
export function AgentMentionTags({ 
  input, 
  agents, 
  onRemoveMention 
}: { 
  input: string; 
  agents: Array<AiAgent & { localEnabled: boolean }>;
  onRemoveMention?: (mention: string) => void;
}) {
  const [isClient, setIsClient] = useState(false);

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Test with mock data if no agents provided
  const testAgents = useMemo(() => agents.length === 0 ? [
    { 
      id: '1', 
      key: 'test-agent', 
      displayName: 'Test Agent', 
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
    }
  ] : agents, [agents]);

  const parseMentions = useCallback((text: string): ParsedMention[] => {
    const mentions: ParsedMention[] = [];
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    let match: RegExpExecArray | null = null;

    while ((match = mentionRegex.exec(text)) !== null) {
      const fullMention = match[0];
      const agentKey = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMention.length;

      // Check if this is a valid mention (not in middle of word)
      const charBefore = startIndex > 0 ? text[startIndex - 1] : ' ';
      const charAfter = endIndex < text.length ? text[endIndex] : ' ';
      
      const isValidStart = charBefore === ' ' || charBefore === '\n' || startIndex === 0;
      const isValidEnd = charAfter === ' ' || charAfter === '\n' || endIndex === text.length;
      
      // Check if agent exists in current group
      const agentExists = testAgents.some(agent => 
        agent.key.toLowerCase() === agentKey.toLowerCase() && agent.localEnabled
      );

      mentions.push({
        fullMention,
        agentKey,
        startIndex,
        endIndex,
        isValid: isValidStart && isValidEnd && agentExists,
      });
    }

    return mentions;
  }, [testAgents]);

  const mentions = parseMentions(input);
  const validMentions = mentions.filter(m => m.isValid);

  // Debug logging
  if (isClient && process.env.NODE_ENV === 'development') {
    console.log('[AgentMentionTags] Debug:', {
      input,
      agentsCount: testAgents.length,
      agents: testAgents.map(a => ({ key: a.key, localEnabled: a.localEnabled })),
      mentions,
      validMentions,
    });
  }

  if (validMentions.length === 0) {
    return (
      <div className="text-xs text-muted-foreground mb-2">
        No valid mentions found. Input: &quot;{input}&quot;
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <div className="text-xs text-muted-foreground mb-2 w-full">
        Mentions: {validMentions.length}
      </div>
      {validMentions.map((mention, index) => {
        const agent = testAgents.find(a => 
          a.key.toLowerCase() === mention.agentKey.toLowerCase()
        );
        
        if (!agent) return null;

        return (
          <div
            key={`${mention.agentKey}-${index}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/50 border border-border rounded-full text-sm font-medium text-accent-foreground shadow-sm hover:bg-accent/70 transition-colors group"
          >
            <div 
              className="size-2.5 rounded-full border border-background"
              style={{ backgroundColor: agent.color || '#3B82F6' }}
            />
            <span>@{agent.key}</span>
            {onRemoveMention && (
              <button
                type="button"
                onClick={() => onRemoveMention(mention.fullMention)}
                className="ml-1 size-4 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                title="Remove mention"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AgentMentionAutocomplete({
  groupId,
  input,
  textareaRef,
  onMentionSelect,
  onInvalidMention,
}: AgentMentionAutocompleteProps) {
  const [state, setState] = useState<AutocompleteState>({
    isOpen: false,
    query: '',
    position: { top: 0, left: 0 },
    selectedIndex: 0,
  });

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch agents for the current group
  const { data: groupAgents } = useSWR<{ agents: Array<AiAgent & { localEnabled: boolean }> }>(
    groupId ? `/api/groups/${groupId}/agents` : null,
    fetcher
  );

  // Memoize agents to prevent unnecessary re-renders
  const agents = useMemo(() => groupAgents?.agents || [], [groupAgents?.agents]);

  // Parse @mentions from input with validation
  const parseMentions = useCallback((text: string): ParsedMention[] => {
    const mentions: ParsedMention[] = [];
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    let match: RegExpExecArray | null = null;

    while ((match = mentionRegex.exec(text)) !== null) {
      const fullMention = match[0];
      const agentKey = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMention.length;

      // Check if this is a valid mention (not in middle of word)
      const charBefore = startIndex > 0 ? text[startIndex - 1] : ' ';
      const charAfter = endIndex < text.length ? text[endIndex] : ' ';
      
      const isValidStart = charBefore === ' ' || charBefore === '\n' || startIndex === 0;
      const isValidEnd = charAfter === ' ' || charAfter === '\n' || endIndex === text.length;
      
      // Check if agent exists in current group
      const agentExists = agents.some(agent => 
        agent.key.toLowerCase() === agentKey.toLowerCase() && agent.localEnabled
      );

      mentions.push({
        fullMention,
        agentKey,
        startIndex,
        endIndex,
        isValid: isValidStart && isValidEnd && agentExists,
      });
    }

    return mentions;
  }, [agents]);

  // Log invalid mentions for debugging
  useEffect(() => {
    if (!groupId || !onInvalidMention) return;

    const mentions = parseMentions(input);
    const invalidMentions = mentions.filter(m => !m.isValid);

    invalidMentions.forEach(mention => {
      let reason = '';
      
      if (!agents.some(agent => agent.key.toLowerCase() === mention.agentKey.toLowerCase())) {
        reason = `Agent '@${mention.agentKey}' not found in group`;
      } else if (!agents.some(agent => 
        agent.key.toLowerCase() === mention.agentKey.toLowerCase() && agent.localEnabled
      )) {
        reason = `Agent '@${mention.agentKey}' is disabled in this group`;
      } else {
        reason = `Invalid mention format for '@${mention.agentKey}'`;
      }

      // Log warning for developers
      console.warn(`[AgentMentionAutocomplete] Invalid mention detected:`, {
        mention: mention.fullMention,
        reason,
        position: { start: mention.startIndex, end: mention.endIndex },
        input: input.substring(Math.max(0, mention.startIndex - 10), mention.endIndex + 10),
      });

      onInvalidMention(mention.fullMention, reason);
    });
  }, [input, groupId, agents, parseMentions, onInvalidMention]);

  // Parse @mentions from input for autocomplete
  useEffect(() => {
    if (!isClient || !textareaRef.current || !groupId) {
      setState(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = input.substring(0, cursorPosition);
    
    // Find the last @ symbol before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setState(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    // Check if @ is at start or preceded by whitespace
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n') {
      setState(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    // Get query after @
    const query = textBeforeCursor.substring(lastAtIndex + 1);
    
    // Check if query contains spaces or newlines (invalid mention)
    if (query.includes(' ') || query.includes('\n')) {
      setState(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    // Calculate position for autocomplete dropdown
    const rect = textarea.getBoundingClientRect();
    const lineHeight = 20; // Approximate line height
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex];
    
    // Calculate position more accurately
    const top = rect.top + (currentLineIndex * lineHeight) + 25;
    const left = rect.left + Math.min(currentLineText.length * 8, rect.width - 200); // Ensure dropdown fits
    
    setState({
      isOpen: true,
      query: query.toLowerCase(),
      position: { top, left },
      selectedIndex: 0,
    });
  }, [input, textareaRef, groupId, isClient]);

  // Filter agents based on query
  const filteredAgents = agents
    .filter(agent => agent.localEnabled) // Only show enabled agents
    .filter(agent => 
      agent.key.toLowerCase().includes(state.query) ||
      agent.displayName.toLowerCase().includes(state.query)
    )
    .slice(0, 8); // Increased limit for better UX

  // Handle keyboard navigation
  useEffect(() => {
    if (!isClient || !state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, filteredAgents.length - 1),
        }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filteredAgents.length > 0) {
          e.preventDefault();
          const selectedAgent = filteredAgents[state.selectedIndex];
          onMentionSelect(selectedAgent.key);
          setState(prev => ({ ...prev, isOpen: false }));
        }
      } else if (e.key === 'Escape') {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, state.selectedIndex, filteredAgents, onMentionSelect, isClient]);

  // Close on click outside
  useEffect(() => {
    if (!isClient || !state.isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isOpen, isClient]);

  if (!state.isOpen || !groupId || filteredAgents.length === 0) {
    return null;
  }

  return (
    <div
      ref={autocompleteRef}
      className="fixed z-50 border border-border rounded-lg shadow-xl max-w-sm backdrop-blur-sm bg-background/95"
      style={{
        top: state.position.top,
        left: state.position.left,
      }}
    >
      <div className="p-3">
        <div className="text-xs text-muted-foreground mb-3 font-medium">
          Mention agents in this group
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredAgents.map((agent, index) => (
            <button
              key={agent.id}
              type="button"
              className={`w-full text-left flex items-center gap-3 p-2.5 rounded-md cursor-pointer text-sm transition-colors ${
                index === state.selectedIndex 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'hover:bg-muted/80'
              }`}
              onClick={() => {
                onMentionSelect(agent.key);
                setState(prev => ({ ...prev, isOpen: false }));
              }}
            >
              <div 
                className="size-3 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: agent.color || '#3B82F6' }}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate text-foreground">
                  @{agent.key}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {agent.displayName}
                </span>
              </div>
              {agent.role && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {agent.role}
                </span>
              )}
            </button>
          ))}
        </div>
        {filteredAgents.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            No agents found matching &quot;{state.query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
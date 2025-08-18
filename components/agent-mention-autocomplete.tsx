'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { AiAgent } from '@/lib/db/schema';

interface AgentMentionAutocompleteProps {
  groupId?: string;
  input: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onMentionSelect: (mention: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
}

export function AgentMentionAutocomplete({
  groupId,
  input,
  textareaRef,
  onMentionSelect,
}: AgentMentionAutocompleteProps) {
  const [state, setState] = useState<AutocompleteState>({
    isOpen: false,
    query: '',
    position: { top: 0, left: 0 },
    selectedIndex: 0,
  });

  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fetch agents for the current group
  const { data: groupAgents } = useSWR<{ agents: Array<AiAgent & { localEnabled: boolean }> }>(
    groupId ? `/api/groups/${groupId}/agents` : null,
    fetcher
  );

  const agents = groupAgents?.agents || [];

  // Parse @mentions from input
  useEffect(() => {
    if (!textareaRef.current || !groupId) {
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
    
    // Check if query contains spaces (invalid mention)
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
    
    // Rough calculation for position
    const top = rect.top + (currentLineIndex * lineHeight) + 25;
    const left = rect.left + (currentLineText.length * 8); // Approximate char width
    
    setState({
      isOpen: true,
      query: query.toLowerCase(),
      position: { top, left },
      selectedIndex: 0,
    });
  }, [input, textareaRef, groupId]);

  // Filter agents based on query
  const filteredAgents = agents.filter(agent => 
    agent.key.toLowerCase().includes(state.query) ||
    agent.displayName.toLowerCase().includes(state.query)
  ).slice(0, 5); // Limit to 5 results

  // Handle keyboard navigation
  useEffect(() => {
    if (!state.isOpen) return;

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
  }, [state.isOpen, state.selectedIndex, filteredAgents, onMentionSelect]);

  // Close on click outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isOpen]);

  if (!state.isOpen || !groupId || filteredAgents.length === 0) {
    return null;
  }

  return (
    <div
      ref={autocompleteRef}
      className="fixed z-50 bg-background border border-border rounded-md shadow-lg max-w-xs"
      style={{
        top: state.position.top,
        left: state.position.left,
      }}
    >
      <div className="p-2">
        <div className="text-xs text-muted-foreground mb-2">Mention agents:</div>
        {filteredAgents.map((agent, index) => (
          <div
            key={agent.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
              index === state.selectedIndex 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-muted'
            }`}
            onClick={() => {
              onMentionSelect(agent.key);
              setState(prev => ({ ...prev, isOpen: false }));
            }}
          >
            <div 
                                className="size-3 rounded-full border"
              style={{ backgroundColor: agent.color || '#3B82F6' }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">@{agent.key}</span>
              <span className="text-xs text-muted-foreground truncate">
                {agent.displayName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
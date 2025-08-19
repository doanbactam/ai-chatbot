'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { AiAgent } from '@/lib/db/schema';
import { X } from 'lucide-react';

interface AgentMentionAutocompleteProps {
  groupId?: string;
  input: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onMentionSelect: (mention: string) => void;
  onInvalidMention?: (mention: string, reason: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
}

interface MentionTag {
  id: string;
  agentKey: string;
  displayName: string;
  color: string;
  startIndex: number;
  endIndex: number;
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

  const [mentionTags, setMentionTags] = useState<MentionTag[]>([]);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fetch agents for the current group
  const { data: groupAgents } = useSWR<{ agents: Array<AiAgent & { localEnabled: boolean }> }>(
    groupId ? `/api/groups/${groupId}/agents` : null,
    fetcher
  );

  const agents = useMemo(() => groupAgents?.agents || [], [groupAgents?.agents]);

  // Parse and validate @mentions from input
  const parseMentions = useCallback((text: string): MentionTag[] => {
    const mentions: MentionTag[] = [];
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    let match: RegExpExecArray | null = null;

    while (true) {
      match = mentionRegex.exec(text);
      if (match === null) break;
      
      const agentKey = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      
      // Find agent by key
      const agent = agents.find(a => a.key === agentKey);
      
      if (agent?.localEnabled && agent.isEnabled) {
        mentions.push({
          id: `${startIndex}-${endIndex}`,
          agentKey: agent.key,
          displayName: agent.displayName,
          color: agent.color || '#3B82F6',
          startIndex,
          endIndex,
        });
      } else {
        // Log invalid mention
        const reason = !agent ? 'Agent not found' : 
                     !agent.localEnabled ? 'Agent not enabled in group' : 
                     !agent.isEnabled ? 'Agent globally disabled' : 'Unknown error';
        
        console.warn(`Invalid mention @${agentKey}: ${reason}`);
        onInvalidMention?.(agentKey, reason);
      }
    }

    return mentions;
  }, [agents, onInvalidMention]);

  // Update mention tags when input changes
  useEffect(() => {
    if (groupId) {
      const newMentionTags = parseMentions(input);
      setMentionTags(newMentionTags);
    }
  }, [input, groupId, parseMentions]);

  // Parse @mentions from input for autocomplete
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
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && charBeforeAt !== '@') {
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
    
    // Calculate character position in current line
    const charPosition = currentLineText.length;
    
    // Rough calculation for position
    const top = rect.top + (currentLineIndex * lineHeight) + 25;
    const left = rect.left + Math.min(charPosition * 8, rect.width - 200); // Approximate char width, max 200px from right
    
    setState({
      isOpen: true,
      query: query.toLowerCase(),
      position: { top, left },
      selectedIndex: 0,
    });
  }, [input, textareaRef, groupId]);

  // Filter agents based on query
  const filteredAgents = agents
    .filter(agent => 
      agent.localEnabled && 
      agent.isEnabled &&
      (agent.key.toLowerCase().includes(state.query) ||
       agent.displayName.toLowerCase().includes(state.query))
    )
    .slice(0, 5); // Limit to 5 results

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

  // Remove mention tag
  const removeMentionTag = useCallback((tagId: string) => {
    const tag = mentionTags.find(t => t.id === tagId);
    if (!tag || !textareaRef.current) return;

    const newText = input.substring(0, tag.startIndex) + input.substring(tag.endIndex);
    // Trigger input change through the parent component
    const event = new Event('input', { bubbles: true });
    textareaRef.current.value = newText;
    textareaRef.current.dispatchEvent(event);
  }, [mentionTags, input, textareaRef]);

  if (!groupId) {
    return null;
  }

  return (
    <>
      {/* Mention Tags Display */}
      {mentionTags.length > 0 && (
        <div className="absolute top-0 inset-x-0 p-2 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex flex-wrap gap-2">
            {mentionTags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-2 py-1 bg-accent rounded-md text-sm"
              >
                <div 
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium">@{tag.agentKey}</span>
                <button
                  type="button"
                  onClick={() => removeMentionTag(tag.id)}
                  className="ml-1 hover:bg-accent-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove mention of ${tag.agentKey}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {state.isOpen && filteredAgents.length > 0 && (
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
              <button
                key={agent.id}
                type="button"
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  index === state.selectedIndex 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  onMentionSelect(agent.key);
                  setState(prev => ({ ...prev, isOpen: false }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onMentionSelect(agent.key);
                    setState(prev => ({ ...prev, isOpen: false }));
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="size-3 rounded-full border border-border"
                    style={{ backgroundColor: agent.color || '#3B82F6' }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">@{agent.key}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {agent.displayName}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
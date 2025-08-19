# @Mention Features for AI Agents

## Overview

The @mention system provides intelligent autocomplete functionality for mentioning AI agents within chat conversations. It includes visual tags, validation, and comprehensive error handling to ensure a smooth user experience.

## Features

### 🚀 Core Functionality
- **Automatic Trigger**: Type `@` to open agent autocomplete
- **Smart Filtering**: Search by agent key or display name
- **Visual Tags**: Display selected mentions above input with remove options
- **Validation**: Ensures only enabled agents can be mentioned
- **Keyboard Navigation**: Full keyboard support for accessibility

### 🎯 User Experience
- **Intuitive Interface**: Clean dropdown with agent information
- **Real-time Feedback**: Immediate visual confirmation of mentions
- **Easy Removal**: Click X button to remove unwanted mentions
- **Responsive Design**: Adapts to different screen sizes and input positions

### 🛡️ Validation & Error Handling
- **Format Validation**: Ensures proper @mention syntax
- **Agent Existence**: Verifies mentioned agents exist
- **Status Checking**: Only allows mentions of enabled agents
- **Error Logging**: Comprehensive logging for debugging
- **User Feedback**: Clear indication of invalid mentions

## Usage

### Basic @Mention
1. Type `@` in the chat input
2. Autocomplete dropdown appears with available agents
3. Use arrow keys to navigate
4. Press Enter/Tab to select or Esc to cancel
5. Selected agent appears as a visual tag above input

### Keyboard Shortcuts
- **@**: Open autocomplete
- **↑/↓**: Navigate through agents
- **Enter/Tab**: Select agent
- **Esc**: Close dropdown
- **Shift+Enter**: New line (bypasses mention selection)

### Visual Tags
- Tags appear above the input field
- Each tag shows agent color, key, and remove button
- Click X to remove individual mentions
- Tags update in real-time as you type

## Implementation Details

### Component Structure
```
AgentMentionAutocomplete
├── Mention Tags Display
│   ├── Agent Color Indicator
│   ├── Agent Key (@username)
│   └── Remove Button (X)
└── Autocomplete Dropdown
    ├── Search Results
    ├── Keyboard Navigation
    └── Selection Handling
```

### Data Flow
1. **Input Detection**: Monitors textarea for `@` character
2. **Query Parsing**: Extracts search term after `@`
3. **Agent Fetching**: Retrieves enabled agents from current group
4. **Filtering**: Matches query against agent keys and names
5. **Selection**: Handles user choice and updates input
6. **Validation**: Parses final text for valid mentions
7. **Tag Display**: Shows visual representation of mentions

### API Integration
- **Endpoint**: `/api/groups/[id]/agents`
- **Data Structure**: `AiAgent & { localEnabled: boolean }`
- **Filtering**: Only agents with `localEnabled: true` and `isEnabled: true`
- **Caching**: Uses SWR for efficient data fetching

## Validation Rules

### Valid @Mention Format
- Must start with `@` character
- Followed by alphanumeric characters, hyphens, or underscores
- No spaces or special characters allowed
- Must be followed by whitespace or end of line

### Agent Requirements
- Agent must exist in the system
- Agent must be enabled globally (`isEnabled: true`)
- Agent must be enabled in current group (`localEnabled: true`)
- Agent must have valid key and display name

### Error Cases
- **Agent Not Found**: Mentioned agent doesn't exist
- **Agent Disabled**: Agent is globally disabled
- **Group Disabled**: Agent not enabled in current group
- **Invalid Format**: Malformed mention syntax

## Debugging

### Console Logging
The system provides comprehensive logging for development:

```javascript
// Valid mention
console.log('Valid mention added:', agentKey);

// Invalid mention
console.warn('Invalid mention @agentKey: reason');

// Autocomplete events
console.log('Autocomplete opened/closed');
console.log('Agent selected:', agentKey);
```

### Common Issues

#### Autocomplete Not Opening
- Check if `groupId` is provided
- Verify textarea ref is properly connected
- Ensure `@` character is typed correctly
- Check browser console for errors

#### Agents Not Loading
- Verify API endpoint is accessible
- Check authentication status
- Ensure group exists and user has access
- Verify database connection

#### Validation Errors
- Check agent status in database
- Verify group-agent relationships
- Ensure proper data structure
- Review validation logic

### Testing
Use the `/test-mention` page to:
- Test autocomplete functionality
- Verify validation rules
- Check error handling
- Test keyboard navigation
- Validate visual tag display

## Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://...

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Component Props
```typescript
interface AgentMentionAutocompleteProps {
  groupId?: string;                    // Current group ID
  input: string;                       // Input text content
  textareaRef: React.RefObject<HTMLTextAreaElement>; // Textarea reference
  onMentionSelect: (mention: string) => void;        // Selection callback
  onInvalidMention?: (mention: string, reason: string) => void; // Error callback
}
```

### Styling Customization
The component uses Tailwind CSS classes that can be customized:
- **Background**: `bg-background`, `bg-accent`
- **Borders**: `border-border`, `border-accent`
- **Text**: `text-foreground`, `text-muted-foreground`
- **Spacing**: `p-2`, `gap-2`, `mb-2`

## Performance Considerations

### Optimization Strategies
- **Debounced Input**: Prevents excessive API calls
- **Result Limiting**: Maximum 5 agents in dropdown
- **Efficient Filtering**: Client-side filtering for small datasets
- **Memoization**: Prevents unnecessary re-renders

### Memory Management
- **Cleanup**: Proper event listener removal
- **State Management**: Minimal state updates
- **Ref Management**: Efficient DOM manipulation

## Security

### Input Sanitization
- **XSS Prevention**: Safe string interpolation
- **SQL Injection**: Parameterized queries
- **Access Control**: User authentication required
- **Data Validation**: Server-side validation

### Access Control
- **Group Membership**: Users can only mention agents in their groups
- **Agent Permissions**: Respects agent enable/disable settings
- **User Authentication**: Requires valid session

## Future Enhancements

### Planned Features
- **Mention History**: Remember frequently mentioned agents
- **Smart Suggestions**: AI-powered agent recommendations
- **Bulk Operations**: Mention multiple agents at once
- **Rich Formatting**: Enhanced mention display options

### Integration Opportunities
- **Slack/Discord**: Export mention format
- **Email Integration**: Convert mentions to email addresses
- **API Webhooks**: Notify mentioned agents
- **Analytics**: Track mention patterns and usage

## Troubleshooting

### Quick Fixes
1. **Refresh Page**: Clear any stale state
2. **Check Console**: Look for error messages
3. **Verify Group**: Ensure you're in the correct group
4. **Clear Cache**: Hard refresh (Ctrl+F5)

### Support
For technical issues:
1. Check this documentation
2. Review console logs
3. Test with `/test-mention` page
4. Contact development team

---

*Last updated: December 2024*
*Version: 1.0.0*
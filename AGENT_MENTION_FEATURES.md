# Agent Mention Features

## Overview
Tính năng mention agents trong group hoạt động giống như tag system của Meta AI, với autocomplete thông minh và validation.

## Tính năng chính

### 1. Autocomplete Agents
- Gõ `@` để kích hoạt autocomplete
- Hiển thị danh sách agents trong group hiện tại
- Chỉ hiển thị agents được enable (`localEnabled: true`)
- Hỗ trợ tìm kiếm theo `key` hoặc `displayName`

### 2. Validation & Error Handling
- **Tag sai → bỏ qua có log cảnh báo để dev dễ debug**
- Kiểm tra format mention (phải bắt đầu bằng space hoặc newline)
- Kiểm tra agent có tồn tại trong group không
- Kiểm tra agent có được enable trong group không
- Log chi tiết vào console với context để debug

### 3. UI/UX giống Meta AI
- Dropdown autocomplete với design hiện đại
- Hiển thị agent tags đã được mention
- Hỗ trợ remove mention bằng click
- Responsive và accessible

## Cách sử dụng

### Trong input
```typescript
// Gõ @ để kích hoạt autocomplete
// Chọn agent từ dropdown
// Hoặc gõ trực tiếp @agentKey
```

### Keyboard Navigation
- `↑/↓`: Di chuyển trong danh sách
- `Enter/Tab`: Chọn agent
- `Escape`: Đóng dropdown

### Remove Mention
- Hover vào tag để hiện nút remove
- Click nút X để xóa mention

## API Endpoints

### GET `/api/groups/[id]/agents`
Lấy danh sách agents trong group:
```typescript
{
  agents: Array<{
    id: string;
    key: string;
    displayName: string;
    role: string;
    color: string;
    localEnabled: boolean;
  }>
}
```

## Error Logging

### Console Warnings
```typescript
[AgentMentionAutocomplete] Invalid mention detected: {
  mention: "@invalidAgent",
  reason: "Agent '@invalidAgent' not found in group",
  position: { start: 10, end: 22 },
  input: "Hello @invalidAgent how are you"
}
```

### Callback Handling
```typescript
onInvalidMention: (invalidMention: string, reason: string) => {
  // Handle invalid mentions
  console.warn(`Invalid mention: ${invalidMention} - ${reason}`);
}
```

## Components

### AgentMentionAutocomplete
Component chính xử lý autocomplete và validation.

### AgentMentionTags
Component hiển thị các mentions đã được tag.

## Validation Rules

1. **Format**: Mention phải bắt đầu bằng `@` và theo sau là `[a-zA-Z0-9_-]+`
2. **Context**: Phải đứng sau space/newline hoặc ở đầu text
3. **Existence**: Agent phải tồn tại trong group
4. **Status**: Agent phải được enable (`localEnabled: true`)

## Debugging

### Enable Debug Logs
```typescript
// Tất cả invalid mentions sẽ được log vào console
// Bao gồm context và vị trí trong input
```

### Common Issues
1. **Agent not found**: Kiểm tra `groupId` và agent `key`
2. **Agent disabled**: Kiểm tra `localEnabled` status
3. **Invalid format**: Kiểm tra spacing và special characters

## Future Enhancements

- [ ] Support for agent aliases
- [ ] Mention suggestions based on context
- [ ] Bulk mention operations
- [ ] Mention history and favorites
- [ ] Custom mention validation rules
interface HighlightedTextProps {
  text: string;
  searchQuery?: string;
  className?: string;
}

export function HighlightedText({ text, searchQuery, className }: HighlightedTextProps) {
  if (!searchQuery || !searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}



interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Split content by newlines to process structure
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentListType: 'ul' | 'ol' | null = null;
  let currentList: React.ReactNode[] = [];
  
  // Helper to process inline formatting like **bold** and [links](url)
  const processInline = (text: string) => {
    // 1. Split by links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // Push preceding text
        if (match.index > lastIndex) {
            parts.push(processBold(text.substring(lastIndex, match.index)));
        }
        // Push link
        parts.push(
            <a 
                key={`link-${match.index}`} 
                href={match[2]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:underline dark:text-green-400 font-medium"
            >
                {match[1]}
            </a>
        );
        lastIndex = linkRegex.lastIndex;
    }
    // Push remaining text
    if (lastIndex < text.length) {
        parts.push(processBold(text.substring(lastIndex)));
    }
    return parts.length > 0 ? parts : processBold(text);
  };

  const processBold = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
         return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  const flushList = (index: number) => {
      if (currentList.length > 0) {
          if (currentListType === 'ol') {
            elements.push(<ol key={`ol-${index}`} className="mb-3 ml-4 space-y-1 list-decimal marker:text-neutral-500">{currentList}</ol>);
          } else {
            elements.push(<ul key={`ul-${index}`} className="mb-3 ml-4 space-y-1 list-disc marker:text-neutral-400">{currentList}</ul>);
          }
          currentList = [];
          currentListType = null;
      }
  };

  lines.forEach((line, index) => {
     const trimmed = line.trim();
     
     // Detect Unordered List Items (starting with - or *)
     if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentListType === 'ol') flushList(index); // Switch type if needed
        currentListType = 'ul';
        
        const itemContent = trimmed.substring(2);
        currentList.push(
            <li key={`li-${index}`} className="pl-1">
                {processInline(itemContent)}
            </li>
        );
     } 
     // Detect Ordered List Items (starting with 1. 2. etc)
     else if (/^\d+\.\s/.test(trimmed)) {
        if (currentListType === 'ul') flushList(index); // Switch type if needed
        currentListType = 'ol';
        
        const firstSpaceIndex = trimmed.indexOf(' ');
        const itemContent = trimmed.substring(firstSpaceIndex + 1);
        currentList.push(
            <li key={`li-${index}`} className="pl-1">
                {processInline(itemContent)}
            </li>
        );
     }
     else {
        // Not a list item, flush any pending list
        flushList(index);
        
        // Handle Headers
        if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={`h3-${index}`} className="text-lg font-bold mt-4 mb-2 text-neutral-800 dark:text-neutral-100">{processInline(trimmed.substring(4))}</h3>);
        } else if (trimmed.startsWith('## ')) {
             elements.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-5 mb-3 text-neutral-900 dark:text-white">{processInline(trimmed.substring(3))}</h2>);
        }
        // Handle standard paragraphs
        else if (trimmed === '') {
             elements.push(<div key={`br-${index}`} className="h-2"></div>);
        } else {
             elements.push(<p key={`p-${index}`} className="mb-2 last:mb-0">{processInline(line)}</p>);
        }
     }
  });
  
  // Flush any remaining list at the end
  flushList(lines.length);

  return <div className={`text-sm md:text-base leading-relaxed ${className}`}>{elements}</div>;
};

export default MarkdownRenderer;

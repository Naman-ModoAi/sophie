'use client';

import ReactMarkdown from 'react-markdown';

export interface MarkdownCardProps {
  content: string;
  className?: string;
}

export function MarkdownCard({ content, className = '' }: MarkdownCardProps) {
  return (
    <div className={`p-4 bg-surface rounded-lg border border-text/10 ${className}`}>
      <div className="prose prose-sm max-w-none prose-headings:text-text prose-p:text-text/80 prose-strong:text-text prose-a:text-accent prose-li:text-text/80">
        <ReactMarkdown
          components={{
            // Customize heading styles - all using small font size
            h1: ({ children }) => <h1 className="text-sm font-bold mb-2 text-text">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-text">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-medium mb-2 text-text">{children}</h3>,
            // Customize paragraph - same size as email text
            p: ({ children }) => <p className="mb-2 text-sm text-text/80 leading-relaxed">{children}</p>,
            // Customize lists - same size
            ul: ({ children }) => <ul className="mb-2 ml-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 ml-4 space-y-1 list-decimal">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-text/80">{children}</li>,
            // Customize links
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                {children}
              </a>
            ),
            // Customize strong/bold
            strong: ({ children }) => <strong className="text-sm font-semibold text-text">{children}</strong>,
            // Customize code
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 bg-text/5 rounded text-xs font-mono text-text">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

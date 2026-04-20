'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { clearMessages } from './actions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// ─── Suggested starters ───────────────────────────────────────────────────────

const STARTERS = [
  "What's the strongest energy available to me right now?",
  "I'm feeling scattered — what does the chart say about focus?",
  "Should I prioritize Allora or OOC this month?",
  "What pattern am I falling into that I need to see?",
  "How do I use this transit to move toward my North Node?",
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted/50 animate-pulse"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-4 py-3 rounded-sm text-sm text-primary bg-card border border-border">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div className="space-y-1 max-w-[92%]">
      <p className="text-[10px] font-sans text-muted uppercase tracking-widest px-0.5">Astro</p>
      {content ? (
        <div className="text-sm text-body leading-relaxed whitespace-pre-wrap px-0.5">
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-3.5 bg-muted/60 ml-0.5 align-middle animate-pulse" />
          )}
        </div>
      ) : (
        <TypingIndicator />
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AskClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages]           = useState<Message[]>(initialMessages);
  const [input, setInput]                 = useState('');
  const [streaming, setStreaming]         = useState(false);
  const [clearPending, startClearTx]     = useTransition();
  const bottomRef                         = useRef<HTMLDivElement>(null);
  const textareaRef                       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || streaming) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: 'Connection error — please try again.' },
        ]);
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: snapshot },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Network error — please try again.' },
      ]);
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClear() {
    if (!confirm('Clear all messages?')) return;
    startClearTx(async () => {
      await clearMessages();
      setMessages([]);
    });
  }

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 14rem)' }}>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
        {isEmpty ? (
          <div className="space-y-5 pt-2">
            <p className="text-muted text-sm">Start a conversation, or choose a prompt below.</p>
            <div className="space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="block w-full text-left text-sm px-4 py-3 rounded-sm border border-border text-body hover:text-primary hover:border-border/60 hover:bg-card transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserBubble key={i} content={msg.content} />
            ) : (
              <AssistantBubble
                key={i}
                content={msg.content}
                isStreaming={streaming && i === messages.length - 1}
              />
            ),
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border pt-4 space-y-2 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your chart, transits, decisions… (Enter to send)"
            disabled={streaming}
            className="flex-1 bg-bg border border-border rounded-sm px-3 py-2.5 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-muted resize-none disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="text-xs font-sans px-4 py-2.5 rounded-sm text-bg transition-colors disabled:opacity-40 self-end"
            style={{ backgroundColor: '#C4956A' }}
          >
            Send
          </button>
        </div>

        {messages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              disabled={clearPending}
              className="text-[10px] font-sans text-muted/40 hover:text-muted transition-colors"
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

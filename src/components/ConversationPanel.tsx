import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { FeedbackButtons } from "./FeedbackButtons";
import { ClearChatButton } from "./ClearChatButton";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  feedback?: number;
}

interface ConversationPanelProps {
  messages: Message[];
  isVisible: boolean;
  onFeedback?: (messageId: string, feedback: number) => void;
  onClear?: () => void;
}

export const ConversationPanel = ({ 
  messages, 
  isVisible, 
  onFeedback,
  onClear 
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible || messages.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto",
        "glass rounded-2xl p-4",
        "animate-slide-up"
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Conversation
          </span>
        </div>
        {onClear && <ClearChatButton onClear={onClear} />}
      </div>

      <div
        ref={scrollRef}
        className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
      >
        {messages.map((message) => (
          <div key={message.id} className="group">
            <MessageBubble
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
            {message.role === 'assistant' && onFeedback && !message.feedback && (
              <div className="flex justify-end mt-1">
                <FeedbackButtons 
                  messageId={message.id} 
                  onFeedback={onFeedback} 
                />
              </div>
            )}
            {message.feedback && (
              <div className="flex justify-end mt-1">
                <span className="text-xs text-muted-foreground">
                  {message.feedback === 1 ? '👍 Helpful' : '👎 Not helpful'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

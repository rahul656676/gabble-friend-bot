import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  messages: Message[];
  isVisible: boolean;
}

export const ConversationPanel = ({ messages, isVisible }: ConversationPanelProps) => {
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
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">
          Conversation
        </span>
      </div>

      <div
        ref={scrollRef}
        className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  );
};

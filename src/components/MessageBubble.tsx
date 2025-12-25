import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export const MessageBubble = ({ role, content, timestamp }: MessageBubbleProps) => {
  const isUser = role === "user";

  // Clean content - remove citation markers like [1], [4], [1][4]
  const cleanContent = content.replace(/\[\d+\]/g, '');

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3",
          "transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{cleanContent}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-2",
              isUser ? "text-primary-foreground/60" : "text-muted-foreground"
            )}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface TextInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export const TextInput = ({ onSend, disabled, placeholder = "Type your message..." }: TextInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSend(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative glass rounded-2xl p-2 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent border-none outline-none",
            "text-foreground placeholder:text-muted-foreground",
            "px-4 py-3 text-sm",
            "focus:ring-0",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

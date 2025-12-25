import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  messageId: string;
  onFeedback: (messageId: string, feedback: number) => void;
}

export const FeedbackButtons = ({ messageId, onFeedback }: FeedbackButtonsProps) => {
  const [feedback, setFeedback] = useState<number | null>(null);

  const handleFeedback = (value: number) => {
    setFeedback(value);
    onFeedback(messageId, value);
  };

  if (feedback !== null) {
    return (
      <span className="text-xs text-muted-foreground ml-2">
        {feedback === 1 ? 'Thanks!' : 'Thanks for feedback'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 hover:text-green-500 hover:bg-green-500/10",
        )}
        onClick={() => handleFeedback(1)}
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 hover:text-red-500 hover:bg-red-500/10",
        )}
        onClick={() => handleFeedback(-1)}
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>
    </div>
  );
};

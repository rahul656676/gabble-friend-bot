import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="text-xs text-muted-foreground mr-1">Was this helpful?</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:text-green-500 hover:bg-green-500/10"
        onClick={() => handleFeedback(1)}
        title="Helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:text-red-500 hover:bg-red-500/10"
        onClick={() => handleFeedback(-1)}
        title="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

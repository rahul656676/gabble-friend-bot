import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Clock, 
  Newspaper, 
  Cloud, 
  Calculator, 
  Lightbulb,
  Heart,
  Laugh
} from 'lucide-react';

interface QuickRepliesProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const quickReplies = [
  { icon: HelpCircle, label: 'Help me with...', message: 'What can you help me with?' },
  { icon: Clock, label: "What's the time?", message: "What's the current time?" },
  { icon: Newspaper, label: 'Latest news', message: "What's happening in the news today?" },
  { icon: Cloud, label: 'Weather', message: "What's the weather like today?" },
  { icon: Calculator, label: 'Calculate', message: 'Can you help me calculate something?' },
  { icon: Lightbulb, label: 'Fun fact', message: 'Tell me an interesting fact' },
  { icon: Heart, label: 'Motivation', message: 'Give me some motivation for today' },
  { icon: Laugh, label: 'Tell a joke', message: 'Tell me a funny joke' },
];

export const QuickReplies = ({ onSelect, disabled }: QuickRepliesProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-center gap-2">
        {quickReplies.map((reply) => (
          <Button
            key={reply.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect(reply.message)}
            disabled={disabled}
            className="glass hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group"
          >
            <reply.icon className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            {reply.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

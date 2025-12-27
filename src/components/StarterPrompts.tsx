import { MessageCircle, Heart, Sparkles, Coffee, Brain } from 'lucide-react';

interface StarterPromptsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const prompts = [
  {
    icon: MessageCircle,
    text: "Say hi 👋",
    message: "Hi! I'd love to chat with you.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Heart,
    text: "I feel lonely",
    message: "I'm feeling a bit lonely today and could use someone to talk to.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Sparkles,
    text: "Motivate me",
    message: "I need some motivation. Can you help lift my spirits?",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Coffee,
    text: "Just chat",
    message: "Let's just have a casual conversation about anything.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Brain,
    text: "I'm stressed",
    message: "I'm feeling stressed and overwhelmed. Can you help me calm down?",
    color: "from-purple-500 to-violet-500"
  }
];

export const StarterPrompts = ({ onSelect, disabled }: StarterPromptsProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <p className="text-center text-muted-foreground mb-4 text-sm">
        Not sure what to say? Try one of these:
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => onSelect(prompt.message)}
            disabled={disabled}
            className={`
              group flex items-center gap-2 px-4 py-2.5 rounded-full
              glass border border-border/50
              hover:border-primary/50 hover:bg-primary/10
              transition-all duration-300 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105 active:scale-95
            `}
          >
            <div className={`
              p-1.5 rounded-full bg-gradient-to-r ${prompt.color}
              group-hover:shadow-lg group-hover:shadow-primary/20
              transition-shadow duration-300
            `}>
              <prompt.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground/90">
              {prompt.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
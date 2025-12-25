import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClearChatButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

export const ClearChatButton = ({ onClear, disabled }: ClearChatButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClear}
      disabled={disabled}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Clear Chat
    </Button>
  );
};

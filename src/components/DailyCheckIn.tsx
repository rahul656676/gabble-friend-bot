import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Cloud, CloudRain, Zap, Heart } from 'lucide-react';

interface DailyCheckInProps {
  onMoodSelect: (mood: string) => void;
  disabled?: boolean;
}

const moods = [
  { id: 'great', label: 'Great!', icon: Sun, color: 'text-yellow-500', message: "I'm feeling great today!" },
  { id: 'good', label: 'Good', icon: Heart, color: 'text-pink-500', message: "I'm feeling good today" },
  { id: 'okay', label: 'Okay', icon: Cloud, color: 'text-blue-400', message: "I'm feeling okay, nothing special" },
  { id: 'stressed', label: 'Stressed', icon: Zap, color: 'text-orange-500', message: "I'm feeling stressed today" },
  { id: 'sad', label: 'Sad', icon: CloudRain, color: 'text-slate-500', message: "I'm feeling a bit sad today" },
];

export const DailyCheckIn = ({ onMoodSelect, disabled }: DailyCheckInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    // Check if user has done check-in today
    const lastCheckIn = localStorage.getItem('gabble_last_checkin');
    const today = new Date().toDateString();
    
    if (lastCheckIn !== today) {
      setIsVisible(true);
    } else {
      setHasCheckedIn(true);
    }
  }, []);

  const handleMoodSelect = (mood: typeof moods[0]) => {
    // Save check-in date
    localStorage.setItem('gabble_last_checkin', new Date().toDateString());
    localStorage.setItem('gabble_last_mood', mood.id);
    
    setHasCheckedIn(true);
    setIsVisible(false);
    
    // Send mood as a message
    onMoodSelect(mood.message);
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  if (!isVisible || hasCheckedIn) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-8 animate-fade-in">
      <div className="glass rounded-2xl p-6 border border-border/50">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Daily Check-In
          </h3>
          <p className="text-sm text-muted-foreground">
            How are you feeling today?
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.id}
                variant="outline"
                onClick={() => handleMoodSelect(mood)}
                disabled={disabled}
                className="flex flex-col items-center gap-2 h-auto py-3 px-4 hover:bg-secondary/50 transition-all hover:scale-105"
              >
                <Icon className={`w-6 h-6 ${mood.color}`} />
                <span className="text-xs">{mood.label}</span>
              </Button>
            );
          })}
        </div>

        <button
          onClick={handleSkip}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

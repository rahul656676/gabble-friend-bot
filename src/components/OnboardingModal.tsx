import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserPreferences } from '@/hooks/useUserPreferences';
import { Volume2, Globe, User, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (prefs: Partial<UserPreferences>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

const personalities = [
  { value: 'helpful', label: 'Helpful Assistant', description: 'Friendly and informative', emoji: '🤝' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like', emoji: '💼' },
  { value: 'casual', label: 'Casual Friend', description: 'Relaxed and conversational', emoji: '😊' },
  { value: 'creative', label: 'Creative Thinker', description: 'Imaginative and expressive', emoji: '🎨' },
  { value: 'concise', label: 'Concise Expert', description: 'Brief and to the point', emoji: '⚡' },
];

const languages = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'hi-IN', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { value: 'hi-EN', label: 'Hinglish', flag: '🇮🇳', description: 'Hindi + English mix' },
  { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { value: 'es-ES', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr-FR', label: 'French', flag: '🇫🇷' },
  { value: 'de-DE', label: 'German', flag: '🇩🇪' },
  { value: 'pt-BR', label: 'Portuguese', flag: '🇧🇷' },
];

export const OnboardingModal = ({ onComplete, availableVoices }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    language: 'en-US',
    personality: 'helpful',
    voiceName: 'default',
    voiceRate: 1.0,
    voicePitch: 1.0,
  });

  const languageVoices = availableVoices.filter(
    v => v.lang.startsWith(preferences.language.split('-')[0])
  );

  const handleComplete = () => {
    onComplete(preferences);
  };

  const steps = [
    // Step 0: Welcome
    {
      title: 'Welcome!',
      subtitle: "Let's personalize your experience",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">
            Set up your AI voice assistant in just a few steps. You can always change these later in settings.
          </p>
        </div>
      ),
    },
    // Step 1: Language
    {
      title: 'Choose Your Language',
      subtitle: 'Select your preferred language for conversations',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setPreferences(p => ({ ...p, language: lang.value }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                preferences.language === lang.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="text-sm font-medium">{lang.label}</div>
              {'description' in lang && (
                <div className="text-xs text-muted-foreground mt-1">{lang.description}</div>
              )}
            </button>
          ))}
        </div>
      ),
    },
    // Step 2: Personality
    {
      title: 'Choose AI Personality',
      subtitle: 'How would you like your assistant to communicate?',
      content: (
        <div className="space-y-3">
          {personalities.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreferences(prev => ({ ...prev, personality: p.value }))}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                preferences.personality === p.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <div className="font-medium">{p.label}</div>
                  <div className="text-sm text-muted-foreground">{p.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    // Step 3: Voice Settings
    {
      title: 'Voice Settings',
      subtitle: 'Customize how the AI sounds',
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              Voice
            </Label>
            <Select
              value={preferences.voiceName}
              onValueChange={(value) => setPreferences(p => ({ ...p, voiceName: value }))}
            >
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {languageVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-muted-foreground">
              Speed: {preferences.voiceRate.toFixed(1)}x
            </Label>
            <Slider
              value={[preferences.voiceRate]}
              onValueChange={([value]) => setPreferences(p => ({ ...p, voiceRate: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-muted-foreground">
              Pitch: {preferences.voicePitch.toFixed(1)}
            </Label>
            <Slider
              value={[preferences.voicePitch]}
              onValueChange={([value]) => setPreferences(p => ({ ...p, voicePitch: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="py-2"
            />
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass-strong rounded-3xl p-8 animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-primary' : idx < step ? 'bg-primary/50' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gradient mb-2">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.subtitle}</p>
        </div>

        <div className="mb-8 max-h-[400px] overflow-y-auto">
          {currentStep.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="glass"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          <Button
            onClick={isLastStep ? handleComplete : () => setStep(s => s + 1)}
            className={`${isFirstStep ? 'w-full' : 'flex-1'} bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground`}
          >
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Settings, X, Volume2, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserPreferences } from '@/hooks/useUserPreferences';

interface SettingsPanelProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

const personalities = [
  { value: 'helpful', label: 'Helpful Assistant', description: 'Friendly and informative' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'casual', label: 'Casual Friend', description: 'Relaxed and conversational' },
  { value: 'creative', label: 'Creative Thinker', description: 'Imaginative and expressive' },
  { value: 'concise', label: 'Concise Expert', description: 'Brief and to the point' },
];

const languages = [
  { value: 'en-US', label: '🇺🇸 English (US)' },
  { value: 'hi-IN', label: '🇮🇳 हिंदी (Hindi)' },
  { value: 'hi-EN', label: '🇮🇳 Hinglish' },
  { value: 'en-GB', label: '🇬🇧 English (UK)' },
  { value: 'es-ES', label: '🇪🇸 Spanish' },
  { value: 'fr-FR', label: '🇫🇷 French' },
  { value: 'de-DE', label: '🇩🇪 German' },
  { value: 'pt-BR', label: '🇧🇷 Portuguese' },
];

export const SettingsPanel = ({
  preferences,
  onUpdatePreferences,
  availableVoices,
}: SettingsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const languageVoices = availableVoices.filter(
    v => v.lang.startsWith(preferences.language.split('-')[0])
  );

  return (
    <>
      {/* Settings button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 glass hover:bg-secondary/50"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Settings panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient">Settings</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => onUpdatePreferences({ language: value })}
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Volume2 className="w-4 h-4" />
                  Voice
                </Label>
                <Select
                  value={preferences.voiceName}
                  onValueChange={(value) => onUpdatePreferences({ voiceName: value })}
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

              {/* Voice Speed */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">
                  Speed: {preferences.voiceRate.toFixed(1)}x
                </Label>
                <Slider
                  value={[preferences.voiceRate]}
                  onValueChange={([value]) => onUpdatePreferences({ voiceRate: value })}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="py-2"
                />
              </div>

              {/* Voice Pitch */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">
                  Pitch: {preferences.voicePitch.toFixed(1)}
                </Label>
                <Slider
                  value={[preferences.voicePitch]}
                  onValueChange={([value]) => onUpdatePreferences({ voicePitch: value })}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="py-2"
                />
              </div>

              {/* Personality */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  Personality
                </Label>
                <Select
                  value={preferences.personality}
                  onValueChange={(value) => onUpdatePreferences({ personality: value })}
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personalities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

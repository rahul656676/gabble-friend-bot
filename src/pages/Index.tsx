import { JarvisOrb } from "@/components/JarvisOrb";
import { ConversationPanel } from "@/components/ConversationPanel";
import { FeatureCard } from "@/components/FeatureCard";
import { TextInput } from "@/components/TextInput";
import { QuickReplies } from "@/components/QuickReplies";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OnboardingModal } from "@/components/OnboardingModal";
import { StarterPrompts } from "@/components/StarterPrompts";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { Mic, Brain, Zap, Shield, Globe, Sparkles, BarChart3, Heart, Lock, AlertCircle, Cpu } from "lucide-react";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const {
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    hasStarted,
    speechSupported,
    handleOrbClick,
    handleStopSpeaking,
    sendTextMessage,
    giveFeedback,
    clearChat,
    preferences,
    updatePreferences,
    availableVoices,
    prefsLoading,
    hasCompletedOnboarding,
  } = useVoiceAgent();

  const features = [
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Advanced sentiment analysis responds with empathy to your emotional state.",
    },
    {
      icon: Mic,
      title: "Voice Synthesis",
      description: "Neural voice processing with human-like speech patterns and intonation.",
    },
    {
      icon: Brain,
      title: "Memory Core",
      description: "Persistent context awareness for personalized, meaningful interactions.",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Sub-second response latency for seamless conversational flow.",
    },
    {
      icon: Shield,
      title: "Encrypted Protocol",
      description: "Military-grade encryption. Zero data retention. Complete privacy.",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Auto-detects and responds in Hindi, English, Hinglish, and more.",
    },
  ];

  // Show loading while checking preferences
  if (prefsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-jarvis border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-jarvis/30 rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden scan-lines">
      {/* Onboarding Modal */}
      {!hasCompletedOnboarding && (
        <OnboardingModal
          onComplete={updatePreferences}
          availableVoices={availableVoices}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        availableVoices={availableVoices}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/analytics')}
        className="fixed top-4 right-16 z-50 glass hover:bg-jarvis/10 border-jarvis/30"
      >
        <BarChart3 className="w-5 h-5 text-jarvis" />
      </Button>

      {/* Holographic grid background */}
      <div className="absolute inset-0 bg-holo-grid" />
      
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-jarvis/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-jarvis/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-jarvis-light/5 rounded-full blur-3xl" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-jarvis/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-jarvis/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-jarvis/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-jarvis/30" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border-jarvis/40 mb-8 animate-fade-in hover:scale-105 transition-transform duration-300 hover:shadow-jarvis-glow">
            <Cpu className="w-4 h-4 text-jarvis animate-pulse" />
            <span className="text-sm font-mono tracking-widest text-jarvis uppercase">
              Super Agent Online
            </span>
            <div className="w-2 h-2 rounded-full bg-jarvis animate-pulse shadow-[0_0_10px_hsl(var(--jarvis))]" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-wider animate-slide-up">
            <span className="text-gradient text-jarvis-glow animate-pulse">HACKX</span>{" "}
            <span className="text-foreground">TEAM AGENT</span>
          </h1>
          
          {/* Clear value proposition */}
          <p className="text-xl md:text-2xl text-jarvis/90 max-w-2xl mx-auto mb-4 font-medium tracking-wide animate-fade-in">
            Your AI-Powered Super Agent for Emotional Support
          </p>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 font-light animate-fade-in">
            Advanced neural network with emotional intelligence. 
            Speak naturally. Get understood. Feel supported.
          </p>

          {/* Animated line decoration */}
          <div className="flex justify-center items-center gap-4 animate-fade-in">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-jarvis to-transparent animate-pulse" />
            <Sparkles className="w-6 h-6 text-jarvis animate-float drop-shadow-[0_0_15px_hsl(var(--jarvis))]" />
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-jarvis to-transparent animate-pulse" />
          </div>
        </header>

        {/* Voice orb section */}
        <section className="flex flex-col items-center justify-center mb-12">
          <div className="mb-16 animate-scale-in">
            <JarvisOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onClick={handleOrbClick}
              onStopSpeaking={handleStopSpeaking}
              speechSupported={speechSupported}
            />
          </div>

          {/* Daily Check-in - show before first interaction */}
          {!hasStarted && (
            <div className="animate-fade-in [animation-delay:0.5s] opacity-0 [animation-fill-mode:forwards]">
              <DailyCheckIn 
                onMoodSelect={(msg) => sendTextMessage(msg, true)} 
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Starter prompts - show before first interaction */}
          {!hasStarted && (
            <div className="w-full mb-8 animate-fade-in [animation-delay:0.7s] opacity-0 [animation-fill-mode:forwards]">
              <StarterPrompts 
                onSelect={(msg) => sendTextMessage(msg, true)} 
                disabled={isProcessing}
              />
            </div>
          )}

          <ConversationPanel 
            messages={messages} 
            isVisible={messages.length > 0}
            onFeedback={giveFeedback}
            onClear={clearChat}
          />
          
          {/* Quick Replies */}
          {hasStarted && !isProcessing && !isSpeaking && (
            <div className="w-full mt-6 animate-fade-in">
              <QuickReplies 
                onSelect={(msg) => sendTextMessage(msg, true)} 
                disabled={isProcessing || isSpeaking}
              />
            </div>
          )}
          
          {/* Text input - always visible after first interaction */}
          {hasStarted && (
            <div className="w-full mt-6 animate-fade-in">
              <TextInput 
                onSend={sendTextMessage} 
                disabled={isProcessing || isSpeaking}
                placeholder={!speechSupported ? "Type your message..." : "Or type your message here..."}
              />
            </div>
          )}
        </section>

        {/* Features section */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-wide animate-fade-in">
              <span className="text-gradient">SYSTEM</span>{" "}
              <span className="text-foreground">CAPABILITIES</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-light animate-fade-in [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
              Powered by advanced AI architecture for human-like interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-fade-in opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 100}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Safety Footer */}
        <footer className="mt-24 border-t border-jarvis/20 pt-12 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            {/* Disclaimer */}
            <div className="glass rounded-lg p-6 mb-8 border-jarvis/30 hover:border-jarvis/50 transition-all duration-300 hover:shadow-jarvis-glow">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-2 tracking-wide">SYSTEM NOTICE</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    HackX Team Agent is an AI companion designed for casual conversation and emotional support. 
                    It is <strong className="text-foreground">not a substitute for professional mental health care</strong>. 
                    If you're experiencing a crisis, please reach out to a qualified professional.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground group hover:text-jarvis transition-colors duration-300">
                <Lock className="w-4 h-4 text-jarvis group-hover:animate-pulse" />
                <span className="font-light">Zero permanent data storage</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group hover:text-jarvis transition-colors duration-300">
                <Shield className="w-4 h-4 text-jarvis group-hover:animate-pulse" />
                <span className="font-light">End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group hover:text-jarvis transition-colors duration-300">
                <Heart className="w-4 h-4 text-jarvis group-hover:animate-pulse" />
                <span className="font-light">Built for your wellbeing</span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground font-mono tracking-wider">
              <p className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-8 bg-jarvis/30" />
                HACKX TEAM AGENT • POWERED BY ADVANCED AI
                <span className="h-[1px] w-8 bg-jarvis/30" />
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
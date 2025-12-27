import { VoiceOrb } from "@/components/VoiceOrb";
import { ConversationPanel } from "@/components/ConversationPanel";
import { FeatureCard } from "@/components/FeatureCard";
import { TextInput } from "@/components/TextInput";
import { QuickReplies } from "@/components/QuickReplies";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OnboardingModal } from "@/components/OnboardingModal";
import { StarterPrompts } from "@/components/StarterPrompts";
import { Mic, Brain, Zap, Shield, Globe, Sparkles, BarChart3, Heart, Lock, AlertCircle } from "lucide-react";
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
      title: "Emotional Support",
      description: "A companion that truly listens and responds with empathy to how you're feeling.",
    },
    {
      icon: Mic,
      title: "Natural Voice",
      description: "Speak naturally and get instant responses with human-like voice synthesis.",
    },
    {
      icon: Brain,
      title: "Remembers Context",
      description: "Keeps track of your conversation to provide personalized, meaningful responses.",
    },
    {
      icon: Zap,
      title: "Real-time",
      description: "Ultra-low latency responses for seamless, natural dialogue flow.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your conversations are encrypted and never stored or shared with third parties.",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description: "Communicate in multiple languages including Hindi and Hinglish.",
    },
  ];

  // Show loading while checking preferences
  if (prefsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
        className="fixed top-4 right-16 z-50 glass hover:bg-secondary/50"
      >
        <BarChart3 className="w-5 h-5" />
      </Button>

      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-30"
        style={{ backgroundSize: "50px 50px" }}
      />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-glow-secondary/10 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero section */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              AI Companion
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Gabble</span>{" "}
            <span className="text-foreground">Friend Bot</span>
          </h1>
          
          {/* Clear value proposition */}
          <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto mb-4 font-medium">
            Your AI companion for emotional support & meaningful conversations
          </p>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Feeling stressed, lonely, or just need someone to talk to? 
            Gabble listens, understands, and responds like a real friend.
          </p>
        </header>

        {/* Voice orb section */}
        <section className="flex flex-col items-center justify-center mb-12">
          <div className="mb-12">
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onClick={handleOrbClick}
              onStopSpeaking={handleStopSpeaking}
              speechSupported={speechSupported}
            />
          </div>

          {/* Starter prompts - show before first interaction */}
          {!hasStarted && (
            <div className="w-full mb-8">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Talk to <span className="text-gradient">Gabble</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with empathy and cutting-edge AI to be your supportive companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </section>

        {/* Trust & Safety Footer */}
        <footer className="mt-24 border-t border-border/50 pt-12">
          <div className="max-w-4xl mx-auto">
            {/* Disclaimer */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    Gabble Friend Bot is an AI companion designed for casual conversation and emotional support. 
                    It is <strong>not a substitute for professional mental health care</strong>. 
                    If you're experiencing a crisis or need professional help, please reach out to a qualified therapist or counselor.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Conversations are not stored permanently</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Your privacy is protected</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                <span>Built with care for your wellbeing</span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>Built for educational and demonstration purposes</p>
              <p className="mt-1">© 2024 Gabble Friend Bot. Powered by advanced AI technology.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
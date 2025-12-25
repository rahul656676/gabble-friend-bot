import { VoiceOrb } from "@/components/VoiceOrb";
import { ConversationPanel } from "@/components/ConversationPanel";
import { FeatureCard } from "@/components/FeatureCard";
import { TextInput } from "@/components/TextInput";
import { QuickReplies } from "@/components/QuickReplies";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Mic, Brain, Zap, Shield, Globe, Sparkles, BarChart3 } from "lucide-react";
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
      icon: Mic,
      title: "Natural Voice",
      description: "Speak naturally and get instant responses with human-like voice synthesis.",
    },
    {
      icon: Brain,
      title: "Advanced AI",
      description: "Powered by state-of-the-art language models for intelligent conversations.",
    },
    {
      icon: Zap,
      title: "Real-time",
      description: "Ultra-low latency responses for seamless, natural dialogue flow.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your conversations are encrypted and never stored or shared.",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description: "Communicate in multiple languages with accurate translations.",
    },
    {
      icon: Sparkles,
      title: "Always Learning",
      description: "Continuously improving to provide better assistance over time.",
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
              AI Voice Agent
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Talk</span> with{" "}
            <span className="text-foreground">Intelligence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience the future of conversation. Our AI voice agent understands you,
            responds naturally, and helps you accomplish more.
          </p>
        </header>

        {/* Voice orb section */}
        <section className="flex flex-col items-center justify-center mb-12">
          <div className="mb-20">
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onClick={handleOrbClick}
              onStopSpeaking={handleStopSpeaking}
              speechSupported={speechSupported}
            />
          </div>

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
              Powerful <span className="text-gradient">Capabilities</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with cutting-edge technology to deliver an exceptional voice experience.
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

        {/* Footer */}
        <footer className="mt-24 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by advanced AI technology
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

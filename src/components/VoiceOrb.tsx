import { cn } from "@/lib/utils";
import { Loader2, Keyboard, Square } from "lucide-react";

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing?: boolean;
  speechSupported?: boolean;
  onClick: () => void;
  onStopSpeaking?: () => void;
}

export const VoiceOrb = ({ 
  isListening, 
  isSpeaking, 
  isProcessing = false, 
  speechSupported = true,
  onClick,
  onStopSpeaking
}: VoiceOrbProps) => {
  const isActive = isListening || isSpeaking || isProcessing;
  const isDisabled = isProcessing;

  const handleClick = () => {
    if (isSpeaking && onStopSpeaking) {
      onStopSpeaking();
    } else {
      onClick();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings - only show when listening */}
      {isListening && (
        <>
          <div className="absolute w-64 h-64 rounded-full bg-primary/5 animate-ripple" />
          <div className="absolute w-56 h-56 rounded-full bg-primary/10 animate-ripple [animation-delay:0.5s]" />
          <div className="absolute w-48 h-48 rounded-full bg-primary/15 animate-ripple [animation-delay:1s]" />
        </>
      )}

      {/* Speaking glow rings */}
      {isSpeaking && (
        <>
          <div className="absolute w-52 h-52 rounded-full bg-glow-secondary/10 animate-pulse" />
          <div className="absolute w-48 h-48 rounded-full bg-glow-secondary/5 animate-pulse [animation-delay:0.3s]" />
        </>
      )}

      {/* Processing glow */}
      {isProcessing && (
        <div className="absolute w-48 h-48 rounded-full bg-primary/20 animate-pulse" />
      )}

      {/* Main orb container */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "relative w-40 h-40 rounded-full transition-all duration-500",
          "flex items-center justify-center",
          "bg-gradient-to-br from-primary/20 to-cyan-500/10",
          "border border-primary/30",
          !isDisabled && "hover:scale-105 active:scale-95 cursor-pointer",
          isDisabled && "cursor-not-allowed opacity-90",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-4 focus:ring-offset-background",
          isListening && "animate-pulse-glow scale-110",
          isSpeaking && "scale-105 border-glow-secondary/50",
          isProcessing && "scale-105"
        )}
      >
        {/* Inner gradient orb */}
        <div
          className={cn(
            "absolute inset-4 rounded-full",
            "opacity-80 transition-all duration-500"
          )}
          style={{
            background: isListening
              ? "conic-gradient(from 0deg, hsl(175 80% 50%), hsl(200 80% 45%), hsl(260 80% 60%), hsl(175 80% 50%))"
              : isSpeaking
              ? "conic-gradient(from 0deg, hsl(260 80% 60%), hsl(280 80% 55%), hsl(175 80% 50%), hsl(260 80% 60%))"
              : isProcessing
              ? "conic-gradient(from 0deg, hsl(45 80% 50%), hsl(30 80% 55%), hsl(175 80% 50%), hsl(45 80% 50%))"
              : "linear-gradient(135deg, hsl(175 80% 50%), hsl(200 80% 45%))",
            animation: isActive ? "orb-rotate 4s linear infinite" : "none",
          }}
        />

        {/* Core glow */}
        <div
          className={cn(
            "absolute inset-8 rounded-full",
            "bg-gradient-radial from-white/40 via-primary/30 to-transparent",
            "blur-sm"
          )}
        />

        {/* Voice bars (when speaking) */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-foreground/80 rounded-full"
                style={{
                  height: "30%",
                  animation: `voice-wave 0.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <div className="relative z-10 text-primary-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Stop icon when speaking */}
        {isSpeaking && !isProcessing && (
          <div className="relative z-10 text-primary-foreground">
            <Square className="w-8 h-8 fill-current" />
          </div>
        )}

        {/* Center icon - show mic when idle or listening */}
        {!isSpeaking && !isProcessing && (
          <div className="relative z-10 text-primary-foreground">
            {!speechSupported ? (
              <Keyboard className="w-8 h-8" />
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(isListening && "animate-pulse")}
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </div>
        )}
      </button>

      {/* Status text */}
      <div className="absolute -bottom-12 text-center">
        <p className="text-sm text-muted-foreground font-medium transition-all duration-300">
          {isProcessing
            ? "Thinking..."
            : isSpeaking
            ? "Tap to stop"
            : isListening
            ? "Listening..."
            : !speechSupported
            ? "Use text input below"
            : "Tap to speak"}
        </p>
      </div>
    </div>
  );
};

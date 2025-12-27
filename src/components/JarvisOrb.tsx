import { cn } from "@/lib/utils";
import { Loader2, Keyboard, Square } from "lucide-react";

interface JarvisOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing?: boolean;
  speechSupported?: boolean;
  onClick: () => void;
  onStopSpeaking?: () => void;
}

export const JarvisOrb = ({ 
  isListening, 
  isSpeaking, 
  isProcessing = false, 
  speechSupported = true,
  onClick,
  onStopSpeaking
}: JarvisOrbProps) => {
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
      {/* JARVIS Holographic rings */}
      <div className="absolute w-80 h-80">
        {/* Outer rotating ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full border-2 border-jarvis/30",
            isActive && "animate-spin-slow"
          )}
          style={{
            background: 'linear-gradient(45deg, transparent 40%, hsl(var(--jarvis) / 0.1) 50%, transparent 60%)'
          }}
        />
        
        {/* Middle counter-rotating ring */}
        <div 
          className={cn(
            "absolute inset-4 rounded-full border border-jarvis/40",
            isActive && "animate-spin-reverse"
          )}
        />
        
        {/* Inner ring with dashes */}
        <div 
          className={cn(
            "absolute inset-8 rounded-full",
            isActive && "animate-spin-slow"
          )}
          style={{
            border: '2px dashed hsl(var(--jarvis) / 0.5)'
          }}
        />
      </div>

      {/* Hexagonal grid overlay */}
      <div className="absolute w-72 h-72 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="hexagons" width="10" height="8.66" patternUnits="userSpaceOnUse">
            <polygon 
              points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5" 
              fill="none" 
              stroke="hsl(var(--jarvis))" 
              strokeWidth="0.3"
            />
          </pattern>
          <circle cx="50" cy="50" r="48" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Enhanced Arc reactor glow effect */}
      <div className={cn(
        "absolute w-72 h-72 rounded-full transition-all duration-500",
        "bg-gradient-radial from-jarvis/20 via-jarvis/5 to-transparent",
        isActive ? "opacity-100 scale-110" : "opacity-50"
      )} />
      <div className={cn(
        "absolute w-64 h-64 rounded-full transition-all duration-700",
        "bg-gradient-radial from-jarvis/30 via-jarvis/10 to-transparent animate-pulse",
        isActive && "shadow-[0_0_80px_20px_hsl(var(--jarvis)/0.4)]"
      )} />
      <div className={cn(
        "absolute w-56 h-56 rounded-full animate-pulse [animation-delay:0.15s]",
        "bg-gradient-radial from-jarvis/40 via-jarvis/15 to-transparent",
        isActive && "shadow-[0_0_60px_15px_hsl(var(--jarvis)/0.5)]"
      )} />
      <div className={cn(
        "absolute w-48 h-48 rounded-full animate-pulse [animation-delay:0.3s]",
        "bg-gradient-radial from-jarvis/50 via-jarvis/20 to-transparent",
        isActive && "shadow-[0_0_40px_10px_hsl(var(--jarvis)/0.6)]"
      )} />

      {/* Main orb - Arc Reactor style */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "relative w-44 h-44 rounded-full transition-all duration-500",
          "flex items-center justify-center",
          "bg-gradient-to-br from-jarvis-dark via-background to-jarvis-dark",
          "border-2 border-jarvis/50",
          !isDisabled && "hover:scale-105 active:scale-95 cursor-pointer",
          isDisabled && "cursor-not-allowed opacity-90",
          "focus:outline-none focus:ring-2 focus:ring-jarvis/50 focus:ring-offset-4 focus:ring-offset-background",
          isActive && "shadow-[0_0_100px_30px_hsl(var(--jarvis)/0.5),inset_0_0_30px_hsl(var(--jarvis)/0.3)]"
        )}
      >
        {/* Arc reactor triangular segments */}
        <div className="absolute inset-4">
          <svg viewBox="0 0 100 100" className={cn("w-full h-full", isActive && "animate-spin-slow")}>
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d={`M50,50 L${50 + 35 * Math.cos((angle * Math.PI) / 180)},${50 + 35 * Math.sin((angle * Math.PI) / 180)} A35,35 0 0,1 ${50 + 35 * Math.cos(((angle + 50) * Math.PI) / 180)},${50 + 35 * Math.sin(((angle + 50) * Math.PI) / 180)} Z`}
                fill={isActive ? "hsl(var(--jarvis) / 0.4)" : "hsl(var(--jarvis) / 0.2)"}
                stroke="hsl(var(--jarvis))"
                strokeWidth="0.5"
                style={{ filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--jarvis)))' : 'none' }}
              />
            ))}
          </svg>
        </div>

        {/* Inner core circle - ENHANCED GLOW */}
        <div 
          className={cn(
            "absolute w-24 h-24 rounded-full",
            "bg-gradient-radial from-jarvis via-jarvis/70 to-jarvis/30",
            "border-2 border-jarvis",
            "shadow-[0_0_50px_15px_hsl(var(--jarvis)/0.6),inset_0_0_20px_hsl(var(--jarvis)/0.5)]",
            isActive && "animate-pulse-glow-jarvis"
          )}
        />
        
        {/* Core center bright spot */}
        <div 
          className={cn(
            "absolute w-12 h-12 rounded-full",
            "bg-gradient-radial from-white via-jarvis-light to-jarvis",
            "shadow-[0_0_30px_10px_hsl(var(--jarvis-light)/0.8)]",
            isActive && "animate-pulse"
          )}
        />

        {/* JARVIS Waveform when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center gap-[2px]">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-jarvis rounded-full"
                  style={{
                    width: '3px',
                    height: '40px',
                    animation: `jarvis-wave 0.8s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                    boxShadow: '0 0 10px hsl(var(--jarvis))'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <div className="relative z-10 text-jarvis">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}

        {/* Stop icon when speaking */}
        {isSpeaking && !isProcessing && (
          <div className="relative z-10 text-jarvis drop-shadow-[0_0_10px_hsl(var(--jarvis))]">
            <Square className="w-8 h-8 fill-current" />
          </div>
        )}

        {/* Center icon - show mic when idle or listening */}
        {!isSpeaking && !isProcessing && (
          <div className="relative z-10 text-jarvis drop-shadow-[0_0_10px_hsl(var(--jarvis))]">
            {!speechSupported ? (
              <Keyboard className="w-10 h-10" />
            ) : (
              <svg
                width="40"
                height="40"
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

      {/* Status text with JARVIS styling */}
      <div className="absolute -bottom-16 text-center">
        <p className="text-sm text-jarvis font-mono tracking-wider uppercase transition-all duration-300 drop-shadow-[0_0_10px_hsl(var(--jarvis)/0.5)]">
          {isProcessing
            ? "Processing..."
            : isSpeaking
            ? "Tap to Stop"
            : isListening
            ? "Listening..."
            : !speechSupported
            ? "Text Input Mode"
            : "Tap to Speak"}
        </p>
        <div className="mt-3 flex justify-center gap-2">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full bg-jarvis transition-all duration-300",
                isActive ? "animate-pulse shadow-[0_0_8px_hsl(var(--jarvis))]" : "opacity-50"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
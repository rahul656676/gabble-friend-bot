import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6",
        "transition-all duration-300",
        "hover:bg-card/60 hover:border-primary/30",
        "hover:shadow-lg hover:shadow-primary/5",
        "group animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-lg mb-4",
          "bg-primary/10 border border-primary/20",
          "flex items-center justify-center",
          "group-hover:bg-primary/20 transition-colors"
        )}
      >
        <Icon className="w-6 h-6 text-primary" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

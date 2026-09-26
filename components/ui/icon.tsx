import {
  AppWindow,
  Cloud,
  Code2,
  Cpu,
  CreditCard,
  Eye,
  Globe,
  HeartHandshake,
  KeyRound,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Smartphone,
  Sparkles,
  UserCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  AppWindow,
  Cloud,
  Code2,
  Cpu,
  CreditCard,
  Eye,
  Globe,
  HeartHandshake,
  KeyRound,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Smartphone,
  Sparkles,
  UserCheck,
  Workflow,
  Zap,
};

/** Resolves an icon by name so content can live in plain data files. */
export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? Sparkles;
  return <C className={className} aria-hidden />;
}

import type { LucideIcon } from 'lucide-react';

export interface DashpanelCardData {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  gradientFrom: string;
  growth?: string;
  growthIcon?: LucideIcon;
  growthColor?: string;
  description?: string;
}

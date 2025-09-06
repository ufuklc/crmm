"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  ListChecks, 
  CalendarDays,
  LucideIcon 
} from "lucide-react";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  delay?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Users,
  ListChecks,
  CalendarDays,
};

export function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
  const Icon = iconMap[icon] || Building2;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

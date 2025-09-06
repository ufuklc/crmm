"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  LogOut, 
  Users, 
  ListChecks,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import MobileMenuButton from "./MobileMenuButton";
import { signOut } from "@/lib/auth";

export default function NewHeader() {
  const router = useRouter();

  async function onSignOut(): Promise<void> {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">Emlak CRM</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <Users className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
            <Link href="/properties" className="flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <Building2 className="h-4 w-4" />
              <span>Varlıklar</span>
            </Link>
            <Link href="/customers" className="flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <Users className="h-4 w-4" />
              <span>Müşteriler</span>
            </Link>
            <Link href="/requests" className="flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <ListChecks className="h-4 w-4" />
              <span>İstekler</span>
            </Link>
            <Link href="/portfolio-owners" className="flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <CalendarDays className="h-4 w-4" />
              <span>Portföy Sahibi</span>
            </Link>
            <button 
              onClick={onSignOut}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </button>
          </nav>

          {/* Mobile Menu Button - Client Component */}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
}

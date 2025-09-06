"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  Users, 
  ListChecks, 
  Home,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function MobileMenuButton() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  async function onSignOut(): Promise<void> {
    await signOut();
    router.push("/sign-in");
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-blue-100 absolute top-full left-0 right-0 z-50 shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/"
                className="flex items-center space-x-3 text-slate-600 hover:text-blue-700 font-medium transition-colors py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Ana Sayfa</span>
              </Link>
              <Link
                href="/properties"
                className="flex items-center space-x-3 text-slate-600 hover:text-blue-700 font-medium transition-colors py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span>Varlıklar</span>
              </Link>
              <Link
                href="/customers"
                className="flex items-center space-x-3 text-slate-600 hover:text-blue-700 font-medium transition-colors py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Müşteriler</span>
              </Link>
              <Link
                href="/requests"
                className="flex items-center space-x-3 text-slate-600 hover:text-blue-700 font-medium transition-colors py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ListChecks className="h-5 w-5" />
                <span>İstekler</span>
              </Link>
              <Link
                href="/portfolio-owners"
                className="flex items-center space-x-3 text-slate-600 hover:text-blue-700 font-medium transition-colors py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CalendarDays className="h-5 w-5" />
                <span>Portföy Sahibi</span>
              </Link>
              <button 
                onClick={onSignOut}
                className="flex items-center space-x-3 text-red-600 hover:text-red-700 font-medium transition-colors py-3 w-full rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

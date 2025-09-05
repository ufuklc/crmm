"use client";

import Link from "next/link";
import type React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { Menu, X } from "lucide-react";
import { NotificationsBell } from "./NotificationsBell";

function MobileNav(): React.ReactElement {
  return (
    <Dialog.Root>
      <div className="md:hidden">
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Menüyü aç"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            <Menu size={18} />
          </button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-lg outline-none">
          <Dialog.Title className="sr-only">Menü</Dialog.Title>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600" />
              <span className="text-sm font-semibold text-gray-900">Emlak CRM</span>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Menüyü kapat"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-1 p-2 text-sm text-gray-700">
            <Dialog.Close asChild>
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-gray-50">Ana Sayfa</Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/properties" className="rounded-lg px-3 py-2 hover:bg-gray-50">Varlıklar</Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/customers" className="rounded-lg px-3 py-2 hover:bg-gray-50">Müşteriler</Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/requests" className="rounded-lg px-3 py-2 hover:bg-gray-50">İstekler</Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/portfolio-owners" className="rounded-lg px-3 py-2 hover:bg-gray-50">Portföy Sahipleri</Link>
            </Dialog.Close>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Header(): React.ReactElement {
  const router = useRouter();

  async function onSignOut(): Promise<void> {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">Emlak CRM</span>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-700">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <Link href="/properties" className="hover:text-gray-900">Varlıklar</Link>
          <Link href="/customers" className="hover:text-gray-900">Müşteriler</Link>
          <Link href="/requests" className="hover:text-gray-900">İstekler</Link>
          <Link href="/portfolio-owners" className="hover:text-gray-900">Portföy Sahipleri</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <button type="button" onClick={onSignOut} className="btn btn-primary">Çıkış Yap</button>
        </div>
      </div>
    </header>
  );
}



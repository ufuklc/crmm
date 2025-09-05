"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function ShowHeader(): React.ReactElement | null {
  const pathname = usePathname();
  const hideOn = ["/sign-in", "/sign-up"];
  if (hideOn.some((p) => pathname?.startsWith(p))) return null;
  return <Header />;
}




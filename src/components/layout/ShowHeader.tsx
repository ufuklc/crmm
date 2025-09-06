"use client";

import { usePathname } from "next/navigation";
import NewHeader from "./NewHeader";

export function ShowHeader(): React.ReactElement | null {
  const pathname = usePathname();
  const hideOn = ["/sign-in", "/sign-up"];
  if (hideOn.some((p) => pathname?.startsWith(p))) return null;
  return <NewHeader />;
}




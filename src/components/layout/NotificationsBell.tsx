"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationsBell(): React.ReactElement {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setCount((j.notifications as unknown[])?.length ?? 0))
      .catch(() => setCount(0));
  }, []);

  return (
    <button
      type="button"
      aria-label="Bildirimler"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    >
      <Bell size={18} />
      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold !text-white">
        {count}
      </span>
    </button>
  );
}



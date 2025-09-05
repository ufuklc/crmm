"use client";

import type React from "react";

export function Spinner({ size = 40 }: { size?: number }): React.ReactElement {
  const px = `${size}px`;
  return (
    <div
      aria-label="Yükleniyor"
      className="inline-block animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
      style={{ width: px, height: px }}
    />
  );
}



import type React from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function RootLoading(): React.ReactElement {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner size={48} />
    </div>
  );
}



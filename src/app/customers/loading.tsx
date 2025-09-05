import type React from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function CustomersLoading(): React.ReactElement {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner />
    </div>
  );
}



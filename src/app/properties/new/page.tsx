import type React from "react";
import { PropertyForm } from "@/components/forms/PropertyForm";

export default function NewPropertyPage(): React.ReactElement {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Yeni Varlık</h1>
      <PropertyForm />
    </div>
  );
}



import type React from "react";
import { CustomerForm } from "@/components/forms/CustomerForm";

export default function NewCustomerPage(): React.ReactElement {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Yeni Müşteri</h1>
      <CustomerForm />
    </div>
  );
}



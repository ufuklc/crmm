"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";

export function PropertyFiltersMobile({ initialSearchParams }: { initialSearchParams?: Record<string, string | string[] | undefined> }): React.ReactElement {
  return (
    <Dialog.Root>
      <div className="md:hidden mb-3">
        <Dialog.Trigger asChild>
          <button className="btn btn-primary w-full">Filtreler</button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-sm font-semibold text-gray-900">Filtreler</Dialog.Title>
          <div className="mt-3">
            <PropertyFiltersBar initialSearchParams={initialSearchParams} />
          </div>
          <div className="mt-3 flex justify-end">
            <Dialog.Close className="btn btn-primary">Kapat</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



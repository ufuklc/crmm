"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { useState, useRef } from "react";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";

export function PropertyFiltersMobile({ initialSearchParams }: { initialSearchParams?: Record<string, string | string[] | undefined> }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const filterBarRef = useRef<{ handleFilter: () => void }>(null);


  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="md:hidden mb-3">
        <Dialog.Trigger asChild>
          <button className="btn btn-primary w-full">Filtreler</button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Filtreler</Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="space-y-4">
            <PropertyFiltersBar 
              ref={filterBarRef}
              initialSearchParams={initialSearchParams} 
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



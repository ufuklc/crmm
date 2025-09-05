"use client";

import React, { useState } from "react";

export function ConfirmButton({
  children,
  confirmText = "Emin misiniz?",
  className,
}: {
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  function submitClosestForm(): void {
    if (formRef) {
      formRef.submit();
    } else {
      // Fallback: try to find the form
      const active = document.activeElement as HTMLElement | null;
      const form = active?.closest("form") as HTMLFormElement | null;
      if (form) form.submit();
    }
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => {
          // Form referansını yakala
          const form = (document.activeElement as HTMLElement)?.closest("form") as HTMLFormElement | null;
          setFormRef(form);
          setOpen(true);
        }} 
        className={className}
      >
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="text-sm font-semibold text-gray-900 mb-2">Onay</div>
            <div className="text-sm text-gray-700">{confirmText}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>İptal</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOpen(false);
                  submitClosestForm();
                }}
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



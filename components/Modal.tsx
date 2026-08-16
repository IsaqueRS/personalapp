"use client";

import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-surfaceAlt rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-textMain">{title}</h3>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-textMain transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

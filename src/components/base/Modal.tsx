import { cn } from '@/lib/utils';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground-950/40"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-background-50 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-background-200/70">
            <h3 className="text-lg font-semibold text-foreground-950 font-heading">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-foreground-500 hover:text-foreground-800 hover:bg-background-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
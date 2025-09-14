import * as RToast from '@radix-ui/react-toast';
import React from 'react';

export const ToastProvider = RToast.Provider;
export const ToastViewport = () => (
  <RToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-96 max-w-[95vw] z-50" />
);

export const Toast = ({ className = '', children, ...props }: React.ComponentProps<typeof RToast.Root>) => (
  <RToast.Root
    className={`bg-surface text-foreground border border-border rounded-md shadow-lg p-3 data-[state=open]:animate-in data-[state=closed]:animate-out ${className}`}
    {...props}
  >
    {children}
  </RToast.Root>
);

export const ToastTitle = RToast.Title;
export const ToastDescription = RToast.Description;
export const ToastAction = RToast.Action;
export const ToastClose = RToast.Close;

export default Toast;


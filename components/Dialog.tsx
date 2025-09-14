import React from 'react';
import * as RD from '@radix-ui/react-dialog';

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;

export const DialogContent = ({ className = '', children, ...props }: React.ComponentProps<typeof RD.Content>) => (
  <RD.Portal>
    <RD.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <RD.Content
      className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface text-foreground border border-border rounded-lg shadow-xl p-6 w-[90vw] max-w-md ${className}`}
      {...props}
    >
      {children}
    </RD.Content>
  </RD.Portal>
);

export const DialogTitle = RD.Title;
export const DialogDescription = RD.Description;
export const DialogClose = RD.Close;

export default Dialog;


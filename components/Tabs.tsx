import * as RTabs from '@radix-ui/react-tabs';
import React from 'react';

export const Tabs = RTabs.Root;
export const TabsList = ({ className = '', ...props }: React.ComponentProps<typeof RTabs.List>) => (
  <RTabs.List className={`inline-flex items-center gap-1 rounded-md border border-border p-1 bg-surface2 ${className}`} {...props} />
);
export const TabsTrigger = ({ className = '', ...props }: React.ComponentProps<typeof RTabs.Trigger>) => (
  <RTabs.Trigger
    className={`px-3 py-1.5 text-sm rounded-md data-[state=active]:bg-accent data-[state=active]:text-[color:var(--color-accent-foreground)] text-muted hover:text-foreground ${className}`}
    {...props}
  />
);
export const TabsContent = RTabs.Content;

export default Tabs;


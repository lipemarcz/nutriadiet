import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', id, ...props }, ref) => {
  const textareaId = id || props.name || undefined;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        className={`w-full rounded-md border bg-surface2 text-foreground placeholder:text-muted border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;


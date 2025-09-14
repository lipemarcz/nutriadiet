import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className = '', id, children, ...props }, ref) => {
  const selectId = id || props.name || undefined;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="text-sm text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`w-full rounded-md border bg-surface2 text-foreground border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;


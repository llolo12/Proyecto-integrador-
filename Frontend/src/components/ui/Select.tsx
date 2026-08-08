import type { SelectHTMLAttributes, ReactNode } from 'react';
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}
export default function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-pv-gray">{label}</label>}
      <select
        className={`rounded-lg border border-pv-sand bg-pv-white px-3 py-2 text-sm outline-none focus:border-pv-green focus:ring-1 focus:ring-pv-green cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

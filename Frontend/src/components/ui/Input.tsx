import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-pv-gray">{label}</label>}
      <input
        className={`rounded-lg border border-pv-sand px-3 py-2 text-sm outline-none focus:border-pv-green focus:ring-1 focus:ring-pv-green ${error ? 'border-pv-danger' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-pv-danger">{error}</span>}
    </div>
  );
}

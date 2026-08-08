import type { TextareaHTMLAttributes } from 'react';
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-pv-gray">{label}</label>}
      <textarea
        className={`rounded-lg border border-pv-sand px-3 py-2 text-sm outline-none focus:border-pv-green focus:ring-1 focus:ring-pv-green resize-none ${error ? 'border-pv-danger' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <span className="text-xs text-pv-danger">{error}</span>}
    </div>
  );
}

import type { ReactNode } from 'react';
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}
export default function Card({ children, className = '', onClick, noPadding = false }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-pv-white border border-pv-sand/50 ${noPadding ? '' : 'p-4'} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

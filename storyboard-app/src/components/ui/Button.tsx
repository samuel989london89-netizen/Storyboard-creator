import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none';

  const variants = {
    primary:
      'bg-[#E8622A] text-white hover:bg-[#C04A18] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-[#1a1a1a] border border-gray-200 hover:border-[#E8622A] hover:text-[#E8622A] active:scale-95',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#1a1a1a] active:scale-95',
    danger:
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white active:scale-95',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

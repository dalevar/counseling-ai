import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary border-transparent',
    secondary: 'bg-muted text-muted-foreground border-transparent',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent',
    destructive: 'bg-destructive/10 text-destructive border-transparent',
    outline: 'border border-border text-foreground bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 select-none ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};

export default Badge;

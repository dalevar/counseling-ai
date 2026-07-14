import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'current';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'default',
  variant = 'primary',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const variantStyles = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    current: 'border-current/20 border-t-current',
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};

export default Spinner;

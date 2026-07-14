import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    // Variant classes
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md shadow-secondary/10',
      outline: 'border border-border bg-transparent text-foreground hover:bg-muted/50',
      ghost: 'bg-transparent text-foreground hover:bg-muted',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/10',
      link: 'text-primary underline-offset-4 hover:underline bg-transparent !p-0 shadow-none',
    };

    // Size classes
    const sizeStyles = {
      sm: 'h-9 px-3 text-xs rounded-md',
      default: 'h-11 px-5 text-sm font-medium rounded-xl',
      lg: 'h-13 px-8 text-base rounded-2xl',
      icon: 'h-10 w-10 justify-center rounded-xl',
    };

    const combinedClasses = `
      inline-flex items-center justify-center gap-2 whitespace-nowrap 
      transition-colors duration-200 cursor-pointer select-none
      disabled:pointer-events-none disabled:opacity-50
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
      ${variantStyles[variant]} 
      ${sizeStyles[size]} 
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={combinedClasses}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

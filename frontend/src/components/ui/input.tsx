import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col items-start gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-foreground/80 tracking-wide select-none">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-muted-foreground select-none pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            ref={ref}
            className={`
              w-full h-11 rounded-xl border border-border bg-card/50 text-sm px-4 
              transition-all duration-200 shadow-sm
              focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
              disabled:opacity-50 disabled:bg-muted/30
              placeholder:text-muted-foreground/60
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon || isPassword ? 'pr-11' : ''}
              ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 text-muted-foreground select-none flex items-center justify-center">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error ? (
          <span className="text-xs font-medium text-destructive mt-0.5" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-muted-foreground mt-0.5">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

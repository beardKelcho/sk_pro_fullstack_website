import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, children, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(e);
    };

    return (
      <form
        ref={ref}
        className={cn('space-y-4', className)}
        onSubmit={handleSubmit}
        role="form"
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, children, htmlFor, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} role="group" {...props}>
        {label && (
          <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {children}
        {error && <FormError>{error}</FormError>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        className={cn('text-sm font-medium text-red-500', className)}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormError.displayName = 'FormError';

export { Form, FormField, FormError }; 
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny } from 'zod';

interface FormProps<T extends ZodTypeAny> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void;
  children: React.ReactNode;
  className?: string;
}

export function Form<T extends ZodTypeAny>({
  schema,
  onSubmit,
  children,
  className = '',
}: FormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            register,
            errors,
          });
        }
        return child;
      })}
    </form>
  );
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register?: any;
  errors?: any;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  register,
  errors,
  className = '',
  ...props
}) => {
  const error = errors?.[name];
  const inputClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    ${error ? 'border-red-300' : ''}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        {...(register ? register(name) : {})}
        {...props}
        className={inputClasses}
      />
      {error && <FormError>{error.message}</FormError>}
    </div>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
}) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>{children}</div>
  );
};

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  children,
  className = '',
}) => {
  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`} role="alert">
      {children}
    </p>
  );
}; 
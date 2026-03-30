import React from 'react';
import {
  useForm,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny } from 'zod';

interface FormChildProps<TFieldValues extends FieldValues> {
  register?: UseFormRegister<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
}

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
        if (React.isValidElement<FormChildProps<z.infer<T>>>(child)) {
          return React.cloneElement(child, {
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
  register?: UseFormRegister<FieldValues>;
  errors?: FieldErrors<FieldValues>;
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
  const fieldError = errors
    ? (errors[name as keyof typeof errors] as { message?: unknown } | undefined)
    : undefined;
  const errorMessage = typeof fieldError?.message === 'string' ? fieldError.message : undefined;
  const inputClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    ${errorMessage ? 'border-red-300' : ''}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        {...(register ? register(name as Path<FieldValues>) : {})}
        {...props}
        className={inputClasses}
      />
      {errorMessage && <FormError>{errorMessage}</FormError>}
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

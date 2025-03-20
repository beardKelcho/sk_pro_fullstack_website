// Form hata tipi
export type FormError<T> = Partial<Record<keyof T | 'form', string>>;

// Form durumu tipi
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error?: string;
} 
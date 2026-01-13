'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  value = '',
  onChange,
  name,
  id,
  className = '',
  placeholder = '5XX XXX XX XX',
  required = false,
  error,
  disabled = false,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Eğer value gelirse, +90'ı çıkar ve sadece numarayı göster
    if (value) {
      const cleanValue = value.replace(/^\+90\s*/, '').replace(/\s/g, '');
      setDisplayValue(cleanValue);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatPhoneNumber = (input: string): string => {
    // Sadece rakamları al
    const numbers = input.replace(/\D/g, '');
    
    // Maksimum 10 rakam (5XX XXX XX XX)
    const limitedNumbers = numbers.slice(0, 10);
    
    // Formatla: 5XX XXX XX XX
    let formatted = '';
    if (limitedNumbers.length > 0) {
      formatted = limitedNumbers.slice(0, 3);
      if (limitedNumbers.length > 3) {
        formatted += ' ' + limitedNumbers.slice(3, 6);
      }
      if (limitedNumbers.length > 6) {
        formatted += ' ' + limitedNumbers.slice(6, 8);
      }
      if (limitedNumbers.length > 8) {
        formatted += ' ' + limitedNumbers.slice(8, 10);
      }
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setDisplayValue(formatted);
    
    // Tam telefon numarasını oluştur (+90 ile)
    const fullNumber = formatted.replace(/\s/g, '');
    const phoneValue = fullNumber ? `+90 ${formatted}` : '';
    
    if (onChange) {
      onChange(phoneValue);
    }
  };

  const handleBlur = () => {
    // Blur olduğunda, eğer numara eksikse temizle
    const numbers = displayValue.replace(/\s/g, '');
    if (numbers.length < 10) {
      setDisplayValue('');
      if (onChange) {
        onChange('');
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-700 dark:text-gray-300 text-sm font-medium">
          +90
        </div>
        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          maxLength={14} // 5XX XXX XX XX formatı için
          className={`flex-1 px-4 py-2 border ${
            error
              ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
          } rounded-r-lg focus:outline-none dark:bg-gray-700 dark:text-white text-sm ${className}`}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}


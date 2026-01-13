'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PasswordInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  autoHideTimeout?: number; // Otomatik kapanma süresi (milisaniye)
}

export default function PasswordInput({
  value = '',
  onChange,
  name,
  id,
  className = '',
  placeholder = 'Şifre giriniz',
  required = false,
  error,
  disabled = false,
  autoHideTimeout = 30000, // 30 saniye
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Şifre gösterildiğinde otomatik kapanma zamanlayıcısı
  useEffect(() => {
    if (showPassword) {
      // Önceki zamanlayıcıyı temizle
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Yeni zamanlayıcı başlat
      timeoutRef.current = setTimeout(() => {
        setShowPassword(false);
      }, autoHideTimeout);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showPassword, autoHideTimeout]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`pr-10 ${className}`}
        placeholder={placeholder}
      />
      
      {/* Göz Simgesi */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        tabIndex={-1}
        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
      >
        {showPassword ? (
          // Göz kapalı (şifre görünüyor)
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          // Göz açık (şifre gizli)
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import PasswordInput from '@/components/ui/PasswordInput';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasyon
    if (!newPassword || newPassword.trim().length === 0) {
      setErrors({ newPassword: 'Yeni şifre gereklidir' });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Şifre en az 6 karakter olmalıdır' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Şifreler eşleşmiyor' });
      return;
    }

    setLoading(true);

    try {
      const { updateUser } = await import('@/services/userService');
      await updateUser(userId, { password: newPassword });
      
      // Başarılı
      if (onSuccess) {
        onSuccess();
      }
      
      // Formu temizle ve modal'ı kapat
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      
      // Toast bildirimi göster
      const { toast } = await import('react-toastify');
      toast.success(`${userName} kullanıcısının şifresi başarıyla değiştirildi`);
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Şifre değiştirilirken bir hata oluştu';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    Şifre Değiştir
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <strong>{userName}</strong> kullanıcısının şifresini değiştiriyorsunuz.
                  </p>
                  
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Şifre <span className="text-red-500">*</span>
                      </label>
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        error={errors.newPassword}
                        placeholder="En az 6 karakter"
                        className={`bg-gray-50 dark:bg-gray-900/50 border ${
                          errors.newPassword 
                            ? 'border-red-500 dark:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        } text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Şifre (Tekrar) <span className="text-red-500">*</span>
                      </label>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        error={errors.confirmPassword}
                        placeholder="Şifreyi tekrar giriniz"
                        className={`bg-gray-50 dark:bg-gray-900/50 border ${
                          errors.confirmPassword 
                            ? 'border-red-500 dark:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        } text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-base font-medium text-white hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


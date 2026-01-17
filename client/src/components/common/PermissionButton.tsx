'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/config/permissions';
import { toast } from 'react-toastify';

/**
 * PermissionButton component props
 * @interface PermissionButtonProps
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required permission to enable the button */
  permission: Permission;
  /** Button content */
  children: React.ReactNode;
  /** Error message shown when user lacks permission */
  disabledMessage?: string;
  /** Click handler (only called if user has permission) */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Yetki kontrolü yapan buton bileşeni
 * Yetkisi olmayan kullanıcılar için buton pasif gözükür ve tıklanamaz
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  children,
  disabledMessage = 'Bu işlem için yetkiniz bulunmamaktadır',
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const hasAccess = usePermission(permission);
  const isDisabled = disabled || !hasAccess;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess) {
      toast.error(disabledMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isDisabled && !disabled ? disabledMessage : props.title}
    >
      {children}
    </button>
  );
};

export default PermissionButton;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/config/permissions';
import { toast } from 'react-toastify';

/**
 * PermissionLink component props
 * @interface PermissionLinkProps
 * @extends {React.AnchorHTMLAttributes<HTMLAnchorElement>}
 */
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Required permission to enable the link */
  permission: Permission;
  /** Link destination URL */
  href: string;
  /** Link content */
  children: React.ReactNode;
  /** Error message shown when user lacks permission */
  disabledMessage?: string;
  /** Click handler (only called if user has permission) */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Yetki kontrolü yapan link bileşeni
 * Yetkisi olmayan kullanıcılar için link pasif gözükür ve tıklanamaz
 */
export const PermissionLink: React.FC<PermissionLinkProps> = ({
  permission,
  href,
  children,
  disabledMessage = 'Bu işlem için yetkiniz bulunmamaktadır',
  onClick,
  className = '',
  ...props
}) => {
  const hasAccess = usePermission(permission);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasAccess) {
      e.preventDefault();
      e.stopPropagation();
      toast.error(disabledMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  if (!hasAccess) {
    return (
      <span
        {...props}
        onClick={handleClick}
        className={`${className} opacity-50 cursor-not-allowed pointer-events-none`}
        title={disabledMessage}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      {...props}
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
};

export default PermissionLink;

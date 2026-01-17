'use client';

import React from 'react';
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/config/permissions';
import { toast } from 'react-toastify';

interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission: Permission;
  href: string;
  children: React.ReactNode;
  disabledMessage?: string;
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

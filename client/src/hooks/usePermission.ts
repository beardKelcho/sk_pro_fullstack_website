import { useState, useEffect } from 'react';
import { hasPermission, Permission } from '@/config/permissions';
import { getStoredUserRole, getStoredUserPermissions } from '@/utils/authStorage';

/**
 * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eden hook
 * @param permission - Kontrol edilecek yetki
 * @returns Yetkiye sahipse true, değilse false
 */
export function usePermission(permission: Permission): boolean {
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // SYNCHRONOUS LOG: this will print immediately on render
  const rawRole = getStoredUserRole();
  const rawPerms = getStoredUserPermissions();
  if (permission === Permission.USER_UPDATE || permission === Permission.USER_DELETE) {
    console.log(`[DEBUG-SYNC] Validating ${permission} for role: "${rawRole}"`);
  }

  useEffect(() => {
    const userRole = getStoredUserRole();
    const userPermissions = getStoredUserPermissions();
    const access = hasPermission(userRole, permission, userPermissions);

    // Debug for specific permissions to trace the issue
    if (permission === Permission.USER_UPDATE || permission === Permission.USER_DELETE) {
      console.log(`[usePermission debug] Checking permission: ${permission}`);
      console.log(`[usePermission debug] userRole:`, userRole);
      console.log(`[usePermission debug] userPermissions:`, userPermissions);
      console.log(`[usePermission debug] hasAccess result:`, access);
    }

    setHasAccess(access);
  }, [permission]);

  return hasAccess;
}

/**
 * Birden fazla yetkiyi kontrol eden hook
 * @param permissions - Kontrol edilecek yetkiler
 * @param requireAll - Tüm yetkilere mi sahip olmalı (default: false, herhangi birine sahip olması yeterli)
 * @returns Yetkiye sahipse true, değilse false
 */
export function usePermissions(
  permissions: Permission[],
  requireAll: boolean = false
): boolean {
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    const userRole = getStoredUserRole();
    const userPermissions = getStoredUserPermissions();

    if (requireAll) {
      // Tüm yetkilere sahip olmalı
      const access = permissions.every(perm =>
        hasPermission(userRole, perm, userPermissions)
      );
      setHasAccess(access);
    } else {
      // Herhangi bir yetkiye sahip olması yeterli
      const access = permissions.some(perm =>
        hasPermission(userRole, perm, userPermissions)
      );
      setHasAccess(access);
    }
  }, [permissions, requireAll]);

  return hasAccess;
}

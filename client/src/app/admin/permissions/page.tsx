'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllUsers, updateUser, mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '@/services/userService';
import { toast } from 'react-toastify';
import { Permission, rolePermissions, Role, permissionDetails, permissionsByCategory } from '@/config/permissions';

// Rol tanımlamaları
const roles = [
  { value: 'Admin', backendValue: 'ADMIN', label: 'Admin', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' },
  { value: 'Firma Sahibi', backendValue: 'FIRMA_SAHIBI', label: 'Firma Sahibi', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
  { value: 'Proje Yöneticisi', backendValue: 'PROJE_YONETICISI', label: 'Proje Yöneticisi', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
  { value: 'Depo Sorumlusu', backendValue: 'DEPO_SORUMLUSU', label: 'Depo Sorumlusu', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' },
  { value: 'Teknisyen', backendValue: 'TEKNISYEN', label: 'Teknisyen', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' }
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  backendRole: string;
  permissions?: string[];
  isActive: boolean;
}

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'assign' | 'details'>('assign');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role);
      // Kullanıcının mevcut yetkilerini yükle
      const currentPermissions = selectedUser.permissions || [];
      setUserPermissions(new Set(currentPermissions));
    }
  }, [selectedUser]);

  // Rol değiştiğinde o rolün yetkilerini yükle
  useEffect(() => {
    if (selectedRole) {
      const roleObj = roles.find(r => r.value === selectedRole);
      if (roleObj) {
        const rolePermissionsList = rolePermissions[roleObj.backendValue as Role] || [];
        // Rol yetkilerini ekle (kullanıcının özel yetkilerini koru)
        const newPermissions = new Set(userPermissions);
        rolePermissionsList.forEach(perm => newPermissions.add(perm));
        setUserPermissions(newPermissions);
      }
    }
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const usersList = response.users || response;
      const formattedUsers = Array.isArray(usersList) ? usersList.map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        email: item.email,
        role: mapBackendRoleToFrontend(item.role),
        backendRole: item.role,
        permissions: item.permissions || [],
        isActive: item.isActive
      })) : [];
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    const newPermissions = new Set(userPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setUserPermissions(newPermissions);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    const roleObj = roles.find(r => r.value === role);
    if (roleObj) {
      const rolePermissionsList = rolePermissions[roleObj.backendValue as Role] || [];
      // Rol yetkilerini yükle
      setUserPermissions(new Set(rolePermissionsList));
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      toast.error('Lütfen bir kullanıcı seçiniz');
      return;
    }

    setUpdating(true);
    try {
      await updateUser(selectedUser.id, {
        role: mapFrontendRoleToBackend(selectedRole) as any,
        permissions: Array.from(userPermissions)
      });
      
      toast.success(`${selectedUser.name} kullanıcısının yetkileri güncellendi`);
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id
            ? {
                ...user,
                role: selectedRole,
                backendRole: mapFrontendRoleToBackend(selectedRole),
                permissions: Array.from(userPermissions)
              }
            : user
        )
      );
    } catch (error: any) {
      console.error('Yetki güncelleme hatası:', error);
      toast.error(error.response?.data?.message || 'Yetkiler güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleDefaultPermissions = (role: string): string[] => {
    const roleObj = roles.find(r => r.value === role);
    if (roleObj) {
      return rolePermissions[roleObj.backendValue as Role] || [];
    }
    return [];
  };

  const isPermissionFromRole = (permission: string): boolean => {
    if (!selectedRole) return false;
    const roleDefaults = getRoleDefaultPermissions(selectedRole);
    return roleDefaults.includes(permission as Permission);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detaylı Yetki Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Her kullanıcı için yetkileri ayrı ayrı yönetin ve özelleştirin
          </p>
        </div>
        <Link href="/admin/users">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Kullanıcı Listesi
          </button>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assign'
                ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Yetki Atama
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Yetki Detayları
          </button>
        </nav>
      </div>

      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Kullanıcı Seçimi ve Rol */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Kullanıcı ve Rol</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <>
                {/* Kullanıcı Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kullanıcı Seçin
                  </label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value);
                      setSelectedUser(user || null);
                    }}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  >
                    <option value="">Kullanıcı seçiniz...</option>
                    {users.filter(u => u.isActive).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rol Seçimi */}
                {selectedUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rol Seçin (Kalıp Yetkiler)
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => handleRoleSelect(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Rol seçildiğinde o role ait yetkiler otomatik yüklenecektir
                      </p>
                    </div>

                    {/* Mevcut Rol Bilgisi */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mevcut Rol:</p>
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        roles.find(r => r.value === selectedUser.role)?.color || ''
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>

                    {/* Kaydet Butonu */}
                    <button
                      onClick={handleSave}
                      disabled={updating || !selectedRole}
                      className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Kaydediliyor...
                        </>
                      ) : (
                        'Yetkileri Kaydet'
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Orta ve Sağ Kolon - Yetki Listesi */}
          {selectedUser && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedUser.name} - Yetkiler
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {userPermissions.size} yetki aktif
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {perms.map(perm => {
                        const isChecked = userPermissions.has(perm.id);
                        const isFromRole = isPermissionFromRole(perm.id);
                        
                        return (
                          <div
                            key={perm.id}
                            className={`p-4 rounded-lg border ${
                              isChecked
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                id={perm.id}
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(perm.id)}
                                className="mt-1 h-4 w-4 text-[#0066CC] dark:text-primary-light focus:ring-[#0066CC] dark:focus:ring-primary-light border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <label
                                  htmlFor={perm.id}
                                  className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                                >
                                  {perm.name}
                                  {isFromRole && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                                      Rol Yetkisi
                                    </span>
                                  )}
                                </label>
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                  {perm.description}
                                </p>
                                {perm.examples.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Örnekler:
                                    </p>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                      {perm.examples.map((example, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="mr-1">•</span>
                                          <span>{example}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedUser && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Yetki atamak için bir kullanıcı seçin
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tüm Yetkiler ve Açıklamaları</h2>
          
          <div className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perms.map(perm => (
                    <div
                      key={perm.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {perm.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {perm.description}
                      </p>
                      {perm.examples.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Örnekler:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {perm.examples.map((example, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tüm Kullanıcılar ve Yetkileri</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Yetki Sayısı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                        roles.find(r => r.value === user.role)?.color || ''
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.permissions?.length || 0} özel yetki
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setActiveTab('assign');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80"
                      >
                        Yetkileri Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllUsers, deleteUser, getRoleLabel, mapBackendRoleToFrontend } from '@/services/userService';
import { getStoredUserRole } from '@/utils/authStorage';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import logger from '@/utils/logger';
import { toast } from 'react-toastify';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';
import { Permission } from '@/config/permissions';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Firma Sahibi' | 'Proje Yöneticisi' | 'Depo Sorumlusu' | 'Teknisyen';
  department?: string;
  status: 'Aktif' | 'Pasif';
  avatar?: string;
  phone?: string;
  lastActive?: string;
}

const roleColors = {
  'Admin': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'Firma Sahibi': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  'Proje Yöneticisi': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Depo Sorumlusu': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'Teknisyen': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
};

const departments = ['Yönetim', 'Teknik', 'Medya', 'Görüntü'];

export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Tümü');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tümü');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tümü');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: string; name: string } | null>(null);

  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = getStoredUserRole() || '';
    setUserRole(role);

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsers();
        const usersList = response.users || response;
        let formattedUsers = Array.isArray(usersList) ? usersList.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          email: item.email,
          role: mapBackendRoleToFrontend(item.role) as 'Admin' | 'Firma Sahibi' | 'Proje Yöneticisi' | 'Depo Sorumlusu' | 'Teknisyen',
          department: '',
          status: (item.isActive ? 'Aktif' : 'Pasif') as 'Aktif' | 'Pasif',
          avatar: item.name?.substring(0, 2).toUpperCase() || '',
          phone: '',
          lastActive: item.updatedAt || new Date().toISOString()
        })) : [];

        if (role !== 'ADMIN') {
          formattedUsers = formattedUsers.filter((u: any) => u.role !== 'Admin');
        }

        setUsers(formattedUsers);
      } catch (err) {
        logger.error('Kullanıcı yükleme hatası:', err);
        setError('Kullanıcılar alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRole === 'Tümü' || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'Tümü' || user.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'Tümü' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success('Kullanıcı başarıyla silindi');
    } catch (error: any) {
      logger.error('Kullanıcı silme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Kullanıcı silinirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // TanStack Table Setup
  const columnHelper = createColumnHelper<User>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Kullanıcı',
      size: 250,
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
              <span className="text-[#0066CC] dark:text-primary-light text-base font-medium">
                {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-4 truncate">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('phone', {
      header: 'İletişim',
      size: 150,
      cell: info => <div className="text-sm text-gray-900 dark:text-white truncate">{info.getValue() || 'Belirtilmemiş'}</div>
    }),
    columnHelper.accessor('role', {
      header: 'Rol & Departman',
      size: 200,
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex flex-col space-y-1">
            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${roleColors[user.role]} w-max`}>
              {user.role}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.department}</span>
          </div>
        );
      }
    }),
    columnHelper.accessor('status', {
      header: 'Durum',
      size: 120,
      cell: info => {
        const status = info.getValue();
        return (
          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${status === 'Aktif'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
            }`}>
            {status}
          </span>
        );
      }
    }),
    columnHelper.accessor('lastActive', {
      header: 'Son Aktivite',
      size: 180,
      cell: info => <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{formatDate(info.getValue())}</div>
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">İşlemler</div>,
      size: 220,
      cell: info => {
        const user = info.row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Link href={`/admin/users/view?id=${user.id}`}>
              <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80 text-sm font-medium">
                Görüntüle
              </button>
            </Link>
            <PermissionLink
              permission={Permission.USER_UPDATE}
              href={`/admin/users/edit?id=${user.id}`}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              disabledMessage="Kullanıcı düzenleme yetkiniz bulunmamaktadır"
            >
              Düzenle
            </PermissionLink>
            <PermissionButton
              permission={Permission.USER_UPDATE}
              onClick={() => {
                setSelectedUserForPassword({ id: user.id, name: user.name });
                setShowPasswordModal(true);
              }}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 text-sm font-medium"
              disabledMessage="Şifre değiştirme yetkiniz bulunmamaktadır"
              title="Şifre Değiştir"
            >
              Şifre
            </PermissionButton>
            {(userRole === 'ADMIN' || userRole === 'FIRMA_SAHIBI') && (
              <PermissionButton
                permission={Permission.USER_DELETE}
                onClick={() => {
                  setUserToDelete(user.id);
                  setShowDeleteModal(true);
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                disabledMessage="Kullanıcı silme yetkiniz bulunmamaktadır"
              >
                Sil
              </PermissionButton>
            )}
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Ekip üyelerini yönetin ve yeni kullanıcılar ekleyin</p>
        </div>
        <Link href="/admin/users/add">
          <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Kullanıcı Ekle
          </button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label htmlFor="search" className="sr-only">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full pl-10 p-2.5 outline-none"
                placeholder="İsim, e-posta veya telefon ara..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="role-filter" className="sr-only">Rol</label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5 outline-none"
            >
              <option value="Tümü">Tüm Roller</option>
              <option value="Admin">Admin</option>
              <option value="Proje Yöneticisi">Proje Yöneticisi</option>
              <option value="Firma Sahibi">Firma Sahibi</option>
              <option value="Depo Sorumlusu">Depo Sorumlusu</option>
              <option value="Teknisyen">Teknisyen</option>
            </select>
          </div>

          <div>
            <label htmlFor="department-filter" className="sr-only">Departman</label>
            <select
              id="department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5 outline-none"
            >
              <option value="Tümü">Tüm Departmanlar</option>
              {departments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">Durum</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5 outline-none"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Kullanıcı Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
            {searchTerm || selectedRole !== 'Tümü' || selectedDepartment !== 'Tümü' || selectedStatus !== 'Tümü' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('Tümü');
                  setSelectedDepartment('Tümü');
                  setSelectedStatus('Tümü');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA]"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/users/add">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA]">
                  Yeni Kullanıcı Ekle
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto relative custom-scrollbar"
          >
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 shadow-sm border-b border-gray-200 dark:border-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800" style={{ width: header.column.getSize() }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paddingTop > 0 && <tr><td style={{ height: `${paddingTop}px` }} colSpan={columns.length} /></tr>}
                {virtualItems.map(virtualRow => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  return (
                    <tr key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 && <tr><td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} /></tr>}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Gösterilen: {filteredUsers.length} Kayıt</span>
            <span>Sanallaştırma Devrede 🚀</span>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Kullanıcıyı Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUserForPassword && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUserForPassword(null);
          }}
          userId={selectedUserForPassword.id}
          userName={selectedUserForPassword.name}
          onSuccess={() => { }}
        />
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ExportMenu from '@/components/admin/ExportMenu';
import { ProjectDisplay, ProjectStatusDisplay } from '@/types/project';
import { getStoredUserRole, getStoredUserPermissions } from '@/utils/authStorage';
import { hasPermission, Permission } from '@/config/permissions';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';
import { useProjects } from '@/hooks/useProjects';
import { MESSAGES } from '@/constants/messages';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

const statusColors: Record<ProjectStatusDisplay, string> = {
  'Onay Bekleyen': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Onaylanan': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Devam Ediyor': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Tamamlandı': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Ertelendi': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'İptal Edildi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export default function ProjectsPage() {
  const {
    projects,
    loading,
    error: apiError,
    updatingStatusId,
    removeProject,
    changeStatus
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectDisplay | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const canUpdateProject = hasPermission(userRole, Permission.PROJECT_UPDATE, userPermissions);

  useEffect(() => {
    setUserRole(getStoredUserRole());
    setUserPermissions(getStoredUserPermissions());
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const handleDeleteClick = (project: ProjectDisplay) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    const success = await removeProject(projectToDelete.id);
    if (success) {
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
    setIsDeleting(false);
  };

  const filteredProjects = projects.filter(project => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(project.customer.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(project.customer.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter && project.status !== statusFilter) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(project.startDate);

    if (dateFilter === 'upcoming' && startDate < today) return false;
    if (dateFilter === 'past' && startDate >= today) return false;

    return true;
  });

  // TanStack Table setup
  const columnHelper = createColumnHelper<ProjectDisplay>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Proje',
      size: 250,
      cell: info => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{info.getValue()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
            {info.row.original.description.length > 60
              ? `${info.row.original.description.substring(0, 60)}...`
              : info.row.original.description}
          </div>
        </div>
      )
    }),
    columnHelper.accessor('customer.companyName', {
      header: 'Müşteri',
      size: 200,
      cell: info => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{info.getValue()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{info.row.original.customer.name}</div>
        </div>
      )
    }),
    columnHelper.accessor('startDate', {
      header: 'Tarih',
      size: 150,
      cell: info => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">{formatDate(info.getValue())}</div>
          {info.getValue() !== info.row.original.endDate && (
            <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(info.row.original.endDate)}</div>
          )}
        </div>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Durum',
      size: 160,
      cell: info => {
        const project = info.row.original;
        if (canUpdateProject) {
          return (
            <select
              value={project.status}
              disabled={updatingStatusId === project.id}
              onChange={(e) => changeStatus(project.id, e.target.value as ProjectStatusDisplay)}
              className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${statusColors[project.status]} ${updatingStatusId === project.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label="Proje durumunu değiştir"
            >
              <option value="Onay Bekleyen">Onay Bekleyen</option>
              <option value="Onaylanan">Onaylanan</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="Ertelendi">Ertelendi</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          );
        }
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[project.status]}`}>
            {project.status}
          </span>
        );
      }
    }),
    columnHelper.accessor('location', {
      header: 'Konum',
      size: 150,
      cell: info => <div className="truncate max-w-[150px] text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</div>
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">İşlemler</div>,
      size: 200,
      cell: info => {
        const project = info.row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Link href={`/admin/projects/view/${project.id}`}>
              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                Görüntüle
              </button>
            </Link>
            <PermissionLink
              permission={Permission.PROJECT_UPDATE}
              href={`/admin/projects/edit/${project.id}`}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
              disabledMessage={MESSAGES.ERRORS.UNAUTHORIZED}
            >
              Düzenle
            </PermissionLink>
            <PermissionButton
              permission={Permission.PROJECT_DELETE}
              onClick={() => handleDeleteClick(project)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
              disabledMessage={MESSAGES.ERRORS.UNAUTHORIZED}
            >
              Sil
            </PermissionButton>
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: filteredProjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredProjects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projeler</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Tüm etkinlik ve organizasyon projelerini yönetin</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <ExportMenu type="projects" baseFilename="projects" label="Dışa Aktar" />
          <PermissionLink
            permission={Permission.PROJECT_CREATE}
            href="/admin/projects/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            disabledMessage={MESSAGES.ERRORS.UNAUTHORIZED}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Proje Ekle
          </PermissionLink>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Proje veya müşteri ara..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Onay Bekleyen">Onay Bekleyen</option>
            <option value="Onaylanan">Onaylanan</option>
            <option value="Devam Ediyor">Devam Ediyor</option>
            <option value="Ertelendi">Ertelendi</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="İptal Edildi">İptal Edildi</option>
          </select>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as 'upcoming' | 'past' | 'all')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
          >
            <option value="all">Tüm Tarihler</option>
            <option value="upcoming">Yaklaşan Etkinlikler</option>
            <option value="past">Geçmiş Etkinlikler</option>
          </select>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter(''); setDateFilter('all'); }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium outline-none text-left pl-2"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">{MESSAGES.UI.LOADING}</span>
          </div>
        </div>
      )}

      {apiError && !loading && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500 rounded-md mb-6">
          <p className="text-red-700">{apiError}</p>
        </div>
      )}

      {!loading && !apiError && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{MESSAGES.UI.NO_DATA}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Filtreleri temizleyin veya yeni bir proje ekleyin.</p>
            </div>
          ) : (
            <div
              ref={parentRef}
              className="h-[600px] overflow-auto relative custom-scrollbar"
            >
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ width: header.column.getSize() }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paddingTop > 0 && <tr><td style={{ height: `${paddingTop}px` }} colSpan={columns.length} /></tr>}
                  {virtualItems.map(virtualRow => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <tr key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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

          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Gösterilen: {filteredProjects.length} Kayıt</span>
            <span>Sanallaştırma Devrede 🚀</span>
          </div>
        </div>
      )}

      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Projeyi Sil</h3>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <strong>{projectToDelete.name}</strong> projesini silmek istediğinize emin misiniz?
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
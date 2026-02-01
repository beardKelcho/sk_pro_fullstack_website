'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTasks, useDeleteTask, Task } from '@/services/taskService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

interface ProjectTasksProps {
    projectId: string;
}

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
    const { data, isLoading, error } = useTasks({ project: projectId });
    const deleteTaskMutation = useDeleteTask();

    const tasks = data?.tasks || [];

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            try {
                await deleteTaskMutation.mutateAsync(id);
                toast.success('Görev başarıyla silindi');
            } catch (err) {
                logger.error('Görev silme hatası:', err);
                toast.error('Görev silinirken bir hata oluştu');
            }
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'TODO': return 'Yapılacak';
            case 'IN_PROGRESS': return 'Devam Ediyor';
            case 'COMPLETED': return 'Tamamlandı';
            case 'CANCELLED': return 'İptal Edildi';
            default: return status;
        }
    };

    const formatPriority = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'Acil';
            case 'HIGH': return 'Yüksek';
            case 'MEDIUM': return 'Orta';
            case 'LOW': return 'Düşük';
            default: return priority;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 text-red-500">
                Görevler yüklenirken bir hata oluştu.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Proje Görevleri</h3>
                <Link href={`/admin/tasks/add?project=${projectId}`}>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Görev Ekle
                    </button>
                </Link>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Bu proje için henüz görev oluşturulmamış.</p>
                    <Link href={`/admin/tasks/add?project=${projectId}`} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                        İlk görevi oluştur
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Başlık</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Öncelik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atanan</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bitiş Tarihi</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">İşlemler</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {tasks.map((task) => (
                                <tr key={task._id || task.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                                        {task.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                            {formatPriority(task.priority)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {/* AssignedTo usually returns ID if not populated. Ideally backend populates it. */}
                                        {/* Assuming task.assignedTo is populated or we display ID/Simple Name */}
                                        {typeof task.assignedTo === 'object' ? (task.assignedTo as any).name : 'Kullanıcı'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/tasks/edit/${task._id || task.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                            Düzenle
                                        </Link>
                                        <button onClick={() => handleDelete(task._id || task.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

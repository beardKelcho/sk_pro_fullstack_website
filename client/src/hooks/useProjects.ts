import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus, ProjectStatusDisplay, ProjectDisplay } from '@/types/project';
import { getAllProjects, deleteProject, updateProject } from '@/services/projectService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { MESSAGES } from '@/constants/messages';

// Backend enum'larını Türkçe string'e çeviren yardımcı fonksiyon
const getStatusDisplay = (status: ProjectStatus): ProjectStatusDisplay => {
    const statusMap: Record<ProjectStatus, ProjectStatusDisplay> = {
        'PLANNING': 'Onay Bekleyen', // legacy
        'PENDING_APPROVAL': 'Onay Bekleyen',
        'APPROVED': 'Onaylanan',
        'ACTIVE': 'Devam Ediyor',
        'ON_HOLD': 'Ertelendi',
        'COMPLETED': 'Tamamlandı',
        'CANCELLED': 'İptal Edildi'
    };
    return statusMap[status] || 'Onay Bekleyen';
};

// Türkçe string'i backend enum'a çeviren yardımcı fonksiyon
const getStatusFromDisplay = (display: ProjectStatusDisplay): ProjectStatus => {
    const displayMap: Record<ProjectStatusDisplay, ProjectStatus> = {
        'Onay Bekleyen': 'PENDING_APPROVAL',
        'Onaylanan': 'APPROVED',
        'Devam Ediyor': 'ACTIVE',
        'Tamamlandı': 'COMPLETED',
        'Ertelendi': 'ON_HOLD',
        'İptal Edildi': 'CANCELLED'
    };
    return displayMap[display] || 'PENDING_APPROVAL';
};

export const useProjects = () => {
    const [projects, setProjects] = useState<ProjectDisplay[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    const formatProject = (item: any): ProjectDisplay => {
        const backendStatus = item.status as ProjectStatus;
        const clientData = typeof item.client === 'object' && item.client ? item.client : null;

        return {
            id: item._id || item.id || '',
            _id: item._id,
            name: item.name || '',
            description: item.description || '',
            customer: clientData ? {
                id: clientData._id || clientData.id || '',
                _id: clientData._id,
                name: clientData.name || '',
                companyName: clientData.companyName || clientData.name || '',
                email: clientData.email || '',
                phone: clientData.phone || '',
                address: clientData.address,
                industry: clientData.industry,
                city: clientData.city,
                status: clientData.status
            } : {
                id: '',
                name: '',
                companyName: '',
                email: '',
                phone: ''
            },
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            status: getStatusDisplay(backendStatus),
            budget: item.budget || 0,
            location: item.location || '',
            team: Array.isArray(item.team) ? item.team.map((t: any) => typeof t === 'string' ? t : (t._id || t.id || '')) : [],
            equipment: Array.isArray(item.equipment) ? item.equipment.map((e: any) => typeof e === 'string' ? e : (e._id || e.id || '')) : [],
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
        };
    };

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllProjects();
            const projectsList = response.projects || response;

            const formattedProjects: ProjectDisplay[] = Array.isArray(projectsList)
                ? projectsList.map(formatProject)
                : [];

            setProjects(formattedProjects);
        } catch (err: unknown) {
            logger.error('Proje yükleme hatası:', err);
            setError(MESSAGES.ERRORS.PROJECT_LOAD);
            toast.error(MESSAGES.ERRORS.PROJECT_LOAD);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeProject = async (id: string): Promise<boolean> => {
        try {
            await deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            toast.success(MESSAGES.SUCCESS.PROJECT_DELETE);
            return true;
        } catch (error: unknown) {
            logger.error('Proje silme hatası:', error);
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            const errorMessage = err?.response?.data?.message || err?.message || MESSAGES.ERRORS.PROJECT_DELETE;
            toast.error(errorMessage);
            return false;
        }
    };

    const changeStatus = async (projectId: string, newDisplay: ProjectStatusDisplay) => {
        const oldProject = projects.find((p) => p.id === projectId);
        if (!oldProject) return;
        if (oldProject.status === newDisplay) return;

        const nextBackendStatus = getStatusFromDisplay(newDisplay);

        // Optimistic UI
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newDisplay } : p)));
        setUpdatingStatusId(projectId);

        try {
            await updateProject(projectId, { status: nextBackendStatus } as any);
            toast.success(MESSAGES.SUCCESS.PROJECT_UPDATE);
        } catch (err: unknown) {
            logger.error('Proje durum güncelleme hatası:', err);
            // Revert
            setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: oldProject.status } : p)));

            const errorObj = err as { message?: string };
            toast.error(errorObj?.message || MESSAGES.ERRORS.PROJECT_UPDATE);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Initial load
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        updatingStatusId,
        refresh: fetchProjects,
        removeProject,
        changeStatus,
        getStatusDisplay, // Export helpers if needed by UI
        getStatusFromDisplay
    };
};

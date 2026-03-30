import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus, ProjectStatusDisplay, ProjectDisplay } from '@/types/project';
import type { Client } from '@/types/client';
import type { Equipment } from '@/types/equipment';
import type { TeamMember } from '@/types/project';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { MESSAGES } from '@/constants/messages';

type ProjectStatusUpdatePayload = {
    status: ProjectStatus;
};

type UseProjectsParams = {
    status?: ProjectStatus;
    search?: string;
    dateScope?: 'upcoming' | 'past' | 'all';
    page?: number;
    limit?: number;
    sort?: string;
};

type BackendProjectEntity = Partial<Project> & {
    _id?: string;
    id?: string;
    client?: string | Partial<Client> | null;
    team?: Array<string | Partial<TeamMember>>;
    equipment?: Array<string | Partial<Equipment>>;
};

const getEntityId = (entity: { _id?: string; id?: string } | string | undefined): string =>
    typeof entity === 'string' ? entity : entity?._id || entity?.id || '';

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

export const useProjects = (params?: UseProjectsParams) => {
    const [projects, setProjects] = useState<ProjectDisplay[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const status = params?.status;
    const search = params?.search;
    const dateScope = params?.dateScope;
    const pageParam = params?.page ?? 1;
    const limitParam = params?.limit ?? 20;
    const sortParam = params?.sort;

    const formatProject = (item: BackendProjectEntity): ProjectDisplay => {
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
            team: Array.isArray(item.team) ? item.team.map((member) => getEntityId(member)) : [],
            equipment: Array.isArray(item.equipment) ? item.equipment.map((equipmentItem) => getEntityId(equipmentItem)) : [],
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
        };
    };

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { getAllProjects } = await import('@/services/projectService');
            const response = await getAllProjects({
                status,
                search,
                dateScope,
                page: pageParam,
                limit: limitParam,
                sort: sortParam,
            });
            const projectsList = response.projects || response;

            const formattedProjects: ProjectDisplay[] = Array.isArray(projectsList)
                ? (projectsList as BackendProjectEntity[]).map(formatProject)
                : [];

            setProjects(formattedProjects);
            setTotal(response.total || 0);
            setPage(response.page || pageParam);
            setTotalPages(response.totalPages || 1);
        } catch (err: unknown) {
            logger.error('Proje yükleme hatası:', err);
            setError(MESSAGES.ERRORS.PROJECT_LOAD);
        } finally {
            setLoading(false);
        }
    }, [dateScope, limitParam, pageParam, search, sortParam, status]);

    const removeProject = async (id: string): Promise<boolean> => {
        try {
            const { deleteProject } = await import('@/services/projectService');
            await deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            setTotal(prev => {
                const nextTotal = Math.max(prev - 1, 0);
                setTotalPages(Math.max(1, Math.ceil(nextTotal / limitParam)));
                return nextTotal;
            });
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
            const { updateProject } = await import('@/services/projectService');
            await updateProject(projectId, { status: nextBackendStatus } as ProjectStatusUpdatePayload);
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
        total,
        page,
        totalPages,
        updatingStatusId,
        refresh: fetchProjects,
        removeProject,
        changeStatus,
        getStatusDisplay, // Export helpers if needed by UI
        getStatusFromDisplay
    };
};

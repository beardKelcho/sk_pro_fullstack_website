import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSiteContent,
    updateSiteContent,
    getAllSiteContents,
    SiteContent,
    SiteContentData,
    HeroContent,
    ServiceItem,
    EquipmentCategory,
    ServicesEquipmentContent,
    AboutContent,
    ContactInfo,
    FooterContent,
    SocialMedia,
    SiteImage,
    LocalizedString
} from '@/services/siteContentService';
import {
    getAllImages,
    uploadImage,
    deleteImage
} from '@/services/siteImageService';
import { useLocale } from 'next-intl';

// Re-export types
export type {
    SiteContent,
    SiteContentData,
    SiteImage,
    HeroContent,
    ServiceItem,
    EquipmentCategory,
    ServicesEquipmentContent,
    AboutContent,
    ContactInfo,
    FooterContent,
    SocialMedia,
    LocalizedString
};

// --- Standalone Image Hooks ---

export const useSiteImages = (section?: string) => {
    return useQuery({
        queryKey: ['siteImages', section],
        queryFn: () => getAllImages(section ? { category: section } : undefined),
    });
};

export const useUploadSiteImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => uploadImage(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteImages'] });
        }
    });
};

export const useDeleteSiteImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteImages'] });
        }
    });
};

// --- Main Content Hook ---

export const useSiteContent = () => {
    const queryClient = useQueryClient();
    const locale = useLocale();

    // Helper to resolve localized string
    const resolveLocalized = (content: LocalizedString | string | undefined): string => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        return content[locale as 'tr' | 'en'] || content['tr'] || ''; // Fallback to TR
    };

    // 1. Fetch content by section
    const useContent = (section: string) => {
        return useQuery({
            queryKey: ['siteContent', section],
            queryFn: () => getSiteContent(section),
            staleTime: 5 * 60 * 1000,
        });
    };

    // 2. Fetch all content
    const useAllContents = () => {
        return useQuery({
            queryKey: ['siteContent', 'all'],
            queryFn: getAllSiteContents,
            staleTime: 5 * 60 * 1000,
        });
    };

    // 3. Update content
    const updateMutation = useMutation({
        mutationFn: ({ section, data }: { section: string; data: any }) => updateSiteContent(section, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['siteContent', variables.section] });
            queryClient.invalidateQueries({ queryKey: ['siteContent', 'all'] });
        },
    });

    const createMutation = useMutation({
        mutationFn: ({ section, data }: { section: string; data: any }) => updateSiteContent(section, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteContent'] });
        }
    });

    return {
        useContent,
        useAllContents,
        updateContent: updateMutation.mutate,
        updateContentAsync: updateMutation.mutateAsync,
        createContent: createMutation.mutate,
        isUpdating: updateMutation.isPending,
        isCreating: createMutation.isPending,
        error: updateMutation.error || createMutation.error,
        createMutation,
        updateMutation,
        resolveLocalized,
        currentLocale: locale
    };
};

import apiClient from './api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import logger from '@/utils/logger';

export type CommentResourceType = 'PROJECT' | 'TASK';

export interface CommentAuthor {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Comment {
  _id: string;
  resourceType: CommentResourceType;
  resourceId: string;
  author: CommentAuthor;
  message: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export const getComments = async (params: { resourceType: CommentResourceType; resourceId: string; limit?: number }) => {
  const res = await apiClient.get('/comments', { params });
  return res.data.comments as Comment[];
};

export const createComment = async (data: {
  resourceType: CommentResourceType;
  resourceId: string;
  message: string;
  mentions?: string[];
}) => {
  const res = await apiClient.post('/comments', data);
  return res.data.comment as Comment;
};

export const deleteComment = async (id: string) => {
  await apiClient.delete(`/comments/${id}`);
};

export const useComments = (resourceType: CommentResourceType, resourceId: string) =>
  useQuery({
    queryKey: ['comments', resourceType, resourceId],
    queryFn: () => getComments({ resourceType, resourceId, limit: 100 }),
    enabled: Boolean(resourceId),
    staleTime: 10_000,
  });

export const useCreateComment = (resourceType: CommentResourceType, resourceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message: string; mentions?: string[] }) =>
      createComment({ resourceType, resourceId, message: payload.message, mentions: payload.mentions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', resourceType, resourceId] }),
    onError: (e: any) => logger.error('Create comment error:', e),
  });
};

export const useDeleteComment = (resourceType: CommentResourceType, resourceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', resourceType, resourceId] }),
    onError: (e: any) => logger.error('Delete comment error:', e),
  });
};


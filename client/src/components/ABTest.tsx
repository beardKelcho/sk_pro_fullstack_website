import { ReactNode } from 'react';
import { useABTesting, useExperimentResults, useExperimentManagement } from '@/hooks/useABTesting';

interface ABTestProps {
  experimentId: string;
  variants: {
    id: string;
    component: ReactNode;
  }[];
  fallback?: ReactNode;
}

export function ABTest({ experimentId, variants, fallback }: ABTestProps) {
  const { variantId, isLoading, error } = useABTesting(experimentId);

  if (isLoading) {
    return <div className="animate-pulse">Yükleniyor...</div>;
  }

  if (error) {
    console.error('AB Test error:', error);
    return fallback || null;
  }

  if (!variantId) {
    return fallback || null;
  }

  const selectedVariant = variants.find(v => v.id === variantId);
  return selectedVariant?.component || fallback || null;
}

interface ExperimentResultsProps {
  experimentId: string;
  render: (results: any[]) => ReactNode;
  fallback?: ReactNode;
}

export function ExperimentResults({ experimentId, render, fallback }: ExperimentResultsProps) {
  const { results, isLoading, error } = useExperimentResults(experimentId);

  if (isLoading) {
    return <div className="animate-pulse">Yükleniyor...</div>;
  }

  if (error) {
    console.error('Experiment results error:', error);
    return fallback || null;
  }

  return render(results) || fallback || null;
}

interface ExperimentManagementProps {
  experimentId: string;
  children: (props: {
    experiment: any;
    isLoading: boolean;
    error: string | null;
    updateExperiment: (updates: any) => Promise<void>;
    deleteExperiment: () => Promise<void>;
  }) => ReactNode;
  fallback?: ReactNode;
}

export function ExperimentManagement({ experimentId, children, fallback }: ExperimentManagementProps) {
  const {
    experiment,
    isLoading,
    error,
    updateExperiment,
    deleteExperiment,
  } = useExperimentManagement(experimentId);

  if (isLoading) {
    return <div className="animate-pulse">Yükleniyor...</div>;
  }

  if (error) {
    console.error('Experiment management error:', error);
    return fallback || null;
  }

  return children({
    experiment,
    isLoading,
    error,
    updateExperiment,
    deleteExperiment,
  }) || fallback || null;
} 
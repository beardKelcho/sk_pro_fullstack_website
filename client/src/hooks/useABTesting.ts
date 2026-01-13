import { useState, useEffect } from 'react';
import { abTesting, Experiment, ExperimentResult } from '@/utils/abTesting';
import { useSession } from 'next-auth/react';

interface ABTestingState {
  variantId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useABTesting(experimentId: string) {
  const { data: session } = useSession();
  const [state, setState] = useState<ABTestingState>({
    variantId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initExperiment = async () => {
      try {
        if (!session?.user || !((session.user as any).id || session.user.email)) {
          setState({
            variantId: null,
            isLoading: false,
            error: 'User not authenticated',
          });
          return;
        }

        const userId = (session.user as any).id || session.user.email || '';
        const variantId = await abTesting.assignVariant(experimentId, userId);
        setState({
          variantId,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          variantId: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize experiment',
        });
      }
    };

    initExperiment();
  }, [experimentId, session?.user]);

  const trackConversion = async (metadata?: Record<string, any>) => {
    try {
      if (!session?.user || !state.variantId) return;

      const userId = (session.user as any).id || session.user.email || '';
      await abTesting.trackConversion(experimentId, userId, metadata);
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  return {
    ...state,
    trackConversion,
  };
}

interface ExperimentResultsState {
  results: ExperimentResult[];
  isLoading: boolean;
  error: string | null;
}

export function useExperimentResults(experimentId: string) {
  const [state, setState] = useState<ExperimentResultsState>({
    results: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadResults = async () => {
      try {
        const results = await abTesting.getResults(experimentId);
        setState({
          results,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          results: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load experiment results',
        });
      }
    };

    loadResults();
  }, [experimentId]);

  return state;
}

interface ExperimentManagementState {
  experiment: Experiment | null;
  isLoading: boolean;
  error: string | null;
}

export function useExperimentManagement(experimentId: string) {
  const [state, setState] = useState<ExperimentManagementState>({
    experiment: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadExperiment = async () => {
      try {
        const experiment = await abTesting.getExperiment(experimentId);
        setState({
          experiment,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          experiment: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load experiment',
        });
      }
    };

    loadExperiment();
  }, [experimentId]);

  const updateExperiment = async (updates: Partial<Experiment>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedExperiment = await abTesting.updateExperiment(experimentId, updates);
      
      if (updatedExperiment) {
        setState({
          experiment: updatedExperiment,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to update experiment');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update experiment',
      }));
    }
  };

  const deleteExperiment = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const success = await abTesting.deleteExperiment(experimentId);
      
      if (success) {
        setState({
          experiment: null,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to delete experiment');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete experiment',
      }));
    }
  };

  return {
    ...state,
    updateExperiment,
    deleteExperiment,
  };
} 
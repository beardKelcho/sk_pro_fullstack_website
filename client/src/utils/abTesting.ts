export interface Experiment {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number;
  }[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  targetAudience?: {
    userRoles?: string[];
    deviceTypes?: string[];
    browsers?: string[];
  };
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  userId: string;
  timestamp: Date;
  conversion?: boolean;
  metadata?: Record<string, any>;
}

class ABTestingService {
  private static instance: ABTestingService;
  private experiments: Map<string, Experiment> = new Map();
  private results: Map<string, ExperimentResult[]> = new Map();
  private readonly STORAGE_KEY = 'ab_testing_experiments';

  private constructor() {
    this.loadExperiments();
  }

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  private loadExperiments(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.experiments = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load experiments:', error);
    }
  }

  private saveExperiments(): void {
    try {
      const data = Object.fromEntries(this.experiments);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save experiments:', error);
    }
  }

  async getExperiment(experimentId: string): Promise<Experiment | null> {
    return this.experiments.get(experimentId) || null;
  }

  async getAllExperiments(): Promise<Experiment[]> {
    return Array.from(this.experiments.values());
  }

  async createExperiment(experiment: Omit<Experiment, 'id'>): Promise<Experiment> {
    const id = crypto.randomUUID();
    const newExperiment: Experiment = {
      ...experiment,
      id,
      startDate: new Date(),
      isActive: true,
    };

    this.experiments.set(id, newExperiment);
    this.saveExperiments();
    return newExperiment;
  }

  async updateExperiment(experimentId: string, updates: Partial<Experiment>): Promise<Experiment | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const updatedExperiment: Experiment = {
      ...experiment,
      ...updates,
    };

    this.experiments.set(experimentId, updatedExperiment);
    this.saveExperiments();
    return updatedExperiment;
  }

  async deleteExperiment(experimentId: string): Promise<boolean> {
    const deleted = this.experiments.delete(experimentId);
    if (deleted) {
      this.saveExperiments();
    }
    return deleted;
  }

  async assignVariant(experimentId: string, userId: string): Promise<string | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.isActive) return null;

    // Kullanıcı hedef kitleye uyuyor mu kontrol et
    if (experiment.targetAudience) {
      const userAgent = navigator.userAgent;
      const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop';
      const browser = this.detectBrowser(userAgent);

      if (
        (experiment.targetAudience.deviceTypes && !experiment.targetAudience.deviceTypes.includes(deviceType)) ||
        (experiment.targetAudience.browsers && !experiment.targetAudience.browsers.includes(browser))
      ) {
        return null;
      }
    }

    // Varyant seçimi
    const totalWeight = experiment.variants.reduce((sum, variant) => sum + variant.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedVariant = experiment.variants[0];

    for (const variant of experiment.variants) {
      random -= variant.weight;
      if (random <= 0) {
        selectedVariant = variant;
        break;
      }
    }

    // Sonucu kaydet
    const result: ExperimentResult = {
      experimentId,
      variantId: selectedVariant.id,
      userId,
      timestamp: new Date(),
    };

    const results = this.results.get(experimentId) || [];
    results.push(result);
    this.results.set(experimentId, results);

    return selectedVariant.id;
  }

  async trackConversion(experimentId: string, userId: string, metadata?: Record<string, any>): Promise<void> {
    const results = this.results.get(experimentId);
    if (!results) return;

    const result = results.find(r => r.userId === userId);
    if (result) {
      result.conversion = true;
      result.metadata = metadata;
    }
  }

  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    return this.results.get(experimentId) || [];
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    if (userAgent.includes('Opera')) return 'opera';
    return 'other';
  }
}

export const abTestingService = ABTestingService.getInstance();

// A/B Testing için yardımcı fonksiyonlar
export const abTesting = {
  getExperiment: (experimentId: string) => abTestingService.getExperiment(experimentId),
  getAllExperiments: () => abTestingService.getAllExperiments(),
  createExperiment: (experiment: Omit<Experiment, 'id'>) => abTestingService.createExperiment(experiment),
  updateExperiment: (experimentId: string, updates: Partial<Experiment>) => abTestingService.updateExperiment(experimentId, updates),
  deleteExperiment: (experimentId: string) => abTestingService.deleteExperiment(experimentId),
  assignVariant: (experimentId: string, userId: string) => abTestingService.assignVariant(experimentId, userId),
  trackConversion: (experimentId: string, userId: string, metadata?: Record<string, any>) => abTestingService.trackConversion(experimentId, userId, metadata),
  getResults: (experimentId: string) => abTestingService.getExperimentResults(experimentId),
}; 